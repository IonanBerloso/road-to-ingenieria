/**
 * scripts/contraste.mjs — mide el contraste de TODO el texto publicado.
 *
 * POR QUÉ EXISTE, y la fecha importa. El 18 de septiembre de 2026 se
 * descubrió que **seis de las siete rutas de la ficha de asignatura estaban
 * publicadas con 1,05:1 de contraste**: el bloque se dibujó con la paleta de
 * la pizarra —`--tiza` sobre fondo oscuro— y acabó colocado sobre el papel.
 * Eran invisibles, y son el destino del único botón de la banda.
 *
 * Llevaba semanas así. No lo cazó nadie porque **ningún guardián miraba el
 * color**: `verify.mjs` comprueba que nadie apague el `outline` del foco y que
 * la regla global de `:focus-visible` pinte un anillo; `humo.mjs` comprueba
 * desbordes a 360 px, enlaces rotos y errores de JavaScript. Ninguno de los
 * dos abre una página y pregunta «¿se lee esto?».
 *
 * Y es el fallo que peor se detecta a ojo: quien escribió el CSS ve el nombre
 * del token, no el color resultante, y quien mira la captura ve un bloque
 * pálido y supone que es el diseño. La única manera es medirlo.
 *
 * QUÉ MIDE. El ratio de la WCAG 2.1 entre el color del texto y el fondo
 * efectivo sobre el que se pinta, en las dos variantes del sitio —claro y
 * oscuro—, sobre una muestra de páginas de cada tipo.
 *
 * EL LISTÓN. 4,5:1 para texto normal y 3:1 para texto grande, que es el AA de
 * la WCAG. Texto grande es ≥ 24 px, o ≥ 18,66 px si va en negrita.
 *
 * LO QUE NO MIDE, dicho para que nadie lo dé por cubierto:
 *
 *   · **Texto sobre gradiente o imagen.** `--pizarra` es un `radial-gradient`
 *     y no tiene un color con el que comparar. Esos nodos se cuentan aparte y
 *     se imprimen, pero no hacen fallar: inventar un color medio sería dar por
 *     comprobado algo que no se ha comprobado (§10).
 *   · **Contraste de elementos no textuales** —bordes, iconos, la línea de una
 *     gráfica—, que la WCAG pide a 3:1 y aquí no se toca.
 *   · **Los estados**: hover, foco y activo no se visitan.
 *
 *     node scripts/contraste.mjs            (levanta el servidor él mismo)
 *     CONTRASTE_SERVIDOR=fuera node scripts/contraste.mjs
 */
import { chromium } from 'playwright';
import { levanta } from './servidor.mjs';

/* El servidor y el `base` los pone `servidor.mjs`, que los lee del propio
   `astro.config`. Sin el `base` las URLs dan 404 y la página carga sin CSS —
   que fue exactamente el error que llevó a medir «344 px de ancho de texto»
   el 17 de septiembre sobre una página sin estilos. Hasta el 26 de
   septiembre de 2026 este guion lo buscaba con una expresión regular en el
   texto del fichero: la tercera forma distinta de leer el mismo dato. */
const PUERTO = Number(process.env.CONTRASTE_PUERTO ?? 4331);
const SERVIDOR_FUERA = process.env.CONTRASTE_SERVIDOR === 'fuera';
let ORIGEN = '';
let servidor = null;

let fallos = 0;
const ok = (t) => console.log(`  ✓ ${t}`);
const fallo = (t, detalle) => {
  console.error(`  ✗ ${t}`);
  if (detalle) console.error(detalle);
  fallos++;
};

/* ── servidor ───────────────────────────────────────────────────────── */

async function esperaServidor() {
  servidor = await levanta({ puerto: PUERTO, fuera: SERVIDOR_FUERA });
  ORIGEN = servidor.origen;
}

/* ── la muestra ─────────────────────────────────────────────────────── */

/** Una página de cada tipo que hay en el sitio, no una por asignatura: lo que
 *  se mide es el CSS, y el CSS lo comparten todas las de un mismo tipo. La
 *  portada va primero porque es donde estaba el fallo que originó esto. */
const MUESTRA = [
  ['la portada', '/'],
  ['la portada con una ficha abierta', '/#calculo'],
  ['un tema', '/calculo/t02-sucesiones/'],
  ['una ruta de estudio', '/calculo/preparar/2ev/'],
  ['el índice de exámenes', '/calculo/examenes/'],
  ['una convocatoria', '/calculo/examenes/2019-2020-ord/'],
  ['el formulario', '/calculo/formulario/'],
  ['el laboratorio', '/calculo/laboratorio/'],
];

