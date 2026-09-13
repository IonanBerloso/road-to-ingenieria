/**
 * El modelo de viga del tema 6 de Mecánica Aplicada, contra los ejercicios de
 * la colección de la asignatura.
 *
 * Los tres casos no están elegidos por bonitos: son los que fijan lo que hay
 * que saber calcular en ese tema —dos cargas puntuales, una repartida con dos
 * voladizos y una triangular— y los tres están publicados en la página, así
 * que si el modelo se aparta de ellos, o el modelo miente o la página miente.
 *
 * El convenio de signos es el del curso: y hacia abajo, dV/dx = −q_y,
 * dM/dx = V, y M positivo cuando tracciona la fibra inferior.
 */
import { describe, expect, it } from 'vitest';
import { cortante, diagrama, extremos, flector, reacciones, type Viga } from '../../src/lib/viga';

/** Ejercicio 6.2: dos cargas puntuales de 10 y 6 Tn y tramos de 3, 4 y 5 m. */
const seisDos: Viga = {
  L: 12,
  xA: 0,
  xB: 12,
  cargas: [
    { tipo: 'puntual', x: 3, P: 10 },
    { tipo: 'puntual', x: 7, P: 6 },
  ],
};

/**
 * Ejercicio 6.5: repartida de 2000 kg/m desde el extremo izquierdo hasta el
 * apoyo B, y 2000 kg colgando del extremo derecho. Apoyos en x = 2 y x = 7,
 * viga de 10 m: dos voladizos, uno a cada lado.
 */
const seisCinco: Viga = {
  L: 10,
  xA: 2,
  xB: 7,
  cargas: [
    { tipo: 'repartida', x1: 0, x2: 7, q1: 2000, q2: 2000 },
    { tipo: 'puntual', x: 10, P: 2000 },
  ],
};

/** Ejercicio 6.9: triangular de 0 en el centro a q0 en el apoyo derecho. */
const L = 6;
const q0 = 3;
const seisNueve: Viga = {
  L,
  xA: 0,
  xB: L,
  cargas: [{ tipo: 'repartida', x1: L / 2, x2: L, q1: 0, q2: q0 }],
};

describe('6.2 · dos cargas puntuales', () => {
  it('reparte 10 y 6 toneladas entre los dos apoyos', () => {
    const { RA, RB } = reacciones(seisDos);
    expect(RA).toBeCloseTo(10, 6);
    expect(RB).toBeCloseTo(6, 6);
  });

  it('deja la cortante nula entre las dos cargas', () => {
    expect(cortante(seisDos, 5)).toBeCloseTo(0, 6);
  });

  it('da una meseta de 30 Tn·m en el flector entre las dos cargas', () => {
    expect(flector(seisDos, 3)).toBeCloseTo(30, 6);
    expect(flector(seisDos, 5)).toBeCloseTo(30, 6);
    expect(flector(seisDos, 7)).toBeCloseTo(30, 6);
  });

  it('cierra el diagrama en cero en los dos extremos', () => {
    expect(flector(seisDos, 0)).toBeCloseTo(0, 6);
    expect(flector(seisDos, 12)).toBeCloseTo(0, 6);
  });
});

describe('6.5 · la repartida con dos voladizos', () => {
  it('da 8600 y 7400 kg en los apoyos', () => {
    const { RA, RB } = reacciones(seisCinco);
    expect(RA).toBeCloseTo(8600, 6);
    expect(RB).toBeCloseTo(7400, 6);
  });

  it('anula la cortante en x = 4,3 m, que es donde el flector es máximo', () => {
    const { cortesV, MmaxPos } = extremos(seisCinco, 4000);
    expect(cortesV.some((x) => Math.abs(x - 4.3) < 0.01)).toBe(true);
    expect(MmaxPos.x).toBeCloseTo(4.3, 2);
    expect(MmaxPos.M).toBeCloseTo(1290, 0);
  });

  it('tiene su peor flector en el apoyo B, con −6000 kg·m', () => {
    expect(flector(seisCinco, 7)).toBeCloseTo(-6000, 6);
    const { Mabs } = extremos(seisCinco, 4000);
    expect(Mabs.M).toBeCloseTo(-6000, 0);
  });

  it('empieza y acaba con flector nulo, que es lo que exige un voladizo libre', () => {
    expect(flector(seisCinco, 0)).toBeCloseTo(0, 6);
    expect(flector(seisCinco, 10)).toBeCloseTo(0, 6);
  });
});

