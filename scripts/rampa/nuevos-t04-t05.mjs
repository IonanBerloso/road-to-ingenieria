/**
 * Nueve ejercicios propios de nivel boletín para los temas 4 y 5.
 *
 * Misma razón que los de `nuevos-t02-t03.mjs`: hay escalones a los que el
 * boletín no da material de nivel intermedio y que hoy saltan del ejemplo de
 * entrada al ejercicio de examen. Cubren Fermat con sus dos contraejemplos,
 * Taylor —construir y componer—, leer la gráfica de la derivada, el estudio
 * completo de una racional y las dos caras del teorema fundamental.
 *
 *     node scripts/rampa/nuevos-t04-t05.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const LF = String.fromCharCode(10);
const PROPIO = 'Ejercicio propio · Road to Ingeniería. De nivel de boletín, escrito '
  + 'para un escalón al que el boletín no da material. No es del boletín ni ha caído en examen.';

function anexa(fichero, bloques) {
  const texto = readFileSync(fichero, 'utf8').replace(/\s+$/, '');
  writeFileSync(fichero, texto + LF + LF + bloques.join(LF) + LF);
}

const T4 = 'src/content/calculo/t04-estudio-local/ejercicios.yaml';
const T5 = 'src/content/calculo/t05-integracion/ejercicios.yaml';

/* ══ Fermat, por sus dos hipótesis ═══════════════════════════════════ */

const fermatBorde = String.raw`  - id: fermat-en-el-borde-del-intervalo
    titulo: Un mínimo con derivada distinta de cero
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Sea $f(x)=x^{2}$ en el intervalo cerrado $[1,3]$.

      Localizar su mínimo absoluto, calcular la derivada ahí y explicar por qué
      esto no contradice el teorema de Fermat.
    pide: El punto donde está el mínimo, el valor de $f'$ en él y la explicación.
    pasos:
      - tipo: reconocer
        pregunta: |
          ¿Dónde alcanza $f(x)=x^2$ su mínimo en $[1,3]$?
        opciones:
          - texto: En $x=1$, el extremo izquierdo del intervalo
            correcta: true
            mensaje: |
              Sí. La parábola crece en todo $[1,3]$ porque el vértice, $x=0$,
              se ha quedado fuera. El valor más pequeño es el primero.
          - texto: En $x=0$, donde está el vértice
            mensaje: |
              El vértice existe, pero **no está en el intervalo**. Solo se
              compite entre los puntos de $[1,3]$, y el $0$ no es uno de ellos.
          - texto: No tiene mínimo, porque la derivada no se anula en el intervalo
            mensaje: |
              Sí lo tiene: $f$ es continua y $[1,3]$ es cerrado y acotado, así
              que por Weierstrass el mínimo y el máximo se alcanzan
              **seguro**. Lo que no está garantizado es que sea en un punto de
              derivada nula.
      - tipo: calcular
        titulo: La derivada en ese punto
        pregunta: |
          ¿Cuánto vale $f'$ en el punto donde está el mínimo?
        respuesta:
          tipo: numero
          valor: '2'
          tolerancia: 0.01
          formato: un número
        distractores:
          - valor: '0'
            mensaje: |
              Esa es la respuesta que Fermat *parecería* imponer, y es
              justamente lo que este ejercicio desmonta. $f'(x)=2x$, y en
              $x=1$ eso vale $2$, no $0$.
          - valor: '6'
            mensaje: |
              Ese es $f'(3)$, la derivada en el otro extremo — donde está el
              **máximo**, no el mínimo.
        pista: |
          $f'(x)=2x$, y el mínimo está en el extremo izquierdo.
        desarrollo: |
          $$
          f'(x)=2x \quad\Longrightarrow\quad f'(1)=2 \neq 0
          $$
        veredicto: |
          Un extremo absoluto con derivada no nula. Toca explicar por qué es
          legal.
      - tipo: justificar
        pregunta: |
          Ordena la explicación. Una pieza es falsa.
        piezas:
          - texto: 'Fermat dice: si $c$ es un extremo **local**, $c$ es **interior** al intervalo y $f$ es **derivable** en $c$, entonces $f''(c)=0$.'
          - texto: 'Aquí el mínimo está en $c=1$, que es un extremo del intervalo y no un punto interior.'
          - texto: 'Falla la hipótesis de interioridad, así que el teorema no dice nada sobre $f''(1)$ y no hay contradicción.'
          - texto: 'De ahí la regla práctica: los candidatos a extremo absoluto son los puntos críticos **y además** los bordes del intervalo.'
          - texto: 'Como $f''(1)\neq0$, el punto $x=1$ no puede ser un extremo, así que el mínimo tiene que estar en otro sitio.'
            trampa: true
            mensaje: |
              Ese es el recíproco mal usado. Fermat va en un solo sentido: de
              extremo interior derivable a derivada nula. Nunca de derivada no
              nula a «aquí no hay extremo», porque en los bordes no aplica.
        veredicto: |
          El teorema se cita con sus tres palabras —local, interior,
          derivable— y se comprueban las tres antes de usarlo.
    resolucion: |
      **Datos.** $f(x)=x^2$ en $[1,3]$.

      ### 1 · Dónde está el mínimo

      $f'(x)=2x>0$ en todo $[1,3]$, luego $f$ es estrictamente creciente y el
      valor más pequeño se alcanza en el extremo izquierdo:

      $$
      \min_{[1,3]} f = f(1) = 1, \qquad \text{en } x=1
      $$

      Que el mínimo existe lo garantiza Weierstrass: $f$ es continua y el
      intervalo es cerrado y acotado.

      ### 2 · La derivada ahí

      $$
      f'(1) = 2 \neq 0
      $$

      ### 3 · Por qué no hay contradicción

      El teorema de Fermat pide **tres** cosas:

      | hipótesis | ¿se cumple aquí? |
      |---|---|
      | $c$ es extremo local | sí |
      | $c$ es **interior** al intervalo | **no**: $c=1$ es el borde |
      | $f$ es derivable en $c$ | sí |

      Falla la segunda, así que el teorema no se puede aplicar y su conclusión
      no tiene por qué darse.

      ### 4 · Comprobación

      Si se amplía el intervalo a $[-1,3]$, el mínimo pasa a $x=0$, que ahora
      sí es interior — y allí $f'(0)=0$, como Fermat exige.

      ### Resultado

      $$
      \boxed{\;\text{Mínimo en } x=1,\ f'(1)=2\neq0:\ \text{el punto no es interior}\;}
      $$

      > **Lo que enseña.** Buscar extremos absolutos en un intervalo cerrado no
      > es «resolver $f'=0$»: es comparar el valor de $f$ en los puntos
      > críticos **y en los dos bordes**. Olvidar los bordes es el error que
      > más puntos cuesta en los problemas de optimización.
`;

