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
	// TODO T06
	throw new Error('T06: no implementado');
}

export function camino(p: Partida, id: string): Nodo[] {
	// TODO T06
	throw new Error('T06: no implementado');
}

export function lineaPrincipal(p: Partida): Nodo[] {
	// TODO T06
	throw new Error('T06: no implementado');
}

export function contarPlies(p: Partida): number {
	// TODO T06
	throw new Error('T06: no implementado');
}

// --- Modificaciones (T07) ---

export function agregarJugada(
	p: Partida,
	idPadre: string,
	san: string,
	uci: string,
	fenNuevo: string,
): { partida: Partida; nodo: Nodo } | null {
	// TODO T07
	throw new Error('T07: no implementado');
}

export function anotar(p: Partida, id: string, texto: string): Partida | null {
	// TODO T07
	throw new Error('T07: no implementado');
}

// --- Ramas (T08) ---

export function promoverRama(p: Partida, id: string): Partida | null {
	// TODO T08
	throw new Error('T08: no implementado');
}

export function borrarRama(p: Partida, id: string): Partida | null {
	// TODO T08
	throw new Error('T08: no implementado');
}

export function siguienteId(p: Partida): string {
	// TODO T08
	throw new Error('T08: no implementado');
}
