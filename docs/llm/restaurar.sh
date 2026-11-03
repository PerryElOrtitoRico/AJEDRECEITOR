#!/bin/bash
# Uso: docs/llm/restaurar.sh → deja src/ como en el último commit (descarta lo que escribió el modelo)
cd "$(dirname "$0")/../.."
git checkout -- src
