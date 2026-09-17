/**
 * Cuatro ejercicios propios de nivel boletín para los temas 2 y 3.
 *
 * Son los primeros ejercicios del corpus que no vienen del boletín ni de un
 * examen y **aun así no son ejemplos de entrada**: tienen dificultad de
 * boletín. Existen porque hay escalones a los que el boletín no da material
 * —no hay ninguna serie telescópica, ninguno de Fermat, ninguno de punto
 * fijo—, y sin ellos esos escalones saltan del ejemplo al examen.
 *
 * Su `fuente` lo dice con todas las letras, como la de los ejemplos: no se
 * cuelan de matute entre los del boletín.
 *
 *     node scripts/rampa/nuevos-t02-t03.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const LF = String.fromCharCode(10);
const PROPIO = 'Ejercicio propio · Road to Ingeniería. De nivel de boletín, escrito '
  + 'para un escalón al que el boletín no da material. No es del boletín ni ha caído en examen.';

/** Añade los ejercicios al final de la lista `ejercicios:` de un tema. */
function anexa(fichero, bloques) {
  const texto = readFileSync(fichero, 'utf8');
  const fin = texto.replace(/\s+$/, '');
  writeFileSync(fichero, fin + LF + LF + bloques.join(LF) + LF);
}

const T2 = 'src/content/calculo/t02-sucesiones/ejercicios.yaml';
const T3 = 'src/content/calculo/t03-funciones-reales/ejercicios.yaml';

/* ══ tema 2 · dos telescópicas ═══════════════════════════════════════ */

