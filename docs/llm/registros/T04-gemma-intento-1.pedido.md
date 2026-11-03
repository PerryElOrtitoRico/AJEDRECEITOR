<!-- modelo google/gemma-4-e4b-qat, temperatura 0.2, max_tokens 6614, razonamiento no -->

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

# T04 · uci.ts

Completá los cinco `// TODO T04` de `src/core/uci.ts`. Es el protocolo UCI de ajedrez (lo que habla Stockfish por texto).

Para leer una línea: `const t = linea.trim().split(/\s+/)` y buscar con `t.indexOf('palabra')`.

## parsearInfo(linea)
1. Si `t[0]` no es `'info'`, devolver `null`.
2. `iDepth = t.indexOf('depth')`, `iPv = t.indexOf('pv')`. Si falta alguno, `null`.
3. `pv = t.slice(iPv + 1)`; `profundidad = Number(t[iDepth + 1])`. Si `pv` está vacío o `profundidad` no es un número finito, `null`.
4. Resultado `{ profundidad, pv }`. Si hay `score`: `t[iScore + 1]` es `'cp'` o `'mate'` y `t[iScore + 2]` el valor numérico; agregar `cp` o `mate` según corresponda. Las palabras `lowerbound` / `upperbound` se ignoran.
Ejemplo: `info depth 12 seldepth 18 score cp 34 nodes 1 pv e2e4 e7e5` → `{ profundidad: 12, cp: 34, pv: ['e2e4', 'e7e5'] }`.

## parsearBestmove(linea)
Si `t[0]` no es `'bestmove'`, `null`. `mejor = t[1]`; si no existe o es `'(none)'`, `null`. Si después hay `ponder` y una jugada, devolver `{ mejor, ponder }`; si no, `{ mejor }` (sin la propiedad `ponder`).

## comandoPosicion(fenInicial, ucis)
Base: `'position startpos'` si `fenInicial` es `null`, o `` `position fen ${fenInicial}` ``. Si `ucis` no está vacío, agregar `` ` moves ${ucis.join(' ')}` ``.

## comandoGo(opciones)
Partes `['go']`; si hay `movetimeMs`, agregar `'movetime'` y su valor; si hay `profundidad`, agregar `'depth'` y su valor; si no hubo ninguna, agregar `'depth', '8'`. Unir con espacios.
Ejemplos: `go movetime 300`, `go depth 8`, `go movetime 300 depth 8`.

## comandosNivel(opciones)
Primer elemento: `` `setoption name Skill Level value ${skill}` ``. Si hay `limitarElo`, agregar `'setoption name UCI_LimitStrength value true'` y `` `setoption name UCI_Elo value ${limitarElo}` ``.

No toques nada fuera de los cinco cuerpos marcados con `// TODO T04`.

---

# Archivos de solo lectura (no los devuelvas)

```ts
// tests/uci.test.ts
import { describe, it, expect } from 'vitest';
import { parsearInfo, parsearBestmove, comandoPosicion, comandoGo, comandosNivel } from '../src/core/uci';

describe('T04 uci (visibles)', () => {
	it('parsearInfo', () => {
		const i = parsearInfo('info depth 12 seldepth 18 score cp 34 nodes 1 pv e2e4 e7e5');
		expect(i).toEqual({ profundidad: 12, cp: 34, pv: ['e2e4', 'e7e5'] });
	});
	it('parsearBestmove', () => {
		expect(parsearBestmove('bestmove e2e4 ponder e7e5')).toEqual({ mejor: 'e2e4', ponder: 'e7e5' });
		expect(parsearBestmove('bestmove (none)')).toBe(null);
	});
	it('comandos', () => {
		expect(comandoPosicion(null, ['e2e4'])).toBe('position startpos moves e2e4');
		expect(comandoGo({ movetimeMs: 300 })).toBe('go movetime 300');
		expect(comandosNivel({ skill: 3 })).toEqual(['setoption name Skill Level value 3']);
	});
});
```

---

# Archivos a completar

```ts
// src/core/uci.ts
// Protocolo UCI: leer líneas del motor y armar comandos. Funciones puras sobre texto.

export interface InfoUci {
	profundidad: number;
	cp?: number;
	mate?: number;
	pv: string[];
}

export interface BestmoveUci {
	mejor: string;
	ponder?: string;
}

export interface OpcionesGo {
	movetimeMs?: number;
	profundidad?: number;
}

export interface OpcionesNivel {
	skill: number;
	limitarElo?: number;
}

export function parsearInfo(linea: string): InfoUci | null {
	// TODO T04
	throw new Error('T04: no implementado');
}

export function parsearBestmove(linea: string): BestmoveUci | null {
	// TODO T04
	throw new Error('T04: no implementado');
}

export function comandoPosicion(fenInicial: string | null, ucis: string[]): string {
	// TODO T04
	throw new Error('T04: no implementado');
}

export function comandoGo(opciones: OpcionesGo): string {
	// TODO T04
	throw new Error('T04: no implementado');
}

export function comandosNivel(opciones: OpcionesNivel): string[] {
	// TODO T04
	throw new Error('T04: no implementado');
}
```

Completá los `// TODO T04`. Devolvé estos archivos completos, cada uno en su bloque: src/core/uci.ts.
