<!-- archivos: src/core/nombres.ts | contexto: tests/nombres.test.ts -->
# T01 · nombres.ts

Completá los cinco `// TODO T01` de `src/core/nombres.ts`. Son funciones puras sobre texto.

## limpiarNombre(s)
1. `s.normalize('NFD')` y quitar las marcas de acento (`/[̀-ͯ]/g`).
2. Pasar a minúsculas.
3. Cambiar cada tramo de caracteres que no sean `a-z` ni `0-9` por un solo `-`.
4. Quitar los guiones del principio y del final.
5. Cortar a 20 caracteres y volver a quitar guiones del final.
6. Si quedó vacío, devolver `'anonimo'`.

## nombreArchivo(fecha, blancas, negras, id8)
`AAAA-MM-DD_HHMMSS_<blancas>-vs-<negras>_<id8>.pgn`, con mes, día, hora, minuto y segundo de 2 dígitos (con cero a la izquierda) y los nombres pasados por `limpiarNombre`.
Ejemplo: `2026-10-30_153045_perry-vs-motor-nivel-3_a1b2c3d4.pgn`.

## esArchivoPartida(nombre)
`true` solo si termina en `.pgn`, no empieza con `.`, no contiene `.sync-conflict-` y no termina en `.tmp`.

## esConflicto(nombre) y originalDeConflicto(nombre)
Usá la expresión `/\.sync-conflict-\d{8}-\d{6}-[A-Z0-9]{7}\.pgn$/`.
- `esConflicto`: `true` si el nombre la cumple.
- `originalDeConflicto`: si la cumple, devolver el nombre reemplazando esa parte por `.pgn`; si no, `null`.
  Ejemplo: `x.sync-conflict-20261030-153045-ABCDEFG.pgn` → `x.pgn`.

No toques nada fuera de los cinco cuerpos marcados con `// TODO T01`.
