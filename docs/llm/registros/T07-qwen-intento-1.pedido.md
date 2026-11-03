<!-- modelo qwen/qwen3.5-9b, temperatura 0.2, max_tokens 5678, razonamiento no -->

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
	throw new Error('T07: no implementado');
}

export function anotar(p: Partida, id: string, texto: string): Partida | null {
	throw new Error('T07: no implementado');
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

Completá los `// TODO T07`. Devolvé estos archivos completos, cada uno en su bloque: src/core/arbol.ts.
