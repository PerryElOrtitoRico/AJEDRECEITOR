#!/bin/bash
# Uso: docs/llm/evaluar.sh Txx   → tsc + vitest de esa tarea (visibles y ocultos; los describe empiezan con el id)
cd "$(dirname "$0")/../.."
. ~/.nvm/nvm.sh >/dev/null 2>&1
npx tsc --noEmit 2>&1 | head -40
[ "${PIPESTATUS[0]}" = 0 ] || { echo "TSC: FALLÓ"; exit 1; }
npx vitest run -t "$1" 2>&1 | tail -60
exit "${PIPESTATUS[0]}"
