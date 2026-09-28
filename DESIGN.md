---
name: SCENE ME
description: Una tira de 16 mm revelada a mano, corriendo por delante de un cielo estrellado.
colors:
  leader: "#0E0F10"
  sombra: "#2A2E31"
  base: "#6E7377"
  margen: "#8F969B"
  emulsion: "#A6ABB0"
  oro: "#E4C46C"
  oro-hondo: "#C49444"
  sepia: "#C8B089"
  tinta-rotulo: "#140A02"
  velo-cielo: "rgba(8, 9, 10, 0.72)"
  scrim-video: "rgba(14, 15, 16, 0.86)"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 8vw, 6rem)"
    lineHeight: 0.86
    letterSpacing: "0.004em"
    fontVariation: "'wdth' 62, 'wght' 800"
    textTransform: "uppercase"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 5rem)"
    lineHeight: 0.92
    letterSpacing: "0.004em"
    fontVariation: "'wdth' 65, 'wght' 800"
    textTransform: "uppercase"
  definicion:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.35vw, 1.125rem)"
    lineHeight: 1.5
    letterSpacing: "0"
    fontVariation: "'wdth' 92, 'wght' 500"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.0625rem"
    lineHeight: 1.62
    fontVariation: "'wdth' 100, 'wght' 400"
    fontFeature: "'tnum' 1"
  nota:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "1.125rem"
    lineHeight: 1.45
    fontStyle: "italic"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.6875rem"
    letterSpacing: "0.24em"
    fontVariation: "'wdth' 100, 'wght' 600"
    textTransform: "uppercase"
    fontFeature: "'tnum' 1"
rounded:
  foco: "2px"
  control: "4px"
  ventanilla: "6px"
  marca-pie: "10px"
  marca-cabecera: "36px"
spacing:
  pelo: "4px"
  junta: "8px"
  casilla: "14px"
  rotulo: "26px"
  borde-pagina: "24px"
  borde-pagina-sm: "40px"
  borde-pagina-lg: "56px"
  seccion: "80px"
  seccion-lg: "112px"
components:
  boton-primario:
    backgroundColor: "{colors.oro}"
    textColor: "{colors.tinta-rotulo}"
    rounded: "{rounded.control}"
    padding: "0 26px"
    height: "56px"
  boton-secundario:
    backgroundColor: "{colors.sombra}"
    textColor: "{colors.emulsion}"
    rounded: "{rounded.control}"
    padding: "0 26px"
    height: "56px"
  dato:
    backgroundColor: "rgba(14, 15, 16, 0.82)"
    textColor: "{colors.emulsion}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  fotograma:
    backgroundColor: "#000000"
    rounded: "{rounded.ventanilla}"
  codigo-margen:
    textColor: "{colors.margen}"
    typography: "{typography.label}"
  codigo-margen-activo:
    textColor: "{colors.oro}"
    typography: "{typography.label}"
  definicion-apagada:
    textColor: "{colors.base}"
    typography: "{typography.definicion}"
  definicion-plena:
    textColor: "{colors.emulsion}"
    typography: "{typography.definicion}"
  enlace:
    textColor: "{colors.emulsion}"
  enlace-hover:
    textColor: "{colors.oro}"
  claqueta:
    backgroundColor: "{colors.emulsion}"
    height: "26px"
  claqueta-menu:
    backgroundColor: "{colors.emulsion}"
    textColor: "{colors.leader}"
    height: "44px"
---

# Design System: SCENE ME

## Overview

**Creative North Star: "La tira de 16 mm, revelada a mano y mirada contra el cielo"**

La portada no es una página con fotos dentro: es un trozo de película sostenido a
contraluz. El suelo ya no es un negro liso, es una **fotografía de emulsión de
película que lee como cielo estrellado** (`/texturas/cielo-estrellas.webp`;
original Texturelabs, serie Film, aportado por el usuario y procesado con sharp,
con su procedencia en el sidecar del fichero), puesta en
`background-attachment: fixed` bajo un velo de negro de leader. La página se
desplaza por delante de ese cielo como una tira por delante de una mesa de luz.
Sobre él, los contenedores llevan perforaciones a los extremos, los rótulos van
impresos en vertical por el margen y la imagen aparece dentro de una ventanilla
de proyector.

De ahí sale la única ley que ordena el resto. **La emulsión vive en el soporte y
jamás sobre la imagen del actor**, porque esa imagen es el producto que se vende.
El grano va en una capa a `opacity: 0.09` por debajo de todo el contenido
(`z-index: 0`); la fuga de luz entra por el 22% derecho del fotograma y se queda
en el borde; el raíl de datos se sacó a su propia columna precisamente porque
flotando encima tapaba la cara de la actriz (y el 28/09/2026 se quitó del todo). Si alguna vez se ve grano sobre una
cara, está mal.

