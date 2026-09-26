---
name: SCENE ME
description: Una tira de 16 mm revelada a mano por la que corre el material del actor.
colors:
  leader: "#0E0F10"
  sombra: "#2A2E31"
  base: "#6E7377"
  margen: "#838A8F"
  emulsion: "#A6ABB0"
  fuga: "#FF8A33"
  sepia: "#C8B089"
  tinta-rotulo: "#140A02"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(3.25rem, 8.6vw, 6.5rem)"
    lineHeight: 0.86
    letterSpacing: "0.004em"
    fontVariation: "'wdth' 62, 'wght' 800"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 5rem)"
    lineHeight: 0.92
    letterSpacing: "0.004em"
    fontVariation: "'wdth' 65, 'wght' 800"
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
spacing:
  pelo: "4px"
  junta: "8px"
  casilla: "14px"
  rotulo: "26px"
  borde-pagina: "24px"
  borde-pagina-lg: "56px"
  seccion: "80px"
  seccion-lg: "112px"
components:
  boton-primario:
    backgroundColor: "{colors.fuga}"
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
    textColor: "{colors.fuga}"
    typography: "{typography.label}"
  enlace:
    textColor: "{colors.emulsion}"
  enlace-hover:
    textColor: "{colors.fuga}"
---

# Design System: SCENE ME

## Overview

**Creative North Star: "La tira de 16 mm revelada a mano"**

La portada no es una página con fotos dentro: es un trozo de película. El suelo
es negro de leader, los contenedores llevan perforaciones a los extremos, los
rótulos van impresos en vertical por el margen y la imagen aparece dentro de una
ventanilla de proyector. El material fotográfico se nota —grano, raya, hollín,
mancha de química, fuga de luz naranja— pero se nota donde tiene que notarse: en
el soporte.

De ahí sale la única ley que ordena el resto. **La emulsión vive en el soporte y
jamás sobre la imagen del actor**, porque esa imagen es el producto que se vende.
El grano va en una capa a `opacity: 0.09` por debajo de todo el contenido
(`z-index: 0`); la fuga de luz entra por el 22% derecho del fotograma y se queda
en el borde; el raíl de datos se sacó a su propia columna precisamente porque
flotando encima tapaba la cara de la actriz. Si alguna vez se ve grano sobre una
cara, está mal.

El mundo es oscuro, denso y mecánico, sin nada blando: cero sombras, cero
degradados decorativos, cero tarjetas. Rechaza explícitamente el arreglo por
defecto de la categoría —vídeo a pantalla completa con titular centrado y tres
tarjetas de servicio iguales— y lo sustituye por composición asimétrica, listados
con filete y fotogramas de proporción distinta según lo que enseñan.

**Key Characteristics:**
- Negro de leader como suelo único; ni blanco ni crema en ninguna superficie.
- Emulsión texturada sólo en el soporte, nunca sobre la imagen.
- Versales estrechadas de Archivo variable (`wdth` 62-65, `wght` 800) como voz de rótulo de lata.
- Naranja de fuga reservado a una sola cosa: lo que está activo.
- Todo contenedor es un trozo de película: perforado, con código en el margen y esquina de 6px.
- Un solo momento de autor en toda la página: el avance de fotograma.
- Plano absoluto: ni una sombra en todo el mundo.

## Colors

Una escala de grises de emulsión sobre negro de leader, con dos acentos de un
solo trabajo cada uno. Todos los contrastes están medidos sobre el leader.

### Primary
- **Naranja de fuga** (`{colors.fuga}`, 8,1:1): la luz que se cuela por el borde de la tira en el revelado a mano. Marca **una sola cosa: lo que está activo ahora**. Es el fotograma en la ventanilla, el código de su margen, el enlace bajo el cursor, la pregunta abierta, el anillo de foco, la selección de texto y el cursor de escritura. No es un color de marca que se reparta por la página.