const telescopicaRaiz = String.raw`  - id: telescopica-con-raices
    titulo: Una telescópica que no converge
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Estudiar el carácter de la serie

      $$
      \sum_{n=1}^{\infty}\frac{1}{\sqrt{n}+\sqrt{n+1}}
      $$
    pide: El carácter de la serie, y su suma si converge.
    pasos:
      - tipo: reconocer
        pregunta: |
          El término tiende a cero. ¿Qué se puede concluir de eso?
        opciones:
          - texto: Nada todavía; es necesario para converger, pero no suficiente
            correcta: true
            mensaje: |
              Exacto. Que $a_n \to 0$ es una **condición necesaria**: si no se
              cumpliera, la serie divergiría seguro. Cumpliéndose, todavía no se
              sabe nada — la armónica lo cumple y diverge.
          - texto: Que la serie converge
            mensaje: |
              Es el error más repetido del tema. La armónica $\sum 1/n$ tiene
              término que tiende a cero y su suma es infinita.
          - texto: Que la serie es telescópica
            mensaje: |
              Telescópica lo es, pero no por eso: lo es porque el término se
              puede escribir como una diferencia de dos valores consecutivos de
              la misma expresión. Y eso hay que descubrirlo racionalizando.
      - tipo: calcular
        titulo: Racionalizar el término
        pregunta: |
          Multiplicando arriba y abajo por $\sqrt{n+1}-\sqrt{n}$, ¿en qué se
          convierte $a_n$? Escribe el valor de $a_3$.
        respuesta:
          tipo: numero
          valor: '0.2679492'
          tolerancia: 0.001
          formato: un número, con tres decimales bastan
        distractores:
          - valor: '0.4494897'
            mensaje: |
              Eso es $\frac{1}{\sqrt3+\sqrt4}$ calculado a lo bruto sin
              racionalizar... y da lo mismo, así que revisa la cuenta: con
              $\sqrt3 = 1{,}732$ y $\sqrt4 = 2$ sale $1/3{,}732 = 0{,}268$.
          - valor: '1.7320508'
            mensaje: |
              Ese es $\sqrt3$ a secas. Lo que se pide es el valor del término
              entero, que es $\sqrt4-\sqrt3$.
        pista: |
          $\left(\sqrt{n}+\sqrt{n+1}\right)\left(\sqrt{n+1}-\sqrt{n}\right) =
          (n+1)-n = 1$.
        desarrollo: |
          $$
          a_n = \frac{1}{\sqrt{n}+\sqrt{n+1}}
              \cdot\frac{\sqrt{n+1}-\sqrt{n}}{\sqrt{n+1}-\sqrt{n}}
              = \frac{\sqrt{n+1}-\sqrt{n}}{(n+1)-n}
              = \sqrt{n+1}-\sqrt{n}
          $$

          Con $n=3$: $\sqrt4-\sqrt3 = 2-1{,}732 = 0{,}268$.
        veredicto: |
          Ahora sí se ve la telescópica: el término es la diferencia de dos
          valores consecutivos de $\sqrt{n}$.
      - tipo: calcular
        titulo: La suma parcial
        pregunta: |
          Sumando de $n=1$ a $n=N$ se cancela casi todo. ¿Cuánto vale $S_{99}$?
        respuesta:
          tipo: numero
          valor: '9'
          tolerancia: 0.01
          formato: un número
        distractores:
          - valor: '10'
            mensaje: |
              Te has dejado el $-\sqrt1$. La suma parcial es
              $\sqrt{N+1}-1$, y con $N=99$ eso es $\sqrt{100}-1 = 10-1$.
          - valor: '0'
            mensaje: |
              Ese es el error de creer que se cancela **todo**. Se cancelan los
              términos de en medio, pero el primero y el último no tienen con
              quién cancelarse: por eso queda $\sqrt{N+1}-1$ y no cero.
        pista: |
          $S_N = (\sqrt2-\sqrt1)+(\sqrt3-\sqrt2)+\dots+(\sqrt{N+1}-\sqrt{N})$.
        desarrollo: |
          $$
          S_N = \sum_{n=1}^{N}\left(\sqrt{n+1}-\sqrt{n}\right) = \sqrt{N+1}-1
          $$

          Con $N=99$: $S_{99} = 10-1 = 9$.
      - tipo: justificar
        pregunta: |
          Ordena el razonamiento que decide el carácter. Una pieza es falsa.
        piezas:
          - texto: 'Racionalizando, $a_n = \sqrt{n+1}-\sqrt{n}$, que es una diferencia consecutiva.'
          - texto: 'La suma parcial se cancela entera salvo los extremos: $S_N = \sqrt{N+1}-1$.'
          - texto: 'Cuando $N\to\infty$, $\sqrt{N+1}\to\infty$, así que $S_N\to\infty$.'
          - texto: 'Por tanto la serie **diverge**, aunque su término tienda a cero.'
          - texto: 'Como el término tiende a cero, la suma parcial está acotada y la serie converge.'
            trampa: true
            mensaje: |
              Eso es precisamente lo que este ejercicio desmonta. Que los
              sumandos se hagan pequeños no impide que la suma crezca sin tope:
              aquí crece como $\sqrt{N}$, despacio pero sin parar.
        veredicto: |
          Telescópica no quiere decir convergente: quiere decir que la suma
          parcial se calcula. Lo que decide es a dónde va esa suma parcial.
    resolucion: |
      **Datos.** Se pide el carácter de $\sum_{n\ge1} \dfrac{1}{\sqrt n+\sqrt{n+1}}$.

      ### 1 · El término tiende a cero, y eso no basta

      $a_n \to 0$, luego **no se puede afirmar que diverja** por la condición
      del término general. Hay que mirar las sumas parciales.

      ### 2 · Racionalizar

      $$
      a_n = \frac{1}{\sqrt n+\sqrt{n+1}}\cdot
            \frac{\sqrt{n+1}-\sqrt n}{\sqrt{n+1}-\sqrt n}
          = \sqrt{n+1}-\sqrt n
      $$

      porque el denominador es $(n+1)-n = 1$.

      ### 3 · La suma parcial

      $$
      S_N = \sum_{n=1}^{N}\left(\sqrt{n+1}-\sqrt n\right) = \sqrt{N+1}-\sqrt1
      $$

      Cada $\sqrt{n}$ aparece una vez con signo más y otra con signo menos,
      salvo el primero y el último.

      ### 4 · El límite

      $$
      \lim_{N\to\infty} S_N = \lim_{N\to\infty}\left(\sqrt{N+1}-1\right) = +\infty
      $$

      ### 5 · Comprobación

      Con $N=99$ la suma vale $9$; con $N = 9999$ vale $99$. Crece sin tope,
      aunque despacio: hacen falta un millón de términos para pasar de mil.

      ### Resultado

      $$
      \boxed{\;\text{La serie diverge}\;}
      $$

      > **Lo que enseña.** Una telescópica no es un tipo de serie convergente:
      > es una serie cuya suma parcial se sabe escribir. Escrita, se mira a
      > dónde va — y aquí se va al infinito.
`;

