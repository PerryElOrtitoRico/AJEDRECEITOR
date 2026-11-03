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

function buscarEn(nodo: Nodo, id: string): Nodo | null {
	if (nodo.id === id) return nodo;
	for (const hijo of nodo.hijos) {
		const r = buscarEn(hijo, id);
		if (r !== null) return r;
	}
	return null;
}

export function buscarNodo(p: Partida, id: string): Nodo | null {
	return buscarEn(p.raiz, id);
}

function caminoEn(nodo: Nodo, id: string): Nodo[] {
	if (nodo.id === id) return [nodo];
	for (const hijo of nodo.hijos) {
		const sub = caminoEn(hijo, id);
		if (sub.length > 0) return [nodo, ...sub];
	}
	return [];
}

export function camino(p: Partida, id: string): Nodo[] {
	return caminoEn(p.raiz, id);
}

export function lineaPrincipal(p: Partida): Nodo[] {
	const linea: Nodo[] = [];
	let actual = p.raiz.hijos[0];
	while (actual !== undefined) {
		linea.push(actual);
		actual = actual.hijos[0];
	}
	return linea;
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
	const padreOriginal = buscarNodo(p, idPadre);
	if (padreOriginal === null) return null;
	const existente = padreOriginal.hijos.find((h) => h.san === san);
	if (existente !== undefined) return { partida: p, nodo: existente };
	const copia = clonar(p);
	const padre = buscarNodo(copia, idPadre);
	if (padre === null) return null;
	const nodo: Nodo = {
		id: siguienteId(copia),
		san,
		uci,
		fen: fenNuevo,
		comentario: '',
		relojSeg: null,
		hijos: [],
	};
	padre.hijos.push(nodo);
	return { partida: copia, nodo };
}

export function anotar(p: Partida, id: string, texto: string): Partida | null {
	if (buscarNodo(p, id) === null) return null;
	const copia = clonar(p);
	const nodo = buscarNodo(copia, id);
	if (nodo === null) return null;
	nodo.comentario = texto;
	return copia;
}

// --- Ramas (T08) ---

export function promoverRama(p: Partida, id: string): Partida | null {
	const copia = clonar(p);
	const padre = padreDe(copia.raiz, id);
	if (padre === null) return null;
	const i = padre.hijos.findIndex((h) => h.id === id);
	const [nodo] = padre.hijos.splice(i, 1);
	if (nodo !== undefined) padre.hijos.unshift(nodo);
	return copia;
}

export function borrarRama(p: Partida, id: string): Partida | null {
	const copia = clonar(p);
	const padre = padreDe(copia.raiz, id);
	if (padre === null) return null;
	padre.hijos = padre.hijos.filter((h) => h.id !== id);
	return copia;
}

function mayorNumero(nodo: Nodo): number {
	const propio = Number(nodo.id.replace(/^n/, ''));
	let mayor = Number.isFinite(propio) ? propio : 0;
	for (const hijo of nodo.hijos) mayor = Math.max(mayor, mayorNumero(hijo));
	return mayor;
}

export function siguienteId(p: Partida): string {
	return `n${mayorNumero(p.raiz) + 1}`;
}
