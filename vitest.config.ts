import { configDefaults, defineConfig } from 'vitest/config';

/* Los worktrees de los agentes (`.claude/worktrees/`, fase M) son copias del
   repositorio con su propia carpeta `tests/`, a medio hacer mientras el agente
   trabaja. Sin esta línea, `npm test` del repositorio los corría también: el 9
   de octubre de 2026 el suelo falló por cuatro tests de un worktree, con los
   del sitio en verde. Lo demás, como venía por defecto. */
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
});
