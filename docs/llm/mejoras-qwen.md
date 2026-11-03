# Mejoras para qwen/Gemma (TypeScript)

Una entrada por pedido: qué falló, por qué, qué se cambia.

## T01 (gemma, intentos: 1)
verde: Al primer pedido (115 s, 745 tokens, stop). tsc, 4 visibles y 8 ocultos OK; no tocó otras funciones.

## T02 (gemma + qwen (corr.), intentos: 3)
verde: Gemma: tsc falló por noUncheckedIndexedAccess (match[1..3] undefined, 3 errores). Corrección 1 (qwen) arregló 2 de 3 (dejó parseFloat(match[3])); corrección 2, con la línea exacta a reemplazar, verde. Regla: contra noUncheckedIndexedAccess decir en la tarea que use '?? 0' o Number(match[i] ?? '0').