const fermatSinDerivada = String.raw`  - id: fermat-y-el-pico-sin-derivada
    titulo: Un mínimo interior donde la derivada no existe
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Sea $f(x)=|x-2|$ en el intervalo $[0,4]$.

      Localizar su mínimo, estudiar si $f$ es derivable ahí y explicar por qué
      esto tampoco contradice el teorema de Fermat.
    pide: El punto del mínimo, las dos derivadas laterales y la explicación.
    pasos:
      - tipo: reconocer
        pregunta: |
          El mínimo está en $x=2$, que **sí** es interior al intervalo. ¿Qué
          hipótesis de Fermat queda por comprobar?
        opciones:
          - texto: La derivabilidad de $f$ en ese punto
            correcta: true
            mensaje: |
              Exacto, y es la que falla. En un pico, las dos pendientes que
              llegan al punto son distintas, así que no hay una sola derivada.
          - texto: La continuidad de $f$ en $[0,4]$
            mensaje: |
              La continuidad se cumple —el valor absoluto es continuo—, y
              además no es hipótesis de Fermat: Fermat pide derivabilidad **en
              el punto**, que es más fuerte.
          - texto: Que el intervalo sea cerrado
            mensaje: |
              Eso lo pide Weierstrass para garantizar que el extremo existe,
              no Fermat. Fermat parte de que el extremo ya está ahí.
      - tipo: calcular
        titulo: La derivada por la derecha
        pregunta: |
          ¿Cuánto vale $f'(2^{+})$, la derivada lateral por la derecha?
        respuesta:
          tipo: numero
          valor: '1'
          tolerancia: 0.01
          formato: un número
        distractores:
          - valor: '-1'
            mensaje: |
              Ese es $f'(2^-)$, la lateral por la **izquierda**: a la izquierda
              de 2 la función es $2-x$, que baja. A la derecha es $x-2$, que
              sube.
          - valor: '0'
            mensaje: |
              No hay ningún tramo horizontal. El gráfico es una uve: baja con
              pendiente $-1$ y sube con pendiente $+1$, sin pasar por cero.
        pista: |
          Para $x>2$ la función vale $x-2$.
        desarrollo: |
          $$
          f(x)=\begin{cases} 2-x & x<2\\ x-2 & x\ge2\end{cases}
          \quad\Longrightarrow\quad
          f'(2^-)=-1,\qquad f'(2^+)=+1
          $$
        veredicto: |
          Las dos laterales existen y son distintas: no hay derivada en $x=2$.
      - tipo: justificar
        pregunta: |
          Ordena la explicación. Una pieza es falsa.
        piezas:
          - texto: 'El mínimo absoluto es $f(2)=0$, y $x=2$ **sí** es interior a $[0,4]$.'
          - texto: 'Las derivadas laterales valen $-1$ y $+1$: como no coinciden, $f$ no es derivable en $x=2$.'
          - texto: 'Falla la hipótesis de derivabilidad, así que Fermat no se aplica y no hay nada que contradecir.'
          - texto: 'De ahí la otra mitad de la regla: los candidatos son los puntos críticos, los bordes **y los puntos donde $f$ no es derivable**.'
          - texto: 'Como no es derivable en $x=2$, la función no puede tener ahí un extremo y el mínimo estará en un borde.'
            trampa: true
            mensaje: |
              Al revés de como funciona. Que no haya derivada no impide el
              extremo: lo único que impide es **usar Fermat para encontrarlo**.
              De hecho el mínimo está justo ahí, y vale $0$.
        veredicto: |
          Junto con el ejercicio del borde, estos son los dos contraejemplos
          que hay que saber decir de memoria.
    resolucion: |
      **Datos.** $f(x)=|x-2|$ en $[0,4]$.

      ### 1 · Escribir la función a trozos

      $$
      f(x)=\begin{cases} 2-x & \text{si } x<2\\[2pt] x-2 & \text{si } x\ge2\end{cases}
      $$

      Baja con pendiente $-1$ hasta $x=2$ y sube con pendiente $+1$ a partir de
      ahí: es una uve con el vértice en $(2,0)$.

      ### 2 · El mínimo

      $f(x)\ge0$ siempre, y vale $0$ solo en $x=2$. Luego el mínimo absoluto es

      $$
      f(2)=0, \qquad \text{y } x=2 \text{ es interior a } [0,4]
      $$

      ### 3 · Las derivadas laterales

      $$
      f'(2^-) = \lim_{h\to0^-}\frac{|2+h-2|-0}{h} = \lim_{h\to0^-}\frac{-h}{h} = -1
      $$

      $$
      f'(2^+) = \lim_{h\to0^+}\frac{h}{h} = +1
      $$

      Distintas, luego **$f$ no es derivable en $x=2$**.

      ### 4 · Por qué no hay contradicción

      Fermat pide extremo local, punto interior **y derivabilidad**. Aquí se
      cumplen las dos primeras y falla la tercera, así que el teorema no se
      aplica.

      ### Resultado

      $$
      \boxed{\;\text{Mínimo en } x=2,\ \text{interior, pero } f \text{ no es derivable ahí}\;}
      $$

      > **Lo que enseña.** Con el ejercicio del borde se completa la lista de
      > candidatos a extremo absoluto: **puntos críticos, puntos sin derivada y
      > extremos del intervalo**. Los tres, siempre, y luego se comparan los
      > valores de $f$.
`;

/* ══ Taylor ══════════════════════════════════════════════════════════ */

