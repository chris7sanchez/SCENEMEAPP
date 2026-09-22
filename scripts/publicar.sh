#!/usr/bin/env bash
#
# PUBLICAR: una palabra en vez de tres comandos.
#
# Existe porque la conexión GitHub→Vercel está rota (la cuenta de GitHub está
# marcada como spam desde el 18/09/2026, ticket de soporte #4781187) y mientras
# eso dure nadie despliega solo: hay que subirlo desde este ordenador. Tres
# comandos a mano, en el orden correcto, cada vez. Y el orden importa: la vez
# que se saltó el `pull` se desplegó una copia vieja y se perdió media tarde
# buscando un fallo que ya estaba arreglado.
#
# Se usa así, desde la carpeta del proyecto:
#
#     npm run publicar
#
# Trae lo último de GitHub, lo despliega en producción, y luego PREGUNTA a la
# web si de verdad llegó: no da nada por bueno porque el comando no fallara.
#
# Cuando GitHub quite la marca, esto deja de hacer falta: cada push a main se
# desplegará solo. El script puede quedarse, no estorba.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "▸ 1/3  Trayendo lo último de GitHub…"
git checkout main
# --ff-only: si hay algo sin guardar o el historial se ha separado, para aquí
# en vez de mezclar a ciegas y desplegar un revoltijo.
git pull --ff-only origin main
echo "   estás en $(git rev-parse --short HEAD) — $(git log -1 --pretty=%s)"

echo
echo "▸ 2/3  Desplegando en producción…"
npx vercel --prod

echo
echo "▸ 3/3  Comprobando que los ficheros llegaron…"
# El propio servidor pide sus ficheros y contesta cuáles faltan. Es la única
# comprobación que vale: lo que se ve en local no dice nada de lo desplegado.
sleep 5
if veredicto=$(curl -fsS --max-time 30 https://scenemeapp.com/api/assets); then
    echo "$veredicto" | node -e '
        let e = ""; process.stdin.on("data", d => e += d).on("end", () => {
            const r = JSON.parse(e);
            console.log(`   versión desplegada: ${r.version}`);
            console.log(`   ${r.veredicto}`);
            process.exit(r.veredicto.startsWith("FALTAN") ? 1 : 0);
        });
    '
    echo
    echo "✅ Publicado: https://scenemeapp.com"
else
    echo "   ⚠️  No se ha podido preguntar a scenemeapp.com/api/assets."
    echo "      El despliegue puede estar bien igualmente; ábrela y míralo."
    exit 1
fi
