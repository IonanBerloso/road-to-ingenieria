#!/usr/bin/env node
/**
 * humo.mjs — el suelo de calidad que `verify.mjs` no puede cubrir.
 *
 * `verify.mjs` lee el HTML publicado. Eso basta para comprobar que algo ESTÁ,
 * pero no que FUNCIONE. Tres fallos reales se colaron por ahí el 19 de agosto
 * de 2026, los tres invisibles a un análisis de texto:
 *
 *   · el MathML de una raíz cuadrada era correcto y el navegador no la
 *     dibujaba, porque la fuente no tenía tabla MATH: el enunciado decía
 *     -3/2 donde debía decir -√3/2
 *   · las pestañas de teoría y ejercicios no enganchaban sus manejadores
 *     porque `data-tema` lo usaban dos componentes distintos
 *   · el mismo atributo `data-ir` en dos sitios hacía que «siguiente»
 *     ocultara los dos paneles
 *
 * Cada comprobación de aquí abajo es un fallo que ya ocurrió. No se añaden
 * comprobaciones por si acaso: se añaden cuando algo se rompe.
 *
 * Abre el sitio construido en Chromium y sale con código != 0 si algo falla.
 */

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { default: astroConfig } = await import('../astro.config.mjs');
const BASE = astroConfig.base.replace(/\/$/, '');
const PUERTO = 4321;
const ORIGEN = `http://localhost:${PUERTO}${BASE}`;

let fallos = 0;
const ok = (t) => console.log(`  ✓ ${t}`);
const fallo = (t, detalle) => {
  console.error(`  ✗ ${t}`);
  if (detalle) console.error(`    ${detalle}`);
  fallos++;
};
const comprueba = (condicion, t, detalle) => (condicion ? ok(t) : fallo(t, detalle));

/* ── servidor ───────────────────────────────────────────────────────── */

const servidor = spawn(
  process.execPath,
  [join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'preview', '--port', String(PUERTO)],
  { cwd: ROOT, stdio: 'ignore' },
);

