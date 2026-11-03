// Árbol de jugadas de una partida (con ramas). Inmutable: las funciones devuelven partidas nuevas.
import type { Nodo, Partida } from './tipos';

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

export function promoverRama(p: Partida, id: string): Partida | null {
	const copia = clonar(p);
	const padre = padreDe(copia.raiz, id);
	if (padre === null) return null;
	
	const i = padre.hijos.findIndex(h => h.id === id);
	if (i === -1) return null;
	
	const [nodo] = padre.hijos.splice(i, 1);
	if (nodo === undefined) return null;
	padre.hijos.unshift(nodo);
	
	return copia;
}

export function borrarRama(p: Partida, id: string): Partida | null {
	const copia = clonar(p);
	const padre = padreDe(copia.raiz, id);
	if (padre === null) return null;
	
	padre.hijos = padre.hijos.filter(h => h.id !== id);
	return copia;
}

export function siguienteId(p: Partida): string {
	let mayor = 0;
	function recursivo(nodo: Nodo): void {
		const num = Number(nodo.id.slice(1));
		if (num > mayor) mayor = num;
		for (const hijo of nodo.hijos) {
			recursivo(hijo);
		}
	}
	recursivo(p.raiz);
	return 'n' + (mayor + 1);
}
