/**
 * Los simuladores enseñan los números del examen, no unos parecidos.
 *
 * Nace el 3 de septiembre de 2026, y no «por si acaso» (§11): el 2 de
 * septiembre los cinco simuladores de Fluidos se publicaron correctos y
 * **completamente invisibles**, y el suelo dio verde. `tests/fisica/` prueba
 * la física, `humo.mjs` prueba que la página no reviente — nadie probaba **el
 * cable entre las dos cosas**: que al pulsar «tubo corroído» salga en pantalla
 * el 0,0417 que publica el examen.
 *
 * Lo que comprueba, sobre el sitio ya construido:
 *
 *  1. que el simulador **se encuentre** aterrizando en la URL a pelo, sin
 *     ancla y sin `localStorage` — que es justo lo que no se comprobó;
 *  2. que cada botón de preajuste deje en la tabla los valores publicados en
 *     la convocatoria de la que sale.
 *
 * No entra en `npm run suelo`: necesita el sitio levantado y tarda. Se pasa
 * al tocar un simulador, como `recalcula` al tocar el corpus.
 *
 *   npm run dev  &&  node scripts/comprueba-simuladores.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.ORIGEN ?? 'http://localhost:4321/road-to-ingenieria';

/**
 * Cada caso dice qué pulsar y qué tiene que aparecer. Los valores **no** se
 * calculan aquí: están copiados de la convocatoria, que es lo único contra lo
 * que tiene sentido comparar (§10).
 */
const CASOS = [
  {
    tema: 'fluidos/t18-perdidas-carga',
    sim: '[data-moody]',
    nombre: 'el ábaco de Moody',
    fuente: 'ejercicio 4 del 3.er parcial de junio de 2021',
    pruebas: [
      { pulsa: '[data-caso="corroido"]', espera: { '[data-f]': '0,0417', '[data-regimen]': 'rugoso' } },
      { pulsa: '[data-caso="nuevo"]', espera: { '[data-f]': '0,0179', '[data-regimen]': 'semirrugoso' } },
      { pulsa: '[data-caso="pe"]', espera: { '[data-regimen]': 'liso' } },
    ],
  },
  {
    tema: 'fluidos/t25-bombeo',
    sim: '[data-pf]',
    nombre: 'el punto de funcionamiento',
    fuente: 'ordinaria de 2025-2026',
    pruebas: [
      { pulsa: '[data-caso="b1"]', espera: { '[data-q]': '12,6 l/s' } },
      { pulsa: '[data-caso="b2"]', espera: { '[data-q]': '15,7 l/s' } },
      { pulsa: '[data-caso="b3"]', espera: { '[data-q]': '16,6 l/s' } },
    ],
  },
  {
    tema: 'fluidos/t07-fuerzas-superficies',
    sim: '[data-prisma]',
    nombre: 'el prisma de presiones',
    fuente: 'los dos ejemplos del propio tema',
    pruebas: [
      /* La compuerta que llega a la lámina libre: el 2h/3 de siempre. */
      { pulsa: '[data-accion="dostercios"]', espera: { '[data-fraccion]': '67 %' } },
    ],
  },
  {
    tema: 'fluidos/t21-canales',
    sim: '[data-canal]',
    nombre: 'la sección de canal',
    fuente: 'las tres secciones de 4 m² de la figura del tema',
    pruebas: [
      { pulsa: '[data-accion="ancho"]', espera: { '[data-pena]': '44,4 %' } },
    ],
  },
  {
    tema: 'fluidos/t20-golpe-ariete',
    sim: '[data-ariete]',
    nombre: 'el golpe de ariete',
    fuente: 'el error típico del propio tema',
    pruebas: [
      { pulsa: '[data-accion="rapido"]', espera: { '[data-dh]': '228 mca', '[data-cel]': '1119 m/s' } },
      { pulsa: '[data-accion="lento"]', espera: { '[data-dh]': '65 mca' } },
    ],
  },
  {
    tema: 'calculo/t01-complejos',
    sim: '[data-plano]',
    nombre: 'el plano complejo',
    fuente: 'geometría, sin caso de física',
    pruebas: [],
  },
];

let fallos = 0;
const mal = (t) => {
  console.log(`  ✗ ${t}`);
  fallos++;
};

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1200, height: 900 } });
const pag = await ctx.newPage();
pag.on('pageerror', (e) => mal(`error de JavaScript: ${e.message}`));

for (const caso of CASOS) {
  console.log(`\n${caso.nombre} · ${caso.tema}`);
  console.log(`  contra ${caso.fuente}`);

  await pag.goto(`${BASE}/${caso.tema}/`, { waitUntil: 'load' });
  /* Sin memoria: el modo de lectura se guarda, y con «completo» guardado la
     comprobación de abajo pasaría sin probar nada. */
  await pag.evaluate(() => {
    try {
      localStorage.clear();
    } catch {}
  });
  await pag.reload({ waitUntil: 'load' });
  await pag.waitForTimeout(900);

  /* 1 · se encuentra */
  const acceso = await pag.evaluate((sel) => {
    const s = document.querySelector(sel);
    if (!s) return { hay: false };
    const a = document.querySelector('[data-ir-sim]');
    const caja = s.getBoundingClientRect();
    return {
      hay: true,
      visibleDeEntrada: caja.height > 0,
      aviso: a && !a.hidden ? a.getAttribute('href') : null,
      chip: !!document.querySelector('.rail a .chip'),
    };
  }, caso.sim);

  if (!acceso.hay) {
    mal('el simulador no está en la página');
    continue;
  }
  /* El ancla concreta cambia con cada simulador; lo que se comprueba es que
     la haya y que lleve, no cuál es. */
  if (!acceso.aviso) mal('la cabecera no anuncia el simulador: nadie lo va a encontrar');
  else console.log(`  ✓ la cabecera lo anuncia y apunta a ${acceso.aviso}`);
  if (!acceso.chip) mal('el índice no marca el apartado que lo contiene');
  else console.log('  ✓ el índice marca su apartado');

  /* Y se llega: se pulsa el aviso, como haría un lector. */
  await pag.click('[data-ir-sim]');
  await pag.waitForTimeout(700);
  const llega = await pag.evaluate((sel) => {
    const c = document.querySelector(sel)?.getBoundingClientRect();
    return !!c && c.height > 0;
  }, caso.sim);
  if (!llega) mal('el aviso de la cabecera no lleva al simulador');
  else console.log('  ✓ el aviso lleva, y el simulador queda visible');

  /* 2 · los números son los del examen */
  for (const prueba of caso.pruebas) {
    await pag.click(prueba.pulsa);
    await pag.waitForTimeout(350);
    const leido = await pag.evaluate(
      ({ sel, campos }) => {
        const s = document.querySelector(sel);
        const r = {};
        for (const c of campos) r[c] = s.querySelector(c)?.textContent?.trim() ?? '(no está)';
        return r;
      },
      { sel: caso.sim, campos: Object.keys(prueba.espera) },
    );
    for (const [campo, esperado] of Object.entries(prueba.espera)) {
      const v = leido[campo];
      if (!v.includes(esperado)) {
        mal(`${prueba.pulsa} → ${campo} dice «${v}» y el examen dice «${esperado}»`);
      } else {
        console.log(`  ✓ ${prueba.pulsa} → ${campo} = ${v}`);
      }
    }
  }
}

await nav.close();

console.log(
  fallos === 0
    ? '\nLos simuladores enseñan lo que publica el examen, y se encuentran.'
    : `\n${fallos} fallo(s). El despliegue se queda parado.`,
);
process.exit(fallos ? 1 : 0);
