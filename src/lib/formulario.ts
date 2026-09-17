/**
 * Qué parte de un tema es «formulario», y qué asignaturas tienen uno.
 *
 * POR QUÉ ESTÁ AQUÍ Y NO EN LA PÁGINA. La regla —«la sección
 * `## Lo que hay que llevar sabido` de cada tema»— la necesitan dos sitios: la
 * página `/[asignatura]/formulario`, que la recorta, y la portada, que decide
 * si enlazarla. El 18 de septiembre de 2026 la portada la enlazó sin
 * preguntar y publicó seis enlaces rotos —las seis asignaturas sin formulario—
 * que cazó `verify.mjs` antes de desplegar. Con la regla en dos sitios, el día
 * que cambie el encabezado se arreglará en uno.
 *
 * El aviso de `getStaticPaths` sigue valiendo: esa función se extrae a su
 * propio módulo y no ve el frontmatter de su página. Lo que sí ve son los
 * `import`, y por eso esto se puede compartir.
 */

/** El encabezado que abre el formulario dentro del `index.mdx` de un tema. */
export const ENCABEZADO = /^##\s+Lo que hay que llevar sabido\s*$/;

/** El cuerpo del formulario de un tema, o `null` si ese tema no tiene. */
export function recortaFormulario(mdx: string): string | null {
  const lineas = mdx.split('\n');
  const i = lineas.findIndex((l) => ENCABEZADO.test(l));
  if (i < 0) return null;
  let j = lineas.length;
  for (let k = i + 1; k < lineas.length; k++) {
    if (/^##\s/.test(lineas[k])) { j = k; break; }
  }
  return lineas.slice(i + 1, j).join('\n').trim() || null;
}

/** Si alguno de los textos dados trae formulario. Basta uno: la página junta
 *  los que haya y omite los que no. */
export function hayFormulario(textos: (string | undefined)[]): boolean {
  return textos.some((t) => (t ? recortaFormulario(t) !== null : false));
}
