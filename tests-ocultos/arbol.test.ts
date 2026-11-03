import { describe, it, expect } from 'vitest';
import type { Nodo, Partida } from '../src/core/tipos';
import {
	buscarNodo, camino, lineaPrincipal, contarPlies,
	agregarJugada, anotar, promoverRama, borrarRama, siguienteId,
} from '../src/core/arbol';

function nodo(id: string, san: string, hijos: Nodo[] = []): Nodo {
	return { id, san, uci: san, fen: 'fen-' + id, comentario: '', relojSeg: null, hijos };
}
function ejemplo(): Partida {
	const raiz = nodo('n0', '', [
		nodo('n1', 'e4', [
			nodo('n2', 'e5', [nodo('n3', 'Nf3', [nodo('n6', 'Nc6')]), nodo('n7', 'f4', [nodo('n8', 'exf4')])]),
			nodo('n4', 'c5'),
		]),
		nodo('n5', 'd4'),
	]);
	return { cabecera: { White: 'a' }, raiz };
}
function ids(n: Nodo): string[] {
	return [n.id, ...n.hijos.flatMap(ids)];
}
function fotos(p: Partida): string {
	return JSON.stringify(p);
}
const vacia = (): Partida => ({ cabecera: {}, raiz: nodo('n0', '') });

describe('T06 arbol: consultas (ocultos)', () => {
	it('buscarNodo encuentra en ramas profundas', () => {
		const p = ejemplo();
		expect(buscarNodo(p, 'n8')?.san).toBe('exf4');
		expect(buscarNodo(p, 'n0')).toBe(p.raiz);
		expect(buscarNodo(p, 'n5')?.san).toBe('d4');
	});
	it('camino por una rama', () => {
		expect(camino(ejemplo(), 'n8').map((n) => n.san)).toEqual(['', 'e4', 'e5', 'f4', 'exf4']);
		expect(camino(ejemplo(), 'n0').map((n) => n.id)).toEqual(['n0']);
	});
	it('lineaPrincipal no incluye la raíz ni las ramas', () => {
		expect(lineaPrincipal(ejemplo()).map((n) => n.id)).toEqual(['n1', 'n2', 'n3', 'n6']);
		expect(lineaPrincipal(vacia())).toEqual([]);
	});
	it('contarPlies no cuenta ramas', () => {
		expect(contarPlies(ejemplo())).toBe(4);
		expect(contarPlies(vacia())).toBe(0);
	});
});

describe('T07 arbol: agregar y anotar (ocultos)', () => {
	it('agregar la misma jugada dos veces no duplica', () => {
		const a = agregarJugada(ejemplo(), 'n1', 'Nf6', 'g8f6', 'f')!;
		const b = agregarJugada(a.partida, 'n1', 'Nf6', 'g8f6', 'f')!;
		expect(b.nodo.id).toBe(a.nodo.id);
		expect(ids(b.partida.raiz).length).toBe(ids(a.partida.raiz).length);
	});
	it('agregar una jugada que ya existe devuelve el hijo existente', () => {
		const p = ejemplo();
		const r = agregarJugada(p, 'n1', 'c5', 'c7c5', 'otro')!;
		expect(r.nodo.id).toBe('n4');
		expect(r.nodo.fen).toBe('fen-n4');
	});
	it('el nodo nuevo queda vacío y con id nuevo', () => {
		const r = agregarJugada(ejemplo(), 'n6', 'Bb5', 'f1b5', 'fenX')!;
		expect(r.nodo).toEqual({ id: 'n9', san: 'Bb5', uci: 'f1b5', fen: 'fenX', comentario: '', relojSeg: null, hijos: [] });
		expect(buscarNodo(r.partida, 'n6')?.hijos.map((h) => h.id)).toEqual(['n9']);
	});
	it('ramas dentro de ramas', () => {
		const a = agregarJugada(ejemplo(), 'n8', 'Nf3', 'g1f3', 'f')!;
		const b = agregarJugada(a.partida, 'n8', 'd4', 'd2d4', 'f')!;
		expect(camino(b.partida, b.nodo.id).map((n) => n.san)).toEqual(['', 'e4', 'e5', 'f4', 'exf4', 'd4']);
		expect(new Set(ids(b.partida.raiz)).size).toBe(ids(b.partida.raiz).length);
	});
	it('padre inexistente', () => {
		expect(agregarJugada(ejemplo(), 'nope', 'e4', 'e2e4', 'f')).toBe(null);
		expect(anotar(ejemplo(), 'nope', 'x')).toBe(null);
	});
	it('anotar reemplaza el comentario y no toca el original', () => {
		const p = ejemplo();
		const antes = fotos(p);
		const a = anotar(p, 'n3', 'primero')!;
		const b = anotar(a, 'n3', 'segundo')!;
		expect(buscarNodo(b, 'n3')?.comentario).toBe('segundo');
		expect(buscarNodo(a, 'n3')?.comentario).toBe('primero');
		expect(fotos(p)).toBe(antes);
		expect(anotar(b, 'n3', '')!.raiz.hijos[0]?.hijos[0]?.hijos[0]?.comentario).toBe('');
	});
	it('agregar no modifica la partida original', () => {
		const p = ejemplo();
		const antes = fotos(p);
		agregarJugada(p, 'n1', 'Nf6', 'g8f6', 'f');
		expect(fotos(p)).toBe(antes);
	});
});

