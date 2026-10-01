/**
 * Que cada taller de Expresión Gráfica se deje construir en un navegador:
 * trazar, crear puntos, marcarlos y recibir su respuesta en la caja del paso.
 *
 * POR QUÉ, SI EL BUILD YA LO COMPRUEBA. `lib/construir.ts` verifica en el
 * build la LÓGICA: que cada error declarado salta con su diagnóstico y no se
 * da por bueno. Lo que no puede ver es el CABLEADO: que un clic en la lámina
 * llegue al punto que toca con el enganche, que la marca se corrija, que el
 * mensaje aparezca en la caja del paso, que la pista salga al tercer fallo y
 * la solución al quinto, y que al terminar se abra el paso siguiente. Eso
 * solo se ve construyendo, y aquí se construye como lo haría un alumno.
 *
 * CÓMO LLEGA AL TALLER. Como un alumno: resuelve los pasos `reconocer` de
 * antes pulsando su opción buena. No usa el modo «resolución completa», que
 * abriría el paso de golpe pero dibujando ya la solución encima, y entonces
 * «la solución sale al quinto fallo» se daría por buena sin mirar nada. El
 * modo completo se comprueba aparte, al final, en una carga limpia.
 *
 * CÓMO CONSTRUYE. Para cada objetivo, por orden: una línea de referencia
 * vertical enganchada a un segmento de la lámina en la x del punto bueno, y
 * un punto sobre ella a la altura del bueno. Primero se prueba un error —el
 * mismo punto un centímetro más abajo— y después el bueno. En el primer
 * objetivo se falla cinco veces seguidas, para ver la pista y la solución.
 * Se pasa en claro y en oscuro, y a 1280 y a 360 px.
 *
 *   npm run talleres
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { chromium } from 'playwright';
import { ROOT, levanta } from './servidor.mjs';

const DIST = join(ROOT, 'dist');
const PUERTO = 4329;
/** Un centímetro de la lámina, en pt: lo que se desplaza el punto malo. */
const UN_CM = 28.35;

/** Las páginas publicadas que llevan un taller. */
function paginasConTaller(dir = DIST) {
  const out = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) out.push(...paginasConTaller(ruta));
    else if (nombre === 'index.html' && readFileSync(ruta, 'utf8').includes('data-taller-datos')) {
      out.push(relative(DIST, dir).split(sep).join('/'));
    }
  }
  return out;
}

const fallos = [];
/** Lo que no falla pero se dice: objetivos de una lámina densa creados por la
 *  puerta de pruebas del Taller. */
const avisos = [];
const ok = (m) => console.log(`  ✓ ${m}`);
const mal = (m) => {
  fallos.push(m);
  console.log(`  ✗ ${m}`);
};

/* `TALLERES_SOLO=ejercicio-54 npm run talleres` prueba solo las páginas cuya
   ruta contiene eso: para mirar un fallo sin esperar a todas. */
const paginas = paginasConTaller().filter((r) => !process.env.TALLERES_SOLO || r.includes(process.env.TALLERES_SOLO));
if (paginas.length === 0) {
  console.log('No hay ningún taller publicado: nada que comprobar.');
  process.exit(0);
}

