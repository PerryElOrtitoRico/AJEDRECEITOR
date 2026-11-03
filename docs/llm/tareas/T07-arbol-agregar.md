<!-- archivos: src/core/arbol.ts | contexto: src/core/tipos.ts, tests/arbol.test.ts -->
# T07 · arbol.ts (b): agregar jugadas y anotar

Completá los dos `// TODO T07` de `src/core/arbol.ts`. **No modifiques la partida que te pasan**: trabajá sobre `clonar(p)`. `buscarNodo` ya está hecho (T06); `siguienteId` lo completa otra subtarea (T08) pero ya podés llamarlo.

## agregarJugada(p, idPadre, san, uci, fenNuevo)
Devuelve `{ partida, nodo }` o `null`.
1. `padre = buscarNodo(p, idPadre)`. Si es `null` → `null`.
2. Si `padre.hijos` ya tiene un hijo con ese `san`: devolver `{ partida: p, nodo: ese hijo }` sin copiar ni duplicar.
3. `copia = clonar(p)` y `padreCopia = buscarNodo(copia, idPadre)` (si es `null` → `null`).
4. Crear el nodo `{ id: siguienteId(copia), san, uci, fen: fenNuevo, comentario: '', relojSeg: null, hijos: [] }`.
5. `padreCopia.hijos.push(nodo)` (al **final**: queda como rama, no como línea principal).
6. Devolver `{ partida: copia, nodo }`.

## anotar(p, id, texto)
1. Si `buscarNodo(p, id)` es `null` → `null`.
2. `copia = clonar(p)`; `nodo = buscarNodo(copia, id)`; `nodo.comentario = texto`.
3. Devolver `copia`.

No toques nada fuera de los dos cuerpos marcados con `// TODO T07`.
