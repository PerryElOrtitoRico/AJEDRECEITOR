<!-- archivos: src/core/importar-lichess.ts | contexto: tests/importar-lichess.test.ts -->
# T12 · importar-lichess.ts

Completá los cuatro `// TODO T12`. Son funciones puras sobre texto.

## urlLichess(usuario, { desdeMs, max })
Base: `` `https://lichess.org/api/games/user/${encodeURIComponent(usuario)}?clocks=true&evals=false&opening=false` ``. Si `desdeMs !== undefined` agregar `` `&since=${desdeMs}` `` (también si es 0); si `max !== undefined` agregar `` `&max=${max}` `` (en ese orden).

## separarPartidas(texto)
Parte un PGN con muchas partidas en un arreglo de textos, uno por partida.
1. `lineas = texto.split(/\r?\n/)`.
2. Una línea **empieza una partida nueva** si `linea.trimStart().startsWith('[Event ')` y (es la primera línea o la línea anterior está vacía, `.trim() === ''`).
3. Al empezar una nueva, si lo acumulado hasta ahora tiene contenido (`acumulado.join('').trim() !== ''`), cerrar esa partida: `acumulado.join('\n').trim()` se agrega al resultado y se vacía el acumulado. Después se agrega la línea al acumulado.
4. Al final, cerrar la última si tiene contenido.
5. Texto vacío o solo espacios → `[]`.
Un `[Event ` dentro de un comentario, sin línea vacía antes, **no** corta.

## idLichess(cabecera)
1. Si `cabecera.GameId` existe y no es vacío, devolverlo.
2. Si no, probar `/lichess\.org\/(?:game\/)?([A-Za-z0-9]{8})(?:\/(?:white|black))?\/?$/` sobre `cabecera.Site ?? ''` y devolver el grupo 1.
3. Si nada coincide → `null`.
Ejemplos: `https://lichess.org/game/FxxYCveC` → `FxxYCveC`; `https://lichess.org/AbCdEfGh/black` → `AbCdEfGh`; `Chess.com` → `null`.

## marcarImportada(pgn, origen, id)
Agrega las etiquetas `[ImportId "<origen>:<id>"]` y `[Origen "<origen>"]` (en ese orden) justo después de la última etiqueta de la cabecera, sin duplicar las que ya estén.
1. `lineas = pgn.split('\n')`. Buscar la posición `ultima` de la última etiqueta de la cabecera: recorrer las líneas; saltear las vacías; si la línea (recortada) cumple `/^\[\w+\s+"/` es etiqueta (`ultima = i`); en la primera línea no vacía que no sea etiqueta, cortar.
2. `hay(clave)`: alguna línea recortada empieza con `` `[${clave} ` ``.
3. Armar `nuevas` con `[ImportId "…"]` si no `hay('ImportId')` y `[Origen "…"]` si no `hay('Origen')`.
4. Si `nuevas` está vacío, devolver `pgn` tal cual. Si no hay ninguna etiqueta (`ultima < 0`), devolver `nuevas.join('\n') + '\n\n' + pgn`. Si hay, `lineas.splice(ultima + 1, 0, ...nuevas)` y `lineas.join('\n')`.

No toques nada fuera de los cuatro cuerpos marcados con `// TODO T12`.