const { origen, para } = await levanta({ puerto: PUERTO });
const navegador = await chromium.launch();
try {
  for (const tema of ['claro', 'oscuro']) {
    for (const ancho of [1280, 360]) {
      for (const ruta of paginas) {
        console.log(`\n${ruta} · ${tema} · ${ancho} px`);
        const contexto = await navegador.newContext({
          viewport: { width: ancho, height: 900 },
          colorScheme: tema === 'oscuro' ? 'dark' : 'light',
        });
        const pagina = await contexto.newPage();
        const errores = [];
        pagina.on('pageerror', (e) => errores.push(e.message));
        pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));

        await abre(pagina, ruta);
        const talleres = pagina.locator('[data-taller]');
        const n = await talleres.count();
        if (n === 0) mal(`${ruta}: la página dice tener un taller y no se encuentra ninguno`);
        /* Un taller que revienta se apunta como fallo y se sigue con el
           siguiente: el guion no puede caerse a medias sin decir qué vio. */
        for (let t = 0; t < n; t++) {
          const quien = `${ruta} · taller ${t + 1}`;
          try {
            await compruebaTaller(pagina, talleres.nth(t), quien);
          } catch (e) {
            mal(`${quien}: se interrumpió la comprobación: ${e.message}`);
          }
        }

        /* El modo completo, en una carga limpia: dibuja la solución sin que
           nadie la haya ganado, que es lo que pide quien lo abre. */
        await abre(pagina, ruta);
        for (let t = 0; t < n; t++) {
          const taller = pagina.locator('[data-taller]').nth(t);
          const quien = `${ruta} · taller ${t + 1}`;
          const antes = await taller.locator('[data-capa="solucion"] > *').count();
          const boton = taller.locator('xpath=ancestor::section[@data-ejercicio][1]').locator('[data-modo="completo"]');
          /* Con dos talleres en el mismo ejercicio, el botón ya se pulsó para
             el primero y dibujó los dos. */
          const yaPulsado = (await boton.getAttribute('aria-pressed')) === 'true';
          if (!yaPulsado) await boton.click();
          const despues = await taller.locator('[data-capa="solucion"] > *').count();
          if ((antes === 0 || yaPulsado) && despues > 0) ok(`${quien}: el modo completo dibuja la solución`);
          else mal(`${quien}: el modo completo no dibuja la solución (antes ${antes}, después ${despues})`);
        }

        if (errores.length) mal(`${ruta}: errores en la consola: ${errores.slice(0, 3).join(' | ')}`);
        await contexto.close();
      }
    }
  }
} finally {
  await navegador.close();
  para();
}

const unicos = [...new Set(avisos)];
if (unicos.length) console.log(`\n${unicos.length} aviso(s), que no bloquean:\n  · ${unicos.join('\n  · ')}`);
console.log(fallos.length ? `\n${fallos.length} fallos en los talleres.` : '\nTalleres: en verde.');
process.exit(fallos.length ? 1 : 0);

/** Carga la página y, si los ejercicios van detrás de una pestaña, la abre.
 *
 *  Hasta el 28 de septiembre de 2026 los talleres vivían en la pestaña de
 *  ejercicios de su tema, y este guion la pulsaba siempre. Desde la fase E4
 *  viven en su bloque de diez, a la vista y sin pestaña, y pulsarla a ciegas
 *  esperaba treinta segundos a un botón que ya no existe y tumbaba el suelo. */
async function abre(pagina, ruta) {
  await pagina.goto(`${origen}/${ruta}/`, { waitUntil: 'load' });
  /* Desde el 1 de octubre de 2026 también hay talleres en las páginas de
     examen —los ejercicios de varios apartados de la colección de Expresión
     Gráfica—, y ahí los ejercicios van en la pestaña de resoluciones: sin
     abrirla, ningún botón se ve y cada clic espera treinta segundos. */
  for (const nombre of ['ejercicios', 'resoluciones']) {
    const pestana = pagina.locator(`[data-pestana="${nombre}"]`);
    if (await pestana.count()) {
      await pestana.first().click();
      break;
    }
  }
}

/** Resuelve, como un alumno, los pasos de antes del taller. Solo sabe de
 *  `reconocer`: con otro paso delante lo dice, en vez de saltárselo. */
async function llegaAlPaso(ejercicio, indice) {
  const datos = JSON.parse(await ejercicio.locator('[data-datos]').textContent());
  for (let i = 0; i < indice; i++) {
    /* Un ejercicio con dos talleres (los de varios apartados de la colección
       de Expresión Gráfica, 1 de octubre de 2026): el primero ya se ha
       construido entero antes de llegar al segundo, y su paso está resuelto. */
    if ((await ejercicio.locator(`li[data-paso="${i}"]`).getAttribute('class'))?.includes('resuelto')) continue;
    if (datos[i].tipo !== 'reconocer') {
      throw new Error(`el paso ${i + 1}, de tipo ${datos[i].tipo}, va antes del taller y el comprobador no sabe resolverlo`);
    }
    await ejercicio.locator(`li[data-paso="${i}"] [data-opcion="${datos[i].correcta}"]`).click();
  }
}