/* ── la medida, dentro del navegador ────────────────────────────────── */

/** Recorre el DOM y devuelve un parte por cada nodo con texto visible.
 *
 *  Se ejecuta dentro de la página, así que no puede usar nada de fuera. */
function mideEnLaPagina() {
  /** Un color CSS a {r,g,b,a}. `getComputedStyle` siempre devuelve rgb()
   *  o rgba(), nunca un nombre ni una almohadilla. */
  const lee = (css) => {
    const n = css.match(/[\d.]+/g);
    if (!n) return null;
    return { r: +n[0], g: +n[1], b: +n[2], a: n[3] === undefined ? 1 : +n[3] };
  };

  /** Compone un color con alfa sobre el que tiene detrás. */
  const sobre = (frente, fondo) => ({
    r: frente.r * frente.a + fondo.r * (1 - frente.a),
    g: frente.g * frente.a + fondo.g * (1 - frente.a),
    b: frente.b * frente.a + fondo.b * (1 - frente.a),
    a: 1,
  });

  /** La luminancia relativa de la WCAG. */
  const lum = ({ r, g, b }) => {
    const c = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };

  const ratio = (a, b) => {
    const [alto, bajo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (alto + 0.05) / (bajo + 0.05);
  };

  /** El fondo sobre el que se pinta un elemento.
   *
   *  Sube por los antepasados componiendo los fondos translúcidos hasta dar
   *  con uno opaco. Si por el camino hay un `background-image` —un gradiente,
   *  una textura—, no hay color con el que comparar y se dice. */
  const fondoDe = (el) => {
    let acumulado = null;
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== 'none') return { pintado: true };
      const c = lee(cs.backgroundColor);
      if (!c || c.a === 0) continue;
      acumulado = acumulado ? sobre(acumulado, c) : c;
      if (c.a === 1) return { color: acumulado };
    }
    /* Nadie ha puesto fondo: el lienzo del navegador, que es blanco. */
    return { color: acumulado ?? { r: 255, g: 255, b: 255, a: 1 } };
  };

  const partes = [];
  let sobreDibujo = 0;
  let invisibles = 0;

  for (const el of document.querySelectorAll('body *')) {
    /* Solo los nodos que pintan texto ellos mismos: si se contara también el
       de los padres, cada palabra saldría tantas veces como niveles tenga. */
    const propio = [...el.childNodes]
      .filter((n) => n.nodeType === 3 && n.textContent.trim())
      .map((n) => n.textContent.trim())
      .join(' ');
    if (!propio) continue;

    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (+cs.opacity === 0) continue;
    /* El contenido de un `<template>` no se pinta, y `aria-hidden` con
       `sr-only` tampoco: el SVG de KaTeX lleva su MathML gemelo oculto. */
    const caja = el.getBoundingClientRect();
    if (caja.width < 1 || caja.height < 1) continue;

    const fondo = fondoDe(el);
    if (fondo.pintado) { sobreDibujo++; continue; }

    let tinta = lee(cs.color);
    if (!tinta) continue;
    /* `color: transparent` no es un fallo de contraste: es un texto que no se
       pinta. Lo usa la marca de estado del ejercicio guiado, un círculo con un
       ✓ dentro que solo aparece al resolver, y va con `aria-hidden`. Medirlo
       daría 1:1 —tinta y fondo son el mismo color— y sería ruido. */
    if (tinta.a === 0) { invisibles++; continue; }
    if (tinta.a < 1) tinta = sobre(tinta, fondo.color);

    const px = parseFloat(cs.fontSize);
    const peso = Number(cs.fontWeight) || 400;
    const grande = px >= 24 || (px >= 18.66 && peso >= 700);

    partes.push({
      sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
      texto: propio.slice(0, 48),
      ratio: Math.round(ratio(tinta, fondo.color) * 100) / 100,
      listón: grande ? 3 : 4.5,
      px: Math.round(px),
    });
  }
  return { partes, sobreDibujo, invisibles };
}

/* ── el recorrido ───────────────────────────────────────────────────── */

