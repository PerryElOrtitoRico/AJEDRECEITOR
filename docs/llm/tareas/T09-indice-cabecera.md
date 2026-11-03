<!-- archivos: src/core/indice.ts | contexto: src/core/tipos.ts, tests/indice.test.ts -->
# T09 · indice.ts (a): cabecera y metadatos

Completá los dos `// TODO T09` de `src/core/indice.ts`. Lo demás ("lo completa otra subtarea") queda como está. Los tipos `MetaPartida`, `Origen` y `Resultado` están en `tipos.ts` (ya importados o importalos de ahí).

## cabeceraDePgn(texto)
Lee las etiquetas `[Clave "Valor"]` del **primer** juego de un texto PGN, sin leer las jugadas. Devuelve `Record<string, string>`.
1. `texto.split(/\r?\n/)`; cada línea se recorta con `.trim()` (hay archivos que empiezan con espacios o tabulaciones).
2. Las líneas vacías se saltean.
3. Una línea es etiqueta si cumple `/^\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]\s*$/`. Guardar `cab[clave] = valor` y contar las etiquetas vistas.
4. Dentro del valor, `\"` pasa a `"` y `\\` a `\` (`.replace(/\\(["\\])/g, '$1')`).
5. Si una línea no vacía **no** es etiqueta y ya se vio al menos una etiqueta: cortar el bucle (empezaron las jugadas; no se leen más etiquetas del segundo juego). Si todavía no se vio ninguna, seguir.
6. Texto vacío o sin etiquetas → `{}`.

## metaDesdeCabecera(archivo, modificado, cabecera, plies)
Arma un `MetaPartida`:
- `archivo`, `modificado`, `plies`: tal cual.
- `fecha`: auxiliar `fechaNormalizada(valor)`: si `valor` cumple `/^(\d{4})[.-](\d{2})[.-](\d{2})$/` → `AAAA-MM-DD` (con guiones); si no (`????.??.??`, `2026.??.??`, `undefined`) → `''`. `fecha = fechaNormalizada(cabecera.Date) || fechaNormalizada(cabecera.UTCDate)`.
- `blancas` = `cabecera.White ?? '?'`; `negras` = `cabecera.Black ?? '?'`.
- `resultado`: `cabecera.Result` si es exactamente `'1-0'`, `'0-1'` o `'1/2-1/2'`; cualquier otra cosa o ausente → `'*'`.
- `origen`: si `ImportId` empieza con `lichess:` → `'lichess'`; si empieza con `chesscom:` → `'chesscom'`; si no, si `Origen` es uno de `'app' | 'lichess' | 'chesscom' | 'manual'` → ese; si no → `'app'`.
- `enCurso`: `cabecera.EnCurso === '1'`.

No toques nada fuera de los dos cuerpos marcados con `// TODO T09`.
