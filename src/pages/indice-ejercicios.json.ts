import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { ruta } from '../lib/rutas';

/**
 * El índice de ejercicios de la paleta de comandos, aparte de la portada.
 *
 * POR QUÉ NO VA DENTRO DE LA PORTADA, que es donde va todo lo demás.
 *
 * Los 1.073 títulos de ejercicio hacen falta: hasta el 14 de septiembre de
 * 2026 la paleta no indexaba ninguno, y por eso «viga» no encontraba nada
 * teniendo el sitio un simulador de vigas y veinticuatro ejercicios de vigas.
 * Pero medido antes de dejarlos dentro: el índice pasaba de **27,9 a 65,8 KB
 * comprimidos**, y la portada entera de 27 a 79. Es triplicar el peso de la
 * página más visitada del sitio por una función que usa una minoría de las
 * visitas, y §11 mide el peso de las páginas por algo.
 *
 * Probada también la forma compacta —los ejercicios agrupados por tema, con
 * la URL y el rótulo una sola vez—: 34,7 KB, solo 3 menos. Gzip ya aprovecha
 * esa repetición él solo, y lo que queda son los títulos (18,3 KB) más sus
 * anclas, que son los títulos otra vez en forma de slug. No hay nada que
 * exprimir ahí.
 *
 * Así que se sirve aparte y la paleta lo pide **la primera vez que se abre**.
 * Quien no la abra no lo descarga nunca; quien la abra paga una petición al
 * mismo origen. Y si esa petición falla, la paleta sigue buscando en el
 * índice de siempre —asignaturas, temas, rutas y conceptos— en vez de
 * quedarse sin funcionar: es un extra, no un requisito.
 *
 * Formato compacto a propósito, que aquí sí compensa porque no hay HTML
 * alrededor que comprimir con él:
 *   [ { u: url del tema, s: «Tema · Asignatura», e: [[título, id], …] }, … ]
 */
export const GET: APIRoute = async () => {
  const catalogo = await getCollection('catalogo');
  const publicados = new Map<string, { sub: string; url: string }>();
  for (const a of catalogo) {
    for (const t of a.data.temas) {
      if (!t.hecho) continue;
      publicados.set(`${a.id}/${t.id}`, {
        sub: `${t.titulo} · ${a.data.nombre}`,
        url: ruta(`${a.id}/${t.id}`),
      });
    }
  }

  const grupos: { u: string; s: string; e: [string, string][] }[] = [];
  for (const f of await getCollection('ejercicios')) {
    /* El id de la colección es «<asignatura>/<tema>/ejercicios». Los de examen
       viven en «<asignatura>/examenes/<convocatoria>/ejercicios» y se quedan
       fuera: se buscan por su convocatoria, que ya está en el índice de la
       portada, e indexarlos aquí duplicaría el mismo problema con otro nombre. */
    const donde = publicados.get(f.id.replace(/\/ejercicios$/, ''));
    if (!donde) continue;
    const e = f.data.ejercicios.map((x) => [x.titulo, x.id] as [string, string]);
    if (e.length) grupos.push({ u: donde.url, s: donde.sub, e });
  }

  return new Response(JSON.stringify(grupos), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
