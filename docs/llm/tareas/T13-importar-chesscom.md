<!-- archivos: src/core/importar-chesscom.ts | contexto: tests/importar-chesscom.test.ts -->
# T13 · importar-chesscom.ts

Completá los cuatro `// TODO T13`. Las respuestas JSON llegan como `unknown`: hay que revisar su forma antes de usarlas. Sin `any`; se sugiere una auxiliar `esObjeto(x: unknown): x is Record<string, unknown>` = `typeof x === 'object' && x !== null`.

## urlArchivos(usuario)
`` `https://api.chess.com/pub/player/${encodeURIComponent(usuario.toLowerCase())}/games/archives` ``.

## urlsDeMeses(json, desde?)
`json` es `{ archives: string[] }` con URLs como `https://api.chess.com/pub/player/x/games/2026/10`.
1. Si `json` no es objeto o `json.archives` no es un arreglo → `[]`.
2. Para cada elemento que sea texto: sacar el mes con `/(\d{4})\/(\d{2})\/?$/` → `"AAAA-MM"` (`${m[1]}-${m[2]}`). Si no coincide, descartarlo.
3. Si `desde` está definido, quedarse con los de mes `>= desde` (se comparan como texto; `desde` es `"AAAA-MM"`).
4. Ordenar de más viejo a más nuevo por ese mes y devolver las URLs originales (con su barra final si la tenían).

## pgnsDeMes(json)
`json` es `{ games: { url?: string, pgn?: string, … }[] }`.
1. Si no es objeto o `games` no es arreglo → `[]`.
2. Por cada elemento que sea objeto y tenga `pgn` de tipo texto **no vacío**: agregar `{ url: (texto o ''), pgn }`. Los demás se descartan.

## idChesscom(url)
Regex `/\/game\/(?:live|daily)\/(\d+)\/?(?:[?#].*)?$/`. Devuelve el grupo 1 (texto con los dígitos) o `null` si no coincide. Ejemplo: `https://www.chess.com/game/live/123456789` → `'123456789'`.

No toques nada fuera de los cuatro cuerpos marcados con `// TODO T13`.
