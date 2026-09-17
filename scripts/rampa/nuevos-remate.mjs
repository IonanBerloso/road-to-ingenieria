/**
 * Los tres últimos ejercicios propios: los que dejan la rampa sin ningún
 * escalón de una sola práctica.
 *
 * Después de `nuevos-t02-t03` y `nuevos-t04-t05` quedaban cuatro escalones con
 * `pr:1`. Dos son el mismo contenido en dos convocatorias —emparejar una
 * función con sus derivadas—, así que se cierran con un solo ejercicio.
 *
 *     node scripts/rampa/nuevos-remate.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const LF = String.fromCharCode(10);
const PROPIO = 'Ejercicio propio · Road to Ingeniería. De nivel de boletín, escrito '
  + 'para un escalón al que el boletín no da material. No es del boletín ni ha caído en examen.';

function anexa(fichero, bloques) {
  const texto = readFileSync(fichero, 'utf8').replace(/\s+$/, '');
  writeFileSync(fichero, texto + LF + LF + bloques.join(LF) + LF);
}

const T3 = 'src/content/calculo/t03-funciones-reales/ejercicios.yaml';
const T4 = 'src/content/calculo/t04-estudio-local/ejercicios.yaml';

/* ── el dominio con tres condiciones ─────────────────────────────────── */

const dominio = String.raw`  - id: dominio-con-un-punto-excluido
    titulo: Un dominio al que hay que quitarle un punto
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Determinar el dominio de

      $$
      f(x)=\frac{\sqrt{x+2}}{\ln(3-x)}
      $$
    pide: El dominio, escrito como unión de intervalos.
    pasos:
      - tipo: reconocer
        pregunta: |
          ¿Cuántas condiciones hay que imponer?
        opciones:
          - texto: >-
              Tres: el radicando no negativo, el argumento del logaritmo
              positivo y el denominador distinto de cero
            correcta: true
            mensaje: |
              Las tres, y la tercera es la que se olvida. El logaritmo se anula
              cuando su argumento vale $1$, y ahí el denominador es cero
              aunque el logaritmo esté perfectamente definido.
          - texto: >-
              Dos: el radicando no negativo y el argumento del logaritmo
              positivo
            mensaje: |
              Falta que el denominador no se anule. Que el logaritmo exista no
              impide que valga cero, y dividir entre cero sigue estando
              prohibido.
          - texto: >-
              Una: basta con que el argumento del logaritmo sea positivo
            mensaje: |
              La raíz también manda: $\sqrt{x+2}$ no existe para $x<-2$.
      - tipo: calcular
        titulo: El punto que hay que quitar
        pregunta: |
          ¿Para qué valor de $x$ se anula el denominador?
        respuesta:
          tipo: numero
          valor: '2'
          tolerancia: 0.01
          formato: un número
        distractores:
          - valor: '3'
            mensaje: |
              En $x=3$ el logaritmo no es que valga cero: es que no existe, y
              esa condición ya la recoge $3-x>0$. Lo que se busca aquí es
              dónde el logaritmo **vale** cero.
          - valor: '0'
            mensaje: |
              $\ln(3-0)=\ln 3 \approx 1{,}1$, que no es cero. El logaritmo se
              anula cuando su argumento vale $1$, no cuando vale $3$.
        pista: |
          $\ln u = 0$ exactamente cuando $u=1$.
        desarrollo: |
          $$
          \ln(3-x)=0 \iff 3-x=1 \iff x=2
          $$
      - tipo: justificar
        pregunta: |
          Ordena el razonamiento. Una pieza es falsa.
        piezas:
          - texto: 'La raíz pide $x+2\ge0$, es decir $x\ge-2$. El cero sí entra: $\sqrt0=0$ existe.'
          - texto: 'El logaritmo pide $3-x>0$, es decir $x<3$, con desigualdad estricta.'
          - texto: 'El denominador pide $\ln(3-x)\neq0$, es decir $x\neq2$.'
          - texto: 'Intersecando las tres: $[-2,3)$ menos el punto $2$, o sea $[-2,2)\cup(2,3)$.'
          - texto: 'Como en $x=2$ el numerador vale $2$ y el denominador $0$, el dominio incluye ese punto con valor infinito.'
            trampa: true
            mensaje: |
              «Valor infinito» no es un valor. En $x=2$ la función no está
              definida y punto; lo que hay ahí es una asíntota vertical, que es
              una propiedad de la gráfica, no un elemento del dominio.
        veredicto: |
          Las tres condiciones se intersecan, no se suman. Y la de la raíz
          lleva el igual dentro, mientras que las otras dos no.
    resolucion: |
      **Datos.** $f(x)=\dfrac{\sqrt{x+2}}{\ln(3-x)}$.

      ### 1 · Las tres condiciones

      | de dónde sale | condición | qué da |
      |---|---|---|
      | la raíz cuadrada | $x+2\ge0$ | $x\ge-2$ |
      | el logaritmo | $3-x>0$ | $x<3$ |
      | el denominador | $\ln(3-x)\neq0$ | $x\neq2$ |

      La segunda va con desigualdad **estricta** y la primera no: una raíz de
      cero existe, un logaritmo de cero no.

      ### 2 · La tercera, con cuidado

      $$
      \ln(3-x)=0 \iff 3-x = e^{0} = 1 \iff x = 2
      $$

      Es la condición que más se olvida, porque el logaritmo en $x=2$ existe
      —vale $\ln1=0$— y no salta a la vista que el problema es la división.

      ### 3 · Intersecar

      $$
      [-2,+\infty) \;\cap\; (-\infty,3) \;\setminus\;\{2\}
      $$

      ### 4 · Comprobación

      En $x=-2$: $f(-2)=0/\ln5=0$, definido. En $x=1{,}99$ el denominador vale
      $0{,}01$ y $f$ se dispara: la asíntota está donde debe.

      ### Resultado

      $$
      \boxed{\;\text{Dom}(f)=[-2,2)\cup(2,3)\;}
      $$

      > **Lo que enseña.** Un dominio se calcula listando **todas** las fuentes
      > de problema —raíces pares, logaritmos, denominadores, arcoseno— y
      > cortando. El denominador con un logaritmo dentro pone dos condiciones,
      > no una.
`;

