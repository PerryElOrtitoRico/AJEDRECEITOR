<!-- archivos: src/core/huella.ts | contexto: tests/huella.test.ts -->
# T14 · huella.ts

Completá los dos `// TODO T14`. La huella identifica una partida por sus jugadas, para detectar duplicados cuando no hay enlace (las partidas de chess.com pegadas no traen ID).

## normalizarMovetext(texto)
Deja solo las jugadas, separadas por un espacio.
1. Quitar comentarios: `texto.replace(/\{[^}]*\}/g, ' ')`.
2. Quitar variantes, también las anidadas: repetir `t = t.replace(/\([^()]*\)/g, ' ')` mientras el texto siga cambiando.
3. Quitar NAGs (`/\$\d+/g`) y números de jugada (`/\d+\.+/g`: `12.`, `12...`, `1.e4`) reemplazándolos por un espacio.
4. `t.split(/\s+/)`; a cada pieza quitarle los `!` y `?` del final (`/[!?]+$/`); descartar las vacías y los resultados `1-0`, `0-1`, `1/2-1/2`, `*`.
5. Unir con un espacio. Por cómo se corta, `8.\nfxe5` queda `fxe5`.
Ejemplo: `1. e4 {bien} e5 2. Nf3 $1 (2. f4) Nc6 1-0` → `e4 e5 Nf3 Nc6`. Texto vacío → `''`.

## huella(cabecera, movetext)
1. Fecha: auxiliar `fechaNormalizada(valor)`: si cumple `/^(\d{4})[.-](\d{2})[.-](\d{2})$/` → `AAAA-MM-DD`; si no → `''`. `fecha = fechaNormalizada(cabecera.Date) || fechaNormalizada(cabecera.UTCDate)`.
2. `base = [White en minúsculas, Black en minúsculas, fecha, normalizarMovetext(movetext)].join('|')` (un nombre que falte es `''`).
3. FNV-1a de 32 bits sobre los códigos de caracteres de `base`:
   `let h = 0x811c9dc5; for (let i = 0; i < base.length; i++) { h ^= base.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }`
4. Devolver `h.toString(16).padStart(8, '0')`.

No toques nada fuera de los dos cuerpos marcados con `// TODO T14`.
