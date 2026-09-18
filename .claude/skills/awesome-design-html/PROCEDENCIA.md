# De dónde sale esta skill

**awesome-design-html**, de yzfly — <https://github.com/yzfly/awesome-design-html> — MIT.
Copiada del commit `de25991`.

## Qué es (y qué no)

Una **biblioteca de referencias**, no un criterio. 118 páginas HTML de un solo
fichero, cada una reconstruyendo el sistema visual de una marca conocida:

    assets/web/   96 páginas de producto  (Stripe, Linear, Notion, Apple, Vercel,
                                           Figma, Airbnb, Cursor, Claude, Spotify,
                                           Tesla, Ferrari, BMW, Bilibili, Xiaomi…)
    assets/ios/   22 maquetas de app iOS  (Instagram, Spotify, TikTok, WhatsApp,
                                           Telegram, Netflix, Uber, Duolingo…)

Más una carta de 742 colores tradicionales chinos, con buscador y copia al
pulsar, en `assets/web/design.zhongguo-colors.html`.

Cada fichero es autónomo: los tokens en un bloque `:root`, las tipografías desde
Google Fonts, y los componentes montados con los colores, la tipografía y los
radios reales de esa marca.

Sirve para decir «el hero como el de Linear», «la tabla de precios al estilo
Stripe», «una maqueta de iPhone como la de Spotify» y que haya algo concreto
que mirar en vez de una descripción de memoria.

**No juzga**. No dice si algo está bien o mal, no detecta anti-patrones y no
tiene opinión. Para eso está `impeccable`, que es la que trae el criterio.
Ésta pone los ingredientes; aquélla dice si el plato está bueno.

## El aviso que va con esto

Son sistemas visuales de marcas ajenas, hechos para aprender de ellos. Copiar
uno entero para Scene Me sería cambiar una portada sin personalidad por la
personalidad de otro. Se usan para sacar piezas -cómo resuelven una jerarquía,
un espaciado, un degradado, una tabla de precios- no para calcarlas.

## Revisada antes de instalarla

- Los 118 HTML no traen `fetch`, ni `XMLHttpRequest`, ni `eval`, ni `import()`.
  Nada que llame a ninguna parte.
- Los únicos dominios que aparecen son `fonts.googleapis.com` y
  `fonts.gstatic.com` (las tipografías), `github.com` (los enlaces de origen) y
  cuatro enlaces a las webs de las propias marcas.
- No pide claves ni variables de entorno.

El instalador oficial es `npx skills add yzfly/awesome-design-html`, que ejecuta
código de terceros. Aquí se ha clonado el repositorio y copiado los ficheros.

## Pesa 6 MB

Son las 118 páginas. No entran en el build de Next ni se despliegan: viven en
`.claude/`, que sólo lee el agente. Si algún día estorban, se borran las que no
se usen; cada fichero es independiente de los demás.

## Actualizarla

    git clone --depth 1 https://github.com/yzfly/awesome-design-html
    cp awesome-design-html/SKILL.md awesome-design-html/LICENSE .claude/skills/awesome-design-html/
    cp -R awesome-design-html/assets .claude/skills/awesome-design-html/assets

y volver a dejar este fichero al lado.