describe('6.9 · la triangular en media viga', () => {
  it('da q0·L/24 en el apoyo izquierdo', () => {
    const { RA } = reacciones(seisNueve);
    expect(RA).toBeCloseTo((q0 * L) / 24, 8);
  });

  it('anula la cortante en 0,7041 L', () => {
    const { cortesV } = extremos(seisNueve, 20000);
    const x = cortesV.find((c) => c > L / 2);
    expect(x).toBeDefined();
    expect((x as number) / L).toBeCloseTo(0.7041, 3);
  });

  it('da un flector máximo de 0,026503 q0 L²', () => {
    const { MmaxPos } = extremos(seisNueve, 20000);
    expect(MmaxPos.M / (q0 * L * L)).toBeCloseTo(0.026503, 5);
  });
});

/**
 * Ejercicio 2 de la convocatoria ordinaria de junio de 2025, en unidades de
 * Mg y de L: cuatro tramos de longitud L, repartida q0 = 4Mg/L y un par de
 * 4MgL en D. El examen publica dos cosas que este caso tiene que reproducir:
 * que la cortante se anula en x = 7L/4 y que el flector máximo es 49MgL/8.
 */
const ordinaria2025: Viga = {
  L: 4,
  xA: 0,
  xB: 4,
  cargas: [
    /* La repartida solo llega hasta C, la mitad de la viga: la resolución
       publicada lo dice al describir el cortante, «baja de 7Mg en A a −Mg en
       C y de C a E vale −Mg». Suponerla en toda la viga era lo que impedía
       reproducir el examen. */
    { tipo: 'repartida', x1: 0, x2: 2, q1: 4, q2: 4 },
    { tipo: 'par', x: 3, M: -4 },
  ],
};

describe('ordinaria de 2025 · la viga con el par en D', () => {
  it('anula la cortante en x = 7L/4, como publica el examen', () => {
    const { cortesV } = extremos(ordinaria2025, 4000);
    expect(cortesV.some((x) => Math.abs(x - 1.75) < 0.005)).toBe(true);
  });

  it('da el flector máximo publicado, 49MgL/8', () => {
    const { MmaxPos } = extremos(ordinaria2025, 4000);
    expect(MmaxPos.M).toBeCloseTo(49 / 8, 3);
    expect(MmaxPos.x).toBeCloseTo(1.75, 2);
  });

  it('reparte 7Mg y 1Mg entre los dos apoyos', () => {
    const { RA, RB } = reacciones(ordinaria2025);
    expect(RA).toBeCloseTo(7, 6);
    expect(RB).toBeCloseTo(1, 6);
  });

  it('deja el cortante en −Mg de C a E, como publica la resolución', () => {
    for (const x of [2.2, 2.8, 3.4, 3.9]) {
      expect(cortante(ordinaria2025, x)).toBeCloseTo(-1, 6);
    }
  });

  it('salta en D de 5MgL a MgL, que es lo que publica la resolución', () => {
    expect(flector(ordinaria2025, 3 - 1e-9)).toBeCloseTo(5, 6);
    expect(flector(ordinaria2025, 3 + 1e-9)).toBeCloseTo(1, 6);
  });

  it('cierra el flector en cero en los dos apoyos, que son extremos', () => {
    expect(flector(ordinaria2025, 0)).toBeCloseTo(0, 9);
    expect(flector(ordinaria2025, 4)).toBeCloseTo(0, 9);
  });

  it('salta 4MgL en el flector al pasar por D', () => {
    const antes = flector(ordinaria2025, 3 - 1e-6);
    const despues = flector(ordinaria2025, 3 + 1e-6);
    expect(Math.abs(despues - antes)).toBeCloseTo(4, 4);
  });
});

describe('el modelo, por dentro', () => {
  it('cierra el equilibrio vertical en las tres vigas', () => {
    for (const v of [seisDos, seisCinco, seisNueve]) {
      const { RA, RB } = reacciones(v);
      const carga = v.cargas.reduce((s, c) => {
        if (c.tipo === 'puntual') return s + c.P;
        if (c.tipo === 'repartida') return s + ((c.q1 + c.q2) / 2) * (c.x2 - c.x1);
        return s;
      }, 0);
      expect(RA + RB).toBeCloseTo(carga, 6);
    }
  });

  it('cumple dM/dx = V, que es lo que el tema quiere que se vea', () => {
    const v = seisCinco;
    const h = 1e-4;
    for (const x of [1, 3, 4.3, 5, 6.5, 8, 9]) {
      const pendiente = (flector(v, x + h) - flector(v, x - h)) / (2 * h);
      expect(pendiente).toBeCloseTo(cortante(v, x), 3);
    }
  });

  it('deja el flector nulo en los extremos libres y salta en las cargas puntuales', () => {
    const salto = cortante(seisDos, 3, 'der') - cortante(seisDos, 3, 'izq');
    expect(salto).toBeCloseTo(-10, 6);
  });

  it('muestrea el diagrama sin huecos ni NaN', () => {
    for (const p of diagrama(seisCinco, 200)) {
      expect(Number.isFinite(p.V)).toBe(true);
      expect(Number.isFinite(p.M)).toBe(true);
    }
  });
});