const telescopicaTres = String.raw`  - id: telescopica-de-tres-en-tres
    titulo: Una telescópica en la que sobreviven tres términos
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Calcular la suma de la serie

      $$
      \sum_{n=1}^{\infty}\frac{1}{n(n+3)}
      $$
    pide: La suma de la serie.
    pasos:
      - tipo: reconocer
        pregunta: |
          Al descomponer en fracciones simples aparece $\frac{1}{n}-\frac{1}{n+3}$
          multiplicado por una constante. ¿Qué cambia respecto de la telescópica
          de siempre, la de $\frac{1}{n(n+1)}$?
        opciones:
          - texto: >-
              Que el hueco entre los dos denominadores es 3, así que no se
              cancelan términos consecutivos sino de tres en tres
            correcta: true
            mensaje: |
              Eso es. Y la consecuencia es que al final **no sobrevive un
              término, sobreviven tres**: los tres primeros de la parte
              positiva. Ese es todo el ejercicio.
          - texto: Que ya no es telescópica
            mensaje: |
              Sí lo es. Telescópica quiere decir que los términos se cancelan
              contra otros de la misma lista; no exige que el cancelado sea el
              de al lado.
          - texto: Que hay que sumar tres series por separado
            mensaje: |
              No hace falta, y además no se puede: $\sum 1/n$ diverge, así que
              separarla en dos series sería restar dos infinitos. Hay que
              trabajar con la suma parcial.
      - tipo: calcular
        titulo: La constante de la descomposición
        pregunta: |
          Al escribir $\dfrac{1}{n(n+3)} = A\left(\dfrac{1}{n}-\dfrac{1}{n+3}\right)$,
          ¿cuánto vale $A$?
        respuesta:
          tipo: numero
          valor: '0.3333333'
          tolerancia: 0.002
          formato: un número; vale escribirlo como 0,333
        distractores:
          - valor: '1'
            mensaje: |
              Comprueba sumando: $\frac1n-\frac1{n+3} = \frac{3}{n(n+3)}$, que es
              **tres veces** lo que se quiere. Hay que dividir entre 3.
          - valor: '3'
            mensaje: |
              Al revés: la diferencia vale tres veces el término, así que la
              constante que hay que poner delante es un tercio.
        pista: |
          Suma $\frac1n-\frac1{n+3}$ con denominador común y compara.
        desarrollo: |
          $$
          \frac{1}{n}-\frac{1}{n+3} = \frac{(n+3)-n}{n(n+3)} = \frac{3}{n(n+3)}
          $$

          luego $\dfrac{1}{n(n+3)} = \dfrac13\left(\dfrac1n-\dfrac1{n+3}\right)$.
      - tipo: calcular
        titulo: La suma
        pregunta: |
          ¿Cuánto vale la suma de la serie?
        respuesta:
          tipo: numero
          valor: '0.6111111'
          tolerancia: 0.002
          formato: un número; es 11/18
        distractores:
          - valor: '0.3333333'
            mensaje: |
              Ese sería el resultado si sobreviviera un solo término, $\frac13\cdot1$.
              Con hueco 3 sobreviven tres: $1$, $\frac12$ y $\frac13$.
          - valor: '1.8333333'
            mensaje: |
              Has sumado $1+\frac12+\frac13$ y te has dejado el tercio de fuera.
              Falta multiplicar por $A = \frac13$.
        pista: |
          $S_N = \frac13\left(1+\frac12+\frac13 - \frac{1}{N+1}-\frac{1}{N+2}-\frac{1}{N+3}\right)$.
        desarrollo: |
          Los tres últimos se van a cero, y queda

          $$
          S = \frac13\left(1+\frac12+\frac13\right) = \frac13\cdot\frac{11}{6}
            = \frac{11}{18} \approx 0{,}6111
          $$
      - tipo: justificar
        pregunta: |
          Ordena el razonamiento. Una pieza es falsa.
        piezas:
          - texto: 'Se descompone: $\frac{1}{n(n+3)} = \frac13\left(\frac1n-\frac1{n+3}\right)$.'
          - texto: 'En la suma parcial, cada $\frac1k$ con $k\ge4$ aparece una vez sumando y otra restando.'
          - texto: 'Sobreviven sin cancelar los tres primeros positivos y los tres últimos negativos.'
          - texto: 'Los tres últimos tienden a cero, así que $S = \frac13\left(1+\frac12+\frac13\right) = \frac{11}{18}$.'
          - texto: 'Como $\sum\frac1n$ y $\sum\frac1{n+3}$ divergen las dos, su diferencia también.'
            trampa: true
            mensaje: |
              De dos series divergentes no se puede concluir nada sobre su
              diferencia: $\infty-\infty$ no es una operación. Por eso no se
              separan las dos sumas, y se trabaja con la suma parcial.
        veredicto: |
          Cuántos términos sobreviven lo dice el hueco: con $\frac1n-\frac1{n+k}$
          sobreviven $k$.
    resolucion: |
      **Datos.** Se pide la suma de $\sum_{n\ge1}\dfrac{1}{n(n+3)}$.

      ### 1 · Descomponer

      $$
      \frac{1}{n}-\frac{1}{n+3} = \frac{3}{n(n+3)}
      \;\Longrightarrow\;
      \frac{1}{n(n+3)} = \frac13\left(\frac1n-\frac1{n+3}\right)
      $$

      ### 2 · Escribir la suma parcial entera

      $$
      3S_N = \left(1-\tfrac14\right)+\left(\tfrac12-\tfrac15\right)
           + \left(\tfrac13-\tfrac16\right)+\left(\tfrac14-\tfrac17\right)+\dots
           + \left(\tfrac1N-\tfrac1{N+3}\right)
      $$

      A partir del cuarto paréntesis, cada fracción positiva cancela a una
      negativa escrita tres paréntesis antes. Quedan sin cancelar los **tres
      primeros positivos** y los **tres últimos negativos**:

      $$
      3S_N = 1+\frac12+\frac13-\frac{1}{N+1}-\frac{1}{N+2}-\frac{1}{N+3}
      $$

      ### 3 · Pasar al límite

      Los tres negativos se van a cero, luego

      $$
      3S = 1+\frac12+\frac13 = \frac{11}{6}
      $$

      ### 4 · Comprobación

      Con $N=10$ la suma parcial vale $0{,}5306$; con $N=1000$, $0{,}6101$. Se
      acerca a $0{,}6111$ por debajo, que es lo que tiene que pasar al ser todos
      los términos positivos.

      ### Resultado

      $$
      \boxed{\;S = \frac{11}{18}\approx 0{,}6111\;}
      $$

      > **Lo que enseña.** El número de términos que sobreviven es el hueco
      > entre los dos denominadores. Con $\frac1n-\frac1{n+1}$ sobrevive uno;
      > con hueco $k$, sobreviven $k$. Contarlos mal es el único error posible
      > una vez descompuesto.
`;

