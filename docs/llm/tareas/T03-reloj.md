<!-- archivos: src/core/reloj.ts | contexto: src/core/tipos.ts, tests/reloj.test.ts -->
# T03 · reloj.ts

Completá los seis `// TODO T03` de `src/core/reloj.ts`. El reloj es **inmutable**: cada función devuelve un `Reloj` nuevo (nunca modifiques el que te pasan) y el tiempo llega siempre por el parámetro `ahoraMs` (milisegundos); no uses `Date.now()`.

## crearReloj({ baseSeg, incSeg })
`{ baseSeg, incSeg, restanteSeg: { blancas: baseSeg, negras: baseSeg }, turno: null, desdeMs: null }`.

## iniciar(r, color, ahoraMs)
Copia de `r` con `turno: color` y `desdeMs: ahoraMs` (copiar también `restanteSeg`).

## restante(r, color, ahoraMs)
1. `guardado = r.restanteSeg[color]`.
2. Si `r.turno !== color` o `r.desdeMs === null`, devolver `guardado`.
3. Si no, `Math.max(0, guardado - (ahoraMs - r.desdeMs) / 1000)`.

## jugada(r, ahoraMs)
Termina el turno actual.
1. Si `r.turno === null` o `r.desdeMs === null`, devolver `r` sin cambios.
2. `quedan = restante(r, r.turno, ahoraMs)`.
3. Si `quedan > 0`, el nuevo tiempo de quien movió es `quedan + r.incSeg`; si `quedan` es 0, queda en 0 (sin incremento).
4. Devolver un reloj nuevo con ese valor en `restanteSeg[r.turno]`, `turno` = el otro color y `desdeMs: ahoraMs`.

## caido(r, ahoraMs)
`'blancas'` si `restante(r, 'blancas', ahoraMs) <= 0`; si no, `'negras'` si el de negras es `<= 0`; si no, `null`.

## formato(seg)
Primero `s = Math.max(0, seg)`.
- Menos de 10 s: `` `0:0${(Math.floor(s * 10 + 1e-6) / 10).toFixed(1)}` ``. Ejemplos: `9.4` → `0:09.4`, `0` → `0:00.0`, `9.99` → `0:09.9`.
- 10 s o más: `t = Math.floor(s)`, `h` horas, `m` minutos, segundos con 2 dígitos. Si `h > 0`: `H:MM:SS` (`1:02:03`); si no, `M:SS` (`5:00`, `0:10`, `10:00`).

No toques nada fuera de los seis cuerpos marcados con `// TODO T03`.