El acento del mundo es ahora **el oro del logo**, muestreado del marco del icono
maestro (`brand/icono-maestro.webp`), no elegido de una rueda de color. Ese oro
sustituyó al naranja de fuga que el contrato de dirección había fijado: donde el
contrato decía `#FF8A33`, el artefacto dice `#E4C46C`, y manda el artefacto,
porque el color sale de un objeto que la marca ya tenía. El mundo sigue siendo
oscuro, denso y mecánico, sin nada blando: cero sombras, cero degradados
decorativos, cero tarjetas. Rechaza el arreglo por defecto de la categoría
—vídeo a pantalla completa con titular centrado y tres tarjetas de servicio
iguales— y lo sustituye por composición asimétrica, listados con filete y
fotogramas de proporción distinta según lo que enseñan.

**Key Characteristics:**
- Suelo único: el cielo de emulsión fijo bajo velo casi negro al 0,72. Ni blanco ni crema en ninguna superficie.
- Emulsión texturada sólo en el soporte, nunca sobre la imagen.
- Versales estrechadas de Archivo variable (`wdth` 62-65, `wght` 800) como voz de rótulo de lata.
- El oro del logo reservado a una sola cosa: lo que está activo.
- Todo contenedor es un trozo de película: perforado, con código en el margen y esquina de 6px.
- Las dos apariciones de la banda de claqueta, y ni una más.
- Dos momentos de autor en toda la página: la presentación del nombre y el avance de fotograma.
- Plano absoluto: ni una sombra en todo el mundo.

## Colors

Una escala de grises de emulsión sobre el cielo velado, con dos acentos cálidos
de un solo trabajo cada uno. **Todos los contrastes están medidos sobre la página
compuesta con `scripts/contraste-sobre-fondo.mjs`, no calculados contra el
`background-color`.**

### Primary
- **Oro del logo** (`{colors.oro}`, 11,3:1): el dorado del marco del icono maestro de SCENE ME. Marca **una sola cosa: lo que está activo ahora**. Es el fotograma en la ventanilla, el código de su margen, el enlace bajo el cursor, la pregunta abierta, el anillo de foco, la selección de texto, el cursor de escritura, el cuerpo del botón primario y el filete inferior de la banda de claqueta. La fuga de luz del borde del fotograma se tiñe de él (`--pel-fuga` es un alias de `--pel-oro`, no un segundo color). No es un color de marca que se reparta por la página.
- **Ámbar de la cabecera** (`--pel-ambar`, `#C9911A`): el dorado del vídeo del nombre, muestreado de sus píxeles dorados (percentil 75). Tiene **un solo uso**: partir en horizontal las tres tomas del Método (el book, la escena, el self-tape) con un filete de 2px que echa un poco de luz hacia abajo, y teñir al 13% la banda del medio. Lo pidió Christian el 28/09/2026 para que las tres se lean como tres piezas. No marca estados: eso sigue siendo del oro del logo.
- **Oro metálico** (`.pel-titulo-oro`): los nombres de las tomas (EL BOOK, LA ESCENA, EL SELF‑TAPE), que Christian pidió en el dorado de la cabecera «con efecto oro brillo pero realista». Degradado vertical con una raya de horizonte fina, como el cromo de las letras del logo pero en oro, y un reflejo que lo cruza cada 7 s (quieto con «reducir movimiento»). Es la única excepción de texto a la Regla del Oro Único, y sólo en esos tres titulares. Su `color` de respaldo (`#DDAE45`) es el que mide el contraste.
- **Oro hondo** (`{colors.oro-hondo}`, 7,0:1): el mismo oro en su parte honda. Declarado en la paleta y **todavía sin uso en la portada**; existe para que un segundo paso del oro no se invente cuando haga falta.

### Secondary
- **Sepia de lápiz de grasa** (`{colors.sepia}`, 9,1:1): el único cálido que no es el oro. Se usa exclusivamente en lo escrito a mano al margen de la tira: las anotaciones en cursiva de Instrument Serif que dicen qué falta o qué está todavía en el laboratorio.