describe('T08 arbol: ramas (ocultos)', () => {
	it('promover una rama profunda', () => {
		const r = promoverRama(ejemplo(), 'n7')!;
		expect(buscarNodo(r, 'n2')?.hijos.map((h) => h.id)).toEqual(['n7', 'n3']);
		expect(lineaPrincipal(r).map((n) => n.id)).toEqual(['n1', 'n2', 'n7', 'n8']);
	});
	it('promover la línea principal no cambia nada', () => {
		const p = ejemplo();
		expect(fotos(promoverRama(p, 'n1')!)).toBe(fotos(p));
		expect(fotos(promoverRama(p, 'n3')!)).toBe(fotos(p));
	});
	it('promover raíz o inexistente', () => {
		expect(promoverRama(ejemplo(), 'n0')).toBe(null);
		expect(promoverRama(ejemplo(), 'nope')).toBe(null);
	});
	it('borrar el nodo del medio de la línea principal quita todo lo que cuelga', () => {
		const r = borrarRama(ejemplo(), 'n2')!;
		expect(ids(r.raiz)).toEqual(['n0', 'n1', 'n4', 'n5']);
		expect(contarPlies(r)).toBe(2);
	});
	it('la raíz no se borra y un id inexistente da null', () => {
		expect(borrarRama(ejemplo(), 'n0')).toBe(null);
		expect(borrarRama(ejemplo(), 'nope')).toBe(null);
	});
	it('borrar y promover no modifican el original', () => {
		const p = ejemplo();
		const antes = fotos(p);
		borrarRama(p, 'n2');
		promoverRama(p, 'n4');
		expect(fotos(p)).toBe(antes);
	});
	it('siguienteId usa el mayor número', () => {
		expect(siguienteId(ejemplo())).toBe('n9');
		expect(siguienteId(vacia())).toBe('n1');
	});
	it('los ids no se repiten tras borrar y agregar', () => {
		let p = ejemplo();
		p = borrarRama(p, 'n4')!;
		const a = agregarJugada(p, 'n1', 'c6', 'c7c6', 'f')!;
		const b = agregarJugada(a.partida, 'n1', 'e6', 'e7e6', 'f')!;
		const todos = ids(b.partida.raiz);
		expect(new Set(todos).size).toBe(todos.length);
	});
	it('agregar y borrar devuelve el árbol original', () => {
		const p = ejemplo();
		const a = agregarJugada(p, 'n6', 'Bb5', 'f1b5', 'f')!;
		const b = borrarRama(a.partida, a.nodo.id)!;
		expect(fotos(b)).toBe(fotos(p));
	});
});
