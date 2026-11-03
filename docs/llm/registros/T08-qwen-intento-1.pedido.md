<!-- modelo qwen/qwen3.5-9b, temperatura 0.2, max_tokens 5440, razonamiento no -->

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

---

# Archivos de solo lectura (no los devuelvas)

```ts
// src/core/tipos.ts
// Contrato de tipos del núcleo. Lo escribe Opus; nadie más lo modifica ni lo redefine.

export type Color = 'blancas' | 'negras';
export type Resultado = '1-0' | '0-1' | '1/2-1/2' | '*';
export type Origen = 'app' | 'lichess' | 'chesscom' | 'manual';

export interface Nodo {
	id: string; // único en la partida: 'n0' (raíz), 'n1', 'n2'...
	san: string; // '' en la raíz
	uci: string; // '' en la raíz
	fen: string; // posición DESPUÉS de la jugada
	comentario: string; // '' si no hay
	relojSeg: number | null; // [%clk] tras la jugada, en segundos
	hijos: Nodo[]; // hijos[0] = línea principal; el resto son ramas
}

export interface Partida {
	cabecera: Record<string, string>; // Event, Site, Date, White, Black, Result, ImportId...
	raiz: Nodo;
}

export interface MetaPartida {
	archivo: string; // solo el nombre, sin carpeta
	fecha: string; // 'AAAA-MM-DD' o ''
	blancas: string;
	negras: string;
	resultado: Resultado;
	origen: Origen;
	plies: number; // jugadas de la línea principal
	modificado: number; // ms epoch
	enCurso: boolean;
}

export interface Archivo {
	nombre: string;
	modificado: number;
}

export interface Almacen {
	listar(): Promise<Archivo[]>;
	leer(nombre: string): Promise<string>;
	escribir(nombre: string, texto: string): Promise<void>; // atómico
	borrar(nombre: string): Promise<void>;
}
```

```ts
// tests/arbol.test.ts
import { describe, it, expect } from 'vitest';
import type { Nodo, Partida } from '../src/core/tipos';
import {
	buscarNodo, camino, lineaPrincipal, contarPlies,
	agregarJugada, anotar, promoverRama, borrarRama, siguienteId,
} from '../src/core/arbol';

function nodo(id: string, san: string, hijos: Nodo[] = []): Nodo {
	return { id, san, uci: '', fen: '', comentario: '', relojSeg: null, hijos };
}
// raíz → e4 → (e5 → Nf3), (c5)
function ejemplo(): Partida {
	const raiz = nodo('n0', '', [nodo('n1', 'e4', [nodo('n2', 'e5', [nodo('n3', 'Nf3')]), nodo('n4', 'c5')])]);
	return { cabecera: {}, raiz };
}

describe('T06 arbol: consultas (visibles)', () => {
	it('buscarNodo y camino', () => {
		const p = ejemplo();
		expect(buscarNodo(p, 'n3')?.san).toBe('Nf3');
		expect(buscarNodo(p, 'zz')).toBe(null);
		expect(camino(p, 'n3').map((n) => n.id)).toEqual(['n0', 'n1', 'n2', 'n3']);
		expect(camino(p, 'zz')).toEqual([]);
	});
	it('lineaPrincipal y contarPlies', () => {
		const p = ejemplo();
		expect(lineaPrincipal(p).map((n) => n.san)).toEqual(['e4', 'e5', 'Nf3']);
		expect(contarPlies(p)).toBe(3);
	});
});

describe('T07 arbol: agregar y anotar (visibles)', () => {
	it('agregarJugada agrega una rama al final', () => {
		const p = ejemplo();
		const r = agregarJugada(p, 'n1', 'd5', 'd7d5', 'fen');
		expect(r?.nodo.id).toBe('n5');
		expect(r?.partida.raiz.hijos[0]?.hijos.map((h) => h.san)).toEqual(['e5', 'c5', 'd5']);
		expect(buscarNodo(p, 'n5')).toBe(null);
	});
	it('anotar', () => {
		expect(buscarNodo(anotar(ejemplo(), 'n2', 'bien')!, 'n2')?.comentario).toBe('bien');
		expect(anotar(ejemplo(), 'zz', 'x')).toBe(null);
	});
});

describe('T08 arbol: ramas (visibles)', () => {
	it('promoverRama', () => {
		const r = promoverRama(ejemplo(), 'n4');
		expect(r?.raiz.hijos[0]?.hijos.map((h) => h.id)).toEqual(['n4', 'n2']);
	});
	it('borrarRama', () => {
		const r = borrarRama(ejemplo(), 'n2');
		expect(buscarNodo(r!, 'n3')).toBe(null);
		expect(borrarRama(ejemplo(), 'n0')).toBe(null);
	});
	it('siguienteId', () => {
		expect(siguienteId(ejemplo())).toBe('n5');
	});
});
```

