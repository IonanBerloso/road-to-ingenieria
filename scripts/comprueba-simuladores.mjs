/**
 * Los simuladores enseñan los números que dice su `fuente`, no unos
 * parecidos. En tres de los nueve esa fuente es una convocatoria; en los
 * demás, nuestra propia prosa. La cabecera lo decía mal hasta el 13 de
 * septiembre de 2026 y **esta primera línea siguió diciéndolo hasta el 15**:
 * el titular es lo último que se corrige y lo primero que se lee.
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
 * Entra en `npm run suelo` desde el 26 de septiembre de 2026. Hasta entonces
 * se quedaba fuera porque necesitaba un servidor levantado a mano, y se pasaba
 * «al tocar un simulador» — es decir, casi nunca: ese día la auditoría
 * encontró leyendo el código tres fallos de simulador que este guion habría
 * cazado con el caso adecuado, y ninguno estaba en su lista. Ahora levanta su
 * propio servidor (`servidor.mjs`) y tarda en torno a un minuto.
 *
 *   npm run sim                          (levanta el servidor él mismo)
 *   SIM_SERVIDOR=fuera SIM_PUERTO=4321 npm run sim   (con `npm run dev` ya en marcha)
 */
import { chromium } from 'playwright';
import { levanta } from './servidor.mjs';

/* Levanta su propio servidor desde el 26 de septiembre de 2026, como el humo,
   y por eso puede estar en el suelo. Antes pedía uno ya levantado en el 4321
   y llevaba el `base` escrito a mano. Con SIM_SERVIDOR=fuera usa el que haya
   en SIM_PUERTO, que es lo cómodo mientras se trabaja con `npm run dev`. */
const srv = await levanta({
  puerto: Number(process.env.SIM_PUERTO ?? 4341),
  fuera: process.env.SIM_SERVIDOR === 'fuera',
});
const BASE = srv.origen;

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
    /* El único que no comprueba un número de un examen, porque no publica
       ninguno: sortea preguntas. Lo que sí es determinista —y lo que se
       rompería sin avisar— es que saque las 25 que dice su banco y que el
       reloj arranque. El reparto por bloques y la aritmética de la nota los
       prueba el recorrido de extremo a extremo del 24 de septiembre de 2026. */
    tema: 'ciencia-materiales/t01-introduccion',
    sim: '[data-sim-test]',
    nombre: 'el simulador del test de mínimos',
    fuente: 'la cabecera del test del 27 de septiembre de 2024',
    pruebas: [
      { pulsa: '[data-empezar]', espera: { '[data-estado]': '25 preguntas. El reloj corre.' } },
    ],
  },
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
    fuente: 'el error típico del propio tema: con z a la izquierda del eje, arctan se desvía π',
    pruebas: [
      {
        pulsa: '[data-caso="trampa"]',
        espera: {
          '[data-cuadrante]': 'III',
          '[data-polar]': '1,40 ∠ -2,36',
          '[data-arctan]': '0,78',
        },
      },
      /* El mismo módulo en el primer cuadrante: ahí los dos coinciden, y ese
         contraste es lo que el bloque «Error típico» del tema pide mirar. */
      {
        pulsa: '[data-caso="limpio"]',
        espera: { '[data-cuadrante]': 'I', '[data-polar]': '1,40 ∠ 0,78', '[data-arctan]': '0,78' },
      },
      {
        pulsa: '[data-caso="giro"]',
        espera: { '[data-producto-txt]': '2,00 ∠ 2,36' },
      },
    ],
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
         pregunta que el simulador contesta. Y la sección tiene que quedar en
         el apoyo, x = 20: el tope del mando la recortaba a 3 viniendo de la
         figura (auditoría del 26 de septiembre de 2026). */
      {
        pulsa: '[data-caso="tenso"]',
        espera: { '[data-err]': '+0,00 %', '[data-out-x]': '20,0 m' },
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
      /* Y la regresión que congelaba los diagramas: con L = 4, A en su
         máximo y B arrastrado por debajo de A + L/10, la corrección de B se
         llamaba a sí misma sin fin porque 2,4 − 2 da 0,3999… Encontrada en
         la auditoría del 26 de septiembre de 2026. B tiene que quedarse en
         2,4 y la página seguir viva: el `pageerror` de arriba caza el
         desbordamiento de pila. */
      {
        pulsa: '[data-caso="ord25"]',
        mueve: [['[data-xa]', '2'], ['[data-xb]', '2.2']],
        espera: { '[data-out-xb]': '2,4' },
      },
    ],
  },
];