### Secondary
- **Sepia de lápiz de grasa** (`{colors.sepia}`, 9,1:1): el único color cálido que no es la fuga. Se usa exclusivamente en lo escrito a mano al margen de la tira: las anotaciones en cursiva de Instrument Serif que dicen qué falta o qué está todavía en el laboratorio.

### Neutral
- **Negro de leader** (`{colors.leader}`): el suelo de toda la página y el fondo del raíl de datos al 82%. Es el único fondo del mundo.
- **Gris de sombra** (`{colors.sombra}`): el cromo. Columnas de perforación, filetes de separación, bordes de casilla, cuerpo del botón secundario, pulgar de la barra de desplazamiento. Nunca lleva texto encima que no sea emulsión.
- **Gris base** (`{colors.base}`, 4,0:1): sólo cromo y filetes —el subrayado en reposo de los enlaces y el pulgar de la barra al pasar por encima—. A 4,0:1 no llega al mínimo de texto normal.
- **Gris de margen** (`{colors.margen}`, 5,4:1): lo impreso en el margen de la película. Códigos de borde, claves del raíl de datos, la marca de estado «Abrir» de las preguntas. Siempre a 11px o menos y siempre en versales espaciadas.
- **Gris de emulsión** (`{colors.emulsion}`, 8,3:1): el texto normal. Cuerpo, titulares, rótulos del botón secundario, respuestas.
- **Tinta de rótulo** (`{colors.tinta-rotulo}`, 8,8:1 sobre el naranja): el casi negro del texto dentro del botón primario y de la selección. No aparece en ningún otro sitio.

### Named Rules
**La Regla de la Emulsión en el Soporte.** El grano, la raya, el hollín, la mancha de química y la fuga de luz viven en el soporte —el negro de leader, el margen perforado, el cromo de los controles— y nunca encima de la imagen. Prueba: si una cara lleva grano o naranja por encima, está mal.

**La Regla de la Fuga Única.** El naranja marca lo que está activo en este momento y nada más. Si dos cosas de la misma pantalla están en naranja sin estar las dos activas, sobra una.

**La Regla del Gris que no Habla.** El gris base (`{colors.base}`) no lleva texto nunca, a ningún tamaño. Es cromo: filetes, subrayados y barras. Para texto pequeño se sube al gris de margen; para texto normal, al de emulsión.

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
es un efecto, es lo que permite que tres líneas de versales llenen la columna
izquierda sin partirse.

### Hierarchy
- **Display** (`{typography.display}`): el rótulo de la lata. Sólo el `h1` de la portada y el titular del cierre, a tres o dos líneas, en versales, interlineado 0,86.
- **Headline** (`{typography.headline}`): titulares de sección y de toma, más el nombre de la marca en cabecera y pie. Mismo carácter, un punto menos estrecho (`wdth 65`) e interlineado 0,92.
- **Body** (`{typography.body}`): el texto corrido. Interlineado 1,62 y cifras tabulares siempre activas, que es lo que mantiene alineada la columna de precios.
- **Nota** (`{typography.nota}`): la anotación a lápiz de grasa, en sepia, al margen. Sólo para decir qué falta o qué está sin cerrar.
- **Label / código de margen** (`{typography.label}`): lo que va impreso en el margen de la película. Versales a 11px con 0,24em de espaciado; en vertical (`writing-mode: vertical-rl`) cuando corre por el canto de la tira.

### Named Rules
**La Regla de los 54 Caracteres.** El cuerpo topa en `54ch`, no en 68. El glifo «0» de Archivo es más ancho que su letra media, así que `68ch` daban 85 caracteres reales por línea. Medido en el artefacto: máximo 73 caracteres a 1440. Si se cambia de tipografía, se vuelve a medir; el número que manda es el de caracteres reales, no el `ch`.

**La Regla del Margen.** Lo que identifica una pieza —«Toma 01», «16 mm», «Sin revelar», «Scene Me»— va impreso en el margen, normalmente en vertical, junto a la perforación. Nunca encima del titular. Un rótulo pequeño sobre un titular es un antetítulo, y aquí los antetítulos están prohibidos.

