<!-- archivos: src/core/limpieza.ts | contexto: tests/limpieza.test.ts -->
# T02 · limpieza.ts

Completá los cuatro `// TODO T02` de `src/core/limpieza.ts`. Sirve para limpiar comentarios de partidas importadas (Lichess/chess.com).

Función auxiliar sugerida (sin exportar): `compactar(texto)` = cambiar cada tramo de 2 o más espacios por uno solo y recortar (`.trim()`).

## extraerReloj(comentario)
Devuelve `{ relojSeg, resto }`.
1. Buscar `/\[%clk\s+(\d+):(\d{1,2}):(\d{1,2}(?:\.\d+)?)\]/`.
2. Si no hay coincidencia: `{ relojSeg: null, resto: compactar(comentario) }`.
3. Si hay: `relojSeg` = horas×3600 + minutos×60 + segundos (los segundos pueden traer décimas: `Number(...)`).
4. `resto` = el comentario sin ese comando, pasado por `compactar`.
Ejemplos: `'[%clk 0:03:00]'` → `{ relojSeg: 180, resto: '' }`; `'[%eval 0.17] [%clk 0:03:00] buen cambio'` → `{ relojSeg: 180, resto: '[%eval 0.17] buen cambio' }`.

## quitarEvaluaciones(comentario)
Borrar los comandos `[%eval …]`, `[%emt …]`, `[%cal …]`, `[%csl …]` y `[%depth …]` (regex `/\[%(?:eval|emt|cal|csl|depth)\s[^\]]*\]/g`) y devolver `compactar(...)`. **No** borra `[%clk …]` ni otros corchetes del usuario como `[nota]`.

## esComentarioDeAnalisis(texto)
Con `texto.trim()`: `true` si cumple `/^(Inaccuracy|Mistake|Blunder)\. .* was best\.$/` o si es exactamente `Checkmate is now unavoidable.`; si no, `false`.

## limpiarNags(nags)
Devuelve un arreglo nuevo sin los NAG del 1 al 6 ni del 10 al 19. Los demás se conservan en su orden.

No toques nada fuera de los cuatro cuerpos marcados con `// TODO T02`.