### Neutral
- **Negro de leader** (`{colors.leader}`): el color del suelo y el del velo que va sobre el cielo. También el fondo del raíl de datos al 82% y el scrim del vídeo del cierre al 86%. Es el único fondo del mundo.
- **Velo de cielo** (`{colors.velo-cielo}`): la capa de leader que va entre el cielo estrellado y todo lo demás. Ver la Regla del Velo Buscado.
- **Scrim de vídeo** (`{colors.scrim-video}`): el leader opaco que va entre un vídeo de fondo y el texto que cae encima, en el cierre. Sin él el titular no se lee.
- **Gris de sombra** (`{colors.sombra}`): el cromo. Columnas de perforación, filetes de separación, bordes de casilla, cuerpo del botón secundario, pulgar de la barra de desplazamiento. Nunca lleva texto encima que no sea emulsión.
- **Gris base** (`{colors.base}`, 4,0:1): cromo, filetes y **el tono apagado de la definición**, que a 24px o más pasa con el mínimo de 3:1. A 4,0:1 no llega al mínimo de texto normal.
- **Gris de margen** (`{colors.margen}`): lo impreso en el margen de la película. Códigos de borde, claves del raíl de datos, la marca de estado «Abrir» de las preguntas. Siempre a 11px o menos y siempre en versales espaciadas. **Se aclaró desde `#838A8F` al meter el cielo detrás**: sobre la textura el valor viejo caía a 4,44:1 y el mínimo de texto normal es 4,5. El valor actual es el primero que pasa medido sobre la página compuesta.
- **Gris de emulsión** (`{colors.emulsion}`, 8,3:1): el texto normal. Cuerpo, titulares, rótulos del botón secundario, respuestas, el tono pleno de la definición y las barras claras de la banda de claqueta y del menú.
- **Tinta de rótulo** (`{colors.tinta-rotulo}`, 11,6:1 sobre el oro): el casi negro del texto dentro del botón primario y de la selección. No aparece en ningún otro sitio.

### Named Rules
**La Regla de la Emulsión en el Soporte.** El grano, la raya, el hollín, la mancha de química y la fuga de luz viven en el soporte —el cielo velado, el margen perforado, el cromo de los controles— y nunca encima de la imagen. Prueba: si una cara lleva grano u oro por encima, está mal.

**La Regla del Oro Único.** El oro marca lo que está activo en este momento y nada más. Lo que no está ocurriendo va en gris pleno, aunque sea la llamada más importante de la página: la llamada de primera plana («Empieza a creer en ti, accede a Scene Me») está deliberadamente en emulsión y no en oro, porque quien lleva la acción es el botón que hay debajo. Si dos cosas de la misma pantalla están en oro sin estar las dos activas, sobra una.

**La Regla del Velo Buscado.** El velo sobre el cielo estrellado tiene un **mínimo buscado, no elegido**: barriendo de 0,30 a 0,66 y midiendo con `scripts/contraste-sobre-fondo.mjs` en cada paso, el primero que no rompe ningún texto es 0,60 (con leader). Por encima de ese suelo, la oscuridad es de dirección de arte: Christian pidió el azul del fondo «más profundo, en la misma tinta», y el velo pasó a `rgba(8, 9, 10, 0.72)`, que deja cada canal al 72% de lo que se veía (un 28% más hondo) sin girar el tono (el fondo medio pasa de rgb(23,32,34) a unos rgb(16,23,24)). Oscurecer sólo puede subir el contraste; aclarar por debajo de 0,60 no se hace. Sin velo, el gris de margen a 11px cae a 2,1:1 sobre las zonas claras del cielo. Si se sube la luz de la textura o se cambia la textura, se vuelve a barrer. No se toca a ojo.

**La Regla del Gris que no Habla.** El gris base (`{colors.base}`) no lleva texto por debajo de 24px, a ningún peso. Es cromo: filetes, subrayados, barras y el tono apagado de la definición, que va a 24px o más. Para texto pequeño se sube al gris de margen; para texto normal, al de emulsión.

## Typography

**Display Font:** Archivo variable (con `system-ui, sans-serif`)
**Body Font:** Archivo variable (con `system-ui, sans-serif`)
**Accent Font:** Instrument Serif cursiva (con `Georgia, serif`)

**Character:** Archivo estrechado en versales suena a rótulo de lata de película,
no a titular de web; Instrument Serif en cursiva no es una voz editorial, es el
lápiz de grasa con el que alguien anotó algo al margen de la tira. Las dos caras
son decisión fija del usuario y no se sustituyen.

El eje de anchura está comprobado empíricamente: a 100px, «ESTRELLA» mide 364px
con `wdth 62`, 551px con `wdth 100` y 681px con `wdth 125`. El estrechamiento no
es un efecto, es lo que permite que dos o tres líneas de versales llenen la
columna izquierda sin partirse.

