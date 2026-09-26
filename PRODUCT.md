# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dos públicos con el mismo peso, los dos actores y actrices en España que ruedan
presencialmente en Madrid:

1. **El que todavía no tiene material.** Empieza, no tiene book decente ni
   ninguna escena, y lo que tiene le da vergüenza enseñarlo. Su trabajo es
   conseguir por primera vez una versión suya que se pueda mover.
2. **El profesional que necesita actualizar.** Ya trabaja y tiene
   representante, pero su material se ha quedado viejo o ha dejado de
   representarle. Su trabajo es tener la versión nueva de sí mismo antes de la
   próxima oportunidad.

La página tiene que dar un camino claro a cada uno desde arriba, sin
subordinar a ninguno de los dos.

## Product Purpose

SCENE ME es un studio para el actor. Hace dos cosas que hasta ahora estaban
separadas:

- **Produce el material** con el que un actor se presenta a la industria: book
  de fotos, escena hecha a medida y self-tape, con dirección de casting durante
  la grabación.
- **Da un sitio donde entrenarse a diario**: los Estudios de cine SCENE ME, con
  escenas para trabajar cada día, ensayo de un guion entero con las réplicas de
  todos los personajes, y una comunidad donde compartir la grabación del día y
  recibir otras miradas.

Éxito es que el actor pase de tener material que no le representa a tener la
versión de sí mismo que quiere mover, y que entre una sesión y la siguiente no
se pare.

## Positioning

Las dos mitades juntas bajo el mismo techo: la productora y la sala de ensayo
diaria, con la comunidad dentro. Un fotógrafo de actores no tiene los Estudios;
una app de ensayo no rueda la escena. La frase que ordena todo el relato es
**«de actor a estrella»**, y la que separa las dos mitades es **«el material se
compra, el actor se entrena»**.

## Operating Context

- El rodaje (book, escena, self-tape) es presencial en Madrid, con horario
  flexible adaptado al actor.
- Los Estudios se usan desde casa, a diario, en sesiones cortas.
- El actor sube su grabación del día y recibe opiniones de otros actores.
- El material se pide muchas veces con prisa real: un director o productor
  quiere ver trabajo y el actor no tiene nada de su versión actual.

## Capabilities and Constraints

**Confirmado, con precio real en el código** (`src/lib/data.ts`,
`src/components/steps/step1-selection.tsx`):

- Book actoral: 150 € (8 fotos retocadas, 2 cambios), 299 € (12-15 fotos, 2-3
  cambios), 399 € (15+ fotos, 3 cambios, maquillaje y peluquería incluidos,
  reel de presentación en 4K).
- Editorial: 250 € street, 350 € fashion, 450 € editorial design.
- Conceptual: 300 € creative concept, 500 € visual story.
- Escenas: pack de 1 escena 499 €, pack de 2 escenas 699 €.

**Implementado en la aplicación:**

- Ensayo de guion completo con réplica por personaje y narrador de acotaciones
  (`src/ai`, `/studio`).
- Comunidad de actores (`src/components/comunidad`, `src/lib/comunidad-db.ts`).
- Reserva de sesiones con calendario y señal (`/booking`, `/api/bookings`).

**Anunciado pero todavía sin construir.** El usuario quiere que aparezca en la
página para irlo definiendo, así que se presenta sin precio inventado y sin
botón que no lleve a ningún sitio:

- Escena EXPRESS en 48 h.
- Packs de self-tape de 5 y de 10 (no hay precio decidido).
- Packtor Pro a 14,99 €/mes (maquetado en el landing; el cobro no está
  verificado).
- Tokens por constancia canjeables por descuentos, fotos y escenas gratis (cero
  código: no existe saldo, ni reglas, ni canje).

**Fuera del relato por decisión del usuario:** Actorlogía existe como sección
del producto (`/actorlogia`, `/astrologia`, `/alquimia`) pero no se nombra al
contar el Método.

**Restricción de despliegue:** la conexión GitHub→Vercel está rota desde el
18/09/2026 (cuenta marcada como spam, ticket #4781187). Se publica a mano con
`npm run publicar`, que hace pull, despliega y luego pregunta a
`/api/assets` si los ficheros llegaron.

## Brand Commitments

- Nombre: SCENE ME / SCENE ME Studios.
- Logo: la claqueta (commit `b1611d5`), presente en los siete sitios donde hace
  falta; los iconos se versionan en `src/lib/iconos-version.ts`.
- Idioma: castellano en todo, incluido el código y los mensajes de commit.
- Tipografías aprobadas para el landing: **Archivo 800** para titulares y
  **Instrument Serif en cursiva** para los acentos. El usuario las eligió
  viendo maquetas y son vinculantes.
- El texto del Método está aprobado palabra por palabra y no se reescribe sin
  pedirlo.
- El fondo del landing no puede ser blanco ni crema: decisión explícita del
  usuario.

## Evidence on Hand

**Material propio real y usable:**

- Vídeo: `public/videos/` — loops de `MIX-cine`, `AMANDA`, `OLIVER`,
  `SONIA_DORADO`, `MUDANZA`, `SHOGUN`, `Mel_cuban`, más los montajes largos
  `*-web.mp4`.
- Fotografía de book: `public/trabajos/web/` (1-11, con variantes `.2` y `.3`).

**Pruebas que existen pero todavía no están recogidas:** hay actores con nombre
que darían permiso para aparecer, y hay papeles y castings conseguidos con
material de SCENE ME. Nada de eso está documentado aún, así que la página
reserva sitio real para esas pruebas y no las inventa mientras falten.

**Prohibido fabricar.** El landing anterior traía cifras y nombres inventados
que se han retirado: «1200 actores en la plataforma», «500 escenas grabadas»,
«3500 horas ensayadas con IA», «40% de tasa de éxito en casting», y los nombres
de portfolio «María G.», «Carlos Ruiz», «Ana S.», «David M.», «Laura V.»,
«Javier T.». No vuelven, ni ellos ni nada parecido, hasta que haya dato real.

## Product Principles

1. **Ni una cifra ni un testimonio inventado.** Si no hay prueba, manda el
   material que se ve: el vídeo y la foto reales.
2. **Las dos mitades son una sola cosa.** Productora y Estudios se entienden
   como un recorrido, no como dos catálogos pegados.
3. **Los dos públicos entran por la puerta grande.** Camino claro para el que no
   tiene nada y para el que actualiza, sin que uno sea la letra pequeña del otro.
4. **Lo que aún no existe se presenta como lo que es.** Sin precio inventado y
   sin botón que no lleve a ningún sitio.
5. **Castellano, siempre.**

## Accessibility & Inclusion

Mínimo WCAG 2.2 AA, y por regla explícita del usuario (regla L0 de su
CLAUDE.md) el texto tiene que poder leerse **siempre**:

- Contraste mínimo 4.5:1 en texto normal y 3:1 en texto grande (>24px) e
  iconos con significado.
- Todo texto sobre vídeo, foto o gradiente lleva un scrim detrás. No se admite
  texto sobre imagen sin capa de contraste.
- Prohibidas las opacidades por debajo del 60% en texto informativo.
- Objetivos táctiles de 44px o más.
- Verificación obligatoria en claro y oscuro, en móvil y en escritorio, antes
  de dar por hecho cualquier cambio.