/* ── la diferencial como aproximación ────────────────────────────────── */

const diferencial = String.raw`  - id: aproximar-una-raiz-cubica-con-la-diferencial
    titulo: Una raíz cúbica sin calculadora
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      Usando la diferencial, aproximar $\sqrt[3]{8{,}1}$ y estimar el error
      cometido.
    pide: El valor aproximado y una idea del error.
    pasos:
      - tipo: reconocer
        pregunta: |
          ¿Qué función y qué punto de partida conviene elegir?
        opciones:
          - texto: $f(x)=\sqrt[3]{x}$ en $a=8$, porque $\sqrt[3]{8}=2$ es exacto y $8$ está cerca de $8{,}1$
            correcta: true
            mensaje: |
              Las dos cosas a la vez, y las dos hacen falta: el punto tiene que
              dar un valor que se sepa de memoria **y** estar cerca del que se
              busca. Si estuviera lejos, la aproximación no valdría nada.
          - texto: $f(x)=\sqrt[3]{x}$ en $a=0$, porque ahí todo es más sencillo
            mensaje: |
              En $a=0$ la derivada de la raíz cúbica ni siquiera existe —la
              tangente es vertical—, y además $0$ está lejísimos de $8{,}1$.
          - texto: $f(x)=x^3$ en $a=2$
            mensaje: |
              Esa es la función inversa. Aproximaría cubos, no raíces cúbicas:
              daría $(2{,}1)^3$, que no es lo que se pide.
      - tipo: calcular
        titulo: La aproximación
        pregunta: |
          ¿Qué valor da la aproximación $f(a)+f'(a)\,\Delta x$?
        respuesta:
          tipo: numero
          valor: '2.0083333'
          tolerancia: 0.0002
          formato: un número, con cuatro decimales
        distractores:
          - valor: '2.1'
            mensaje: |
              Has sumado el incremento entero, $0{,}1$, sin multiplicarlo por
              la derivada. La derivada aquí vale $1/12$, así que el incremento
              de $f$ es doce veces menor que el de $x$.
          - valor: '2.0333333'
            mensaje: |
              Has usado $f'(8)=1/3$ en vez de $1/12$. La derivada de
              $x^{1/3}$ es $\frac13x^{-2/3}$, y en $x=8$ eso es
              $\frac13\cdot\frac14$.
        pista: |
          $f'(x)=\frac{1}{3\sqrt[3]{x^2}}$, y $\sqrt[3]{8^2}=4$.
        desarrollo: |
          $$
          f'(8)=\frac{1}{3\cdot4}=\frac1{12},
          \qquad
          \sqrt[3]{8{,}1}\approx 2+\frac{0{,}1}{12}=2{,}008\overline{3}
          $$
      - tipo: justificar
        pregunta: |
          Ordena el razonamiento, incluido el del error. Una pieza es falsa.
        piezas:
          - texto: 'Se toma $f(x)=x^{1/3}$, $a=8$ y $\Delta x = 0{,}1$, porque $f(8)=2$ es exacto.'
          - texto: 'La diferencial es $df = f''(a)\,\Delta x = \frac{1}{12}\cdot0{,}1 = 0{,}00833$.'
          - texto: 'Luego $\sqrt[3]{8{,}1}\approx f(8)+df = 2{,}00833$.'
          - texto: 'Como $f''''(x)=-\frac{2}{9}x^{-5/3}<0$, la función es cóncava hacia abajo y la tangente va por encima: la aproximación se pasa.'
          - texto: 'El error de la diferencial es siempre menor que $\Delta x$, así que aquí es menor que $0{,}1$.'
            trampa: true
            mensaje: |
              Ni es siempre así ni dice gran cosa cuando lo es. El error
              depende de la segunda derivada y del **cuadrado** del incremento:
              aquí sale del orden de $3\cdot10^{-5}$, tres mil veces menor que
              $0{,}1$. Con una cota tan floja, la aproximación parecería inútil.
        veredicto: |
          El signo de la segunda derivada dice de qué lado falla la
          aproximación, y eso se puede decir sin calcular nada.
    resolucion: |
      **Datos.** Aproximar $\sqrt[3]{8{,}1}$ con la diferencial.

      ### 1 · Elegir función, punto e incremento

      $$
      f(x)=x^{1/3}, \qquad a=8, \qquad \Delta x = 0{,}1
      $$

      El punto $a=8$ se elige por dos razones a la vez: $f(8)=2$ es exacto y
      está cerca de $8{,}1$.

      ### 2 · La derivada ahí

      $$
      f'(x)=\frac13x^{-2/3}=\frac{1}{3\sqrt[3]{x^2}}
      \quad\Longrightarrow\quad
      f'(8)=\frac{1}{3\cdot4}=\frac1{12}
      $$

      ### 3 · La aproximación

      $$
      f(a+\Delta x)\approx f(a)+f'(a)\,\Delta x
      = 2+\frac{0{,}1}{12}=2{,}00833
      $$

      ### 4 · De qué lado falla

      $$
      f''(x)=-\frac29x^{-5/3}<0 \ \text{ para } x>0
      $$

      La función es cóncava hacia abajo, luego su **tangente queda por
      encima** de la curva: la aproximación se pasa por arriba.

      El tamaño del error se estima con el término siguiente de Taylor:

      $$
      \left|\frac{f''(8)}{2}(\Delta x)^2\right|
      = \frac{2/(9\cdot32)}{2}\cdot0{,}01 \approx 3{,}5\cdot10^{-5}
      $$

      ### 5 · Comprobación

      El valor exacto es $2{,}0082988$, así que el error real es
      $3{,}5\cdot10^{-5}$ **y por exceso**, las dos cosas como se había
      previsto.

      ### Resultado

      $$
      \boxed{\;\sqrt[3]{8{,}1}\approx2{,}00833,\ \text{por exceso, con error} \sim3{,}5\cdot10^{-5}\;}
      $$

      > **Lo que enseña.** La diferencial es el polinomio de Taylor de grado
      > uno con otro nombre, y por eso el error va con $(\Delta x)^2$. Saber si
      > se pasa o se queda corto no cuesta ninguna cuenta: lo dice el signo de
      > $f''$.
`;