const taylorLn = String.raw`  - id: taylor-del-logaritmo-en-uno
    titulo: Taylor de orden tres fuera del cero
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Calcular el polinomio de Taylor de orden $3$ de $f(x)=\ln x$ alrededor de
      $a=1$, usarlo para aproximar $\ln(1{,}1)$ y acotar el error cometido.
    pide: El polinomio, el valor aproximado y una cota del error.
    pasos:
      - tipo: reconocer
        pregunta: |
          El centro es $a=1$, no $a=0$. ¿En qué potencias va escrito el
          polinomio?
        opciones:
          - texto: En potencias de $(x-1)$
            correcta: true
            mensaje: |
              Eso es. El polinomio de Taylor centrado en $a$ va siempre en
              potencias de $(x-a)$, y por eso vale tanto cerca de $a$: en $x=a$
              todos los sumandos menos el primero se anulan.
          - texto: En potencias de $x$
            mensaje: |
              Eso sería Maclaurin, el caso $a=0$. Y aquí $a=0$ ni siquiera está
              en el dominio: $\ln 0$ no existe.
          - texto: En potencias de $\ln x$
            mensaje: |
              Un polinomio de Taylor es un polinomio en la variable, siempre.
              La función es lo que se aproxima, no lo que se eleva.
      - tipo: calcular
        titulo: La aproximación
        pregunta: |
          Sustituyendo $x=1{,}1$ en el polinomio de orden 3, ¿qué valor sale
          para $\ln(1{,}1)$?
        respuesta:
          tipo: numero
          valor: '0.0953333'
          tolerancia: 0.0002
          formato: un número, con cinco decimales
        distractores:
          - valor: '0.1'
            mensaje: |
              Ese es el polinomio de orden **1**, que se queda en $(x-1)$. El de
              orden 3 tiene dos términos más.
          - valor: '0.1053333'
            mensaje: |
              Has sumado el término cuadrático en vez de restarlo. Los signos
              del desarrollo del logaritmo se alternan: $+,-,+,-\dots$
        pista: |
          $P_3(x) = (x-1)-\frac{(x-1)^2}{2}+\frac{(x-1)^3}{3}$, y aquí
          $x-1 = 0{,}1$.
        desarrollo: |
          $$
          P_3(1{,}1) = 0{,}1 - \frac{0{,}01}{2} + \frac{0{,}001}{3}
                     = 0{,}1 - 0{,}005 + 0{,}000333 = 0{,}095333
          $$
      - tipo: calcular
        titulo: La cota del error
        pregunta: |
          Con el resto de Lagrange, $|R_3| \le \dfrac{\max|f^{(4)}|}{4!}\,|x-1|^4$
          en $[1;\,1{,}1]$. ¿Cuánto vale esa cota?
        respuesta:
          tipo: numero
          valor: '0.000025'
          tolerancia: 0.000002
          formato: un número; vale notación científica
        distractores:
          - valor: '0.0001'
            mensaje: |
              Eso es $|x-1|^4$ a secas, sin dividir entre $4!$ ni multiplicar
              por el máximo de la cuarta derivada.
          - valor: '0.0000042'
            mensaje: |
              Has dividido entre $4!=24$ pero te has dejado el factor $6$ del
              máximo de $|f^{(4)}|$. La cuenta es $6/24 = 1/4$, no $1/24$.
        pista: |
          $f^{(4)}(x) = -6/x^4$, y en $[1;\,1{,}1]$ su valor absoluto es
          máximo en $x=1$, donde vale $6$.
        desarrollo: |
          $$
          |R_3| \le \frac{6}{24}\,(0{,}1)^4 = 0{,}25\cdot10^{-4} = 2{,}5\cdot10^{-5}
          $$
        veredicto: |
          El error real es $0{,}0000231$, por debajo de la cota. Una cota que se
          respeta es la mejor comprobación que hay.
      - tipo: justificar
        pregunta: |
          Ordena el razonamiento. Una pieza es falsa.
        piezas:
          - texto: 'Las derivadas en $a=1$ son $f(1)=0$, $f''(1)=1$, $f''''(1)=-1$ y $f''''''(1)=2$.'
          - texto: 'Dividiendo cada una por su factorial: $P_3(x)=(x-1)-\frac{(x-1)^2}{2}+\frac{(x-1)^3}{3}$.'
          - texto: 'En $x=1{,}1$ el incremento es $0{,}1$, y el polinomio da $0{,}095333$.'
          - texto: 'El resto de Lagrange se acota con el máximo de $|f^{(4)}|$ en el intervalo, y sale $2{,}5\cdot10^{-5}$.'

          - texto: 'Como el polinomio es de grado 3, la aproximación tiene tres cifras decimales exactas garantizadas.'
            trampa: true
            mensaje: |
              El grado del polinomio no se traduce en un número de decimales:
              eso lo decide la cota del resto, que depende además de lo lejos
              que esté $x$ del centro. Aquí la cota da cuatro decimales
              buenos, no tres, y a $x=2$ no daría ninguno.
        veredicto: |
          Aproximar sin acotar el resto es dar un número sin decir cuánto vale.
          La cota es parte del ejercicio, no un extra.
    resolucion: |
      **Datos.** $f(x)=\ln x$, centro $a=1$, orden $3$.

      ### 1 · Las derivadas en el centro

      $$
      \begin{aligned}
      f(x)&=\ln x, & f(1)&=0\\
      f'(x)&=\tfrac1x, & f'(1)&=1\\
      f''(x)&=-\tfrac1{x^2}, & f''(1)&=-1\\
      f'''(x)&=\tfrac{2}{x^3}, & f'''(1)&=2
      \end{aligned}
      $$

      ### 2 · Montar el polinomio

      $$
      P_3(x)=0+\frac{1}{1!}(x-1)+\frac{-1}{2!}(x-1)^2+\frac{2}{3!}(x-1)^3
      $$

      $$
      \boxed{\,P_3(x)=(x-1)-\frac{(x-1)^2}{2}+\frac{(x-1)^3}{3}\,}
      $$

      ### 3 · Aproximar

      Con $x=1{,}1$, el incremento es $x-1=0{,}1$:

      $$
      P_3(1{,}1)=0{,}1-0{,}005+0{,}000\overline{3}=0{,}095333
      $$

      ### 4 · Acotar el error

      La cuarta derivada es $f^{(4)}(x)=-6/x^4$, y en $[1;\,1{,}1]$ su valor
      absoluto es mayor en $x=1$, donde vale $6$. Por el resto de Lagrange:

      $$
      |R_3(1{,}1)| \le \frac{6}{4!}\,(0{,}1)^4 = \frac{6}{24}\cdot10^{-4}
                    = 2{,}5\cdot10^{-5}
      $$

      ### 5 · Comprobación

      El valor exacto es $\ln(1{,}1)=0{,}0953102$, así que el error real es
      $2{,}31\cdot10^{-5}$: por debajo de la cota, como tiene que ser.

      ### Resultado

      $$
      \boxed{\;\ln(1{,}1)\approx0{,}09533\ \text{con error menor que }2{,}5\cdot10^{-5}\;}
      $$

      > **Lo que enseña.** Centrado en $a$ el polinomio se escribe en
      > $(x-a)$, y al sustituir **lo que se eleva es el incremento**, no la
      > $x$. Sustituir $1{,}1$ donde va $0{,}1$ es el error que más se repite
      > en este tema.
`;