async function esperaServidor() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${ORIGEN}/`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('El servidor de vista previa no ha arrancado en 30 s.');
}

/* ── comprobaciones ─────────────────────────────────────────────────── */

async function main() {
  await esperaServidor();

  const navegador = await chromium.launch();
  /* La pestaña se renueva en cada página del bucle de abajo; esta primera es
     solo para tener algo que cerrar la primera vez. */
  let pagina = await navegador.newPage({ viewport: { width: 1280, height: 1000 } });

  const erroresConsola = [];

  /* Se recorre cada página de contenido, no solo una: el día que haya veinte
     temas, el fallo aparecerá en el que nadie miró.

     Las páginas de examen entran desde el 20 de agosto de 2026, y no es un
     añadido cosmético: al crearlas, sus ejercicios quedaron fuera del filtro
     `/tNN-` y durante un rato el suelo dio verde sin haber probado **ni un
     solo distractor de examen**. Eso es exactamente la confianza falsa que
     §11 prohíbe. El índice `/examenes/` no entra: no tiene ejercicios. */
  /* Las rutas de estudio entran desde el 22 de agosto de 2026, y por el mismo
     motivo que entraron las de examen: incrustan ejercicios guiados, así que
     fuera del filtro sus distractores no se probarían y el suelo seguiría
     dando verde. Es la segunda vez que pasa lo mismo, y por eso está apuntado
     en `tasks/todo.md` que este filtro debería dejar de enumerar formas de URL
     y pasar a ser «toda página enlazada desde la portada con un
     [data-ejercicio] dentro». */
  const paginas = await (await fetch(`${ORIGEN}/`)).text().then((html) =>
    [...html.matchAll(/href="([^"]+)"/g)]
      .map((m) => m[1])
      .filter(
        (h) =>
          h.startsWith(BASE) &&
          /\/[a-z]+\/(t\d{2}-|examenes\/\d{4}-\d{4}|preparar\/)/.test(h),
      ),
  );
  /* La portada solo enlaza un puñado de exámenes, y ahí vive la mayor parte
     del contenido: 96 páginas con 457 ejercicios. Durante meses el navegador
     abrió 8 de esas 96 —un 8 %— y el resto solo lo miraba `verify.mjs`, que
     lee el HTML y no ejecuta nada. El único fallo que el guardián de viewBox
     ha cazado lo cazó de rebote, porque esa figura se reutilizaba en una ruta.

     Así que se añade una MUESTRA ROTATORIA: ocho páginas de examen elegidas
     por el día del año, con lo que en unas semanas pasan todas sin que el CI
     se dispare. Se imprime cuáles son, para que un fallo se pueda reproducir.
     Y `HUMO_TODO=1` las abre todas: eso es lo que se pasa al cerrar una
     asignatura, no en cada commit. */
  const todosLosExamenes = [...new Set(
    (await Promise.all(
      [...new Set([...(await (await fetch(`${ORIGEN}/`)).text())
        .matchAll(/href="([^"]+)"/g)].map((m) => m[1])
        .filter((h) => h.startsWith(BASE) && /\/[a-z]+\/$/.test(h.replace(BASE, '/')))
        .map((h) => h))]
        .map(async (h) => {
          const html = await (await fetch(`${ORIGEN.replace(BASE, '')}${h}`)).text().catch(() => '');
          /* sin el fragmento: `#ej-…` no es otra página, y contarlo dejaba la
             muestra de ocho en un solo examen */
          return [...html.matchAll(/href="([^"#]+examenes\/\d{4}-\d{4}[^"#]*)"/g)].map((m) => m[1]);
        }),
    )).flat(),
  )].filter((h) => h.startsWith(BASE));

  const yaAbiertos = new Set(paginas);
  const candidatos = todosLosExamenes.filter((h) => !yaAbiertos.has(h)).sort();
  const TODO = process.env.HUMO_TODO === '1';
  const CUANTOS = 8;
  let muestra = [];
  if (candidatos.length) {
    if (TODO) {
      muestra = candidatos;
    } else {
      const dia = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
      const desde = (dia * CUANTOS) % candidatos.length;
      for (let i = 0; i < Math.min(CUANTOS, candidatos.length); i++) {
        muestra.push(candidatos[(desde + i) % candidatos.length]);
      }
    }
  }

  const rutas = [...new Set([...paginas, ...muestra])];

  comprueba(rutas.length > 0, `hay páginas de contenido que comprobar (${rutas.length})`);
  console.log(
    `  · exámenes: ${yaAbiertos.size ? [...yaAbiertos].filter((h) => h.includes('/examenes/')).length : 0} fijos` +
    ` + ${muestra.length} ${TODO ? 'de la barrida completa (HUMO_TODO=1)' : `de la muestra rotatoria de hoy, de ${candidatos.length} posibles`}`,
  );
  if (!TODO && muestra.length) {
    console.log(`    ${muestra.map((h) => h.replace(BASE, '')).join('\n    ')}`);
  }

  /** Recuento global de trazos: ver el comentario de más abajo. */
  const medidos = { raiz: 0, barra: 0, etiqueta: 0 };

  for (const ruta of rutas) {
    /* Cada página va en su propio try. Antes, un fallo de infraestructura en
       una —una navegación a destiempo, un tiempo de espera— abortaba el
       recorrido entero y las 122 restantes se quedaban sin mirar, con un
       mensaje que ni siquiera decía cuál había sido. Ahora se anota, se sigue,
       y al final se dice con nombre. */
    try {
    console.log(`\n${ruta}`);
    /* Una pestaña para las 123 páginas de la barrida completa acababa dando
       «Execution context was destroyed» en una página distinta cada vez: no era
       un fallo de contenido sino de acumulación —cada tema son 150.000 nodos y
       varios megas—. Se abre una pestaña limpia por página y se cierra al
       terminar. Cuesta unos segundos y quita una fuente de ruido: un guardián
       que falla al azar se acaba ignorando, que es lo que §11 prohíbe. */
    if (pagina && !pagina.isClosed()) await pagina.close().catch(() => {});
    pagina = await navegador.newPage({ viewport: { width: 1280, height: 1000 } });
    pagina.on('pageerror', (e) => erroresConsola.push(`${ruta} → ${e.message}`));
    pagina.on('console', (m) => m.type() === 'error' && erroresConsola.push(`${ruta} → ${m.text()}`));
    await pagina.goto(`http://localhost:${PUERTO}${ruta}`, { waitUntil: 'load', timeout: 60000 });
    /* Esperar a que el navegador quede ocioso, no un tiempo fijo. El tema 1
       pinta doce lienzos del paso `verificar` en `requestIdleCallback`, y esa
       tarea chocaba con las medidas de aquí: el guardián fallaba con
       «Execution context was destroyed» en esa página y solo en esa. Si el
       trabajo diferido no ha terminado, medir es medir a medias. */
    await pagina.evaluate(() => new Promise((listo) => {
      const espera = window.requestIdleCallback ?? ((f) => setTimeout(f, 300));
      espera(() => listo(), { timeout: 8000 });
    })).catch(() => {});
    await pagina.waitForTimeout(400);

    /* 1 · Los signos que se estiran se DIBUJAN, no solo existen en el DOM.
       Las fórmulas las dibuja KaTeX en el build, con sus propias fuentes: la
       raíz es un `.sqrt` con su `.sqrt-sign`, y la barra del conjugado un
       `.overline` con su `.overline-line`. Si la caja de esos trazos mide
       cero, la fórmula que ve el alumno es otra: `√3` se convierte en `3` y
       `z̄` en `z`, que es justo lo contrario de lo que dice.

       Las dos cosas fallaron de verdad con la salida MathML pura, cada una con
       una fuente distinta. Por eso se miden las dos.

       Se mide con TODO desplegado. En modo guiado casi nada está visible, y
       una comprobación que no encuentra fórmulas pasa en vacío: eso es un
       guardián de mentira. */
    /* Abrir una pestaña dispara `history.replaceState` (Tema.astro), y con
       decenas de ejercicios en la página eso rompía el `evaluate` que lanzaba
       los clics: el guardián fallaba con «Execution context was destroyed» en
       una página distinta cada vez. No era contenido, era el propio guardián
       navegando mientras miraba. Se desactiva mientras duran los clics —lo que
       nos interesa es abrir los paneles, no el historial— y se devuelve. */
    await pagina.evaluate(() => {
      const original = history.replaceState;
      history.replaceState = () => {};
      try {
        for (const b of document.querySelectorAll('[data-modo="completo"]')) b.click();
      } finally {
        history.replaceState = original;
      }
    });
    await pagina.waitForTimeout(300);

    const trazos = await pagina.evaluate(() => {
      const medidas = { raiz: [], barra: [] };

      /* Se destapa TODO lo oculto —desarrollos, mensajes de error, la
         resolución completa—: una fórmula rota dentro de un bloque que hoy
         está plegado sigue estando rota cuando el alumno lo abra. */
      const tapados = [...document.querySelectorAll('[hidden]')];
      for (const e of tapados) e.hidden = false;

      for (const panel of document.querySelectorAll('.panel')) {
        panel.style.display = 'block'; // ver los dos paneles a la vez, solo para medir
        /* El radical es un <svg> dentro del `.sqrt`, y la barra del conjugado
           es el borde inferior de un `.overline-line`. No son texto: si el CSS
           de KaTeX no llega, los dos se quedan a cero y la fórmula cambia de
           significado sin que nada falle. */
        for (const e of panel.querySelectorAll('.sqrt')) {
          if (!e.getBoundingClientRect().width) continue;
          const svg = e.querySelector('svg')?.getBoundingClientRect();
          medidas.raiz.push({
            texto: e.textContent.trim().slice(0, 8),
            grosor: svg ? svg.width : 0,
          });
        }

        for (const e of panel.querySelectorAll('.overline-line')) {
          if (!e.getBoundingClientRect().width) continue;
          medidas.barra.push({
            texto: e.closest('.overline')?.textContent.trim().slice(0, 8) ?? '',
            grosor: parseFloat(getComputedStyle(e).borderBottomWidth) || 0,
          });
        }
        panel.style.display = '';
      }

      for (const e of tapados) e.hidden = true;
      return medidas;
    });

    /* El recuento se acumula para todo el sitio y se comprueba al final. Un
       tema puede no tener ninguna raíz —sucesiones, por ejemplo— y eso no es
       un fallo; lo que sería un fallo es que NINGUNA página tuviera, porque
       entonces la comprobación estaría pasando en vacío. */
    for (const [cual, nombre, minimo] of [
      ['raiz', 'las raíces dibujan su radical', 4],
      ['barra', 'los conjugados dibujan su barra', 0.4],
    ]) {
      const medidas = trazos[cual];
      medidos[cual] += medidas.length;
      const mudas = medidas.filter((m) => m.grosor < minimo);
      if (medidas.length === 0) continue;
      comprueba(
        mudas.length === 0,
        `${nombre} (${medidas.length})`,
        mudas.length ? `«${mudas[0].texto}» tiene el trazo a ${mudas[0].grosor} px` : '',
      );
    }

    /* 1 bis · Nada de una figura se sale de su viewBox.
       Se añade el 26 de agosto de 2026, y no por si acaso: ha pasado tres
       veces y las tres solo se cazaron mirando una captura. «y = 8x − 4» se
       publicó como «y = 8x» en la ordinaria de 2016-2017, «t (s)» como «t (»
       en la de 2015-2016, y el pie «la misma idea, con el coseno dentro» de la
       figura del escalón del tema 10 se cortaba por la derecha.

       El 27 de agosto de 2026 se amplía de `text` a `rect`, `circle` y `line`,
       y también por un fallo real: el árbol de Rouché del tema 5 de Álgebra
       tenía dos rectángulos que se salían 8 px por la derecha. Las etiquetas
       de dentro sí cabían, así que el guardián pasaba en verde mientras las
       cajas se veían cortadas. Se cazó mirando la captura, otra vez.

       **`path` se queda fuera a propósito**, y conviene que quede dicho para
       que nadie lo «arregle»: KaTeX dibuja cada radical y cada delimitador
       estirable con su propio `<svg viewBox="0 0 400000 …">` y un `<path>` que
       se sale por diseño. Medido sobre nueve páginas de tema antes de ampliar
       el guardián: con `rect`, `circle` y `line` salen **cero** falsos
       positivos; añadiendo `path` salen once, y los once son de KaTeX. Un
       guardián que da la alarma once veces de once en falso enseña a ignorar
       los guardianes, que es el daño de verdad (§11).

       Y el 29 de agosto de 2026, al abrir por primera vez las 96 páginas de
       examen enteras, la regla de `circle` se estrecha por lo mismo: dio
       cuatro avisos y los cuatro eran correctos. Tres eran círculos guía —el
       de radio 2 del que solo se dibuja un arco de 45°, la esfera del cuenco,
       la del cucurucho—, dibujados a propósito más grandes que el marco. El
       cuarto eran marcadores de continuación con el centro fuera. Así que un
       círculo solo cuenta si es un **marcador cortado**: radio pequeño y
       centro dentro del marco. El filtro está en el bucle, con su motivo.

       Un `<text>` fuera del viewBox no rompe nada: el navegador lo recorta y
       la página sigue en verde. Por eso hacía falta medirlo, y por eso se mide
       aquí y no en `verify.mjs`: la caja de un texto SVG solo la sabe el
       navegador, que es quien elige la fuente y la mide.

       Y hay que **destapar la página entera** antes de medir, no basta con el
       modo completo. Medido el 26 de agosto de 2026 sobre una página de examen:
       32 SVG, 38 etiquetas, y en modo completo el navegador devolvía **cero**
       cajas medibles, porque `getBBox()` de un elemento dentro de algo con
       `display: none` da todo ceros y el filtro de anchura cero se las comía
       todas. Con la página destapada, esas mismas 38 se miden y dos estaban
       fuera. En las páginas de tema el modo completo sí bastaba, y por eso el
       guardián parecía funcionar el día que se escribió.

       De ahí el recuento: si en una página con figuras no se mide **ninguna**
       etiqueta, el guardián está pasando en vacío y eso también es un fallo. */
    /* Destapar y medir van en DOS pasos con una espera en medio, y no es
       cosmético: haciéndolo en el mismo `evaluate` el navegador devolvía cero
       cajas en las páginas de examen. Necesita un reflujo entre una cosa y la
       otra. */
    await pagina.evaluate(() => {
      window.__tapados = [];
      for (const e of document.querySelectorAll('[hidden]')) {
        e.removeAttribute('hidden');
        window.__tapados.push([e, 'hidden']);
      }
      for (const e of document.querySelectorAll('body *')) {
        if (getComputedStyle(e).display === 'none') {
          e.style.display = 'block';
          window.__tapados.push([e, 'display']);
        }
      }
    });
    await pagina.waitForTimeout(400);

    const recorte = await pagina.evaluate(() => {
      const tapados = window.__tapados ?? [];
      const fuera = [];
      let medidas = 0;
      for (const svg of document.querySelectorAll('svg[viewBox]')) {
        const [vx, vy, vw, vh] = svg.getAttribute('viewBox').split(/[\s,]+/).map(Number);
        /* `getBBox()` devuelve la caja en el espacio del PROPIO elemento, sin
           las transformaciones de sus antepasados. Un `<circle cx="0" cy="0"
           r="58">` dentro de un `<g transform="translate(255 -55)">` declara
           una caja de −58 a 58 y está dibujado de 197 a 313.

           Sin corregir esto el guardián daba un falso positivo en la arandela
           del tema 5 de Cálculo el mismo día que se amplió — y, peor, tenía el
           fallo simétrico: algo genuinamente fuera dentro de un grupo
           trasladado habría pasado en verde. La corrección compone la matriz
           del elemento con la inversa de la del `<svg>`, que es lo que lleva
           del espacio del elemento al del viewBox. */
        const raiz = svg.getScreenCTM();
        for (const t of svg.querySelectorAll('text, rect, circle, line')) {
          let b;
          try {
            b = t.getBBox();
          } catch {
            continue;
          }
          if (!b.width) continue;
          /* Los círculos solo cuentan si son MARCADORES CORTADOS: radio
             pequeño y centro dentro del marco. Al abrir las 96 páginas de
             examen por primera vez —29 de agosto de 2026— la regla marcó
             cuatro figuras y las cuatro eran correctas: tres círculos guía de
             radio 138 a 200 de los que solo se dibuja un arco, y unos
             marcadores de continuación con el centro fuera a propósito. Cero
             fallos reales de cuatro avisos: sin este filtro la regla enseñaría
             a ignorar el guardián, que es lo que §11 prohíbe. */
          if (t.tagName === 'circle') {
            const r = t.r?.baseVal?.value ?? 0;
            const cx = t.cx?.baseVal?.value ?? 0;
            const cy = t.cy?.baseVal?.value ?? 0;
            const dentro = cx >= vx && cx <= vx + vw && cy >= vy && cy <= vy + vh;
            if (r > 20 || !dentro) continue;
          }
          if (raiz) {
            const m = t.getScreenCTM();
            if (m) {
              const aVB = raiz.inverse().multiply(m);
              const xs = [];
              const ys = [];
              for (const [px, py] of [
                [b.x, b.y],
                [b.x + b.width, b.y],
                [b.x, b.y + b.height],
                [b.x + b.width, b.y + b.height],
              ]) {
                const p = new DOMPoint(px, py).matrixTransform(aVB);
                xs.push(p.x);
                ys.push(p.y);
              }
              b = {
                x: Math.min(...xs),
                y: Math.min(...ys),
                width: Math.max(...xs) - Math.min(...xs),
                height: Math.max(...ys) - Math.min(...ys),
              };
            }
          }
          medidas++;
          const holgura = 0.5;
          if (
            b.x < vx - holgura ||
            b.x + b.width > vx + vw + holgura ||
            b.y < vy - holgura ||
            b.y + b.height > vy + vh + holgura
          ) {
            /* Un `text` se nombra por lo que dice; una caja, por su etiqueta y
               su posición, que es lo único que la identifica al ir a buscarla. */
            const quien =
              t.tagName === 'text'
                ? `«${t.textContent.trim().slice(0, 30)}»`
                : `<${t.tagName} en x=${Math.round(b.x)} y=${Math.round(b.y)}>`;
            fuera.push(`${quien} en ${svg.getAttribute('aria-labelledby') ?? '?'}`);
          }
        }
      }

      for (const [e, que] of tapados) {
        if (que === 'hidden') e.hidden = true;
        else e.style.display = '';
      }
      /* Solo cuentan como figura los SVG que llevan alguna etiqueta dentro:
         KaTeX dibuja cada radical con su propio <svg viewBox>, y esos no tienen
         texto ninguno. Sin este filtro, una ruta con sesenta radicales parecía
         tener sesenta figuras sin medir. */
      const svgs = [...document.querySelectorAll('svg[viewBox]')]
        .filter((s) => s.querySelector('text')).length;
      return { fuera, medidas, svgs };
    });
    medidos.etiqueta += recorte.medidas;
    comprueba(
      recorte.fuera.length === 0,
      `nada se sale de su viewBox: ni etiquetas ni cajas (${recorte.medidas})`,
      recorte.fuera.length ? `recortadas: ${recorte.fuera.slice(0, 3).join(' · ')}` : '',
    );
    if (recorte.svgs > 0) {
      comprueba(
        recorte.medidas > 0,
        'las etiquetas de las figuras se han podido medir',
        `hay ${recorte.svgs} figuras y ninguna etiqueta medible: el guardián estaría pasando en vacío`,
      );
    }

    /* La lectura recuerda el modo en localStorage, así que hay que borrarlo
       antes de recargar: si no, el resto de comprobaciones se harían sobre una
       página en modo completo, que no es el estado en el que llega el alumno. */
    await pagina.evaluate(() => {
      try {
        localStorage.removeItem('modo-lectura');
      } catch {}
    });
    await pagina.reload({ waitUntil: 'networkidle' });
    await pagina.waitForTimeout(300);

    /* 2 · Las pestañas cambian de panel Y marcan cuál está activa.
       Con `:target` el panel cambia aunque el JavaScript no se haya
       enganchado; lo que delata el fallo es el marcador.

       Los nombres de las pestañas NO se escriben aquí. Un tema tiene
       «teoría / ejercicios» y un examen «examen / resoluciones», y hasta el 20
       de agosto de 2026 este guardián buscaba los del tema a pelo: al aparecer
       los exámenes se quedó esperando un `data-pestana="ejercicios"` que en
       esa página no existe. Se busca por lo que la pestaña CONTIENE, que es lo
       que de verdad importa, y así el guardián sobrevive a la siguiente
       plantilla que se invente. */
    const nombres = await pagina.evaluate(() => {
      const enlaces = [...document.querySelectorAll('.pestanas a[data-pestana]')];
      const conEjercicios = enlaces.find((a) =>
        document.getElementById(a.dataset.pestana)?.querySelector('[data-ejercicio]'),
      );
      const otra = enlaces.find((a) => a !== conEjercicios);
      return { ejercicios: conEjercicios?.dataset.pestana, otra: otra?.dataset.pestana };
    });

    if (nombres.ejercicios) {
      await pagina.click(`[data-pestana="${nombres.ejercicios}"]`);
      await pagina.waitForTimeout(200);

      const estado = await pagina.evaluate(() => ({
        panel: document.querySelector('[data-armazon]')?.dataset.panel,
        activa: document.querySelector('.pestanas a[aria-current="page"]')?.dataset.pestana,
      }));

      comprueba(
        estado.panel === nombres.ejercicios,
        `la pestaña «${nombres.ejercicios}» abre su panel`,
      );
      comprueba(
        estado.activa === nombres.ejercicios,
        'la pestaña abierta es la que aparece marcada',
        `marcada: ${estado.activa ?? 'ninguna'} — el manejador no se ha enganchado`,
      );

      /* 3 · Los controles de la lectura no tocan las pestañas. */
      await pagina.click(`[data-pestana="${nombres.otra}"]`);
      await pagina.waitForTimeout(200);
      const siguiente = await pagina.$('[data-pasos]:not([hidden]) [data-ir="1"]');
      if (siguiente && (await siguiente.isVisible())) {
        await siguiente.click();
        await pagina.waitForTimeout(200);
        const panel = await pagina.evaluate(
          () => document.querySelector('[data-armazon]')?.dataset.panel,
        );
        comprueba(
          panel === nombres.otra,
          'avanzar de apartado no cambia de pestaña',
          `el panel pasó a "${panel}"`,
        );
      }
    }

    /* 4 · Cada ejercicio guiado diagnostica el error concreto.
       Se escribe un distractor declarado en el YAML y se exige que la
       respuesta NO sea el mensaje genérico (§05: nunca «incorrecto»).

       Se recorren TODOS los ejercicios de la página, no el primero: el día
       que haya diez, el fallo estará en el que nadie miró. */
    const cuantos = (await pagina.$$('[data-ejercicio]')).length;
    if (cuantos && nombres.ejercicios) {
      await pagina.click(`[data-pestana="${nombres.ejercicios}"]`);
    }

    for (let n = 0; n < cuantos; n++) {
      await pagina.waitForTimeout(200);

      /* Se prueban TODOS los distractores declarados, no uno de muestra. Un
         distractor cuyo valor el lector de respuestas no sepa interpretar
         —una raíz mal escrita, un signo raro— nunca se dispararía, y el
         alumno recibiría «no es correcto» donde había un diagnóstico escrito.
         Eso no se ve leyendo el YAML. */
      const prueba = await pagina.evaluate(async (n) => {
        const raiz = document.querySelectorAll('[data-ejercicio]')[n];
        const titulo = raiz.querySelector('h3')?.textContent.trim() ?? `ejercicio ${n + 1}`;
        const datos = JSON.parse(raiz.querySelector('[data-datos]').textContent);
        const espera = (ms) => new Promise((r) => setTimeout(r, ms));

        for (const paso of raiz.querySelectorAll('[data-paso]')) paso.classList.remove('bloqueado');

        const mudos = [];
        let probados = 0;

        /* Los pasos de verificación no llevan distractores: el diagnóstico sale
           de comparar dos regiones. Se comprueban de otra manera —una condición
           imposible tiene que recibir diagnóstico, y la propia condición del
           enunciado tiene que darse por buena—, que es el equivalente. */
        for (let i = 0; i < datos.length; i++) {
          if (datos[i].tipo !== 'verificar') continue;
          const paso = raiz.querySelector(`[data-paso="${i}"]`);
          paso.classList.remove('bloqueado');
          const campo = paso.querySelector('input');
          const boton = paso.querySelector('[data-comprobar]');

          campo.value = 'x > 99999';
          boton.click();
          await espera(120);
          probados++;
          const dicho = (paso.querySelector('[data-fb]').textContent ?? '').trim();
          if (!/región/i.test(dicho) || dicho.length < 60) {
            mudos.push(`región vacía (paso ${i + 1}): «${dicho.slice(0, 40)}»`);
          }

          /* La condición del enunciado, escrita tal cual, tiene que valer: es
             trivialmente la misma región que ella misma. Si esto falla, algo
             se ha roto en el intérprete o en la comparación. */
          campo.value = datos[i].condicion;
          boton.click();
          await espera(150);
          probados++;
          if (!paso.classList.contains('resuelto')) {
            mudos.push(`la condición del enunciado no se acepta (paso ${i + 1})`);
          }
        }

        for (let i = 0; i < datos.length; i++) {
          if (datos[i].tipo !== 'calcular') continue;
          const paso = raiz.querySelector(`[data-paso="${i}"]`);

          for (let k = 0; k < datos[i].distractores.length; k++) {
            const esperado = paso
              .querySelector(`[data-msg-distractor="${k}"]`)
              .textContent.trim()
              .slice(0, 40);

            paso.querySelector('input').value = datos[i].distractores[k];
            paso.querySelector('[data-comprobar]').click();
            await espera(60);
            probados++;

            const dicho = (paso.querySelector('[data-fb]').textContent ?? '').trim();
            if (!dicho.includes(esperado)) {
              mudos.push(`${datos[i].distractores[k]} (paso ${i + 1})`);
            }
          }
        }

        return { titulo, probados, mudos };
      }, n);

      comprueba(
        prueba.probados > 0,
        `«${prueba.titulo}»: hay respuestas que probar (${prueba.probados})`,
      );
      comprueba(
        prueba.mudos.length === 0,
        `«${prueba.titulo}»: cada respuesta equivocada recibe su diagnóstico`,
        prueba.mudos.length ? `sin diagnosticar: ${prueba.mudos.join(', ')}` : '',
      );
    }
    } catch (e) {
      fallo(`la página ${ruta} no se pudo comprobar`, String(e).slice(0, 160));
    }
  }

  /* ── 360 px con las resoluciones abiertas ─────────────────────────
     Se añade el 24 de agosto de 2026, después de encontrar el fallo. Las
     páginas de examen desbordaban a lo ancho en un móvil —651 px de scroll
     en un viewport de 360— pero **solo al abrir una resolución**, porque es
     entonces cuando entran las fórmulas en bloque de KaTeX.

     Por eso no lo cazaba nadie: `verify.mjs` comprueba los 360 px leyendo el
     CSS en busca de anchos fijos (y aquí no había ninguno), y este fichero
     abría las páginas pero nunca desplegaba las resoluciones. Llevaba roto
     desde que existe el apartado de exámenes, en las 33 páginas.

     La causa era una regla responsive que sustituía `minmax(0, 1fr)` por
     `1fr` a secas y con eso devolvía a la columna su `min-width: auto`. */
  {
    const deExamen = rutas.filter((u) => u.includes('/examenes/'));
    const pagina = await navegador.newPage();
    await pagina.setViewportSize({ width: 360, height: 900 });
    const desbordan = [];

    for (const url of deExamen.slice(0, 6)) {
      // el fragmento activa la pestaña; sin él los botones están ocultos
      await pagina.goto(`http://localhost:${PUERTO}${url}#resoluciones`, { waitUntil: 'load' });
      await pagina.waitForTimeout(200);
      for (const caja of await pagina.$$('[data-ejercicio]')) {
        for (const b of await caja.$$('button')) {
          if (!/resoluci/i.test((await b.innerText()) ?? '')) continue;
          // si uno no se deja pulsar no se para el guardián: se sigue con el resto
          await b.click({ timeout: 2000 }).catch(() => {});
          break;
        }
      }
      await pagina.waitForTimeout(250);
      const ancho = await pagina.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        visible: window.innerWidth,
      }));
      if (ancho.scroll > ancho.visible + 1) {
        desbordan.push(`${url.split('/').filter(Boolean).pop()} → ${ancho.scroll}px`);
      }
    }
    await pagina.close();

    comprueba(
      desbordan.length === 0,
      `a 360 px, las resoluciones de examen abiertas no desbordan (${Math.min(6, deExamen.length)} páginas)`,
      desbordan.join(', '),
    );
  }

  console.log('');
  comprueba(
    medidos.raiz > 0 && medidos.barra > 0,
    `en todo el sitio hay raíces (${medidos.raiz}) y barras (${medidos.barra}) que medir`,
    'sin ninguna, la comprobación de trazos estaría pasando en vacío',
  );
  comprueba(
    erroresConsola.length === 0,
    'cero errores de JavaScript en consola',
    erroresConsola.slice(0, 3).join(' | '),
  );

  await navegador.close();
}

try {
  console.log('Navegador — comprobaciones que el HTML no puede dar\n');
  await main();
} catch (e) {
  fallo('la comprobación no pudo completarse', String(e));
} finally {
  servidor.kill();
}

console.log('');
if (fallos) {
  console.error(`${fallos} fallo(s) en navegador. El despliegue se queda parado.`);
  process.exit(1);
}
console.log('Navegador: en verde.');
