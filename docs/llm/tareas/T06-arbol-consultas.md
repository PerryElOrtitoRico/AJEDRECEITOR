<!-- archivos: src/core/arbol.ts | contexto: src/core/tipos.ts, tests/arbol.test.ts -->
# T06 · arbol.ts (a): consultas

Completá los cuatro `// TODO T06` de `src/core/arbol.ts`. El árbol es `Partida.raiz` (un `Nodo` con `hijos`); `hijos[0]` es la línea principal y el resto son ramas. Las funciones de consulta no modifican nada. Las funciones marcadas "lo completa otra subtarea" quedan como están. `clonar` y `padreDe` ya están hechas.

## buscarNodo(p, id)
Recorrido en profundidad desde `p.raiz`: devolver el nodo cuyo `id` coincide o `null`. Se sugiere una función auxiliar recursiva `buscarEn(nodo, id)` (sin exportar).

## camino(p, id)
Arreglo de nodos desde la raíz hasta el nodo `id` (ambos incluidos). Si el id no existe, `[]`. Recursivo: si `nodo.id === id` → `[nodo]`; si no, probar cada hijo y, si devuelve algo no vacío, devolver `[nodo, ...sub]`.

## lineaPrincipal(p)
Los nodos que se obtienen siguiendo `hijos[0]` desde la raíz, **sin incluir la raíz**. Sin jugadas → `[]`. Usar un bucle: `let actual = p.raiz.hijos[0]; while (actual !== undefined) { …push; actual = actual.hijos[0]; }`.

## contarPlies(p)
La cantidad de nodos de `lineaPrincipal(p)` (las ramas no cuentan).

No toques nada fuera de los cuatro cuerpos marcados con `// TODO T06`.
