<!-- archivos: src/core/arbol.ts | contexto: src/core/tipos.ts, tests/arbol.test.ts -->
# T08 · arbol.ts (c): ramas e ids

Completá los tres `// TODO T08` de `src/core/arbol.ts`. **No modifiques la partida que te pasan**: trabajá sobre `clonar(p)`. Usá `padreDe(copia.raiz, id)` (ya hecha) para encontrar el padre de un nodo; devuelve `null` si el id no existe o es la raíz.

## promoverRama(p, id)
1. `copia = clonar(p)`; `padre = padreDe(copia.raiz, id)`. Si `padre` es `null` → `null` (la raíz y los ids inexistentes no se promueven).
2. `i = padre.hijos.findIndex(h => h.id === id)`; sacar ese nodo con `splice(i, 1)` y ponerlo al principio con `unshift`.
3. Devolver `copia`. Si el nodo ya era `hijos[0]`, el resultado es igual a la partida original.

## borrarRama(p, id)
1. `copia = clonar(p)`; `padre = padreDe(copia.raiz, id)`. Si es `null` → `null` (la raíz no se puede borrar).
2. `padre.hijos = padre.hijos.filter(h => h.id !== id)` (se va el nodo y todo lo que cuelga de él).
3. Devolver `copia`.

## siguienteId(p)
`'n' + (mayor número usado + 1)`, mirando el `id` de **todos** los nodos del árbol (incluida la raíz `n0`). El número de un id es lo que sigue a la `n` (`Number(id.slice(1))`). Árbol solo con la raíz → `'n1'`. Se sugiere una auxiliar recursiva `mayorNumero(nodo)`.

No toques nada fuera de los tres cuerpos marcados con `// TODO T08`.
