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
 *  2. que cada botón de preajuste deje en la tabla **los valores que declara
 *     su campo `fuente`**, sean del examen o no.
 *
 * Y ESE «SEAN DEL EXAMEN O NO» HAY QUE LEERLO, porque hasta el 13 de
 * septiembre de 2026 esta cabecera decía «los valores publicados en la
 * convocatoria de la que sale» y el comentario de `CASOS` remataba: «están
 * copiados de la convocatoria, que es lo único contra lo que tiene sentido
 * comparar». Era verdad de **tres** de los nueve casos. Los `fuente` de los
 * otros seis lo dicen negro sobre blanco —«los dos ejemplos del propio tema»,
 * «la figura del propio tema», «el error típico del propio tema»— y uno no
 * compara nada. O sea que el guardián describía como ancla externa lo que en
 * su mayoría es una prueba de regresión contra nuestra propia prosa.
 *
 * La regresión también sirve: caza que un cambio en el modelo mueva lo que la
 * página enseña, que es exactamente el fallo del 2 de septiembre. Lo que no
 * hace es garantizar que el número sea cierto. La diferencia está tabulada
 * fila por fila en `tests/fisica/README.md`, y **el reparto de hoy es 3 con
 * ancla externa, 2 mixtas y 3 propias**.
 *
 * Un guardián que se cree más fuerte de lo que es hace más daño que uno que
 * falta: por eso esto se corrige aquí y no solo en el informe.
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
 * calculan aquí, nunca: se copian de donde diga su `fuente`, y el `fuente`
 * dice la verdad sobre de dónde salen (§10). Tres los toman de una
 * convocatoria —el ábaco de Moody, el punto de funcionamiento y los diagramas
 * de viga— y son los únicos que anclan contra algo ajeno al proyecto. Los
 * demás los toman de la figura o del ejemplo del propio tema, y entonces esto
 * comprueba que el modelo y la página sigan diciendo lo mismo, que es una
 * regresión y no una verificación. Ver la cabecera.
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
  {
    tema: 'mecanica-aplicada/t05-cables',
    sim: '[data-cat]',
    nombre: 'la catenaria y su directriz',
    fuente: 'la figura del propio tema: cable de 10 N/m con 20 N en el punto más bajo',
    pruebas: [
      {
        pulsa: '[data-caso="figura"]',
        espera: {
          '[data-c]': 'c = 2,00 m',
          '[data-tp]': '47,0 N',
          '[data-yp]': 'y = 4,705 m · s = 4,259 m',
        },
      },
      /* Con el cable tenso la parábola deja de equivocarse, que es la
         pregunta que el simulador contesta. */
      {
        pulsa: '[data-caso="tenso"]',
        espera: { '[data-err]': '+0,00 %' },
      },
    ],
  },
  {
    tema: 'mecanica-aplicada/t08-movimiento-plano',
    sim: '[data-cir]',
    nombre: 'el centro instantáneo',
    fuente: 'la figura del propio tema, con el mecanismo de 0,1 y 0,3 m a 45°',
    pruebas: [
      {
        pulsa: '[data-caso="figura"]',
        espera: { '[data-wb]': '2,43 rad/s', '[data-vb]': '0,879 m/s' },
      },
      /* En el punto muerto el centro se va al infinito y la deslizadera se
         para: es la posición que explica por qué existe la base. */
      {
        pulsa: '[data-caso="muerto"]',
        espera: { '[data-pos]': 'I se va al infinito', '[data-vb]': '0,000 m/s' },
      },
    ],
  },
  {
    tema: 'mecanica-aplicada/t06-resistencia-de-materiales',
    sim: '[data-viga]',
    nombre: 'los diagramas de la viga',
    fuente: 'el ejercicio 2 de la ordinaria de 2025 y el 6.5 de la colección',
    pruebas: [
      /* El examen publica dos cosas de esta viga: que la cortante se anula en
         x = 7L/4 y que el flector máximo vale 49MgL/8 = 6,125. */
      {
        pulsa: '[data-caso="ord25"]',
        espera: { '[data-corte]': 'en x = 1,75', '[data-mvano]': '+6,125' },
      },
      /* Y el 6.5, que la página publica con sus reacciones y sus dos
         flectores: +1290 kg·m en el vano y −6000 en el apoyo. */
      {
        pulsa: '[data-caso="col65"]',
        espera: {
          '[data-reacciones]': 'R_A = 8600 · R_B = 7400',
          '[data-mvano]': '+1290',
          '[data-mapoyo]': '−6000',
        },
      },
    ],
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
