/**
 * Vuelve a pegar TODAS las figuras, sustituyendo las que ya están.
 *
 * Hace falta cuando cambia el lienzo y no la figura: el día que el marco pasó
 * a medir también los rótulos de los mosaicos, o el día que el estimador de
 * anchos se hizo conservador porque en el CI la mono se dibuja más ancha. Sin
 * esto habría que revertir los ficheros de contenido, y esos llevan además
 * todo lo que se escribió a mano.
 *
 *     node scripts/figuras/rehacer.mjs
 */
import { pega, pegaEnCampo, quitaFigura, quitaFiguraDePaso } from './pegar.mjs';

const GENERADORES = [
  'calculo-t01', 'calculo-t05', 'calculo-t06', 'calculo-t07', 'calculo-t11',
  'calculo-examenes', 'calculo-ejemplos',
  'calculo-ejemplos-t01-entrada', 'calculo-ejemplos-t02', 'calculo-ejemplos-t03', 'calculo-ejemplos-t04',
  'calculo-ejemplos-t08', 'calculo-ejemplos-t05-t07',
  'calculo-ejemplos-t09', 'calculo-ejemplos-t10',
  'calculo-practica-t01', 'calculo-practica-t01-lugares', 'calculo-practica-t02', 'calculo-practica-t02-demostrar',
  'calculo-practica-t03', 'calculo-practica-t03-aplicaciones',
  'calculo-practica-t04', 'calculo-practica-t04-optimizacion',
  'calculo-practica-t05', 'calculo-practica-t06',
  'calculo-practica-t07', 'calculo-practica-t07-recintos', 'calculo-practica-t07-solidos',
  'calculo-practica-t08', 'calculo-practica-t08-apartados',
  'calculo-practica-t09', 'calculo-practica-t09-familias',
  'calculo-practica-t10', 'calculo-practica-t10-sistemas',
  'calculo-practica-t11', 'calculo-practica-t11-mas',
  /* Los ejercicios propios, que no vienen del boletín: dos de sus figuras
     van en el `enunciado` porque son el dato, no la ilustración. */
  'calculo-propios-t02-t03', 'calculo-propios-t04', 'calculo-propios-t04b',
  'calculo-propios-t05',
];

let n = 0;
for (const nombre of GENERADORES) {
  const mod = await import(`./${nombre}.mjs`);
  for (const f of mod.figuras ?? []) {
    const fichero = f.fichero ?? mod.FICHERO;
    /* `campo: 'paso'` no es un campo de texto: es la forma que tiene
       `calculo-propios-t04` de decir «en el paso dibujar», igual que no poner
       campo. Hasta el 26 de septiembre de 2026 esto lo trataba como un campo,
       `quitaFigura` buscaba un `paso: |` que no existe y lanzaba: la pasada
       moría tras 37 generadores y los tres últimos no se rehacían nunca. */
    if (f.campo && f.campo !== 'paso') {
      quitaFigura(fichero, f.id, f.campo);
      pegaEnCampo(fichero, f.id, f.campo, f.svg, f.pie);
    } else {
      quitaFiguraDePaso(fichero, f.id, f.paso ?? 0);
      pega(fichero, f.id, f.svg, f.paso ?? 0);
    }
    n++;
  }
  console.log(`${nombre}: ${(mod.figuras ?? []).length}`);
}
console.log(`\n${n} figuras rehechas`);
