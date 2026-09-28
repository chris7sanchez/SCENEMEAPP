---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/components/landing"]
---

---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/components/landing"]
---

Superficie: la landing pública (`src/app/page.tsx` y `src/components/landing/`). Modo: Persuade.

Público: dos por igual, el actor sin material y el profesional cuyo material ha
envejecido. Acción: entrar gratis a los Estudios, o pedir la escena. Pruebas
disponibles: sólo material propio (vídeos de `public/videos`, fotos de
`public/trabajos/web`). Sin cifras ni testimonios: no existen todavía.

Restricciones: fondo no blanco ni crema. Archivo 800 e Instrument Serif cursiva
son tipografías fijadas por el usuario. El texto del Método está aprobado.
Actorlogía no se nombra. EXPRESS 48 h, packs de self-tape, Packtor Pro y tokens
se muestran sin precio inventado y sin botón que no lleve a ningún sitio.

## Direction contract

THESIS: La landing es una tira de 16 mm revelada a mano por la que corre el
material del actor. La emulsión —grano, raya, fuga de luz— vive en el soporte y
jamás sobre la imagen que hay que vender. Rechaza el arreglo por defecto de la
categoría: vídeo a pantalla completa con titular centrado y tres tarjetas de
servicio iguales.

OWN-WORLD: El suelo es el cielo de emulsión `/texturas/cielo-estrellas.webp`,
fijo, bajo un velo `rgba(8, 9, 10, 0.72)` sobre `#0E0F10`; el mínimo (0,60)
está buscado con `scripts/contraste-sobre-fondo.mjs`, y por encima se oscureció
en la misma tinta a petición de Christian. Texto en gris de emulsión
`#A6ABB0`; margen `#8F969B` para lo impreso a 11px; base `#6E7377` sólo a 24px o
más y en cromo. Oro del logo `#E4C46C`, muestreado del marco del icono maestro,
sólo para lo activo. Sepia `#C8B089` para lo escrito a mano. Archivo variable
estrechado (wdth 62 display, wdth 65 secciones, wght 800) en versales para
rotular; Instrument Serif cursiva como lápiz de grasa. Todo contenedor es un
trozo de película: perforaciones a los extremos, código de borde vertical,
esquina de 6px. Las barras de claqueta del logo aparecen exactamente dos veces.

STORY: Entiende que hay dos mitades, la productora que rueda su material y los
Estudios donde se entrena a diario. Cree que su trabajo saldrá con la calidad que
ve corriendo por la tira. Entra gratis, o pide la escena.

FIRST VIEWPORT: Cabecera con la claqueta del logo pegada a la izquierda, casi
tan alta como la banda, y SCENE ME centrado respecto a la página. Debajo, las
barras de claqueta. Izquierda, sin antetítulo y como PRIMERA LECTURA de la
página, la definición en dos frases: la del actor en tono apagado y la de la
estrella en tono pleno, y ese salto de tono es la transformación. Debajo, la
línea que identifica ("Un studio para el actor, en Madrid"), la llamada
"Empieza a creer en ti, accede a Scene Me" en gris pleno —nunca en oro— y el
botón primario con forma de fotograma perforado, en oro y con rótulo casi
negro.
Derecha, el 45% del ancho: la tira vertical sangrando arriba y abajo, tres
fotogramas con los vídeos reales dentro, perforaciones a ambos lados, códigos de
borde en vertical. Pegado al borde, el raíl con los datos del fotograma que está
en la ventanilla. Abajo, sobre filete, los dos caminos como dos entradas de
reparto.

CAMBIOS POSTERIORES DEL USUARIO (mandan sobre lo de arriba si algo se
contradice): el naranja se sustituyó por el oro del logo; el eslogan "De actor
a estrella" se mudó al título del Método, que dice "De actor a estrella en 3
pasos"; la definición pasó a ser lo primero de la página; se añadió el cielo de
fondo; y el logo se implementó como imagen real en cabecera y pie.

FORM: 16 mm revelado a mano (`cinema-cinematography-editing-hand-processed-film-bloom`),
retador elegido por el usuario frente a la asignación 6 de 7, el bloque de
créditos. Clave de semilla `31ab9f01`. Interacción característica: **el avance de
fotograma** — al bajar, la tira avanza encajando fotograma a fotograma como una
ventanilla de proyector, y el raíl de datos cambia al que entra; sólo ese lleva
la fuga de oro. Gramática de movimiento: mecánica y escalonada, nunca elástica,
con salida exponencial, un solo momento de autor en toda la página.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