### Hierarchy
- **Display** (`{typography.display}`): el rótulo de la lata. Un solo sitio: el titular del cierre (a `clamp(2.75rem, 8vw, 6rem)`). El nombre de la cabecera ya no va en Archivo: lo forma el vídeo de presentación (ver **Marca** y **Movimiento**).
- **Titular de portada** (el `h1`, visible desde el 28/09/2026): «Tu book, tu escena y tu self‑tape», en la voz de headline a `clamp(1.5rem, 3vw, 2.75rem)` (la mitad desde el 28/09/2026), dos líneas, **centrado a todo lo ancho** con su frase debajo; la portada se parte en dos (llamada a la izquierda, tira de vídeos a la derecha) sólo a partir de ahí. Es lo primero que se lee: dice qué es esto con todas las letras. «self‑tape» lleva guion que no parte (U+2011), porque con el normal el navegador partía «SELF-» / «TAPE» entre líneas.
- **Headline** (`{typography.headline}`): titulares de sección y de toma, la llamada de primera plana y el nombre de la marca en el pie. Mismo carácter, un punto menos estrecho (`wdth 65`) e interlineado 0,92. Su rampa baja por secciones: `clamp(2.5rem, 5.5vw, 4.75rem)` y en oro metálico en los nombres de las tomas; `clamp(1.25rem, 2.4vw, 2rem)` en «De actor a estrella / en 3 pasos» (la segunda línea en minúscula), por debajo de ellos a propósito, `clamp(2.25rem, 4.6vw, 4rem)` en Estudios y Laboratorio, `clamp(2rem, 4vw, 3rem)` en Preguntas, `clamp(1.5rem, 2.6vw, 2rem)` en los títulos de fila y `1.375rem` en los fotogramas sin revelar.
- **Definición** (`{typography.definicion}`): la voz de la promesa, y **lo que sigue al título del Método**: primero «De actor a estrella / en 3 pasos», centrado y en dos líneas fijas (`<br>`), y debajo la definición, también centrada y a media voz (16-18px, cada frase en una sola línea desde 1024px), que dice lo que esa promesa quiere decir. Hasta el 28/09/2026 abría la portada; Christian la movió porque quien llegaba leía una frase preciosa sin saber todavía qué se le ofrecía. El texto no se ha tocado. No va en versales: son dos frases seguidas que hay que leer, así que van en caja normal con anchura 92, peso 500, medida de 62ch y `text-wrap: balance`. La diferencia entre las dos frases la lleva el tono —apagada la del actor, plena la de la estrella—, no el color ni el cuerpo. Ese salto es la transformación dicha con la paleta.
- **Body** (`{typography.body}`): el texto corrido. Interlineado 1,62 y cifras tabulares siempre activas, que es lo que mantiene alineada la columna de precios.
- **Nota** (`{typography.nota}`): la anotación a lápiz de grasa, en sepia, al margen. Sólo para decir qué falta o qué está sin cerrar.
- **Label / código de margen** (`{typography.label}`): lo que va impreso en el margen de la película. Versales a 11px con 0,24em de espaciado; en vertical (`writing-mode: vertical-rl`) cuando corre por el canto de la tira.

### Named Rules
**La Regla de los 54 Caracteres.** El cuerpo y la respuesta de las preguntas topan en `54ch`, no en 68. El glifo «0» de Archivo es más ancho que su letra media, así que `68ch` daban 85 caracteres reales por línea. Medido con `scripts/inspeccion-landing.mjs`: máximo 73 caracteres a 1440. Si se cambia de tipografía, se vuelve a medir; el número que manda es el de caracteres reales, no el `ch`.

**La Regla del Margen.** Lo que identifica una pieza —«Toma 01», «16 mm», «Sin revelar», «Scene Me»— va impreso en el margen, normalmente en vertical, junto a la perforación. Nunca encima del titular. Un rótulo pequeño sobre un titular es un antetítulo, y aquí los antetítulos están prohibidos.

**La Regla del Tono, no del Color.** Cuando dos frases tienen que contrastar entre sí, se separan por tono dentro de la escala de grises (base contra emulsión), no gastando el oro ni cambiando de cuerpo. El oro sigue reservado a lo activo.

**La Regla del Lápiz de Grasa.** Instrument Serif cursiva aparece únicamente en sepia y únicamente anotando algo concreto: lo que falta, lo que aún no tiene precio, lo que está en el laboratorio. No se usa para citas, ni para subtítulos, ni para dar aire.

## Layout

No hay rejilla global: hay una tira que recorre la página y contenido colgado de
ella. Las secciones son de ancho completo con márgenes de página crecientes
(24px, 40px a partir de `sm`, 56px a partir de `lg`) y ritmo vertical de 80px en
móvil y 96-128px en escritorio.