const taylorCompuesto = String.raw`  - id: componer-tres-desarrollos-conocidos
    titulo: Un desarrollo dentro de otro
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Obtener el desarrollo de Maclaurin de

      $$
      f(x)=\ln\!\left(1+\operatorname{sen} x\right)
      $$

      hasta el término en $x^{3}$, **sin derivar la función**: componiendo los
      desarrollos conocidos de $\operatorname{sen} x$ y de $\ln(1+u)$.
    pide: Los términos hasta $x^3$, y el coeficiente de $x^3$ en concreto.
    pasos:
      - tipo: reconocer
        pregunta: |
          Se va a sustituir $u=\operatorname{sen} x$ en $\ln(1+u)$. ¿Hasta qué
          orden hay que desarrollar el seno?
        opciones:
          - texto: Hasta $x^3$, porque el seno empieza en $x$ y todo lo que aporte $x^4$ o más sobra
            correcta: true
            mensaje: |
              Eso es. Como $u$ es del orden de $x$, cualquier término de $u$ a
              partir de $x^4$ solo puede producir potencias de grado 4 o mayor,
              que se tiran.
          - texto: Hasta $x^9$, porque hay que elevar $u$ al cubo
            mensaje: |
              Al elevar al cubo los grados **se suman**, no hace falta más
              material: el término más bajo de $u^3$ ya es $x^3$, y todo lo
              demás de $u^3$ pasa de $x^3$.
          - texto: Basta con $u \approx x$, el primer término
            mensaje: |
              Casi, pero no: el término $-x^3/6$ del seno sí llega a $x^3$ por
              la vía de $u$ y cambia el resultado. Con solo $u=x$ saldría
              $1/3$ en vez de $1/6$.
      - tipo: calcular
        titulo: El coeficiente del término cúbico
        pregunta: |
          ¿Cuánto vale el coeficiente de $x^{3}$ en el desarrollo de $f$?
        respuesta:
          tipo: numero
          valor: '0.1666667'
          tolerancia: 0.002
          formato: un número; es 1/6
        distractores:
          - valor: '0.3333333'
            mensaje: |
              Eso sale de usar $u=x$ y quedarse solo con $u^3/3$: falta restar
              el $-x^3/6$ que trae el propio seno. $\frac13-\frac16=\frac16$.
          - valor: '-0.1666667'
            mensaje: |
              Ese es el coeficiente del seno solo. Al pasar por el logaritmo se
              le suma $+\frac13$ y el signo se da la vuelta.
        pista: |
          $u = x-\frac{x^3}{6}$, $u^2 = x^2+O(x^4)$, $u^3 = x^3+O(x^5)$, y
          $\ln(1+u)=u-\frac{u^2}{2}+\frac{u^3}{3}+O(u^4)$.
        desarrollo: |
          $$
          \ln(1+\operatorname{sen}x)
          = \left(x-\frac{x^3}{6}\right)-\frac{x^2}{2}+\frac{x^3}{3}+O(x^4)
          = x-\frac{x^2}{2}+\frac{x^3}{6}+O(x^4)
          $$
      - tipo: justificar
        pregunta: |
          Ordena el método. Una pieza es falsa.
        piezas:
          - texto: 'Se escribe $u=\operatorname{sen}x = x-\frac{x^3}{6}+O(x^5)$, que es del orden de $x$.'
          - texto: 'Se eleva: $u^2 = x^2+O(x^4)$ y $u^3=x^3+O(x^5)$, porque al multiplicar los grados se suman.'
          - texto: 'Se sustituye en $\ln(1+u)=u-\frac{u^2}{2}+\frac{u^3}{3}+O(u^4)$ y se tira todo lo de grado mayor que 3.'
          - texto: 'Agrupando por potencias queda $x-\frac{x^2}{2}+\frac{x^3}{6}$.'
          - texto: 'El método vale igual si $u$ no tiende a cero, porque los desarrollos son identidades.'
            trampa: true
            mensaje: |
              No: la serie de $\ln(1+u)$ solo converge para $|u|<1$, y el
              desarrollo solo aproxima **cerca de $u=0$**. Componer exige que
              el de dentro tienda a cero donde el de fuera está centrado. Aquí
              se cumple porque $\operatorname{sen}0=0$.
        veredicto: |
          Componer es más rápido y menos expuesto a error que derivar cuatro
          veces un logaritmo de un seno.
    resolucion: |
      **Datos.** $f(x)=\ln(1+\operatorname{sen}x)$, hasta $x^3$, por composición.

      ### 1 · Comprobar que se puede componer

      El desarrollo de $\ln(1+u)$ está centrado en $u=0$, así que hace falta
      que $u=\operatorname{sen}x$ tienda a cero cuando $x\to0$. Se cumple:
      $\operatorname{sen}0=0$.

      ### 2 · Los dos desarrollos de partida

      $$
      \operatorname{sen}x = x-\frac{x^3}{6}+O(x^5),
      \qquad
      \ln(1+u) = u-\frac{u^2}{2}+\frac{u^3}{3}+O(u^4)
      $$

      ### 3 · Las potencias de $u$, solo hasta grado 3

      $$
      u = x-\frac{x^3}{6}, \qquad
      u^2 = x^2 - \frac{x^4}{3}+\dots = x^2+O(x^4), \qquad
      u^3 = x^3+O(x^5)
      $$

      Al multiplicar, los grados se suman: por eso $u^2$ empieza en $x^2$ y
      $u^3$ en $x^3$, y por eso no hacía falta más material del seno.

      ### 4 · Sustituir y agrupar

      $$
      \begin{aligned}
      \ln(1+\operatorname{sen}x)
      &= \left(x-\frac{x^3}{6}\right)-\frac{1}{2}x^2+\frac{1}{3}x^3+O(x^4)\\[4pt]
      &= x-\frac{x^2}{2}+\left(-\frac16+\frac13\right)x^3+O(x^4)
      \end{aligned}
      $$

      ### 5 · Comprobación

      En $x=0{,}2$: el desarrollo da $0{,}18133$ y la función vale $0{,}18129$.
      Cuatro cifras, que es lo que cabe esperar de un error de orden $x^4$.

      ### Resultado

      $$
      \boxed{\;\ln(1+\operatorname{sen}x)=x-\frac{x^2}{2}+\frac{x^3}{6}+O(x^4)\;}
      $$

      > **Lo que enseña.** Los desarrollos se componen, se suman y se
      > multiplican como polinomios, tirando por el camino todo lo que pase del
      > orden pedido. Derivar cuatro veces $\ln(1+\operatorname{sen}x)$ da lo
      > mismo y tarda cinco veces más.
`;

/* ══ Leer la gráfica de la derivada ══════════════════════════════════ */

const leerDerivadaCortes = String.raw`  - id: la-derivada-que-corta-tres-veces
    titulo: Lo dibujado es la derivada, y corta tres veces
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      La figura muestra la gráfica de **$f'$**, la derivada de una función $f$
      definida y derivable en todo $\mathbb{R}$. La curva corta al eje
      horizontal en $x=-1$, $x=1$ y $x=3$.

      Determinar los intervalos de crecimiento de $f$ y clasificar sus extremos
      locales.
    pide: Los intervalos donde $f$ crece o decrece, y qué es cada extremo.
    pasos:
      - tipo: reconocer
        pregunta: |
          En la figura, el punto más alto de la curva está alrededor de
          $x=0$. ¿Qué es eso para $f$?
        opciones:
          - texto: Un máximo de la **derivada** — el punto donde $f$ crece más deprisa
            correcta: true
            mensaje: |
              Exacto, y es la confusión que este formato busca provocar. Un
              máximo de lo dibujado es un máximo de $f'$, no de $f$. Para $f$
              ese punto es donde la pendiente es mayor — un punto de
              inflexión, de hecho.
          - texto: Un máximo local de $f$
            mensaje: |
              Los máximos de $f$ están donde la curva dibujada **corta el
              eje** pasando de positiva a negativa, no donde la curva alcanza
              su altura mayor.
          - texto: Un punto donde $f$ no es derivable
            mensaje: |
              El enunciado dice que $f$ es derivable en todo $\mathbb{R}$, y
              además la curva de $f'$ está dibujada ahí sin interrupción.
      - tipo: calcular
        titulo: Cuántos extremos
        pregunta: |
          ¿Cuántos extremos locales tiene $f$?
        respuesta:
          tipo: numero
          valor: '3'
          tolerancia: 0.1
          formato: un número entero
        distractores:
          - valor: '1'
            mensaje: |
              Solo hay uno si se cuenta el punto más alto de la curva
              dibujada. Los extremos de $f$ son los cortes con el eje, y hay
              tres.
          - valor: '0'
            mensaje: |
              Los habría cero si $f'$ no cambiara de signo. Aquí cambia tres
              veces, y cada cambio de signo es un extremo.
        pista: |
          Cada corte de la curva dibujada con el eje en el que **cambia de
          signo** es un extremo de $f$.
        desarrollo: |
          La derivada corta el eje en $-1$, $1$ y $3$, y en los tres **cambia
          de signo**, así que los tres son extremos de $f$.
      - tipo: reconocer
        pregunta: |
          ¿Qué es $x=1$ para $f$?
        opciones:
          - texto: Un máximo local, porque $f'$ pasa de positiva a negativa
            correcta: true
            mensaje: |
              Sí. Antes de $1$ la curva dibujada está por encima del eje —$f$
              sube— y después por debajo —$f$ baja—. Sube y luego baja: máximo.
          - texto: Un mínimo local
            mensaje: |
              Sería mínimo si $f'$ pasara de negativa a positiva. Eso ocurre
              en $x=-1$ y en $x=3$, no en $x=1$.
          - texto: Un punto de inflexión
            mensaje: |
              Las inflexiones de $f$ están donde $f'$ tiene sus extremos, es
              decir en los picos y valles de la curva dibujada, no en sus
              cortes con el eje.
      - tipo: justificar
        pregunta: |
          Ordena la lectura completa. Una pieza es falsa.
        piezas:
          - texto: 'Lo dibujado es $f''$: su **signo** dice si $f$ sube o baja, y su altura dice cuánto.'
          - texto: 'La curva está por debajo del eje en $(-\infty,-1)$ y en $(1,3)$: ahí $f$ decrece.'
          - texto: 'Está por encima en $(-1,1)$ y en $(3,+\infty)$: ahí $f$ crece.'
          - texto: 'Luego $x=-1$ y $x=3$ son mínimos locales de $f$, y $x=1$ es un máximo local.'
          - texto: 'Como la curva dibujada es negativa en $(1,3)$, la función $f$ es negativa en ese tramo.'
            trampa: true
            mensaje: |
              El signo de $f'$ no dice nada sobre el signo de $f$, solo sobre
              si sube o baja. Una función puede ser positiva y decreciente sin
              ningún problema — de hecho no hay datos en la figura para saber
              el signo de $f$: faltaría un valor.
        veredicto: |
          El signo decide la monotonía; la altura, la curvatura. Y el valor de
          $f$ no sale de aquí sin un dato más.
    resolucion: |
      **Datos.** La gráfica de $f'$, con cortes en $x=-1$, $x=1$ y $x=3$.

      ### 1 · Escribirlo antes de nada

      Lo primero que hay que anotar en el margen: **lo dibujado es $f'$**. Todo
      lo demás sale de leer el signo de esa curva.

      ### 2 · El signo, tramo a tramo

      | tramo | la curva dibujada | $f$ |
      |---|---|---|
      | $(-\infty,-1)$ | por debajo del eje | decrece |
      | $(-1,1)$ | por encima | crece |
      | $(1,3)$ | por debajo | decrece |
      | $(3,+\infty)$ | por encima | crece |

      ### 3 · Clasificar los extremos

      En cada corte hay cambio de signo, luego los tres son extremos:

      $$
      \begin{aligned}
      x=-1&:\ -\to+ \;\Longrightarrow\; \text{mínimo local}\\
      x=1&:\ +\to- \;\Longrightarrow\; \text{máximo local}\\
      x=3&:\ -\to+ \;\Longrightarrow\; \text{mínimo local}
      \end{aligned}
      $$

      ### 4 · Lo que la figura **no** dice

      Ni el valor de $f$ en ningún punto, ni su signo: para eso haría falta un
      dato más, del tipo $f(0)=2$. La gráfica de la derivada determina $f$
      salvo una constante.

      ### Resultado

      $$
      \boxed{\;f \text{ crece en } (-1,1)\cup(3,\infty)\ \text{y decrece en }
      (-\infty,-1)\cup(1,3)\;}
      $$

      con mínimos en $x=-1$ y $x=3$ y máximo en $x=1$.

      > **Lo que enseña.** En este formato el error caro no es de cálculo: es
      > leer la curva como si fuera $f$. Un pico de lo dibujado es una
      > inflexión de $f$, y un corte con el eje es un extremo.
`;

