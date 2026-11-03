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

<!-- 109 s · entrada 4001 · salida 980 · finish_reason stop -->