El orden de lectura es el del artefacto: **cabecera, banda de claqueta,
definición dentro del hero, Método, Estudios, Laboratorio, Preguntas, cierre**.
La cabecera pone el icono de la marca grande y pegado a la izquierda en posición
absoluta (`sm:absolute sm:left-0`) precisamente para que el nombre quede centrado
respecto a la **página** y no respecto al hueco que deja el logo; por debajo de
`sm` el logo vuelve arriba y centrado, y no se encoge hasta lo ilegible.

La composición es deliberadamente asimétrica y cambia de sección a sección: el
hero parte en `1fr / 51%` con la definición, el texto, la llamada y los botones a
la izquierda y, a la derecha, **la tira en segunda capa**: ocupa la mitad derecha
de toda la portada de arriba abajo, por detrás del titular, con cinco
fotogramas que corren con el scroll (parallax sin librería, `useTiraEnParallax`
en `hero.tsx`). En la franja del titular la capa se aclara al 22%
(`.pel-tira-capa`, con la altura del titular medida en `--velo-fin`) para que
lo de delante se lea. Los códigos de borde van impresos en la película y corren
con ella. En el móvil y con «reducir movimiento» la tira va quieta, debajo de la
llamada, con tres fotogramas. (El raíl de datos se quitó el 28/09/2026.) el Método alterna el lado del
fotograma toma a toma (`lg:flex-row-reverse` en las impares) con una tira de
perforaciones fija (`sticky`) por el borde izquierdo; los Estudios ponen la tira
tumbada en horizontal y resuelven el contenido en un listado con filete, no en
cajas; el laboratorio es una sola tira horizontal con cuatro fotogramas sin
revelar dentro.

Las proporciones de los fotogramas son distintas a propósito —4/5 el book, 16/9
la escena, 3/4 el self-tape— porque cada medio tiene la suya. Los titulares y los
textos llevan tope de medida en caracteres (`12ch`, `15ch`, `32ch`, `34ch`,
`44ch`, `46ch`, `52ch`) en vez de anchos fijos.

El comportamiento responsivo es de recolocación, no de reducción: los códigos verticales del margen desaparecen por debajo de
`sm`; y por debajo de 480px el botón aprieta relleno (16px), cuerpo (13px) y
espaciado (0,1em) manteniendo intactos los 56px de alto, porque el objetivo
táctil no se toca.

### Named Rules
**La Regla de la Columna Propia.** Los datos, los códigos y los rótulos tienen su propia columna o su propio margen. Nada informativo se superpone a un fotograma. Cuando no cabe al lado, baja debajo.

**La Regla de la Definición Primero.** Lo primero que se lee en la portada es la definición de qué separa a un actor de una estrella, no un eslogan. El eslogan («De actor a estrella») vive en el título del Método (hoy, antes de la definición), donde tiene los tres pasos detrás que lo sostienen.

## Elevation & Depth

Este mundo es **absolutamente plano: no existe ni una `box-shadow` en toda la
portada**. La profundidad se consigue por cuatro vías, todas materiales:

1. **El cielo fijo.** La textura va en `background-attachment: fixed`, así que el contenido se desplaza por delante de un fondo que no se mueve. Ése es el único paralaje del mundo y no hace falta ninguno más.
2. **Capas tonales.** Velo casi negro al 0,72 sobre el cielo, cromo (`{colors.sombra}`) para perforaciones y filetes, raíl de datos sobre leader al 82% y scrim de vídeo al 86%: siempre el mismo color, cambiando la opacidad.
3. **Emulsión superpuesta.** La capa `.pel-grano` combina tres baldosas —raya (`screen`), mancha de química (`soft-light`) y grano (`normal`)— a `opacity: 0.09` por debajo de todo el contenido. El 0,09 está medido, no elegido a ojo: sube el negro a un equivalente de `#181818` y con eso el gris de margen sigue en 5,0:1. Los botones llevan su propia capa de emulsión a 0,08 con `mix-blend-mode: overlay`, aparte, para no tocar el color calculado del rótulo.
4. **Luz, no sombra.** Lo que está activo se ilumina: la fuga dorada entra por el 22% derecho del fotograma en ventanilla con `mix-blend-mode: screen`, y el hover de los botones es `filter: brightness(1.12)`.

### Named Rules
**La Regla sin Sombra.** Aquí no hay sombras de ningún tipo. Si algo necesita destacar, se ilumina con el oro o se separa con un filete de cromo; nunca se levanta.

**La Regla del Fondo Medido.** Cualquier opacidad que se interponga entre una fotografía y un texto —el velo del cielo, el grano, el scrim del vídeo— es un valor medido contra el contraste, no un gusto. Si se cambia una textura o se sube su luz, se vuelven a medir todos los textos sobre el fondo resultante con `scripts/contraste-sobre-fondo.mjs` antes de darla por buena.

