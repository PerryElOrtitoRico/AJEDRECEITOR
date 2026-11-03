<!-- archivos: src/core/pista.ts | contexto: tests/pista.test.ts -->
# T05 · pista.ts

Completá los dos `// TODO T05` de `src/core/pista.ts`. La pista tiene dos pasos: la primera pulsación resalta la pieza a mover; la segunda, también la casilla de destino.

## siguientePista(previa, fen, mejorUci)
Devuelve un `EstadoPista` nuevo `{ fen, mejor: mejorUci, nivel }` (no modifica `previa`):
- `nivel` es `2` si `previa` no es `null` y `previa.fen === fen` (misma posición: se pulsó otra vez);
- en cualquier otro caso (sin previa o posición distinta) es `1`.
Nunca pasa de 2.

## casillasAResaltar(estado)
1. Si `estado.mejor.length < 4`, devolver `[]`.
2. `desde = estado.mejor.slice(0, 2)`, `hasta = estado.mejor.slice(2, 4)` (de `e7e8q` salen `e7` y `e8`).
3. Nivel 1 → `[desde]`; nivel 2 → `[desde, hasta]`.

No toques nada fuera de los dos cuerpos marcados con `// TODO T05`.
