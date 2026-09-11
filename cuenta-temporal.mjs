/* Febrero de 2025, problema 2. Generador de aire caliente de catalogo. */
const cp = 1.0045, R = 0.287;
const Pnom = 200, Putil = 184, caudal = 16500 / 3600;   // m3/s en la entrada
const Te = 11, T0 = 10, Tzona = 400, Tgases = 70;

const rho = 101.325 / (R * (273.15 + Te));
const m = caudal * rho;
const dT = Putil / (m * cp);
const Ts = Te + dT;

const K = (t) => t + 273.15;
const perdidas = Pnom - Putil;
const bEntra = Pnom * (1 - K(T0) / K(Tzona));
const bAire = m * (cp * dT - K(T0) * cp * Math.log(K(Ts) / K(Te)));
const bGases = perdidas * (1 - K(T0) / K(Tgases));
const BD = bEntra - bAire - bGases;

const f = (x, n = 3) => x.toFixed(n);
console.log(`densidad a ${Te} C = ${f(rho)} kg/m3   ->  gasto = ${f(m)} kg/s`);
console.log(`salto = ${f(dT, 2)} K   ->  temperatura de salida = ${f(Ts, 1)} C`);
console.log(`exergia que entra con el calor a 400 C = ${f(bEntra, 2)} kW`);
console.log(`  se queda en el aire        = ${f(bAire, 2)} kW`);
console.log(`  se va con los gases a 70 C = ${f(bGases, 2)} kW`);
console.log(`  destruida                  = ${f(BD, 2)} kW`);
console.log(`rendimiento exergetico = ${f(bAire / bEntra * 100, 2)} %`);
console.log(`(rendimiento energetico = ${f(Putil / Pnom * 100, 1)} %)`);
