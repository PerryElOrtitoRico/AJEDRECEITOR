# Mejoras para qwen/Gemma (TypeScript)

Una entrada por pedido: qué falló, por qué, qué se cambia.

## T01 (gemma, intentos: 1)
verde: Al primer pedido (115 s, 745 tokens, stop). tsc, 4 visibles y 8 ocultos OK; no tocó otras funciones.

## T02 (gemma + qwen (corr.), intentos: 3)
verde: Gemma: tsc falló por noUncheckedIndexedAccess (match[1..3] undefined, 3 errores). Corrección 1 (qwen) arregló 2 de 3 (dejó parseFloat(match[3])); corrección 2, con la línea exacta a reemplazar, verde. Regla: contra noUncheckedIndexedAccess decir en la tarea que use '?? 0' o Number(match[i] ?? '0').

## T04 (gemma + qwen (corr.), intentos: 2)
verde: Gemma: variable renombrada a medias (comando/command), 'as any' en bestmove y 131 líneas (>120). Una corrección de qwen (520 s, sin razonar) arregló los tres. Regla: decirle a Gemma 'sin as any: los campos opcionales se asignan directo' y el tope de líneas en la tarea.

## T05 (gemma, intentos: 1)
verde: Al primer pedido (65 s, 439 tokens). tsc, visible y 5 ocultos OK.

## T03 (qwen, intentos: 3)
verde: Intento 1: en jugada calculó 'quedan' pero no lo guardó en restanteSeg (4 tests rojos). Corrección 1 (error + contrato) devolvió lo mismo; corrección 2 con las líneas exactas a reemplazar, verde en 75 s. Regla: cuando devuelve el mismo bug, dar el bloque literal a cambiar; y en la tarea decir 'guardá el valor calculado en el campo'.

## T06 (qwen, intentos: 1)
verde: Al primer pedido (64 s, 748 tokens). tsc, visibles y ocultos T06 OK; no tocó T07/T08.

## T07 (qwen, intentos: 2)
devuelta a Opus (bloqueada por T08): Intento 1: implementó también promoverRama/borrarRama/siguienteId (T08) y dejó id '' en vez de siguienteId(copia); el T06 anterior había borrado los '// TODO T07/T08' del esqueleto, por eso no los reconoció como ajenos. Corrección 1: código de T07 correcto (agregarJugada/anotar), pero sus ocultos llaman a siguienteId, que lanza 'T08: no implementado' hasta que T08 esté hecha: T07 no puede quedar verde antes que T08 (dependencia no declarada en el README).

## T08 (qwen, intentos: 2)
devuelta a Opus: Intento 1: unshift equivocado + 'corrección' en el mismo cuerpo; dos errores TS2345 (noUncheckedIndexedAccess) en promoverRama. Corr. 1 (con las 3 líneas literales a poner) fallida: dejó 'padre.hijos.unshift(nodo)' sin el 'if (nodo === undefined) return null;' (error: arbol.ts(114,22) TS2345 Argument of type 'Nodo | undefined' is not assignable to parameter of type 'Nodo'; línea: padre.hijos.unshift(nodo);) y el archivo quedó en 139 líneas (>120). Con ese único fallo tsc, los 27 tests T06-T08 pasaban. Regla: ante noUncheckedIndexedAccess dar el patrón 'const x = arr[i]; if (x === undefined) return null;' ya en la tarea.

## T09 (gemma + qwen (corr.), intentos: 2)
verde: Gemma: sacó 'Origen, Resultado' del import del esqueleto (regla ya conocida) y 3 errores noUncheckedIndexedAccess en match[1]/match[2]. Una corrección de qwen con el import literal y el patrón '?? ""' (195 s): verde (13 tests). Archivo 130 líneas con los stubs de T10/T11 (>120 antes de implementarlos).

## T10 (qwen, intentos: 3)
verde: Intento 1 (304 s): actualizarIndice no llenaba 'indice' y ordenar al revés (2 errores de lógica). Corr. 1 arregló actualizarIndice pero dejó fecha ascendente (a.fecha.localeCompare(b.fecha)); corr. 2 con la línea literal a reemplazar: verde. Regla: en comparadores 'más nuevo primero', escribir en la tarea 'b.fecha.localeCompare(a.fecha)'. Archivo 137 líneas (>120) con T11 pendiente.

## T11 (gemma, intentos: 1)
verde: Al primer pedido (267 s, 1696 tokens). tsc y 32 tests T09-T11 OK; solo tocó los dos cuerpos de T11. indice.ts queda en 164 líneas (T09+T10+T11 juntas: el tope de 120 por archivo no es alcanzable).

## T12 (qwen, intentos: 2)
verde: Intento 1: 12 errores tsc por noUncheckedIndexedAccess (lineas[i], match[1]) + typo de variable + lógica de marcarImportada (hay() solo miraba la última etiqueta, agregó líneas vacías). Una corrección con cada arreglo literal (90 s): verde. Regla: dar en TODAS las tareas el patrón noUncheckedIndexedAccess (if (x === undefined) continue; ?? '').
