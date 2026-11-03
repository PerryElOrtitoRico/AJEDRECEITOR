<!-- modelo qwen/qwen3.5-9b, temperatura 0.2, max_tokens 6438, razonamiento no -->

## system

Sos un programador TypeScript (modo estricto, módulos ES) cuidadoso. Te paso archivos con funciones marcadas `// TODO Txx`: completá solo las que nombra la tarea; las marcadas "lo completa otra subtarea" quedan exactamente como están.
Reglas:
- Sin librerías, sin `any`, sin DOM, sin fs. Las funciones son puras: no modifican sus argumentos (devolvé valores nuevos) y no usan estado global.
- No cambies nombres, parámetros, tipos ni `import` que ya están, ni lo que ya está hecho. Podés agregar funciones auxiliares sin exportar. Los tipos del contrato (src/core/tipos.ts) no se redefinen.
- Las funciones no lanzan excepciones por entrada mala: devuelven `null` o el valor que indica la tarea.
- Mantené cada archivo en 120 líneas o menos. Nombres y comentarios en español.
- No crees ni modifiques otros archivos.
- Devolvé cada archivo completo (nada de '...') en su propio bloque de código, con la ruta en la primera línea como comentario: un bloque por archivo, nunca dos archivos en el mismo bloque. Ejemplo:
```ts
// src/core/ejemplo.ts
export function doble(n: number): number {
	return 2 * n;
}
```
- Sin explicaciones fuera de los bloques.

## user

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

---

# Archivos de solo lectura (no los devuelvas)

```ts
// tests/importar-lichess.test.ts
import { describe, it, expect } from 'vitest';
import { urlLichess, separarPartidas, idLichess, marcarImportada } from '../src/core/importar-lichess';

describe('T12 importar-lichess (visibles)', () => {
	it('urlLichess', () => {
		expect(urlLichess('Franco_Stechina', {})).toBe(
			'https://lichess.org/api/games/user/Franco_Stechina?clocks=true&evals=false&opening=false',
		);
		expect(urlLichess('x', { desdeMs: 5, max: 10 })).toBe(
			'https://lichess.org/api/games/user/x?clocks=true&evals=false&opening=false&since=5&max=10',
		);
	});
	it('separarPartidas', () => {
		const t = '[Event "a"]\n\n1. e4 *\n\n[Event "b"]\n\n1. d4 *\n';
		expect(separarPartidas(t)).toEqual(['[Event "a"]\n\n1. e4 *', '[Event "b"]\n\n1. d4 *']);
	});
	it('idLichess', () => {
		expect(idLichess({ GameId: 'AbCdEfGh' })).toBe('AbCdEfGh');
		expect(idLichess({ Site: 'https://lichess.org/game/FxxYCveC' })).toBe('FxxYCveC');
		expect(idLichess({ Site: '?' })).toBe(null);
	});
	it('marcarImportada', () => {
		const r = marcarImportada('[Event "a"]\n[Site "b"]\n\n1. e4 *', 'lichess', 'AbCdEfGh');
		expect(r).toBe('[Event "a"]\n[Site "b"]\n[ImportId "lichess:AbCdEfGh"]\n[Origen "lichess"]\n\n1. e4 *');
	});
});
```

---

# Archivos a completar

```ts
// src/core/importar-lichess.ts
// Importación desde Lichess: URL de la API, separar el PGN múltiple, identificar partidas. Funciones puras.

export function urlLichess(usuario: string, opciones: { desdeMs?: number; max?: number }): string {
	// TODO T12
	throw new Error('T12: no implementado');
}

export function separarPartidas(texto: string): string[] {
	// TODO T12
	throw new Error('T12: no implementado');
}

export function idLichess(cabecera: Record<string, string>): string | null {
	// TODO T12
	throw new Error('T12: no implementado');
}

export function marcarImportada(pgn: string, origen: 'lichess' | 'chesscom', id: string): string {
	// TODO T12
	throw new Error('T12: no implementado');
}
```

Completá los `// TODO T12`. Devolvé estos archivos completos, cada uno en su bloque: src/core/importar-lichess.ts.
