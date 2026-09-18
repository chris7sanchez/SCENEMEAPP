# De dónde sale esta skill

**Impeccable**, de Paul Bakaus — <https://github.com/pbakaus/impeccable> — Apache 2.0.
Copiada del commit `f2c7051`, versión `4.3.1` de la skill.

Lenguaje de diseño para agentes: un único comando `/impeccable` con 23
sub-comandos (`shape`, `craft`, `critique`, `audit`, `polish`, `bolder`,
`quieter`, `typeset`, `colorize`, `layout`, `animate`, `delight`, `clarify`,
`distill`, `harden`, `optimize`, `adapt`, `onboard`, `overdrive`, `init`,
`document`, `extract`, `live`) y una lista explícita de anti-patrones —las
fuentes de siempre, los degradados morados, las tarjetas dentro de tarjetas, el
rebote en las animaciones— para que la interfaz no salga con cara de plantilla.

## Qué se ha copiado

    .claude/skills/impeccable/SKILL.md        el cuerpo de la skill
    .claude/skills/impeccable/reference/      37 guías (una por sub-comando)
    .claude/skills/impeccable/scripts/        el lanzador y el navegador en vivo
    .claude/agents/impeccable-*.md            4 agentes que la skill invoca

El instalador oficial es `npx skills add pbakaus/impeccable`, que ejecuta código
de terceros. Aquí se ha clonado el repositorio y copiado los ficheros: el
resultado es el mismo sin ejecutar nada.

## LO QUE HAY QUE SABER ANTES DE USARLA

El paso 1 de la skill dice que hay que ejecutar `scripts/impeccable context`.
Ese lanzador **descarga un binario** desde las releases de GitHub la primera vez
y lo ejecuta. Es el motor que hace el análisis determinista (61 reglas) y el
`live` del navegador.

- Se guarda en `~/.impeccable`, fuera del repositorio.
- Comprueba el `sha256` de lo que baja antes de usarlo.
- No pide claves ni variables de entorno de nadie.

Aun así, es código que se descarga y se ejecuta, así que conviene saberlo. La
propia skill trae el camino alternativo por escrito: si el lanzador no está
disponible, se avisa en un mensaje y se leen `PRODUCT.md` y `DESIGN.md` a mano.
**Todo el criterio de diseño está en los markdown y funciona sin el binario.**

Para quitar esa parte y quedarse sólo con la guía escrita:

    rm -rf .claude/skills/impeccable/scripts

## Revisada antes de instalarla

Una skill son instrucciones que el agente va a seguir, así que se ha mirado:

- A dónde llama el lanzador: `github.com` (las releases) e `impeccable.style`
  (la documentación, y sólo dentro del texto de un error). Nada más.
- El `TOKEN` que aparece en `live-browser.js` no es una credencial: es el
  identificador de sesión del servidor local que monta el modo `live` en
  `localhost`.
- No pide `API_KEY` de nada, no lee variables de entorno ajenas, no escribe
  fuera del proyecto salvo la caché del binario en `~/.impeccable`.

## Alcance

Es de diseño de interfaz: portadas, paneles, formularios, estados vacíos,
tipografía, color, movimiento y microcopia. Para la portada, el login y el
backlot sirve. Para el parser de guiones o el reproductor de ensayo, no.

Convive con `design-taste-frontend`, que es más corta y está acotada a landings
y portfolios. Si las dos opinan sobre lo mismo, manda Impeccable: es la que
trae el criterio detallado y los anti-patrones concretos.

## Actualizarla

    git clone --depth 1 https://github.com/pbakaus/impeccable
    cp -R impeccable/plugin/skills/impeccable .claude/skills/impeccable
    cp impeccable/plugin/agents/impeccable-*.md .claude/agents/

y volver a dejar este fichero al lado.