/* ══ tema 3 · Bolzano y punto fijo ═══════════════════════════════════ */

const bolzanoCinco = String.raw`  - id: bolzano-tres-raices-de-una-quintica
    titulo: Tres raíces garantizadas sin resolver nada
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Demostrar que la ecuación

      $$
      x^{5}-3x+1 = 0
      $$

      tiene al menos **tres** raíces reales.
    pide: La demostración, indicando en qué intervalos está cada raíz.
    pasos:
      - tipo: reconocer
        pregunta: |
          ¿Qué hay que hacer para garantizar **tres** raíces con el teorema de
          Bolzano?
        opciones:
          - texto: >-
              Encontrar tres intervalos disjuntos en cada uno de los cuales la
              función cambie de signo
            correcta: true
            mensaje: |
              Eso es. Bolzano da una raíz por cada cambio de signo en un
              intervalo donde la función sea continua, y los intervalos tienen
              que ser disjuntos para que las raíces sean distintas.
          - texto: Comprobar que la derivada se anula dos veces
            mensaje: |
              Eso ayuda a saber cuántas raíces hay **como mucho** —entre dos
              raíces hay un cero de la derivada, por Rolle—, pero no garantiza
              ninguna. Para garantizar hace falta cambio de signo.
          - texto: Resolver la ecuación
            mensaje: |
              No se puede: una quíntica general no tiene fórmula. Justamente por
              eso el ejercicio pide garantizar sin resolver.
      - tipo: calcular
        titulo: El valor que cierra el tercer intervalo
        pregunta: |
          Con $f(x)=x^{5}-3x+1$, ¿cuánto vale $f(2)$?
        respuesta:
          tipo: numero
          valor: '27'
          tolerancia: 0.01
          formato: un número
        distractores:
          - valor: '-25'
            mensaje: |
              Ese es $f(-2)$. Cuidado con el signo de la potencia impar:
              $(-2)^5 = -32$, pero $2^5 = +32$.
          - valor: '33'
            mensaje: |
              Has sumado el $3x$ en vez de restarlo: $32-6+1 = 27$.
        pista: |
          $2^5 = 32$, y luego $-3\cdot2+1$.
        desarrollo: |
          $$
          f(2) = 32-6+1 = 27 > 0
          $$
        veredicto: |
          Junto con $f(1) = -1 < 0$, esto cierra el tercer cambio de signo.
      - tipo: justificar
        pregunta: |
          Ordena la demostración. Una de las piezas no debe entrar.
        piezas:
          - texto: '$f$ es un polinomio, luego es continua en todo $\mathbb{R}$; Bolzano se puede aplicar en cualquier intervalo.'
          - texto: 'Se evalúa: $f(-2)=-25<0$, $f(0)=1>0$, $f(1)=-1<0$ y $f(2)=27>0$.'
          - texto: 'Hay cambio de signo en $(-2,0)$, en $(0,1)$ y en $(1,2)$, que son tres intervalos disjuntos.'
          - texto: 'Por Bolzano hay una raíz en cada uno, y al ser disjuntos son tres raíces distintas.'
          - texto: 'Como el grado es cinco, la ecuación tiene exactamente cinco raíces reales.'
            trampa: true
            mensaje: |
              El grado cinco garantiza cinco raíces **complejas** contando
              multiplicidades, no cinco reales. De hecho esta ecuación tiene
              exactamente tres reales y dos complejas conjugadas.
        veredicto: |
          Bolzano da un mínimo de raíces, nunca un máximo. Para acotar por
          arriba hace falta Rolle o la monotonía.
    resolucion: |
      **Datos.** Se pide demostrar que $x^5-3x+1=0$ tiene al menos tres raíces
      reales.

      ### 1 · Continuidad

      $f(x)=x^5-3x+1$ es un polinomio, luego es continua en todo $\mathbb{R}$.
      La hipótesis de Bolzano se cumple en cualquier intervalo cerrado, y esto
      hay que decirlo antes de usarla.

      ### 2 · Buscar cambios de signo

      $$
      \begin{aligned}
      f(-2) &= -32+6+1 = -25 < 0\\
      f(0)  &= 1 > 0\\
      f(1)  &= 1-3+1 = -1 < 0\\
      f(2)  &= 32-6+1 = 27 > 0
      \end{aligned}
      $$

      ### 3 · Aplicar Bolzano tres veces

      En $[-2,0]$, en $[0,1]$ y en $[1,2]$ la función es continua y cambia de
      signo. Por el teorema de Bolzano hay al menos una raíz en cada uno de los
      tres intervalos **abiertos**, y como son disjuntos, las tres raíces son
      distintas.

      ### 4 · Comprobación

      Las raíces son aproximadamente $-1{,}389$, $0{,}334$ y $1{,}214$, y cada
      una cae donde toca. Además $f'(x)=5x^4-3$ se anula solo en dos puntos,
      así que por Rolle no puede haber más de tres raíces: son exactamente tres.

      ### Resultado

      $$
      \boxed{\;\text{Hay al menos una raíz en }(-2,0),\ (0,1)\ \text{y}\ (1,2)\;}
      $$

      > **Lo que enseña.** Bolzano se usa tantas veces como cambios de signo se
      > encuentren, y encontrarlos es tanteo: se prueban enteros pequeños hasta
      > que el signo salta. Lo que no da Bolzano nunca es un máximo.
`;