## Shapes

Tres radios de sistema y dos de marca, cada uno con su trabajo:

- **Ventanilla (6px)**: sólo el fotograma. Es la esquina de la ventanilla del proyector, no la de una tarjeta.
- **Control (4px)**: botones y casillas del raíl de datos.
- **Foco (2px)**: el redondeo del anillo de `:focus-visible`.
- **Marca**: el icono de la app es un raster real y lleva el redondeo del propio icono, que crece con él: 10px en el pie a 40px, y 18px → 30px → 36px en la cabecera según el escalón (80px, 136px, 168px de lado). No se usa para nada que no sea el logo.

La forma que define el mundo no es el radio, es **la perforación**: un rectángulo
de 20×14 con 3px de radio dibujado en SVG, repetido en una columna de 34px de
ancho (34px de alto en la variante tumbada) sobre cromo, con la baldosa de hollín
detrás en `overlay` comiéndose el margen sin tocar el agujero. Los botones llevan
la misma perforación reducida (22px de ancho, agujero de 12×10, 18px en móvil) a
los dos extremos.

La segunda forma de marca es **la banda de claqueta**: barras diagonales a 104°,
de 42px, en emulsión y leader, con filete inferior de 2px de oro, 26px de alto.
Son las barras del brazo de la claqueta del logo. En oro y negro leían como cinta
de obra —exactamente lo que una marca de cine no quiere decir—, así que las
barras van blancas y negras y el oro entra debajo, de filete.

Bajo la cabecera, la banda es además **el menú** (`components/landing/claqueta-menu.tsx`):
44px de alto, once tramos iguales inclinados 14° (negro, sección, negro…
negro), cada sección rotulada en leader sobre su tramo blanco. Al pasar el
ratón o con el foco, la barra se enciende (`#E9ECEE`), echa un halo sobre los
negros vecinos y un reflejo la cruza, como la luz sobre el cromo del logo; con
«reducir movimiento» se enciende sin reflejo. Por debajo de 1024px los negros
se quedan en filetes de 6px para que quepan los cinco nombres sin deslizar.

Las separaciones son filetes de 1px de cromo. No hay contenedores con relleno y
fondo propio salvo el raíl de datos: lo demás se estructura con filetes,
perforaciones y espacio.

### Named Rules
**La Regla del Trozo de Película.** Todo contenedor de esta portada es un trozo de película: perforado en los extremos, con su código impreso en el margen. Si un bloque parece una tarjeta —caja con fondo, radio grande y relleno uniforme— está mal.

**La Regla de las Dos Claquetas.** La banda de claqueta aparece exactamente dos veces en toda la página: abre la portada bajo la cabecera, convertida en menú, y anuncia el cierre. Una raya repetida deja de significar algo en cuanto aparece por tercera vez. Si hace falta una tercera, lo que falta es otra cosa.

## Components

### Buttons
Un botón aquí es un trozo de película: mismo cuerpo para el primario y el
secundario, y sólo cambia el relleno.

- **Shape:** perforado a los dos lados (columna de 22px, 18px por debajo de 480px), esquina de control (4px), alto mínimo 56px.
- **Primary:** cuerpo y perforaciones en oro con el rótulo en tinta de rótulo (11,6:1). Rótulo en versales a 14px, `wght 700`, 0,16em de espaciado, relleno lateral de 26px.
- **Secondary:** mismo cuerpo en cromo con el rótulo en emulsión.
- **Hover / Active:** `brightness(1.12)` al pasar; 1px hacia abajo al pulsar. Transición de 420ms con salida exponencial.
- **Detalle que se rompe si se toca:** la barra de color central va `align-self: stretch`. Sin eso no llega al alto del botón y las perforaciones asoman por arriba y por abajo: cuatro bloques sueltos en vez de película.

### Links
- **Reposo:** emulsión con subrayado de 1px en gris base y 5px de separación (`text-underline-offset`).
- **Hover:** texto y subrayado pasan a oro, en 420ms.

### Fotograma (componente insignia)
La ventanilla donde va el trabajo del actor, y sale limpio.

- **Shape:** esquina de 6px, `overflow: hidden`, fondo negro puro, contenido en `object-fit: cover`.
- **Estado activo** (`data-activo="si"`): la fuga de luz del borde derecho pasa de 0 a 1 en 420ms. Es un degradado de oro al 88% que muere en transparente al 100% del ancho de la banda (22%), en `mix-blend-mode: screen`. Se queda en el borde: no cruza por encima de la cara de nadie.
- **Prohibido:** cualquier texto, dato, degradado o textura encima del fotograma.