---

# Archivos a completar

```ts
// src/core/arbol.ts
// Árbol de jugadas de una partida (con ramas). Inmutable: las funciones devuelven partidas nuevas.
import type { Nodo, Partida } from './tipos';

// Ya hechas (no las cambies): copia profunda y búsqueda del padre de un nodo.
function clonar(p: Partida): Partida {
	return structuredClone(p);
}

function padreDe(raiz: Nodo, id: string): Nodo | null {
	for (const hijo of raiz.hijos) {
		if (hijo.id === id) return raiz;
		const encontrado = padreDe(hijo, id);
		if (encontrado !== null) return encontrado;
	}
	return null;
}

// --- Consultas (T06) ---

export function buscarNodo(p: Partida, id: string): Nodo | null {
	function buscarEn(nodo: Nodo, id: string): Nodo | null {
		if (nodo.id === id) return nodo;
		for (const hijo of nodo.hijos) {
			const encontrado = buscarEn(hijo, id);
			if (encontrado !== null) return encontrado;
		}
		return null;
	}
	return buscarEn(p.raiz, id);
}

export function camino(p: Partida, id: string): Nodo[] {
	const nodo = buscarNodo(p, id);
	if (!nodo) return [];
	
	function recursivo(nodoActual: Nodo): Nodo[] | null {
		if (nodoActual.id === id) return [nodoActual];
		for (const hijo of nodoActual.hijos) {
			const sub = recursivo(hijo);
			if (sub !== null) return [nodoActual, ...sub];
		}
		return null;
	}
	
	const resultado = recursivo(p.raiz);
	return resultado ? resultado : [];
}

export function lineaPrincipal(p: Partida): Nodo[] {
	let actual = p.raiz.hijos[0];
	const resultado: Nodo[] = [];
	while (actual !== undefined) {
		resultado.push(actual);
		actual = actual.hijos[0];
	}
	return resultado;
}

export function contarPlies(p: Partida): number {
	return lineaPrincipal(p).length;
}

// --- Modificaciones (T07) ---

export function agregarJugada(
	p: Partida,
	idPadre: string,
	san: string,
	uci: string,
	fenNuevo: string,
): { partida: Partida; nodo: Nodo } | null {
	const padre = buscarNodo(p, idPadre);
	if (!padre) return null;

	const hijoExistente = padre.hijos.find((h) => h.san === san);
	if (hijoExistente !== undefined) {
		return { partida: p, nodo: hijoExistente };
	}

	const copia = clonar(p);
	const padreCopia = buscarNodo(copia, idPadre);
	if (!padreCopia) return null;

	const nuevoNodo: Nodo = {
		id: siguienteId(copia),
		san,
		uci,
		fen: fenNuevo,
		comentario: '',
		relojSeg: null,
		hijos: [],
	};

	padreCopia.hijos.push(nuevoNodo);
	return { partida: copia, nodo: nuevoNodo };
}

export function anotar(p: Partida, id: string, texto: string): Partida | null {
	const nodo = buscarNodo(p, id);
	if (!nodo) return null;

	const copia = clonar(p);
	const nodoCopia = buscarNodo(copia, id);
	if (!nodoCopia) return null;

	nodoCopia.comentario = texto;
	return copia;
}

// --- Ramas (T08) ---

export function promoverRama(p: Partida, id: string): Partida | null {
	throw new Error('T08: no implementado');
}

export function borrarRama(p: Partida, id: string): Partida | null {
	throw new Error('T08: no implementado');
}

export function siguienteId(p: Partida): string {
	throw new Error('T08: no implementado');
}
```

Completá los `// TODO T08`. Devolvé estos archivos completos, cada uno en su bloque: src/core/arbol.ts.