const leerDerivadaTrozos = String.raw`  - id: de-la-derivada-a-trozos-a-la-funcion
    titulo: Reconstruir la función a partir del área
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      La figura muestra la gráfica de **$f'$**, que es constante a trozos:
      vale $1$ en $[0,2]$, vale $-2$ en $(2,3]$ y vuelve a valer $1$ en
      $(3,5]$. Se sabe además que $f(0)=0$.

      Calcular $f(3)$ y $f(5)$, y describir qué aspecto tiene $f$ en $x=2$.
    pide: Los dos valores de $f$ y el aspecto de la gráfica en $x=2$.
    pasos:
      - tipo: reconocer
        pregunta: |
          ¿Cómo se recupera $f$ a partir de la gráfica de $f'$ y del dato
          $f(0)=0$?
        opciones:
          - texto: Acumulando el área con signo bajo la curva de $f'$
            correcta: true
            mensaje: |
              Sí: $f(x)=f(0)+\int_0^x f'$. El área por encima del eje suma y la
              de debajo resta, y el dato $f(0)$ es lo que fija la altura de
              partida.
          - texto: Derivando la gráfica dibujada
            mensaje: |
              Derivar llevaría a $f''$, que es ir en la dirección contraria.
              De $f'$ a $f$ se va integrando.
          - texto: Midiendo la pendiente de la curva dibujada
            mensaje: |
              La pendiente de lo dibujado es $f''$, que aquí es cero en cada
              tramo. Lo que se necesita es el área, no la pendiente.
      - tipo: calcular
        titulo: El valor en x = 3
        pregunta: |
          ¿Cuánto vale $f(3)$?
        respuesta:
          tipo: numero
          valor: '0'
          tolerancia: 0.05
          formato: un número
        distractores:
          - valor: '4'
            mensaje: |
              Has sumado las dos áreas en valor absoluto, $2+2$. La de debajo
              del eje **resta**: el área con signo del segundo tramo es $-2$.
          - valor: '2'
            mensaje: |
              Ese es $f(2)$, el valor al final del primer tramo. Falta descontar
              el trozo en el que $f'$ es negativa.
        pista: |
          Primer tramo: $1\times2=2$. Segundo tramo: $(-2)\times1=-2$.
        desarrollo: |
          $$
          f(3)=f(0)+\underbrace{1\cdot2}_{[0,2]}+\underbrace{(-2)\cdot1}_{(2,3]}
              = 0+2-2 = 0
          $$
      - tipo: calcular
        titulo: El valor en x = 5
        pregunta: |
          ¿Y $f(5)$?
        respuesta:
          tipo: numero
          valor: '2'
          tolerancia: 0.05
          formato: un número
        distractores:
          - valor: '6'
            mensaje: |
              Otra vez las áreas sin signo: $2+2+2$. La del tramo negativo
              resta.
          - valor: '0'
            mensaje: |
              Ese es $f(3)$. Del $3$ al $5$ la derivada vuelve a valer $1$
              durante dos unidades, así que $f$ sube dos.
        pista: |
          Al valor que ya tenías en $x=3$ le sumas el área del último tramo,
          $1\times2$.
        desarrollo: |
          $$
          f(5)=f(3)+1\cdot2 = 0+2 = 2
          $$
      - tipo: justificar
        pregunta: |
          Ordena la descripción de $f$. Una pieza es falsa.
        piezas:
          - texto: 'En cada tramo $f''$ es constante, así que $f$ es un segmento de recta con esa pendiente.'
          - texto: 'De 0 a 2 sube con pendiente $1$; de 2 a 3 baja con pendiente $-2$; de 3 a 5 vuelve a subir con pendiente $1$.'
          - texto: 'En $x=2$ las pendientes laterales son $1$ y $-2$: la gráfica de $f$ hace un pico, no una curva suave.'
          - texto: 'Ese pico es un máximo local de $f$, y ahí $f$ no es derivable aunque sí sea continua.'
          - texto: 'Como $f''$ da un salto en $x=2$, la función $f$ también salta ahí.'
            trampa: true
            mensaje: |
              $f$ no salta: la integral de una función acotada es continua
              siempre, aunque el integrando tenga saltos. Lo que se pierde en
              $x=2$ es la derivada, no la continuidad. Se ve en el dibujo: la
              uve invertida está pegada, sin hueco.
        veredicto: |
          Un salto en $f'$ produce un pico en $f$. Un salto en $f$ exigiría
          algo mucho peor.
    resolucion: |
      **Datos.** $f'$ constante a trozos ($1$, $-2$, $1$) y $f(0)=0$.

      ### 1 · La herramienta

      $$
      f(x) = f(0) + \int_0^x f'(t)\,dt
      $$

      Como $f'$ es constante en cada tramo, la integral es área de rectángulos,
      **con signo**.

      ### 2 · Acumular

      | tramo | $f'$ | anchura | área con signo | $f$ al final |
      |---|---|---|---|---|
      | $[0,2]$ | $1$ | $2$ | $+2$ | $f(2)=2$ |
      | $(2,3]$ | $-2$ | $1$ | $-2$ | $f(3)=0$ |
      | $(3,5]$ | $1$ | $2$ | $+2$ | $f(5)=2$ |

      ### 3 · El aspecto en $x=2$

      A la izquierda $f$ es la recta de pendiente $1$; a la derecha, la de
      pendiente $-2$. Las dos llegan al mismo valor, $f(2)=2$, así que $f$ es
      **continua** ahí, pero las pendientes laterales no coinciden: hay un
      **pico**, y $f$ no es derivable en $x=2$.

      Como sube por la izquierda y baja por la derecha, ese pico es un
      **máximo local**.

      ### 4 · Comprobación

      Sumando las tres áreas con signo: $2-2+2=2$, que es $f(5)$ partiendo de
      $f(0)=0$. Y el área total con signo entre $0$ y $3$ es cero, lo que
      encaja con que $f$ vuelva a valer $0$ en $x=3$.

      ### Resultado

      $$
      \boxed{\;f(3)=0,\qquad f(5)=2,\qquad \text{pico (máximo local) en } x=2\;}
      $$

      > **Lo que enseña.** El dato $f(0)$ no es un adorno: sin él, de la
      > gráfica de $f'$ solo se deduce $f$ salvo una constante. Es la misma
      > constante de integración de siempre, vista desde el dibujo.
`;