### Definición
Las dos frases bajo el título del Método.

- **Apagada:** la frase del actor, en gris de margen (`{colors.margen}`): desde que la definición va a media voz (menos de 24px), el gris base ya no puede llevarla.
- **Plena:** la frase de la estrella, en emulsión.
- **Forma:** caja normal (no versales), 62ch de medida, `text-wrap: balance`, 8px de separación entre las dos frases.

### Raíl de datos
**Fuera de la portada desde el 28/09/2026** (Christian: la tira va sola). El componente `Dato` sigue en `tira.tsx` por si vuelve; si vuelve, así era:
- **Casilla:** filete de 1px de cromo, radio de control, relleno 12px/14px, fondo leader al 82%.
- **Clave:** 10px en gris de margen, versales, 0,24em.
- **Valor:** 15px en emulsión, `wght 500`, cifras tabulares.
- **Comportamiento:** el contenido cambia con el fotograma en ventanilla y el contenedor va `aria-live="polite"`.

### Código de margen
- **Style:** versales de 11px en gris de margen con 0,24em de espaciado y cifras tabulares; `writing-mode: vertical-rl` cuando corre por el canto de la tira.
- **Activo:** el mismo código en oro, sólo para el fotograma que está en la ventanilla.

### Navigation
La navegación de la cabecera es la banda de claqueta (ver arriba): los cuatro
anclajes de sección y «Entrar», cada uno en su tramo blanco, todos del mismo
ancho. No hay una segunda fila de enlaces. El pie repite el
mismo patrón en tres columnas de códigos con enlaces de texto debajo, y sólo
lleva enlaces que llevan a algún sitio.

### Marca
El logo es la imagen real del icono de la app (`/android-chrome-512x512.png` en
cabecera, `/android-chrome-192x192.png` en el pie), servida por el helper
`icono()` con su huella de versión. No se redibuja, no se recolorea y no se
sustituye por texto: el oro de todo el sistema sale de él.

Desde el 28/09/2026 (decisión de Christian) la **cabecera** es el vídeo de
presentación, que forma el nombre; y el **icono** ya no va arriba: está en la
portada, al lado de la llamada «Empieza a creer en ti, accede a Scene Me», como
puerta que lleva a `/login` (a 176px como mucho, esquinas al 21%).

El **nombre** «SCENE ME» tiene su propia letra: versales cromadas plateadas que
no existen como fuente, sólo como imagen (`/sceneme-letras.webp`, maestro en
`brand/sceneme-letras-maestro.webp`). Donde sale como marca fuera de la
cabecera -el pie, la cortinilla, /creator- va con `LetrasSceneMe`
(`components/marca`), nunca escrito en Archivo. El cromo es plata, no oro: no
compite con la Regla del Oro Único.

### Preguntas
`<details>` nativo, sin una línea de JavaScript: se abre con teclado de serie.

- **Fila:** filete inferior de cromo, 22px arriba y abajo, alto mínimo 44px, título de 18px en emulsión.
- **Estado dicho con palabras:** el marcador nativo se oculta y en su sitio va un rótulo de margen que pone «Abrir» y pasa a «Cerrar» y a oro al abrirse. No hay flecha que gire.
- **Hover / abierta:** el título pasa a oro.

### Superficies del navegador
Tematizadas para que el mundo no se rompa donde pinta el sistema operativo:
selección en oro con texto en tinta de rótulo, cursor de escritura en oro,
anillo de foco de 2px en oro con 3px de separación, barra de desplazamiento fina
en cromo sobre leader (11px, pulgar con 3px de borde de leader y radio de 6px,
gris base al pasar por encima).

### Movimiento
**Dos momentos de autor, no más.** El segundo entró el 28/09/2026 porque Christian
veía la portada quieta y pobre: **la presentación**, el vídeo en el que un rollo
de película se desenrolla y sobre él se forma el nombre (`components/landing/presentacion.tsx`,
`public/marca/presentacion.mp4`). Vive en la cabecera, donde antes estaban el
icono y las letras: el vídeo ES el nombre, y llena la franja de lado a lado. En
el móvil va el fotograma entero (16:9); en pantalla ancha, una franja 32:9
que enseña del 35% al 88% del alto del fotograma (las letras, medidas, van
del 43,6% al 86,3%): aire por encima del nombre y «Studios» casi rozando
abajo. Para que quepa, el vídeo se estira un 6% en horizontal en vez de dejar
filetes negros a los lados. Deja de crecer a 1920px de ancho. Arranca al cargar, suena sólo si se pide («Ver con
sonido») y se queda en el último fotograma con el nombre formado; nunca en
bucle. Con «reducir movimiento», conexión pobre o reproducción automática
bloqueada, sólo ese último fotograma.

