#!/bin/bash
#
# Arranque de las sesiones de Claude Code en la web.
#
# Cada sesión en la nube empieza con el repositorio recién clonado y sin
# node_modules: ni las pruebas (vitest), ni el linter (eslint), ni los tipos
# (tsc) funcionan hasta que alguien hace `npm install`. Esto lo hace solo, antes
# de que empiece la sesión.
#
# Sólo corre en la nube. En el Mac ya hay node_modules y no hace falta tocarlos.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# Playwright está en devDependencies para las comprobaciones con navegador,
# pero el contenedor ya trae Chromium. Sin esto, npm se bajaría otro de
# cientos de MB en cada arranque.
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# `npm install` y no `npm ci`: el contenedor se guarda en caché al terminar este
# script, y `npm ci` borra node_modules entero cada vez, tirando esa caché.
# `install` sólo añade lo que falta, así que la segunda vez es casi instantáneo.
npm install --no-audit --no-fund --loglevel=error