let fallos = 0;
const mal = (t) => {
  console.log(`  ✗ ${t}`);
  fallos++;
};

/** Los números que un simulador enseña, indexados por su primer atributo
 *  `data-*`: solo hojas, que es donde vive un número. Se ejecuta dentro de la
 *  página, con o sin JavaScript del sitio. */
function leeNumeros(sel) {
  const raiz = document.querySelector(sel);
  const r = {};
  if (!raiz) return r;
  const vistos = {};
  for (const el of raiz.querySelectorAll('*')) {
    if (el.children.length) continue;
    /* `data-astro-cid-…` lo pone Astro para acotar los estilos y no dice nada
       del dato; tomarlo por clave emparejaba elementos que no son el mismo. */
    const a = [...el.attributes].find((x) => x.name.startsWith('data-') && !x.name.startsWith('data-astro-'));
    if (!a) continue;
    const k = `[${a.name}]`;
    vistos[k] = (vistos[k] ?? 0) + 1;
    r[vistos[k] > 1 ? `${k} nº ${vistos[k]}` : k] = el.textContent.trim().replace(/\s+/g, ' ');
  }
  return r;
}

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1200, height: 900 } });
const pag = await ctx.newPage();
pag.on('pageerror', (e) => mal(`error de JavaScript: ${e.message}`));
/* La misma página sin el JavaScript del sitio: lo que ve quien lo tiene
   apagado, y lo que se ve durante el primer instante antes de que cargue. */
const ctxSin = await nav.newContext({ viewport: { width: 1200, height: 900 }, javaScriptEnabled: false });
const pagSin = await ctxSin.newPage();

try {
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

  /* 1 bis · sin JavaScript no enseña números que el modelo no da.
     Cada simulador trae escritos a mano los valores de su estado de partida,
     para quien no tiene JavaScript y para el primer instante de la carga. Nada
     los comparaba con el modelo, y la auditoría del 26 de septiembre de 2026
     encontró tres simuladores publicando cifras que su propio modelo ya no
     daba —la catenaria decía «−4,3 %» donde el modelo da «+10,7 %»—. Se
     compara solo lo que lleva una cifra: un «--:--» o un hueco vacío que el
     script rellena no afirman nada. */
  await pagSin.goto(`${BASE}/${caso.tema}/`, { waitUntil: 'load' });
  const sinJs = await pagSin.evaluate(leeNumeros, caso.sim);
  const conJs = await pag.evaluate(leeNumeros, caso.sim);
  const desfases = Object.entries(sinJs).filter(
    ([k, v]) => /\d/.test(v) && k in conJs && conJs[k] !== v,
  );
  for (const [k, v] of desfases) {
    mal(`sin JavaScript, ${k} dice «${v}» y el modelo, al cargar, «${conJs[k]}»`);
  }
  if (!desfases.length) {
    const n = Object.values(sinJs).filter((v) => /\d/.test(v)).length;
    console.log(`  ✓ sin JavaScript enseña lo mismo que el modelo (${n} cifras)`);
  }

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
    /* `mueve` pone un valor en un deslizador y dispara `input`, que es lo
       que hace un dedo al arrastrarlo: sin esto, lo que solo pasa al mover
       un mando —no al pulsar un preajuste— no lo probaba nadie. */
    for (const [sel, valor] of prueba.mueve ?? []) {
      await pag.evaluate(
        ({ sim, sel, valor }) => {
          const el = document.querySelector(sim)?.querySelector(sel);
          if (!el) throw new Error(`no está ${sel}`);
          el.value = valor;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        },
        { sim: caso.sim, sel, valor },
      );
    }
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
} catch (e) {
  mal(`la comprobación no pudo terminar: ${e.message}`);
} finally {
  await nav.close();
  srv.para();
}

console.log(
  fallos === 0
    ? '\nCada simulador enseña lo que declara su fuente, y se encuentra.'
    : `\n${fallos} fallo(s). El despliegue se queda parado.`,
);
process.exit(fallos ? 1 : 0);