El otro momento, el de siempre: **el avance de fotograma.** La tira
encaja de uno en uno (`scroll-snap-type: y proximity`, hijos a
`scroll-snap-align: center`) y un `IntersectionObserver` con umbrales
`[0, 0.2, 0.4, 0.6, 0.8, 1]` decide cuál es el que más superficie enseña: sólo
ése se lleva la fuga de luz y su número en el margen («01 de 03»).

Todo lo demás es estado, no espectáculo: transiciones de 420ms con
`cubic-bezier(0.16, 1, 0.3, 1)` sobre color, opacidad, `filter` y `transform`.
Mecánico y escalonado, nunca elástico. Con `prefers-reduced-motion: reduce`, toda
transición y animación baja a 1ms y el encaje se desactiva.

### Named Rules
**La Regla de los Dos Momentos de Autor.** Sólo el avance de fotograma y la presentación tienen derecho a llamar la atención. Cualquier otra animación tiene que ser respuesta a un estado (hover, foco, abierto, activo) y durar 420ms con la salida exponencial. Nada se mueve por moverse.

## Do's and Don'ts

### Do:
- **Do** verificar el contraste de esta portada con `scripts/contraste-sobre-fondo.mjs`, que pone el texto transparente, captura el fondo desnudo y mide el píxel del percentil 98 que hay detrás de cada letra. Con una fotografía de fondo, calcular contra el `background-color` computado **miente**: ese método dejó pasar 55 fallos que este cazó. Última medición en producción: 118 textos a 1440 y 114 a 390, todos pasan.
- **Do** usar `scripts/inspeccion-landing.mjs` para lo otro que no se ve a ojo: desbordes horizontales y caracteres reales por línea.
- **Do** mantener la emulsión en el soporte: capa `.pel-grano` a `opacity: 0.09`, por debajo del contenido, nunca dentro de un fotograma.
- **Do** dar a todo contenedor cuerpo de película: perforación en los extremos y su código impreso en el margen.
- **Do** reservar el oro (`{colors.oro}`) a lo que está activo ahora mismo, y sólo a una cosa por pantalla; lo demás va en gris pleno, incluida la llamada principal.
- **Do** separar dos frases que se oponen por tono (base contra emulsión) en vez de por color.
- **Do** escribir los códigos de margen en versales de 11px con 0,24em, en gris de margen, y en vertical cuando corran por el canto.
- **Do** topar el texto corrido en `54ch` y volver a medir caracteres reales si cambia la tipografía.
- **Do** variar la proporción de cada fotograma según lo que enseña (4/5, 16/9, 3/4) en lugar de repetir el mismo formato.
- **Do** decir los estados con palabras («Abrir» / «Cerrar», «En marcha», «Sin revelar») en vez de con iconos o flechas.
- **Do** poner un scrim opaco (`{colors.scrim-video}`) detrás de cualquier texto que caiga sobre vídeo o foto.
- **Do** mantener los 56px de alto del botón y los 44px de la fila de pregunta también en móvil, apretando relleno y espaciado antes que el objetivo táctil.
- **Do** embarcar cada raster con su procedencia en un sidecar `.json` al lado del fichero, como hacen las cinco texturas y el cielo.

### Don't:
- **Don't** poner grano, raya, fuga, texto ni dato encima de la imagen del actor. Esa imagen es el producto.
- **Don't** bajar el velo por debajo del mínimo medido (0,60) ni cambiar la luz de la textura del cielo sin volver a barrer con el medidor. Un fondo fotográfico no se ajusta a ojo.
- **Don't** usar el gris base (`{colors.base}`) para texto por debajo de 24px: a 4,0:1 no llega.
- **Don't** repartir el oro como color de marca, ni gastarlo en una llamada que no está ocurriendo.
- **Don't** meter una tercera banda de claqueta.
- **Don't** poner un antetítulo: ningún rótulo pequeño va encima de un titular. Su sitio es el margen.
- **Don't** resolver una sección con tarjetas iguales. Listados con filete, tiras y fotogramas de proporción propia.
- **Don't** numerar una sección si el número no lleva información. «Toma 01» identifica una toma real; los cuatro del laboratorio no llevan número porque no tienen orden.
- **Don't** añadir sombras: este mundo es plano y se ilumina, no se levanta.
- **Don't** usar fondo blanco ni crema en ninguna superficie.
- **Don't** meter una tercera animación de autor: el avance de fotograma y la presentación son los dos únicos.
- **Don't** inventar una cifra, un testimonio, un precio o un botón que no lleve a ningún sitio. Lo que no existe se dice a lápiz de grasa.
