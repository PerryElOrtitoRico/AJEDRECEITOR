<!-- archivos: src/core/uci.ts | contexto: tests/uci.test.ts -->
# T04 · uci.ts

Completá los cinco `// TODO T04` de `src/core/uci.ts`. Es el protocolo UCI de ajedrez (lo que habla Stockfish por texto).

Para leer una línea: `const t = linea.trim().split(/\s+/)` y buscar con `t.indexOf('palabra')`.

## parsearInfo(linea)
1. Si `t[0]` no es `'info'`, devolver `null`.
2. `iDepth = t.indexOf('depth')`, `iPv = t.indexOf('pv')`. Si falta alguno, `null`.
3. `pv = t.slice(iPv + 1)`; `profundidad = Number(t[iDepth + 1])`. Si `pv` está vacío o `profundidad` no es un número finito, `null`.
4. Resultado `{ profundidad, pv }`. Si hay `score`: `t[iScore + 1]` es `'cp'` o `'mate'` y `t[iScore + 2]` el valor numérico; agregar `cp` o `mate` según corresponda. Las palabras `lowerbound` / `upperbound` se ignoran.
Ejemplo: `info depth 12 seldepth 18 score cp 34 nodes 1 pv e2e4 e7e5` → `{ profundidad: 12, cp: 34, pv: ['e2e4', 'e7e5'] }`.

## parsearBestmove(linea)
Si `t[0]` no es `'bestmove'`, `null`. `mejor = t[1]`; si no existe o es `'(none)'`, `null`. Si después hay `ponder` y una jugada, devolver `{ mejor, ponder }`; si no, `{ mejor }` (sin la propiedad `ponder`).

## comandoPosicion(fenInicial, ucis)
Base: `'position startpos'` si `fenInicial` es `null`, o `` `position fen ${fenInicial}` ``. Si `ucis` no está vacío, agregar `` ` moves ${ucis.join(' ')}` ``.

## comandoGo(opciones)
Partes `['go']`; si hay `movetimeMs`, agregar `'movetime'` y su valor; si hay `profundidad`, agregar `'depth'` y su valor; si no hubo ninguna, agregar `'depth', '8'`. Unir con espacios.
Ejemplos: `go movetime 300`, `go depth 8`, `go movetime 300 depth 8`.

## comandosNivel(opciones)
Primer elemento: `` `setoption name Skill Level value ${skill}` ``. Si hay `limitarElo`, agregar `'setoption name UCI_LimitStrength value true'` y `` `setoption name UCI_Elo value ${limitarElo}` ``.

No toques nada fuera de los cinco cuerpos marcados con `// TODO T04`.