/* ══ El estudio completo ═════════════════════════════════════════════ */

const estudioRacional = String.raw`  - id: estudio-completo-de-una-racional
    titulo: El estudio completo de x²/(x−1)
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Hacer el estudio completo de

      $$
      f(x)=\frac{x^{2}}{x-1}
      $$

      dominio, asíntotas, monotonía, extremos y curvatura, y esbozar la gráfica.
    pide: El estudio completo y el esbozo.
    pasos:
      - tipo: reconocer
        pregunta: |
          El numerador tiene un grado más que el denominador. ¿Qué anuncia eso?
        opciones:
          - texto: Una asíntota oblicua, que se encuentra dividiendo
            correcta: true
            mensaje: |
              Eso es, y dividiendo se encuentra de una vez: si
              $f(x)=(mx+n)+\frac{r}{x-1}$, la oblicua es $y=mx+n$, porque el
              resto se va a cero.
          - texto: Una asíntota horizontal
            mensaje: |
              La horizontal aparece cuando el grado de arriba es menor o igual
              que el de abajo. Con un grado más, la función crece como una
              recta, no se aplana.
          - texto: Que no hay asíntotas
            mensaje: |
              Hay dos: la vertical en $x=1$, donde se anula el denominador, y
              la oblicua por el grado.
      - tipo: calcular
        titulo: El mínimo local
        pregunta: |
          Los puntos críticos son $x=0$ y $x=2$. ¿Cuánto vale $f$ en el
          segundo?
        respuesta:
          tipo: numero
          valor: '4'
          tolerancia: 0.05
          formato: un número
        distractores:
          - valor: '2'
            mensaje: |
              Has sustituido en el numerador y te has olvidado de dividir... o
              has dividido mal: $\frac{2^2}{2-1}=\frac41=4$.
          - valor: '0'
            mensaje: |
              Ese es $f(0)$, el valor en el **otro** punto crítico, que además
              es el máximo local.
        pista: |
          $f(2)=\dfrac{4}{1}$.
        desarrollo: |
          $$
          f'(x)=\frac{2x(x-1)-x^2}{(x-1)^2}=\frac{x(x-2)}{(x-1)^2}
          $$

          se anula en $x=0$ y $x=2$, y $f(2)=4$.
        veredicto: |
          Curioso y cierto: el máximo local vale $0$ y el mínimo local vale
          $4$. No se contradicen porque están en ramas separadas por la
          asíntota.
      - tipo: justificar
        pregunta: |
          Ordena el estudio. Una pieza es falsa.
        piezas:
          - texto: 'Dominio: $\mathbb{R}\setminus\{1\}$, y en $x=1$ hay asíntota vertical.'
          - texto: 'Dividiendo, $f(x)=x+1+\frac{1}{x-1}$, así que $y=x+1$ es asíntota oblicua.'
          - texto: 'De $f''(x)=\frac{x(x-2)}{(x-1)^2}$: $f$ crece en $(-\infty,0)$ y en $(2,\infty)$, y decrece en el resto.'
          - texto: 'Luego $x=0$ es máximo local con $f(0)=0$ y $x=2$ es mínimo local con $f(2)=4$.'
          - texto: 'Como hay un máximo local en $x=0$ y un mínimo local en $x=2$, la función corta a su asíntota oblicua entre los dos.'
            trampa: true
            mensaje: |
              No la corta nunca: $f(x)-(x+1)=\frac{1}{x-1}$, que no se anula
              para ningún $x$. Que un máximo valga menos que un mínimo es
              posible precisamente porque la asíntota vertical parte la gráfica
              en dos ramas que no se comunican.
        veredicto: |
          El orden importa: dominio, asíntotas, derivada, signo, valores. El
          esbozo es la consecuencia, no un dibujo aparte.
      - tipo: dibujar
        consigna: |
          Esboza la gráfica de $f$ en el rectángulo $x\in[-4,6]$,
          $y\in[-8,12]$, con sus dos asíntotas dibujadas a trazos y los dos
          extremos marcados con su valor.
        comprueba:
          - punto: La asíntota vertical $x=1$, a trazos, con la curva huyendo de ella por los dos lados
            porque: >-
              Es lo que parte la gráfica en dos ramas. Sin ella, el esbozo
              sugiere una curva continua y todo lo demás deja de encajar.
          - punto: La asíntota oblicua $y=x+1$, también a trazos
            porque: >-
              Es lo que dice cómo se va la función en los dos infinitos. Una
              racional con un grado más arriba no se aplana, y un esbozo con
              ramas horizontales estaría mal.
          - punto: El máximo local en $(0,0)$, en la rama izquierda, y el mínimo local en $(2,4)$, en la derecha
            porque: >-
              Son los dos únicos puntos de tangente horizontal. Que el máximo
              esté más abajo que el mínimo es correcto, y solo se entiende si
              las dos ramas están bien separadas.
          - punto: La rama izquierda por debajo de la oblicua y la derecha por encima
            porque: >-
              La diferencia es $f(x)-(x+1)=\frac{1}{x-1}$, negativa a la
              izquierda de 1 y positiva a la derecha. Es lo que decide de qué
              lado se acerca cada rama.
        veredicto: |
          Si tu esbozo tiene las dos asíntotas y los dos extremos en el lado
          que les toca, está bien aunque las curvas no sean exactas: eso es lo
          que se corrige.
    resolucion: |
      **Datos.** $f(x)=\dfrac{x^2}{x-1}$.

      ### 1 · Dominio y asíntota vertical

      El denominador se anula en $x=1$, y el numerador ahí vale $1\neq0$:

      $$
      \text{Dom}(f)=\mathbb{R}\setminus\{1\},
      \qquad
      \lim_{x\to1^-}f=-\infty,\quad \lim_{x\to1^+}f=+\infty
      $$

      Asíntota vertical $x=1$.

      ### 2 · Asíntota oblicua

      Dividiendo:

      $$
      f(x)=x+1+\frac{1}{x-1}
      $$

      Como $\frac{1}{x-1}\to0$ en los dos infinitos, $y=x+1$ es asíntota
      oblicua por ambos lados. Y como esa diferencia **nunca se anula**, la
      curva no corta a su asíntota.

      ### 3 · Monotonía y extremos

      $$
      f'(x)=\frac{2x(x-1)-x^2}{(x-1)^2}=\frac{x^2-2x}{(x-1)^2}=\frac{x(x-2)}{(x-1)^2}
      $$

      El denominador es siempre positivo, así que el signo lo pone $x(x-2)$:

      | tramo | $x(x-2)$ | $f$ |
      |---|---|---|
      | $(-\infty,0)$ | $+$ | crece |
      | $(0,1)$ | $-$ | decrece |
      | $(1,2)$ | $-$ | decrece |
      | $(2,\infty)$ | $+$ | crece |

      $$
      x=0:\ \text{máximo local},\ f(0)=0
      \qquad
      x=2:\ \text{mínimo local},\ f(2)=4
      $$

      ### 4 · Curvatura

      De $f(x)=x+1+(x-1)^{-1}$:

      $$
      f''(x)=\frac{2}{(x-1)^3}
      $$

      Negativa para $x<1$ —cóncava hacia abajo— y positiva para $x>1$ —cóncava
      hacia arriba—. No hay punto de inflexión, porque en $x=1$ la función ni
      siquiera está definida.

      ### 5 · Comprobación

      El máximo local vale $0$ y el mínimo local vale $4$: el máximo está **por
      debajo** del mínimo. Suena a error y no lo es — están en ramas distintas,
      separadas por la asíntota vertical, y entre ellas la función pasa por
      $-\infty$ y $+\infty$.

      ### Resultado

      $$
      \boxed{\;\text{AV } x=1,\ \text{AO } y=x+1,\
      \text{máx } (0,0),\ \text{mín } (2,4)\;}
      $$

      > **Lo que enseña.** Dividir la fracción al principio resuelve dos cosas
      > de golpe: da la asíntota oblicua y deja la función en una forma,
      > $x+1+\frac{1}{x-1}$, en la que las derivadas salen en una línea.
`;

