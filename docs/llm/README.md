# docs/llm — orquestación de qwen/Gemma

Método: `~/Escritorio/Hobbies/programacion/Proyectos/qwen-aprendizajes.md`. Plan: nota "Plan de implementación" del vault (Trabajo/Proyectos/Ajedrez).

## Cómo funciona una tarea
- `tareas/Txx-*.md`: la tarea. Cabecera `<!-- archivos: <los que el modelo devuelve> | contexto: <solo lectura> -->`.
- `src/core/*.ts`: esqueleto con `// TODO Txx` y `throw new Error('Txx: no implementado')`.
- `tests/*.test.ts`: tests **visibles** (los escribe Opus; el modelo los ve como contexto).
- `tests-ocultos/*.test.ts`: tests **ocultos** (Opus; nunca se mandan al modelo).
- `referencia/`: solución de Opus. Solo sirve para verificar que los tests están bien (`verificar_tarea.py`). **Nunca se manda ni se lee desde `pedir.py`.**
- Todos los `describe` empiezan con el id de la tarea (`T06 …`); `evaluar.sh Txx` corre `tsc` + `vitest -t Txx`.

## Ciclo
```bash
python3 docs/llm/verificar_tarea.py T01              # una vez, antes de mandar (con dependencias: T01 T09 T12)
docs/llm/modelo.sh gemma python3 docs/llm/pedir.py docs/llm/tareas/T01-nombres.md gemma 1
docs/llm/evaluar.sh T01                              # tsc + visibles + ocultos
docs/llm/modelo.sh qwen python3 docs/llm/pedir.py docs/llm/tareas/T01-nombres.md qwen 2 --error /ruta/error.txt   # corrección
docs/llm/aceptar.sh T01 ; git commit
```
Máximo 2 correcciones fallidas por tarea; después vuelve a Opus. Retrospectiva de cada pedido en `mejoras-qwen.md`.

## Orden y dependencias
T01 → T02 → T04 → T05 → T03 → T06 → T07 → T08 → T09 → T10 (usa T01) → T11 → T12 (usa T09 en los ocultos) → T13 → T14 (usa T09 en los ocultos).
Modelo: Gemma = T01 T02 T04 T05 T09 T11 T13 T14; qwen = T03 T06 T07 T08 T10 T12.

## Planilla
| Tarea | Modelo | Intentos | Resultado | Nota |
|---|---|---|---|---|
| T01 | gemma | 1 | verde | Al primer pedido (115 s, 745 tokens, stop). tsc, 4 visibles y 8 ocultos OK; no tocó otras funciones. |
| T02 | gemma + qwen (corr.) | 3 | verde | Gemma: tsc falló por noUncheckedIndexedAccess (match[1..3] undefined, 3 errores). Corrección 1 (qwen) arregló 2 de 3 (dejó parseFloat(match[3])); corrección 2, con la línea exacta a reemplazar, verde. Regla: contra noUncheckedIndexedAccess decir en la tarea que use '?? 0' o Number(match[i] ?? '0'). |
| T04 | gemma + qwen (corr.) | 2 | verde | Gemma: variable renombrada a medias (comando/command), 'as any' en bestmove y 131 líneas (>120). Una corrección de qwen (520 s, sin razonar) arregló los tres. Regla: decirle a Gemma 'sin as any: los campos opcionales se asignan directo' y el tope de líneas en la tarea. |
| T05 | gemma | 1 | verde | Al primer pedido (65 s, 439 tokens). tsc, visible y 5 ocultos OK. |
| T03 | qwen | 3 | verde | Intento 1: en jugada calculó 'quedan' pero no lo guardó en restanteSeg (4 tests rojos). Corrección 1 (error + contrato) devolvió lo mismo; corrección 2 con las líneas exactas a reemplazar, verde en 75 s. Regla: cuando devuelve el mismo bug, dar el bloque literal a cambiar; y en la tarea decir 'guardá el valor calculado en el campo'. |
| T06 | qwen | 1 | verde | Al primer pedido (64 s, 748 tokens). tsc, visibles y ocultos T06 OK; no tocó T07/T08. |
| T07 | qwen | 2 | devuelta a Opus (bloqueada por T08) | Intento 1: implementó también promoverRama/borrarRama/siguienteId (T08) y dejó id '' en vez de siguienteId(copia); el T06 anterior había borrado los '// TODO T07/T08' del esqueleto, por eso no los reconoció como ajenos. Corrección 1: código de T07 correcto (agregarJugada/anotar), pero sus ocultos llaman a siguienteId, que lanza 'T08: no implementado' hasta que T08 esté hecha: T07 no puede quedar verde antes que T08 (dependencia no declarada en el README). |
| T08 | qwen | 2 | devuelta a Opus | Intento 1: unshift equivocado + 'corrección' en el mismo cuerpo; dos errores TS2345 (noUncheckedIndexedAccess) en promoverRama. Corr. 1 (con las 3 líneas literales a poner) fallida: dejó 'padre.hijos.unshift(nodo)' sin el 'if (nodo === undefined) return null;' (error: arbol.ts(114,22) TS2345 Argument of type 'Nodo | undefined' is not assignable to parameter of type 'Nodo'; línea: padre.hijos.unshift(nodo);) y el archivo quedó en 139 líneas (>120). Con ese único fallo tsc, los 27 tests T06-T08 pasaban. Regla: ante noUncheckedIndexedAccess dar el patrón 'const x = arr[i]; if (x === undefined) return null;' ya en la tarea. |
| T09 | gemma + qwen (corr.) | 2 | verde | Gemma: sacó 'Origen, Resultado' del import del esqueleto (regla ya conocida) y 3 errores noUncheckedIndexedAccess en match[1]/match[2]. Una corrección de qwen con el import literal y el patrón '?? ""' (195 s): verde (13 tests). Archivo 130 líneas con los stubs de T10/T11 (>120 antes de implementarlos). |
