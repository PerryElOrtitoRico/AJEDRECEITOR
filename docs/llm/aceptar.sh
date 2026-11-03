#!/bin/bash
# Uso: docs/llm/aceptar.sh Txx → guarda una copia de los archivos aceptados (para restaurar.sh)
cd "$(dirname "$0")/../.."
mkdir -p docs/llm/aceptados/"$1"
git diff --name-only -- src | while read f; do mkdir -p "docs/llm/aceptados/$1/$(dirname "$f")"; cp "$f" "docs/llm/aceptados/$1/$f"; done
git add src && git status --short src