const puntoFijo = String.raw`  - id: punto-fijo-del-coseno
    titulo: La ecuación que resuelve la calculadora sola
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Demostrar que la ecuación $\cos x = x$ tiene **exactamente una** solución
      real, y que está en el intervalo $\left[0,1\right]$.
    pide: La demostración de la existencia y la de la unicidad.
    pasos:
      - tipo: reconocer
        pregunta: |
          La ecuación no está igualada a cero. ¿Cuál es el primer movimiento?
        opciones:
          - texto: >-
              Pasar todo a un lado y estudiar $g(x)=\cos x - x$, que es a la que
              se le aplica Bolzano
            correcta: true
            mensaje: |
              Eso es, y es el único movimiento del ejercicio que hay que
              recordar: Bolzano habla de **raíces**, así que primero se fabrica
              una función cuyo cero sea la solución buscada.
          - texto: Aplicar Bolzano directamente a $\cos x$
            mensaje: |
              Bolzano diría dónde se anula el coseno, que no es lo que se
              pregunta. Hay que fabricar la función auxiliar.
          - texto: Despejar la $x$
            mensaje: |
              No se puede despejar: la $x$ aparece dentro y fuera del coseno.
              Ese es precisamente el motivo de que el ejercicio exista.
      - tipo: calcular
        titulo: El extremo derecho
        pregunta: |
          Con $g(x)=\cos x - x$, ¿cuánto vale $g(1)$? (el coseno, en radianes)
        respuesta:
          tipo: numero
          valor: '-0.4596977'
          tolerancia: 0.005
          formato: un número, con tres decimales bastan
        distractores:
          - valor: '0.4596977'
            mensaje: |
              Signo cambiado. $\cos 1 = 0{,}540$, que es **menor** que $1$, así
              que la resta sale negativa.
          - valor: '0.9998477'
            mensaje: |
              Has calculado el coseno de 1 **grado**. En todo el tema los
              ángulos van en radianes, y es un error que en examen cuesta el
              ejercicio entero.
        pista: |
          $\cos 1 \approx 0{,}5403$ con la calculadora en radianes.
        desarrollo: |
          $$
          g(1) = \cos 1 - 1 \approx 0{,}5403-1 = -0{,}4597 < 0
          $$

          Y en el otro extremo, $g(0) = \cos 0 - 0 = 1 > 0$.
        veredicto: |
          Cambio de signo en $[0,1]$: Bolzano ya da la existencia.
      - tipo: justificar
        pregunta: |
          Ordena la demostración completa. Una pieza es falsa.
        piezas:
          - texto: 'Se define $g(x)=\cos x - x$, continua en $\mathbb{R}$ por ser diferencia de continuas.'
          - texto: '$g(0)=1>0$ y $g(1)=\cos 1-1<0$, así que por Bolzano hay una raíz en $(0,1)$.'
          - texto: '$g''(x) = -\operatorname{sen} x - 1 \le 0$, y solo vale cero en puntos aislados.'
          - texto: 'Luego $g$ es estrictamente decreciente en todo $\mathbb{R}$ y no puede cortar al eje dos veces: la solución es única.'
          - texto: 'Como el coseno está acotado entre $-1$ y $1$, fuera de ese intervalo no hay soluciones, y dentro solo puede haber una.'
            trampa: true
            mensaje: |
              La primera mitad es cierta y además útil —fuera de $[-1,1]$ no
              puede haber solución—, pero la segunda no se sigue de ella:
              acotado no quiere decir que se corte una sola vez. La unicidad
              sale de la monotonía, no de la cota.
        veredicto: |
          Existencia con Bolzano, unicidad con la derivada. Son dos argumentos
          distintos y el ejercicio pide los dos.
    resolucion: |
      **Datos.** Se pide demostrar que $\cos x = x$ tiene exactamente una
      solución, y localizarla en $[0,1]$.

      ### 1 · Fabricar la función auxiliar

      Bolzano habla de raíces, así que se pasa todo a un lado:

      $$
      g(x) = \cos x - x
      $$

      Resolver $\cos x = x$ es encontrar los ceros de $g$. Y $g$ es continua en
      todo $\mathbb{R}$ por ser diferencia de funciones continuas.

      ### 2 · Existencia, con Bolzano

      $$
      g(0) = 1 > 0, \qquad g(1) = \cos 1 - 1 \approx -0{,}4597 < 0
      $$

      $g$ es continua en $[0,1]$ y cambia de signo, luego existe $c\in(0,1)$
      con $g(c)=0$.

      ### 3 · Unicidad, con la derivada

      $$
      g'(x) = -\operatorname{sen} x - 1 \le 0
      $$

      porque $\operatorname{sen} x \ge -1$. La igualdad solo se da en los puntos
      aislados donde $\operatorname{sen} x = -1$, así que $g$ es
      **estrictamente decreciente** en todo $\mathbb{R}$. Una función
      estrictamente decreciente no puede tomar el valor $0$ dos veces: si lo
      tomara en $c_1<c_2$ tendríamos $g(c_1)=g(c_2)$, imposible.

      ### 4 · Comprobación

      La solución vale $c \approx 0{,}739$, y es la que sale al pulsar el coseno
      repetidamente en una calculadora en radianes partiendo de cualquier
      número: cada pulsación acerca un poco más.

      ### Resultado

      $$
      \boxed{\;\text{Hay exactamente una solución, y está en }(0,1)\;}
      $$

      > **Lo que enseña.** Este es el molde de casi todos los ejercicios de
      > teoremas del examen: *existe* se demuestra con Bolzano y *es única* con
      > la monotonía. Escribir solo una de las dos mitades es media nota.
`;

anexa(T2, [telescopicaRaiz, telescopicaTres]);
anexa(T3, [bolzanoCinco, puntoFijo]);
console.log('4 ejercicios propios añadidos: 2 en t02 y 2 en t03');