/* ══ El teorema fundamental, sus dos caras ═══════════════════════════ */

const barrowDosLimites = String.raw`  - id: derivar-una-integral-de-limites-variables
    titulo: Derivar una integral que no se sabe calcular
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Sea

      $$
      F(x)=\int_{x^{2}}^{x^{3}} e^{-t^{2}}\,dt
      $$

      Calcular $F'(x)$ y evaluar $F'(1)$.
    pide: La expresión de $F'(x)$ y su valor en $x=1$.
    pasos:
      - tipo: reconocer
        pregunta: |
          La primitiva de $e^{-t^2}$ no es elemental: no hay forma de
          escribirla con funciones conocidas. ¿Impide eso derivar $F$?
        opciones:
          - texto: No, porque el teorema fundamental da $F'$ sin necesidad de conocer la primitiva
            correcta: true
            mensaje: |
              Ese es exactamente el motivo de que el teorema valga la pena.
              Basta con que el integrando sea continuo, y $e^{-t^2}$ lo es en
              todo $\mathbb{R}$.
          - texto: Sí, sin primitiva no se puede hacer nada
            mensaje: |
              Entonces este ejercicio sería imposible, y es justo al revés: la
              gracia del teorema es dar la derivada de algo que no se sabe
              integrar.
          - texto: Hay que desarrollar $e^{-t^2}$ en serie y derivar término a término
            mensaje: |
              Se puede, y da lo mismo, pero es dar una vuelta enorme. El
              teorema lo resuelve en una línea.
      - tipo: calcular
        titulo: El valor en x = 1
        pregunta: |
          ¿Cuánto vale $F'(1)$?
        respuesta:
          tipo: numero
          valor: '0.3678794'
          tolerancia: 0.002
          formato: un número; es 1/e
        distractores:
          - valor: '1.8393972'
            mensaje: |
              Has sumado los dos términos en vez de restarlos. El límite
              **inferior** entra con signo menos: la regla es
              $f(b(x))b'(x)-f(a(x))a'(x)$.
          - valor: '0'
            mensaje: |
              Cero saldría si los dos límites fueran iguales o si los dos
              términos se cancelasen. Aquí los factores son $3x^2$ y $2x$, que
              en $x=1$ valen $3$ y $2$: no se cancelan.
        pista: |
          $F'(x)=e^{-x^6}\cdot3x^2-e^{-x^4}\cdot2x$, y en $x=1$ las dos
          exponenciales valen $e^{-1}$.
        desarrollo: |
          $$
          F'(1)=3e^{-1}-2e^{-1}=e^{-1}\approx0{,}3679
          $$
      - tipo: justificar
        pregunta: |
          Ordena el razonamiento. Una pieza es falsa.
        piezas:
          - texto: 'Se llama $G$ a una primitiva de $e^{-t^2}$, que existe por ser el integrando continuo aunque no se sepa escribir.'
          - texto: 'Por la regla de Barrow, $F(x)=G(x^3)-G(x^2)$.'
          - texto: 'Derivando con la regla de la cadena: $F''(x)=G''(x^3)\cdot3x^2-G''(x^2)\cdot2x$.'
          - texto: 'Y como $G''=e^{-t^2}$: $F''(x)=3x^2e^{-x^6}-2xe^{-x^4}$.'
          - texto: 'Existe $G$ porque toda función acotada tiene primitiva.'
            trampa: true
            mensaje: |
              Acotada no basta: la función que vale 0 en los racionales y 1 en
              los irracionales está acotada y no tiene primitiva. Lo que
              garantiza la primitiva es la **continuidad**, que es la hipótesis
              del teorema fundamental.
        veredicto: |
          Los dos factores $3x^2$ y $2x$ no son adorno: son la regla de la
          cadena, y olvidarlos es el error más común del escalón.
    resolucion: |
      **Datos.** $F(x)=\displaystyle\int_{x^2}^{x^3} e^{-t^2}\,dt$.

      ### 1 · Por qué se puede

      $e^{-t^2}$ es continua en todo $\mathbb{R}$, así que por la primera parte
      del teorema fundamental tiene primitiva, llamémosla $G$, con $G'=e^{-t^2}$.
      Que $G$ no se pueda escribir con funciones elementales no importa: para
      derivar solo hace falta saber que existe.

      ### 2 · Escribir $F$ con esa primitiva

      Por la regla de Barrow,

      $$
      F(x)=G(x^3)-G(x^2)
      $$

      ### 3 · Derivar con la regla de la cadena

      $$
      F'(x)=G'(x^3)\cdot 3x^2 - G'(x^2)\cdot 2x
           = 3x^2e^{-x^6}-2xe^{-x^4}
      $$

      Los factores $3x^2$ y $2x$ son las derivadas de los límites. El inferior
      entra restando.

      ### 4 · Evaluar

      $$
      F'(1)=3e^{-1}-2e^{-1}=e^{-1}\approx0{,}3679
      $$

      ### 5 · Comprobación

      El signo tiene sentido: cerca de $x=1$ el límite superior $x^3$ se mueve
      más deprisa que el inferior $x^2$, así que el intervalo de integración se
      ensancha y la integral de una función positiva crece. $F'(1)>0$, como
      sale.

      ### Resultado

      $$
      \boxed{\;F'(x)=3x^{2}e^{-x^{6}}-2xe^{-x^{4}},\qquad F'(1)=\frac1e\;}
      $$

      > **Lo que enseña.** La fórmula general es
      > $\frac{d}{dx}\int_{a(x)}^{b(x)}f = f(b)b'-f(a)a'$, y los dos trozos que
      > más se olvidan son el signo menos del límite inferior y los factores
      > $b'$ y $a'$.
`;

