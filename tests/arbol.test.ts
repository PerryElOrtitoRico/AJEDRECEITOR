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
