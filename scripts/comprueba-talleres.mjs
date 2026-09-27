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
const ok = (m) => console.log(`  ✓ ${m}`);
const mal = (m) => {
  fallos.push(m);
  console.log(`  ✗ ${m}`);
};

const paginas = paginasConTaller();
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
        for (let t = 0; t < n; t++) await compruebaTaller(pagina, talleres.nth(t), `${ruta} · taller ${t + 1}`);

        /* El modo completo, en una carga limpia: dibuja la solución sin que
           nadie la haya ganado, que es lo que pide quien lo abre. */
        await abre(pagina, ruta);
        for (let t = 0; t < n; t++) {
          const taller = pagina.locator('[data-taller]').nth(t);
          const quien = `${ruta} · taller ${t + 1}`;
          const antes = await taller.locator('[data-capa="solucion"] > *').count();
          await taller.locator('xpath=ancestor::section[@data-ejercicio][1]').locator('[data-modo="completo"]').click();
          const despues = await taller.locator('[data-capa="solucion"] > *').count();
          if (antes === 0 && despues > 0) ok(`${quien}: el modo completo dibuja la solución`);
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

console.log(fallos.length ? `\n${fallos.length} fallos en los talleres.` : '\nTalleres: en verde.');
process.exit(fallos.length ? 1 : 0);

/** Carga la página y abre la pestaña de ejercicios, que es donde viven. */
async function abre(pagina, ruta) {
  await pagina.goto(`${origen}/${ruta}/`, { waitUntil: 'load' });
  await pagina.locator('[data-pestana="ejercicios"]').first().click();
}

/** Resuelve, como un alumno, los pasos de antes del taller. Solo sabe de
 *  `reconocer`: con otro paso delante lo dice, en vez de saltárselo. */
async function llegaAlPaso(ejercicio, indice) {
  const datos = JSON.parse(await ejercicio.locator('[data-datos]').textContent());
  for (let i = 0; i < indice; i++) {
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
    const punto = await lienzo.evaluate((svg, [px, py]) => {
      const m = svg.getScreenCTM();
      return { x: m.a * px + m.c * py + m.e, y: m.b * px + m.d * py + m.f };
    }, [x, y]);
    await pagina.mouse.click(punto.x, punto.y);
  };
  const herramienta = (h) => taller.locator(`[data-herr="${h}"]`).click();

  /** Una vertical en la x dada, enganchada a un segmento de la lámina que la cruce. */
  const vertical = async (x) => {
    const s = datos.segmentos.find(([a, b]) => Math.abs(b[0] - a[0]) > 1 && x >= Math.min(a[0], b[0]) + 1 && x <= Math.max(a[0], b[0]) - 1);
    if (!s) throw new Error(`ningún segmento de la lámina cruza x = ${x}`);
    const [a, b] = s;
    const y = a[1] + ((x - a[0]) * (b[1] - a[1])) / (b[0] - a[0]);
    await herramienta('vertical');
    await pulsa([x, y]);
  };
  const marca = async (k, xy) => {
    await taller.locator(`[data-objetivo="${k}"]`).click();
    await pulsa(xy);
  };
  const clase = async () => (await caja.getAttribute('class')) ?? '';

  let elegidas = {};
  for (const [k, o] of datos.objetivos.entries()) {
    const rama = o.es.eleccion !== undefined ? (elegidas[o.es.eleccion] ?? 0) : 0;
    const bueno = o.es.ramas[rama][0];
    /* Un centímetro más abajo, salvo que se salga de la lámina: Q₁ de SD1
       está a 28 pt del borde inferior, y el clic caía fuera del dibujo. */
    const abajo = bueno[1] + UN_CM;
    const malo = [bueno[0], abajo < datos.encuadre.y + datos.encuadre.h - 5 ? abajo : bueno[1] - UN_CM];
    await vertical(bueno[0]);
    await herramienta('punto');
    await pulsa(malo);
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
    await herramienta('punto');
    await pulsa(bueno);
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
    else mal(`${quien}: ${o.rotulo} en su sitio no se da por bueno (${await caja.innerText()})`);
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
  if ((await paso.getAttribute('class'))?.includes('resuelto')) ok(`${quien}: con todos los puntos, el paso queda resuelto`);
  else mal(`${quien}: con todos los puntos marcados, el paso no se resuelve`);
  const siguiente = ejercicio.locator(`li[data-paso="${indice + 1}"]`);
  if ((await siguiente.count()) > 0 && !(await siguiente.getAttribute('class'))?.includes('bloqueado')) {
    ok(`${quien}: y se abre el paso siguiente`);
  } else if ((await siguiente.count()) > 0) {
    mal(`${quien}: resuelto el taller, el paso siguiente sigue bloqueado`);
  }
}