async function main() {
  await esperaServidor();
  console.log(`Contraste — ${MUESTRA.length} páginas, en claro y en oscuro\n`);

  const nav = await chromium.launch();
  const malos = new Map();
  let nodos = 0;
  let sinComparar = 0;
  let transparentes = 0;

  for (const tema of ['claro', 'oscuro']) {
    /* El navegador dice preferir ese tema, como el sistema de quien lo usa:
       así el script de la cabecera lo pone ANTES del primer pintado, que es
       lo que ve un alumno con el oscuro puesto.

       Hasta el 26 de septiembre de 2026 el tema se cambiaba al llegar
       `DOMContentLoaded`, con la página ya pintada en claro, y en una máquina
       lenta eso midió colores de paso: siete nodos de una opción de ejercicio
       de la ruta de la 2.ª evaluación salían a 1,09:1, que es la tinta ya
       oscura —el color no tiene transición— sobre el fondo del botón todavía
       claro —ese sí, 0,15 s—. En esta máquina no pasaba nunca; en la de
       GitHub, siempre, y tumbó los despliegues del 24 y del 26 de septiembre
       con el suelo local en verde. Se reprodujo aquí frenando la CPU seis
       veces (`Emulation.setCPUThrottlingRate`): el guardián viejo da los mismos
       siete nodos, y este, verde. */
    const ctx = await nav.newContext({
      viewport: { width: 1366, height: 900 },
      colorScheme: tema === 'oscuro' ? 'dark' : 'light',
    });
    const pag = await ctx.newPage();
    await pag.addInitScript((t) => {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.dataset.theme = t;
      });
    }, tema);

    for (const [nombre, r] of MUESTRA) {
      await pag.goto(ORIGEN + r, { waitUntil: 'load', timeout: 60000 });
      /* Y sin transiciones mientras se mide: el contraste que importa es el
         del color al que se llega, no el de un fotograma intermedio. */
      await pag.addStyleTag({
        content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
      });
      await pag.evaluate((t) => { document.documentElement.dataset.theme = t; }, tema);
      await pag.waitForTimeout(350);

      const { partes, sobreDibujo, invisibles } = await pag.evaluate(mideEnLaPagina);
      nodos += partes.length;
      sinComparar += sobreDibujo;
      transparentes += invisibles;

      for (const p of partes) {
        if (p.ratio >= p.listón) continue;
        /* Una sola entrada por regla de CSS y tema: lo que hay que arreglar es
           el selector, no cada palabra que lo usa. */
        const clave = `${tema} · ${p.sel}`;
        const antes = malos.get(clave);
        if (!antes || p.ratio < antes.ratio) malos.set(clave, { ...p, tema, ruta: nombre });
      }
    }
    await ctx.close();
  }
  await nav.close();

  console.log(`  · ${nodos} nodos de texto medidos`);
  if (sinComparar) {
    console.log(`  · ${sinComparar} sobre gradiente o imagen, que no se pueden comparar`);
  }
  if (transparentes) {
    console.log(`  · ${transparentes} con la tinta transparente, que no pintan nada`);
  }

  if (malos.size === 0) {
    ok(`todo el texto llega a su listón de contraste (4,5:1, y 3:1 el grande)`);
  } else {
    const lineas = [...malos.values()]
      .sort((a, b) => a.ratio - b.ratio)
      .map((p) => `    ${String(p.ratio).padStart(5)}:1  (pide ${p.listón})  ${p.tema.padEnd(7)} ${p.sel}\n`
        + `             en ${p.ruta} · ${p.px}px · «${p.texto}»`)
      .join('\n');
    fallo(`texto por debajo de su listón de contraste (${malos.size})`, lineas);
  }
}

try {
  await main();
} catch (e) {
  /* Si el servidor se cae a media pasada, la causa casi siempre es que otro
     guion ha hecho `astro preview stop` — el humo lo hace al arrancar, y eso
     mata cualquier preview, incluido el de quien esté trabajando. Pasó el 24
     de septiembre de 2026 al lanzar el humo de una asignatura mientras el
     suelo corría. Decirlo ahorra buscar el fallo donde no está. */
  const pista = /ERR_CONNECTION_REFUSED|ECONNREFUSED/.test(e.message)
    ? [
        '',
        '    El servidor dejó de responder a media pasada. ¿Hay otro guion',
        '    levantando `astro preview`? El humo lo para al arrancar, y se',
        '    lleva por delante el de este guardián.',
      ].join('\n')
    : '';
  fallo('el guardián de contraste no ha podido terminar', `    ${e.message}${pista}`);
} finally {
  servidor?.para();
}

if (fallos > 0) {
  console.error(`\n${fallos} fallo(s) de contraste.`);
  process.exit(1);
}
console.log('\nContraste: en verde.');
process.exit(0);