async function compruebaTaller(pagina, taller, quien) {
  const paso = taller.locator('xpath=ancestor::li[@data-paso][1]');
  const ejercicio = taller.locator('xpath=ancestor::section[@data-ejercicio][1]');
  const indice = Number(await paso.getAttribute('data-paso'));
  try {
    await llegaAlPaso(ejercicio, indice);
  } catch (e) {
    mal(`${quien}: ${e.message}`);
    return;
  }
  if ((await paso.getAttribute('class'))?.includes('bloqueado')) {
    mal(`${quien}: resueltos los pasos de antes, el del taller sigue bloqueado`);
    return;
  }

  const datos = JSON.parse(await taller.locator('[data-taller-datos]').textContent());
  const lienzo = taller.locator('[data-lienzo]');
  const caja = paso.locator('[data-fb]');
  const solucion = taller.locator('[data-capa="solucion"] > *');

  /** Pulsa en la lámina en coordenadas suyas (pt), con el lienzo a la vista. */
  const pulsa = async ([x, y]) => {
    await lienzo.scrollIntoViewIfNeeded();
    /* Con la lupa puesta, el punto puede quedar fuera del marco o de la
       pantalla: se mueve el marco y, si hace falta, la página, como haría un
       alumno con el dedo. */
    const punto = await lienzo.evaluate((svg, [px, py]) => {
      const marco = svg.parentElement;
      const aPantalla = () => {
        const m = svg.getScreenCTM();
        return { x: m.a * px + m.c * py + m.e, y: m.b * px + m.d * py + m.f };
      };
      let q = aPantalla();
      const r = marco.getBoundingClientRect();
      if (q.x < r.left + 12 || q.x > r.right - 12 || q.y < r.top + 12 || q.y > r.bottom - 12) {
        /* Sin animar: con `scroll-behavior: smooth` el desplazamiento llega
           después de medir, y el clic caería donde estaba el punto. */
        marco.scrollBy({ left: q.x - (r.left + r.width / 2), top: q.y - (r.top + r.height / 2), behavior: 'instant' });
        q = aPantalla();
      }
      /* Y si algo lo tapa —la cabecera fija de la página, a 40 px del borde
         con la lupa a ×4 en SD26—, el clic se lo llevaría eso: la página se
         mueve hasta dejar el punto en medio de la pantalla. */
      const tapado = () => {
        const el = document.elementFromPoint(q.x, q.y);
        return !el || !svg.contains(el);
      };
      if (q.y < 12 || q.y > innerHeight - 12 || tapado()) {
        scrollBy({ top: q.y - innerHeight / 2, behavior: 'instant' });
        q = aPantalla();
      }
      return q;
    }, [x, y]);
    await pagina.mouse.click(punto.x, punto.y);
  };
  const herramienta = (h) => taller.locator(`[data-herr="${h}"]`).click();

  /* El imán del Taller engancha a un punto a 1,4·r y a un cruce a r, con
     r = 11 px de pantalla en pt de la lámina (`ENGANCHE_PX` en Taller.astro).
     A 1280 px son unos 5 pt y a 360 px unos 12: la holgura se mide con el del
     ancho en que se prueba, no con el del móvil para los dos. */
  await lienzo.scrollIntoViewIfNeeded();
  const radioAhora = () =>
    lienzo.evaluate((svg) => {
      const m = svg.getScreenCTM();
      return m ? 11 / Math.hypot(m.a, m.b) : 5;
    });
  let r = await radioAhora();
  let umbral = 1.4 * r + 1;
  const corte2 = ([a, b], [c, e]) => {
    const u = [b[0] - a[0], b[1] - a[1]], v = [e[0] - c[0], e[1] - c[1]];
    const den = u[0] * v[1] - u[1] * v[0];
    if (Math.abs(den) < 1e-9) return null;
    const t = ((c[0] - a[0]) * v[1] - (c[1] - a[1]) * v[0]) / den;
    const w = ((c[0] - a[0]) * u[1] - (c[1] - a[1]) * u[0]) / den;
    return t >= 0 && t <= 1 && w >= 0 && w <= 1 ? [a[0] + t * u[0], a[1] + t * u[1]] : null;
  };
  const cruces = [];
  for (let i = 0; i < datos.segmentos.length; i++)
    for (let j = i + 1; j < datos.segmentos.length; j++) {
      const x = corte2(datos.segmentos[i], datos.segmentos[j]);
      if (x) cruces.push(x);
    }
  /** Si un clic en q engancharía a q y no a otra cosa de la lámina. */
  const sinVecinos = (q) =>
    cruces.every((x) => { const d = Math.hypot(x[0] - q[0], x[1] - q[1]); return d < 0.5 || d > umbral; }) &&
    datos.puntos.every((pt) => { const d = Math.hypot(pt.x - q[0], pt.y - q[1]); return d < 0.5 || d > umbral; });

  /** Una vertical por el punto dado, enganchada al segmento de la lámina que
   *  la cruce más lejos de él: el enganche deja un punto donde se pulsa, y si
   *  queda cerca del que se va a marcar después, el clic se pega a ese punto
   *  viejo (pasó con EF en SD4, a 8,9 pt). */
  /** Dónde cruzan los segmentos de la lámina la vertical x = v (o la
   *  horizontal y = v), del más lejano al más cercano a `cerca`. */
  const cortesDe = (eje, v, cerca) => {
    const [i, j] = eje === 'x' ? [0, 1] : [1, 0];
    return datos.segmentos
      .filter(([a, b]) => Math.abs(b[i] - a[i]) > 1 && v >= Math.min(a[i], b[i]) + 1 && v <= Math.max(a[i], b[i]) - 1)
      .map(([a, b]) => a[j] + ((v - a[i]) * (b[j] - a[j])) / (b[i] - a[i]))
      .sort((p, q) => Math.abs(q - cerca) - Math.abs(p - cerca));
  };
  const conHorizontal = (await taller.locator('[data-herr="horizontal"]').count()) > 0;
  /** El apoyo de la línea que lleva al punto bueno: la vertical por su x,
   *  enganchada al cruce más lejano que no tenga otro al lado —en una lámina
   *  densa, el imán se llevaba la vertical al cruce vecino, a 4 pt, y el
   *  punto caía 3 pt fuera de su sitio (L₂ del Ejercicio 53)—; si no hay
   *  ninguno, la horizontal por su y. Un objetivo que cae donde ningún
   *  segmento cruza su vertical (un abatido, el vértice de una pirámide) se
   *  construye así, como lo haría un alumno con la otra regla. */
  const apoyo = ([x, y]) => {
    const v = cortesDe('x', x, y).find((c) => sinVecinos([x, c]));
    if (v !== undefined) return { herr: 'vertical', en: [x, v], libre: true };
    const h = conHorizontal ? cortesDe('y', y, x).find((c) => sinVecinos([c, y])) : undefined;
    if (h !== undefined) return { herr: 'horizontal', en: [h, y], libre: true };
    const v0 = cortesDe('x', x, y)[0];
    return v0 !== undefined ? { herr: 'vertical', en: [x, v0], libre: false } : null;
  };
  const vertical = async (q) => {
    const a = apoyo(q);
    if (!a) throw new Error(`ningún segmento de la lámina cruza la vertical ni la horizontal de (${q.map((v) => v.toFixed(1)).join(', ')})`);
    await herramienta(a.herr);
    await pulsa(a.en);
  };
  const marca = async (k, xy) => {
    await taller.locator(`[data-objetivo="${k}"]`).click();
    await pulsa(xy);
  };
  const clase = async () => (await caja.getAttribute('class')) ?? '';

  /* De las posiciones que valen para un objetivo, la primera que cae dentro
     de la lámina con margen y que cruza algún segmento, para poder enganchar
     la vertical: los abatidos de SD4 valen en ocho sitios y alguno sale del
     dibujo, donde no se puede pulsar. */
  const { x: ex, y: ey, w: ew, h: eh } = datos.encuadre;
  /** Si hay dónde apoyar la línea que lleva a q (ver `apoyo`). */
  const cruzaQ = (q) => apoyo(q) !== null;
  const dentro = ([x, y]) => x > ex + 5 && x < ex + ew - 5 && y > ey + 5 && y < ey + eh - 5;
  /* Y lejos de lo que atrae el enganche: los cruces de su vertical con la
     lámina y los puntos dados. A 360 px el enganche abarca unos 9 pt, y un
     objetivo a 8,9 pt de un cruce —el abatido de F en el alzado, junto al
     cable CD— no se puede marcar: el clic se va al cruce. Un alumno haría lo
     mismo que aquí: construir otra de las posiciones que valen. Encima de un
     cruce sí vale, y es lo normal —Q₁ está en el alero, los vértices de SD5
     en sus rectas—: ahí el enganche ayuda. */
  const lejos = (d) => d < 0.5 || d > umbral;
  const libre = ([x, y]) => {
    const a = apoyo([x, y]);
    const [eje, v, c] = a?.herr === 'horizontal' ? ['y', y, x] : ['x', x, y];
    return (
      cortesDe(eje, v, c).every((k) => lejos(Math.abs(k - c))) &&
      datos.puntos.every((p) => lejos(Math.hypot(p.x - x, p.y - y)))
    );
  };

  /* La lupa, lo justo para que cada objetivo tenga una posición buena que se
     pueda marcar sin que el imán se vaya a un vecino: las láminas SD no la
     necesitan; los ejercicios de varios apartados de la colección, sí. */
  /* Marcable: dentro de la lámina, con un apoyo sin vecinos para su línea y
     lejos de lo que atrae el imán a lo largo de ella. */
  const marcables = () =>
    datos.objetivos.every((o) => o.es.ramas.some((rama) => rama.some((q) => dentro(q) && apoyo(q)?.libre && libre(q))));
  const ampliar = taller.locator('[data-lupa="1"]');
  for (let n = 1; n < 4 && !marcables() && (await ampliar.count()) && !(await ampliar.isDisabled()); n++) {
    await ampliar.click();
    r = await radioAhora();
    umbral = 1.4 * r + 1;
  }

  let elegidas = {};
  const densos = [];
  for (const [k, o] of datos.objetivos.entries()) {
    const rama = o.es.eleccion !== undefined ? (elegidas[o.es.eleccion] ?? 0) : 0;
    /* La posición buena que se puede construir como un alumno: con una línea
       de apoyo sin vecinos y lejos de lo que atrae el imán. Si no hay
       ninguna —una lámina densa—, la primera dentro de la lámina, y sus
       puntos se crean por la puerta de pruebas del Taller (`taller:punto`):
       se comprueba igual que se corrigen y hablan, y se avisa. Solo falla si
       la solución cae fuera de la lámina, porque entonces nadie la marcaría. */
    const construible = o.es.ramas[rama].find((q) => dentro(q) && apoyo(q)?.libre && libre(q));
    const bueno = construible ?? o.es.ramas[rama].find((q) => dentro(q));
    if (!bueno) {
      mal(`${quien}: ${o.rotulo} no tiene ninguna posición buena dentro de la lámina`);
      continue;
    }
    const porLaPuerta = !construible;
    if (porLaPuerta) densos.push(o.rotulo);
    const porPuerta = (q) => taller.evaluate((el, [x, y]) => el.dispatchEvent(new CustomEvent('taller:punto', { detail: { x, y } })), q);
    const masCerca = (q) =>
      taller.locator('[data-capa="puntos"] circle').evaluateAll(
        (cs, [x, y]) => cs.map((c) => Math.hypot(Number(c.getAttribute('cx')) - x, Number(c.getAttribute('cy')) - y)).sort((a, b) => a - b)[0] ?? Infinity,
        q,
      );
    /* Se construye como un alumno; si el punto no queda donde toca —el imán
       lo ha llevado a otra cosa de una lámina densa, quizá a un punto que este
       mismo guion dejó antes—, se crea por la puerta de pruebas y se avisa.
       Así lo único que falla es un punto exacto que el Taller no acepta. */
    const creaEn = async (q) => {
      if (porLaPuerta) return porPuerta(q);
      await herramienta('punto');
      await pulsa(q);
      if ((await masCerca(q)) > 0.5) {
        await porPuerta(q);
        if (!densos.includes(o.rotulo)) densos.push(o.rotulo);
      }
    };
    /* Un centímetro más abajo, salvo que se salga de la lámina: Q₁ de SD1
       está a 28 pt del borde inferior, y el clic caía fuera del dibujo. */
    /* El punto malo, un centímetro más allá sobre la misma línea que lleva
       al bueno: más abajo en la vertical, o a un lado en la horizontal, sin
       salirse de la lámina. Fuera de la línea no se puede crear: el imán no
       tiene nada a lo que engancharse. */
    const enHorizontal = apoyo(bueno)?.herr === 'horizontal';
    const [iB, lo, ancho] = enHorizontal ? [0, datos.encuadre.x, datos.encuadre.w] : [1, datos.encuadre.y, datos.encuadre.h];
    const mas = bueno[iB] + UN_CM;
    const coord = mas < lo + ancho - 5 ? mas : bueno[iB] - UN_CM;
    const malo = enHorizontal ? [coord, bueno[1]] : [bueno[0], coord];
    if (!porLaPuerta) await vertical(bueno);
    await creaEn(malo);
    if (k === 0) {
      for (let i = 0; i < 4; i++) await marca(k, malo);
      if ((await solucion.count()) === 0) ok(`${quien}: a los cuatro fallos la solución sigue sin dibujarse`);
      else mal(`${quien}: la solución se dibuja antes del quinto fallo`);
    }
    await marca(k, malo);
    if ((await clase()).includes('mal') && (await caja.innerText()).trim().length > 20) ok(`${quien}: ${o.rotulo} mal marcado recibe su diagnóstico`);
    else mal(`${quien}: ${o.rotulo} mal marcado no dice nada`);
    if (k === 0) {
      const texto = await caja.innerText();
      if (/pista/i.test(texto) && /desarrollo/i.test(texto)) ok(`${quien}: al quinto fallo, la pista y el desarrollo`);
      else mal(`${quien}: al quinto fallo faltan la pista o el desarrollo`);
      if ((await solucion.count()) > 0) ok(`${quien}: al quinto fallo la solución se dibuja encima`);
      else mal(`${quien}: al quinto fallo la solución no se dibuja`);
    }
    await creaEn(bueno);
    /* En el primero, además, se deja una recta a medias antes de marcar:
       marcar tiene que abandonarla, como cambiar de herramienta, o el clic
       siguiente la remataría desde un punto viejo (revisión del 27 de
       septiembre de 2026). */
    if (k === 0) {
      await herramienta('recta');
      await pulsa(malo);
    }
    await marca(k, bueno);
    if ((await clase()).includes('bien')) ok(`${quien}: ${o.rotulo} bien marcado se da por bueno`);
    else {
      /* Dónde está de verdad el punto más cercano al bueno: si no cayó en su
         sitio, el fallo es del clic, no del ejercicio. */
      const cerca = await taller.locator('[data-capa="puntos"] circle').evaluateAll(
        (cs, [x, y]) => cs.map((c) => Math.hypot(Number(c.getAttribute('cx')) - x, Number(c.getAttribute('cy')) - y)).sort((a, b) => a - b)[0] ?? -1,
        bueno,
      );
      mal(`${quien}: ${o.rotulo} en su sitio no se da por bueno (el punto más cercano está a ${cerca.toFixed(1)} pt; ${(await caja.innerText()).slice(0, 90)})`);
    }
    if (k === 0) {
      /* El clic de después, a un centímetro o más de los dos puntos que ya
         hay: más cerca, a 360 px el enganche lo pega a uno de ellos, y con
         dos puntos iguales no sale recta ni con el fallo. */
      const { y: ey, h: eh } = datos.encuadre;
      const lado = Math.sign(bueno[1] - malo[1]);
      const y = [bueno[1] + lado * UN_CM, malo[1] - lado * UN_CM].find((v) => v > ey + 5 && v < ey + eh - 5);
      const lineas = taller.locator('[data-capa="usuario"] line');
      const antes = await lineas.count();
      await pulsa([bueno[0], y]);
      if ((await lineas.count()) === antes) ok(`${quien}: marcar un punto abandona la recta que estaba a medias`);
      else mal(`${quien}: después de marcar, un clic remata la recta que se había dejado a medias`);
      await herramienta('punto');
    }
    if (o.es.eleccion !== undefined && elegidas[o.es.eleccion] === undefined) elegidas = { ...elegidas, [o.es.eleccion]: rama };
  }
  if (densos.length) {
    avisos.push(`${quien}: ${densos.join(', ')}, en una lámina tan densa que se crearon por la puerta de pruebas`);
  }
  if ((await paso.getAttribute('class'))?.includes('resuelto')) ok(`${quien}: con todos los puntos, el paso queda resuelto`);
  else mal(`${quien}: con todos los puntos marcados, el paso no se resuelve`);
  const siguiente = ejercicio.locator(`li[data-paso="${indice + 1}"]`);
  if ((await siguiente.count()) > 0 && !(await siguiente.getAttribute('class'))?.includes('bloqueado')) {
    ok(`${quien}: y se abre el paso siguiente`);
  } else if ((await siguiente.count()) > 0) {
    mal(`${quien}: resuelto el taller, el paso siguiente sigue bloqueado`);
  }
}
