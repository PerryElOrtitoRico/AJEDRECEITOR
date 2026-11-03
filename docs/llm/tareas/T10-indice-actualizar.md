<!-- archivos: src/core/indice.ts | contexto: src/core/tipos.ts, src/core/nombres.ts, tests/indice.test.ts -->
# T10 · indice.ts (b): actualizar y ordenar

Completá los dos `// TODO T10` de `src/core/indice.ts`. No modifiques los arreglos que recibís (devolvé arreglos nuevos). `esArchivoPartida` ya está importado de `./nombres`.

## actualizarIndice(viejo, listado)
`viejo` son las entradas guardadas (`MetaPartida[]`); `listado` los archivos que hay ahora en la carpeta (`Archivo[]`, con `nombre` y `modificado`). Devuelve `{ indice, aLeer, eliminados }`.
1. `porNombre = new Map(viejo.map(m => [m.archivo, m]))`.
2. Recorrer `listado` en orden. Ignorar los que `!esArchivoPartida(a.nombre)`. Anotar el nombre en un `Set` de presentes.
3. Si hay entrada previa con el **mismo** `modificado`: ponerla en `indice`.
4. Si no hay entrada previa o el `modificado` es otro: poner el nombre en `aLeer` (y **no** en `indice`).
5. `eliminados`: los `archivo` de `viejo` que no están en el conjunto de presentes.

## ordenar(indice)
Copia (`[...indice]`) ordenada con `sort`:
1. Una entrada con `fecha === ''` va después de una que tiene fecha.
2. Si las dos tienen fecha distinta: la más nueva primero (las fechas `AAAA-MM-DD` se comparan como texto).
3. Si empatan: mayor `modificado` primero (`b.modificado - a.modificado`). Esto también vale entre las que no tienen fecha.

No toques nada fuera de los dos cuerpos marcados con `// TODO T10`.