/* ── emparejar una función con sus dos derivadas ─────────────────────── */

const emparejar = String.raw`  - id: cual-de-las-tres-es-la-funcion
    titulo: Tres curvas parecidas, y solo una es la función
    fuente: ${PROPIO}
    nivel: practica
    enunciado: |
      La figura muestra, en el mismo par de ejes, las gráficas de una función
      $f$, de su derivada $f'$ y de su derivada segunda $f''$, rotuladas
      $A$, $B$ y $C$ en algún orden. Las tres se anulan una sola vez en el
      intervalo dibujado: $A$ en $x=3$, $B$ en $x=6$ y $C$ en $x=0$.

      Decidir cuál es cuál, razonadamente.
    pide: Qué es cada una de las tres curvas, y el razonamiento.
    pasos:
      - tipo: reconocer
        pregunta: |
          ¿Qué relación hay entre los ceros de una curva y los extremos de la
          anterior?
        opciones:
          - texto: >-
              Donde una curva corta el eje, la que es su primitiva tiene un
              extremo
            correcta: true
            mensaje: |
              Ese es todo el método. Si $B=f'$ se anula en $x=6$, entonces $f$
              tiene ahí un extremo; y buscando qué curva tiene su extremo en
              $x=6$, se identifica $f$.
          - texto: Donde una curva corta el eje, su derivada también
            mensaje: |
              No hay ninguna razón para eso. La parábola $x^2$ se anula en
              cero y su derivada $2x$ también, pero es casualidad: con
              $x^2-1$ deja de pasar.
          - texto: Donde una curva tiene un extremo, su derivada también
            mensaje: |
              Los extremos de la derivada son las **inflexiones** de la
              función, no sus extremos. Es otra relación, y también sirve, pero
              no es esta.
      - tipo: reconocer
        pregunta: |
          Suponiendo que $B$ resulte ser $f''$, ¿qué significa que $B$ se anule
          en $x=6$?
        opciones:
          - texto: Que $f$ tiene un punto de inflexión en $x=6$
            correcta: true
            mensaje: |
              Sí, y es la segunda relación de la cadena: los ceros de $f''$ son
              las inflexiones de $f$, igual que los ceros de $f'$ son sus
              extremos. Sirve para comprobar el emparejamiento al final.
          - texto: Que $f$ tiene un extremo en $x=6$
            mensaje: |
              Los extremos de $f$ los marcan los ceros de $f'$, no los de
              $f''$. En $x=6$ lo que cambia es la curvatura, no el sentido de
              la marcha.
          - texto: Que $f$ vale cero en $x=6$
            mensaje: |
              El valor de $f$ no se lee en la gráfica de $f''$. De hecho aquí
              $f$ solo se anula en $x=0$, que es donde corta $C$.
      - tipo: calcular
        titulo: Contar los ceros
        pregunta: |
          Si $C$ se anula en $x=0$ y es la función $f$, ¿en qué valor de $x$
          tendría $f$ su máximo, sabiendo que la que se anula en $x=3$ es $A$?
        respuesta:
          tipo: numero
          valor: '3'
          tolerancia: 0.05
          formato: un número
        distractores:
          - valor: '0'
            mensaje: |
              En $x=0$ es donde $C$ **vale cero**, que es otra cosa. El máximo
              está donde se anula su derivada.
          - valor: '6'
            mensaje: |
              En $x=6$ se anula $B$. Si $B$ fuese la derivada de $C$, el máximo
              estaría ahí — pero entonces $A$ no tendría dónde encajar.
        pista: |
          El máximo de $f$ está donde $f'$ corta el eje.
        desarrollo: |
          Si $C=f$, su derivada es la que se anula donde $C$ tiene el máximo.
          Mirando la figura, $C$ sube hasta $x=3$ y baja después, así que su
          derivada es $A$, la que se anula en $x=3$. Y entonces $B$, que se
          anula en $x=6$, es $f''$: en $x=6$ está la inflexión de $C$.
      - tipo: justificar
        pregunta: |
          Ordena el razonamiento completo. Una pieza es falsa.
        piezas:
          - texto: 'Las tres curvas se anulan en puntos distintos: $C$ en $0$, $A$ en $1$ y $B$ en $2$.'
          - texto: 'La curva $C$ crece hasta $x=3$ y decrece después, así que su derivada se anula en $x=3$: esa es $A$.'
          - texto: 'La curva $A$ tiene su punto más bajo en $x=6$, así que su derivada se anula en $x=6$: esa es $B$.'
          - texto: 'Luego $C=f$, $A=f''$ y $B=f''''$, y la cadena encaja entera sin sobrar ninguna.'
          - texto: 'Se podría haber decidido igual mirando cuál es la más pequeña, porque derivar siempre reduce el tamaño.'
            trampa: true
            mensaje: |
              Derivar no reduce nada: $e^{2x}$ crece al derivarla y
              $\operatorname{sen}(100x)$ se multiplica por cien. El tamaño de
              las curvas no ordena la cadena; los ceros y los extremos sí.
        veredicto: |
          Encajar la cadena entera es la comprobación: si al final sobra una
          curva o dos piden el mismo sitio, el emparejamiento está mal.
    resolucion: |
      **Datos.** Tres curvas $A$, $B$, $C$ que son $f$, $f'$ y $f''$ en algún
      orden, con un cero cada una en $x=3$, $x=6$ y $x=0$ respectivamente.

      ### 1 · La única relación que hace falta

      $$
      \text{cero de } g \;\longleftrightarrow\; \text{extremo de la primitiva de } g
      $$

      Con eso se encadenan las tres.

      ### 2 · Encajar

      La curva $C$ sube hasta $x=3$ y baja a partir de ahí: tiene un máximo en
      $x=3$. Luego su derivada se anula en $x=3$, y la única que lo hace es
      $A$:

      $$
      A = C'
      $$

      La curva $A$ tiene su punto más bajo en $x=6$, así que su derivada se
      anula ahí, y la única que lo hace es $B$:

      $$
      B = A' = C''
      $$

      ### 3 · Leer el resultado

      $$
      C=f, \qquad A=f', \qquad B=f''
      $$

      La cadena encaja entera y no sobra ninguna curva, que es la comprobación
      del método.

      ### 4 · Comprobación con la inflexión

      Si $B=f''$ se anula en $x=6$, entonces $f=C$ tiene una inflexión en
      $x=6$: mirando la figura, $C$ cambia ahí de cóncava hacia abajo a cóncava
      hacia arriba. Encaja.

      ### Resultado

      $$
      \boxed{\;C=f,\quad A=f',\quad B=f''\;}
      $$

      > **Lo que enseña.** Emparejar no es cuestión de ojo: se cuenta dónde se
      > anula cada una y dónde tiene sus extremos, y se encadena. Si al final
      > dos curvas reclaman el mismo sitio, el emparejamiento está mal y hay
      > que rehacerlo, no forzarlo.
`;

anexa(T3, [dominio]);
anexa(T4, [diferencial, emparejar]);
console.log('3 ejercicios propios añadidos: 1 en t03 y 2 en t04');
