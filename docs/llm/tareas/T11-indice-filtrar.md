<!-- archivos: src/core/indice.ts | contexto: src/core/tipos.ts, tests/indice.test.ts -->
# T11 · indice.ts (c): resultado para mí y filtro

Completá los dos `// TODO T11` de `src/core/indice.ts`. `ResultadoParaMi` ya está definido en el archivo.

## resultadoParaMi(meta, misNombres)
Orden de decisión:
1. Si `meta.enCurso` → `'en curso'`.
2. `mios = misNombres.map(n => n.toLowerCase())`. `soyBlancas = mios.includes(meta.blancas.toLowerCase())`, `soyNegras` igual con `meta.negras`.
3. Si `soyBlancas === soyNegras` (ninguno o los dos colores son míos) → `'desconocido'`.
4. Si `meta.resultado === '1/2-1/2'` → `'tablas'`.
5. Si `meta.resultado === '*'` → `'desconocido'`.
6. `ganaronBlancas = meta.resultado === '1-0'`. Si `ganaronBlancas === soyBlancas` → `'victoria'`; si no → `'derrota'`.

## filtrar(indice, { resultado, misNombres })
Si `resultado` es `undefined`, devolver una copia de todo (`[...indice]`). Si no, `indice.filter(m => resultadoParaMi(m, misNombres) === resultado)`.

No toques nada fuera de los dos cuerpos marcados con `// TODO T11`.
