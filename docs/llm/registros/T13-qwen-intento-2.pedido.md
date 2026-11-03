<!-- modelo qwen/qwen3.5-9b, temperatura 0.2, max_tokens 5937, razonamiento no -->

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

# T13 · importar-chesscom.ts

Completá los cuatro `// TODO T13`. Las respuestas JSON llegan como `unknown`: hay que revisar su forma antes de usarlas. Sin `any`; se sugiere una auxiliar `esObjeto(x: unknown): x is Record<string, unknown>` = `typeof x === 'object' && x !== null`.

## urlArchivos(usuario)
`` `https://api.chess.com/pub/player/${encodeURIComponent(usuario.toLowerCase())}/games/archives` ``.

## urlsDeMeses(json, desde?)
`json` es `{ archives: string[] }` con URLs como `https://api.chess.com/pub/player/x/games/2026/10`.
1. Si `json` no es objeto o `json.archives` no es un arreglo → `[]`.
2. Para cada elemento que sea texto: sacar el mes con `/(\d{4})\/(\d{2})\/?$/` → `"AAAA-MM"` (`${m[1]}-${m[2]}`). Si no coincide, descartarlo.
3. Si `desde` está definido, quedarse con los de mes `>= desde` (se comparan como texto; `desde` es `"AAAA-MM"`).
4. Ordenar de más viejo a más nuevo por ese mes y devolver las URLs originales (con su barra final si la tenían).

## pgnsDeMes(json)
`json` es `{ games: { url?: string, pgn?: string, … }[] }`.
1. Si no es objeto o `games` no es arreglo → `[]`.
2. Por cada elemento que sea objeto y tenga `pgn` de tipo texto **no vacío**: agregar `{ url: (texto o ''), pgn }`. Los demás se descartan.

## idChesscom(url)
Regex `/\/game\/(?:live|daily)\/(\d+)\/?(?:[?#].*)?$/`. Devuelve el grupo 1 (texto con los dígitos) o `null` si no coincide. Ejemplo: `https://www.chess.com/game/live/123456789` → `'123456789'`.

No toques nada fuera de los cuatro cuerpos marcados con `// TODO T13`.

---

# Archivos de solo lectura (no los devuelvas)

```ts
// tests/importar-chesscom.test.ts
import { describe, it, expect } from 'vitest';
import { urlArchivos, urlsDeMeses, pgnsDeMes, idChesscom } from '../src/core/importar-chesscom';

describe('T13 importar-chesscom (visibles)', () => {
	it('urlArchivos', () => {
		expect(urlArchivos('FrancoStechina')).toBe('https://api.chess.com/pub/player/francostechina/games/archives');
	});
	it('urlsDeMeses', () => {
		const json = { archives: ['https://api.chess.com/pub/player/x/games/2026/10', 'https://api.chess.com/pub/player/x/games/2026/08'] };
		expect(urlsDeMeses(json)).toEqual([
			'https://api.chess.com/pub/player/x/games/2026/08',
			'https://api.chess.com/pub/player/x/games/2026/10',
		]);
		expect(urlsDeMeses(json, '2026-09')).toEqual(['https://api.chess.com/pub/player/x/games/2026/10']);
	});
	it('pgnsDeMes', () => {
		const json = { games: [{ url: 'u1', pgn: 'P1' }, { url: 'u2' }] };
		expect(pgnsDeMes(json)).toEqual([{ url: 'u1', pgn: 'P1' }]);
	});
	it('idChesscom', () => {
		expect(idChesscom('https://www.chess.com/game/live/123456789')).toBe('123456789');
		expect(idChesscom('https://www.chess.com/otra')).toBe(null);
	});
});
```

---

# Archivos a completar

```ts
// src/core/importar-chesscom.ts
// Importación desde chess.com: URLs de la API pública y lectura de sus respuestas JSON. Funciones puras.

export interface PgnChesscom {
	url: string; // enlace de la partida ('' si no vino)
	pgn: string;
}

/**
 * Verifica si un valor es un objeto no nulo.
 */
const esObjeto = (x: unknown): x is Record<string, unknown> =>
	typeof x === 'object' && x !== null;

export function urlArchivos(usuario: string): string {
	return `https://api.chess.com/pub/player/${encodeURIComponent(usuario.toLowerCase())}/games/archives`;
}

export function urlsDeMeses(json: unknown, desde?: string): string[] {
	if (!esObjeto(json) || !Array.isArray(json.archives)) {
		return [];
	}

	const archives = json.archives;
	const meses: { url: string; mes: string }[] = [];
	const regex = /\/(\d{4})\/(\d{2})\/?$/;

	for (const item of archives) {
		if (typeof item === 'string') {
			const match = item.match(regex);
			if (match) {
				const anio = match[1];
				const mes = match[2];
				const mesStr = `${anio}-${mes}`;
				const urlOriginal = item.endsWith('/') ? item : item + '/';
				meses.push({ url: urlOriginal, mes: mesStr });
			}
		}
	}

	if (desde) {
		const desdeStr = desde.toUpperCase();
		const filtrados = meses.filter(m => m.mes >= desdeStr);
		return filtrados.map(m => m.url);
	}

	// Ordenar de más viejo a más nuevo (alfabéticamente funciona para AAAA-MM)
	meses.sort((a, b) => a.mes.localeCompare(b.mes));
	return meses.map(m => m.url);
}

export function pgnsDeMes(json: unknown): PgnChesscom[] {
	if (!esObjeto(json) || !Array.isArray(json.games)) {
		return [];
	}

	const games = json.games;
	const resultados: PgnChesscom[] = [];

	for (const game of games) {
		if (esObjeto(game) && typeof game.pgn === 'string' && game.pgn.trim().length > 0) {
			const url = typeof game.url === 'string' ? game.url : '';
			resultados.push({ url: url, pgn: game.pgn });
		}
	}

	return resultados;
}

export function idChesscom(url: string): string | null {
	const regex = /\/game\/(?:live|daily)\/(\d+)\/?(?:[?#].*)?$/;
	const match = url.match(regex);
	return match ? match[1] : null;
}
```

---

# Error al compilar o testear (corregilo)

```
src/core/importar-chesscom.ts: un error de tsc y tres de lógica.
1) tsc --noEmit: importar-chesscom.ts(72,17): error TS2322: Type 'string | undefined' is not assignable to type 'string | null' (noUncheckedIndexedAccess).   ← línea: return match ? match[1] : null;   Corrección: return match?.[1] ?? null;
2) Test tests/importar-chesscom.test.ts "urlsDeMeses": se esperaba ["https://api.chess.com/pub/player/x/games/2026/08", ".../2026/10"] (sin barra final) y recibió las mismas CON "/" al final. Contrato paso 4: "devolver las URLs originales (con su barra final si la tenían)". Línea que está mal: const urlOriginal = item.endsWith('/') ? item : item + '/';   Corrección: guardar `url: item` tal cual, sin agregar nada (meses.push({ url: item, mes: mesStr })).
3) Contrato pasos 3 y 4: primero filtrar por `desde` (si está definido) y DESPUÉS ordenar siempre; hoy con `desde` hacés return antes del sort. Además `desde` se compara tal cual (sin toUpperCase): `const filtrados = desde === undefined ? meses : meses.filter(m => m.mes >= desde);` luego `filtrados.sort((a, b) => a.mes.localeCompare(b.mes)); return filtrados.map(m => m.url);`
Dejá urlArchivos, pgnsDeMes y esObjeto como están. Devolvé el archivo completo.
```

Completá los `// TODO T13`. Devolvé estos archivos completos, cada uno en su bloque: src/core/importar-chesscom.ts.