**La Regla del Lápiz de Grasa.** Instrument Serif cursiva aparece únicamente en sepia y únicamente anotando algo concreto: lo que falta, lo que aún no tiene precio, lo que está en el laboratorio. No se usa para citas, ni para subtítulos, ni para dar aire.

## Layout

No hay rejilla global: hay una tira que recorre la página y contenido colgado de
ella. Las secciones son de ancho completo con márgenes de página crecientes
(24px, 40px a partir de `sm`, 56px a partir de `lg`) y ritmo vertical de 80px en
móvil y 112px en escritorio.

La composición es deliberadamente asimétrica y cambia de sección a sección: la
portada parte en `1fr / 51%` con el rótulo a la izquierda y la tira vertical
sangrando arriba y abajo a la derecha, más una columna propia de 184px para el
raíl de datos; el Método alterna el lado del fotograma toma a toma
(`lg:flex-row-reverse` en las impares) con una tira de perforaciones fija
(`sticky`) por el borde izquierdo; los Estudios ponen la tira tumbada en
horizontal y resuelven el contenido en un listado con filete, no en cajas; el
laboratorio es una sola tira horizontal con cuatro fotogramas sin revelar dentro.

Las proporciones de los fotogramas son distintas a propósito —4/5 el book, 16/9
la escena, 3/4 el self-tape—, porque cada medio tiene la suya. Los titulares y
los textos llevan tope de medida en caracteres (`14ch`, `34ch`, `44ch`, `52ch`)
en vez de anchos fijos.

El comportamiento responsivo es de recolocación, no de reducción: el raíl de
datos pasa de columna lateral a una fila de cuatro casillas **debajo** de la
tira, nunca encima; los códigos verticales del margen desaparecen por debajo de
`sm`; y por debajo de 480px el botón aprieta relleno (16px), cuerpo (13px) y
espaciado (0,1em) manteniendo intactos los 56px de alto, porque el objetivo
táctil no se toca.

### Named Rules
**La Regla de la Columna Propia.** Los datos, los códigos y los rótulos tienen su propia columna o su propio margen. Nada informativo se superpone a un fotograma. Cuando no cabe al lado, baja debajo.

## Elevation & Depth

Este mundo es **absolutamente plano: no existe ni una `box-shadow` en toda la
portada**. La profundidad se consigue por tres vías, todas materiales:

1. **Capas tonales.** Leader (`{colors.leader}`) de suelo, cromo (`{colors.sombra}`) para perforaciones y filetes, y el raíl de datos sobre leader al 82% de opacidad para despegarse un punto del fondo sin cambiar de color.
2. **Emulsión superpuesta.** La capa `.pel-grano` combina tres baldosas —raya (`screen`), mancha de química (`soft-light`) y grano (`normal`)— a `opacity: 0.09` por debajo de todo el contenido. El 0,09 está medido, no elegido a ojo: sube el negro a un equivalente de `#181818` y con eso el gris de margen sigue en 5,0:1. Los botones llevan su propia capa de emulsión a 0,08 con `mix-blend-mode: overlay`, aparte, para no tocar el color calculado del rótulo.
3. **Luz, no sombra.** Lo que está activo se ilumina: la fuga naranja entra por el 22% derecho del fotograma en ventanilla con `mix-blend-mode: screen`, y el hover de los botones es `filter: brightness(1.12)`.

### Named Rules
**La Regla sin Sombra.** Aquí no hay sombras de ningún tipo. Si algo necesita destacar, se ilumina con la fuga o se separa con un filete de cromo; nunca se levanta.

**La Regla del 0,09.** La opacidad de la emulsión es un valor medido contra el contraste, no un gusto. Si se sube la textura, se vuelven a medir todos los grises sobre el fondo resultante antes de darla por buena.

## Shapes

Tres radios y ni uno más, cada uno con su trabajo:

- **Ventanilla (6px)**: sólo el fotograma. Es la esquina de la ventanilla del proyector, no la de una tarjeta.
- **Control (4px)**: botones y casillas del raíl de datos.
- **Foco (2px)**: el redondeo del anillo de `:focus-visible`.

La forma que define el mundo no es el radio, es **la perforación**: un rectángulo
de 20×14 con 3px de radio dibujado en SVG, repetido en una columna de 34px de
ancho (34px de alto en la variante tumbada) sobre cromo, con la baldosa de hollín
detrás en `overlay` comiéndose el margen sin tocar el agujero. Los botones llevan
la misma perforación reducida (22px de ancho, agujero de 12×10, 18px en móvil) a
los dos extremos.

Las separaciones son filetes de 1px de cromo. No hay contenedores con relleno y
fondo propio salvo el raíl de datos: lo demás se estructura con filetes,
perforaciones y espacio.

### Named Rules
**La Regla del Trozo de Película.** Todo contenedor de esta portada es un trozo de película: perforado en los extremos, con su código impreso en el margen. Si un bloque parece una tarjeta —caja con fondo, radio grande y relleno uniforme— está mal.

## Components

### Buttons
Un botón aquí es un trozo de película: mismo cuerpo para el primario y el
secundario, y sólo cambia el relleno.

- **Shape:** perforado a los dos lados (columna de 22px, 18px por debajo de 480px), esquina de control (4px), alto mínimo 56px.
- **Primary:** cuerpo y perforaciones en naranja de fuga con el rótulo en tinta de rótulo (8,8:1). Rótulo en versales a 14px, `wght 700`, 0,16em de espaciado, relleno lateral de 26px.
- **Secondary:** mismo cuerpo en cromo con el rótulo en emulsión.
- **Hover / Active:** `brightness(1.12)` al pasar; 1px hacia abajo al pulsar. Transición de 420ms con salida exponencial.
- **Detalle que se rompe si se toca:** la barra de color central va `align-self: stretch`. Sin eso no llega al alto del botón y las perforaciones asoman por arriba y por abajo: cuatro bloques sueltos en vez de película.

### Links
- **Reposo:** emulsión con subrayado de 1px en gris base y 5px de separación (`text-underline-offset`).
- **Hover:** texto y subrayado pasan a naranja de fuga, en 420ms.

### Fotograma (componente insignia)
La ventanilla donde va el trabajo del actor, y sale limpio.

- **Shape:** esquina de 6px, `overflow: hidden`, fondo negro puro, contenido en `object-fit: cover`.
- **Estado activo** (`data-activo="si"`): la fuga de luz del borde derecho pasa de 0 a 1 en 420ms. Es un degradado naranja al 92% que muere en transparente al 100% del ancho de la banda (22%), en `mix-blend-mode: screen`. Se queda en el borde: no cruza por encima de la cara de nadie.
- **Prohibido:** cualquier texto, dato, degradado o textura encima del fotograma.

### Raíl de datos
- **Casilla:** filete de 1px de cromo, radio de control, relleno 12px/14px, fondo leader al 82%.
- **Clave:** 10px en gris de margen, versales, 0,24em.
- **Valor:** 15px en emulsión, `wght 500`, cifras tabulares.
- **Comportamiento:** el contenido cambia con el fotograma en ventanilla y el contenedor va `aria-live="polite"`.

### Código de margen
- **Style:** versales de 11px en gris de margen con 0,24em de espaciado y cifras tabulares; `writing-mode: vertical-rl` cuando corre por el canto de la tira.
- **Activo:** el mismo código en naranja de fuga, sólo para el fotograma que está en la ventanilla.

### Preguntas
`<details>` nativo, sin una línea de JavaScript: se abre con teclado de serie.

- **Fila:** filete inferior de cromo, 22px arriba y abajo, alto mínimo 44px, título de 18px en emulsión.
- **Estado dicho con palabras:** el marcador nativo se oculta y en su sitio va un rótulo de margen que pone «Abrir» y pasa a «Cerrar» y a naranja al abrirse. No hay flecha que gire.
- **Hover / abierta:** el título pasa a naranja de fuga.