const barrowATrozos = String.raw`  - id: la-funcion-integral-de-una-funcion-a-trozos
    titulo: Cuando el integrando salta, ¿qué le pasa al teorema?
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Sea

      $$
      f(t)=\begin{cases} 1 & \text{si } 0\le t<1\\ 2 & \text{si } 1\le t\le 2\end{cases}
      \qquad\text{y}\qquad
      F(x)=\int_{0}^{x} f(t)\,dt \ \ \text{para } x\in[0,2]
      $$

      Escribir $F$ explícitamente, estudiar si es continua y si es derivable, y
      decir dónde falla $F'(x)=f(x)$ y por qué.
    pide: La expresión de $F$, su continuidad, su derivabilidad y la explicación.
    pasos:
      - tipo: reconocer
        pregunta: |
          El teorema fundamental dice que $F'(x)=f(x)$. ¿Qué pide a cambio?
        opciones:
          - texto: Que $f$ sea **continua** en el punto donde se deriva
            correcta: true
            mensaje: |
              Esa es la hipótesis, y aquí se rompe justo en $x=1$. Fuera de ese
              punto $f$ sí es continua y el teorema funciona con normalidad.
          - texto: Que $f$ sea derivable
            mensaje: |
              No hace falta tanto: el teorema solo pide continuidad del
              integrando. De hecho la gracia es que $F$ sale más suave que $f$,
              no menos.
          - texto: Que $f$ sea positiva
            mensaje: |
              El signo no interviene. Con $f$ negativa la integral resta área y
              todo sigue valiendo.
      - tipo: calcular
        titulo: Un valor de F
        pregunta: |
          ¿Cuánto vale $F(1{,}5)$?
        respuesta:
          tipo: numero
          valor: '2'
          tolerancia: 0.02
          formato: un número
        distractores:
          - valor: '3'
            mensaje: |
              Eso es $2\times1{,}5$: has usado el valor $2$ en todo el
              intervalo. Pero en $[0,1)$ la función vale $1$, no $2$.
          - valor: '1.5'
            mensaje: |
              Y eso es usar $f\equiv1$ en todo el intervalo, olvidando el
              segundo tramo.
        pista: |
          Área del primer rectángulo: $1\times1$. Del segundo: $2\times0{,}5$.
        desarrollo: |
          $$
          F(1{,}5)=\int_0^1 1\,dt+\int_1^{1{,}5}2\,dt = 1+1 = 2
          $$
      - tipo: justificar
        pregunta: |
          Ordena el estudio de $F$. Una pieza es falsa.
        piezas:
          - texto: 'Acumulando área: $F(x)=x$ en $[0,1]$ y $F(x)=1+2(x-1)=2x-1$ en $[1,2]$.'
          - texto: 'En $x=1$ los dos trozos valen lo mismo, $F(1)=1$, así que $F$ es continua en todo $[0,2]$.'
          - texto: 'Pero las derivadas laterales valen $1$ y $2$, así que $F$ no es derivable en $x=1$.'
          - texto: 'Ahí falla $F''=f$, y falla porque $f$ no es continua en $x=1$: es la hipótesis del teorema.'
          - texto: 'Como $f$ no es continua en $x=1$, la integral $F(x)$ tampoco está definida ahí.'
            trampa: true
            mensaje: |
              La integral está perfectamente definida: $f$ es acotada y con un
              solo punto de discontinuidad, así que es integrable en $[0,2]$ y
              $F(1)=1$. Lo que se pierde no es la integral, es la igualdad
              $F'=f$ en ese punto.
        veredicto: |
          Integrable, continua y derivable son tres cosas distintas, y este
          ejercicio las separa en dos líneas.
    resolucion: |
      **Datos.** $f$ vale $1$ en $[0,1)$ y $2$ en $[1,2]$; $F(x)=\int_0^x f$.

      ### 1 · Escribir $F$

      Para $x\in[0,1]$ solo interviene el primer tramo:

      $$
      F(x)=\int_0^x 1\,dt = x
      $$

      Para $x\in[1,2]$ se suma el área acumulada hasta $1$ más la del segundo
      tramo:

      $$
      F(x)=1+\int_1^x 2\,dt = 1+2(x-1)=2x-1
      $$

      ### 2 · Continuidad

      $$
      \lim_{x\to1^-}F(x)=1, \qquad \lim_{x\to1^+}F(x)=2\cdot1-1=1, \qquad F(1)=1
      $$

      Los tres coinciden: **$F$ es continua en todo $[0,2]$**. Y no es
      casualidad: la integral de una función acotada siempre lo es.

      ### 3 · Derivabilidad

      $$
      F'(1^-)=1, \qquad F'(1^+)=2
      $$

      No coinciden, luego **$F$ no es derivable en $x=1$**. La gráfica de $F$
      hace un pico: una recta de pendiente $1$ que se convierte en una de
      pendiente $2$.

      ### 4 · Dónde falla $F'=f$, y por qué

      En todo punto de $[0,2]$ salvo $x=1$ se cumple $F'(x)=f(x)$, porque ahí
      $f$ es continua. En $x=1$ no hay siquiera $F'(1)$, y el teorema
      fundamental no se puede invocar: **su hipótesis es que $f$ sea continua
      en el punto**, y no lo es.

      ### 5 · Comprobación

      Las derivadas laterales de $F$ valen $1$ y $2$, que son exactamente los
      dos valores laterales de $f$. El teorema no desaparece: se parte en dos
      mitades, una por cada lado.

      ### Resultado

      $$
      \boxed{\;F(x)=\begin{cases}x & 0\le x\le1\\ 2x-1 & 1<x\le2\end{cases}
      \quad\text{continua, no derivable en } x=1\;}
      $$

      > **Lo que enseña.** Integrar suaviza y derivar afila. Partiendo de una
      > $f$ con un salto, $F$ sale continua pero con un pico; si $f$ tuviera un
      > pico, $F$ saldría derivable. Cada escalón de suavidad que gana la
      > integral es el que pierde la derivada.
`;

anexa(T4, [fermatBorde, fermatSinDerivada, taylorLn, taylorCompuesto,
  leerDerivadaCortes, leerDerivadaTrozos, estudioRacional]);
anexa(T5, [barrowDosLimites, barrowATrozos]);
console.log('9 ejercicios propios añadidos: 7 en t04 y 2 en t05');