### Superficies del navegador
Tematizadas para que el mundo no se rompa donde pinta el sistema operativo:
selección naranja con texto en tinta de rótulo, cursor de escritura naranja,
anillo de foco de 2px naranja con 3px de separación, barra de desplazamiento
fina en cromo sobre leader (11px, pulgar con 3px de borde de leader y radio de
6px, gris base al pasar por encima).

### Movimiento
**Un solo momento de autor en toda la página: el avance de fotograma.** La tira
encaja de uno en uno (`scroll-snap-type: y proximity`, hijos a
`scroll-snap-align: center`) y un `IntersectionObserver` con umbrales
`[0, 0.2, 0.4, 0.6, 0.8, 1]` decide cuál es el que más superficie enseña: sólo
ése se lleva la fuga de luz y sus datos suben al raíl.

Todo lo demás es estado, no espectáculo: transiciones de 420ms con
`cubic-bezier(0.16, 1, 0.3, 1)` sobre color, opacidad, `filter` y `transform`.
Mecánico y escalonado, nunca elástico. Con `prefers-reduced-motion: reduce`, toda
transición y animación baja a 1ms y el encaje se desactiva.

### Named Rules
**La Regla del Único Momento de Autor.** Sólo el avance de fotograma tiene derecho a llamar la atención. Cualquier otra animación tiene que ser respuesta a un estado (hover, foco, abierto, activo) y durar 420ms con la salida exponencial. Nada se mueve por moverse.

## Do's and Don'ts

### Do:
- **Do** mantener la emulsión en el soporte: capa `.pel-grano` a `opacity: 0.09`, por debajo del contenido, nunca dentro de un fotograma.
- **Do** dar a todo contenedor cuerpo de película: perforación en los extremos y su código impreso en el margen.
- **Do** reservar el naranja de fuga (`{colors.fuga}`) a lo que está activo ahora mismo, y sólo a una cosa por pantalla.
- **Do** escribir los códigos de margen en versales de 11px con 0,24em, en gris de margen, y en vertical cuando corran por el canto.
- **Do** topar el texto corrido en `54ch` y volver a medir caracteres reales si cambia la tipografía.
- **Do** variar la proporción de cada fotograma según lo que enseña (4/5, 16/9, 3/4) en lugar de repetir el mismo formato.
- **Do** decir los estados con palabras («Abrir» / «Cerrar», «En marcha», «Sin revelar») en vez de con iconos o flechas.
- **Do** poner un scrim opaco (leader al 86%) detrás de cualquier texto que caiga sobre vídeo o foto.
- **Do** mantener los 56px de alto del botón y los 44px de la fila de pregunta también en móvil, apretando relleno y espaciado antes que el objetivo táctil.

### Don't:
- **Don't** poner grano, raya, fuga, texto ni dato encima de la imagen del actor. Esa imagen es el producto.
- **Don't** usar el gris base (`{colors.base}`) para texto a ningún tamaño: a 4,0:1 no llega.
- **Don't** repartir el naranja como color de marca.
- **Don't** poner un antetítulo: ningún rótulo pequeño va encima de un titular. Su sitio es el margen.
- **Don't** resolver una sección con tarjetas iguales. Listados con filete, tiras y fotogramas de proporción propia.
- **Don't** numerar una sección si el número no lleva información. «Toma 01» identifica una toma real; los cuatro del laboratorio no llevan número porque no tienen orden.
- **Don't** añadir sombras: este mundo es plano y se ilumina, no se levanta.
- **Don't** usar fondo blanco ni crema en ninguna superficie.
- **Don't** meter una segunda animación de autor: el avance de fotograma es el único.
- **Don't** inventar una cifra, un testimonio, un precio o un botón que no lleve a ningún sitio. Lo que no existe se dice a lápiz de grasa.
