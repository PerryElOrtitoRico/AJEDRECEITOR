import { describe, it, expect } from 'vitest';
import type { MetaPartida } from '../src/core/tipos';
import {
	cabeceraDePgn, metaDesdeCabecera, actualizarIndice, ordenar, resultadoParaMi, filtrar,
} from '../src/core/indice';

function meta(extra: Partial<MetaPartida> = {}): MetaPartida {
	return {
		archivo: 'a.pgn', fecha: '2026-10-30', blancas: 'Yo', negras: 'Motor', resultado: '1-0',
		origen: 'app', plies: 10, modificado: 100, enCurso: false, ...extra,
	};
}

describe('T09 indice: cabecera y meta (visibles)', () => {
	it('cabeceraDePgn', () => {
		const c = cabeceraDePgn('[Event "Casual"]\n[White "Yo"]\n\n1. e4 e5 *');
		expect(c).toEqual({ Event: 'Casual', White: 'Yo' });
	});
	it('metaDesdeCabecera', () => {
		const m = metaDesdeCabecera('x.pgn', 5, { Date: '2026.10.30', White: 'A', Black: 'B', Result: '0-1' }, 12);
		expect(m).toEqual({
			archivo: 'x.pgn', fecha: '2026-10-30', blancas: 'A', negras: 'B', resultado: '0-1',
			origen: 'app', plies: 12, modificado: 5, enCurso: false,
		});
	});
});

describe('T10 indice: actualizar y ordenar (visibles)', () => {
	it('actualizarIndice', () => {
		const viejo = [meta({ archivo: 'a.pgn', modificado: 1 }), meta({ archivo: 'b.pgn', modificado: 2 })];
		const r = actualizarIndice(viejo, [{ nombre: 'a.pgn', modificado: 1 }, { nombre: 'c.pgn', modificado: 3 }]);
		expect(r.indice.map((m) => m.archivo)).toEqual(['a.pgn']);
		expect(r.aLeer).toEqual(['c.pgn']);
		expect(r.eliminados).toEqual(['b.pgn']);
	});
	it('ordenar', () => {
		const o = ordenar([meta({ archivo: 'v', fecha: '' }), meta({ archivo: 'a', fecha: '2026-01-01' }), meta({ archivo: 'b', fecha: '2026-02-01' })]);
		expect(o.map((m) => m.archivo)).toEqual(['b', 'a', 'v']);
	});
});

describe('T11 indice: resultado para mí y filtro (visibles)', () => {
	it('resultadoParaMi', () => {
		expect(resultadoParaMi(meta(), ['yo'])).toBe('victoria');
		expect(resultadoParaMi(meta({ resultado: '0-1' }), ['Yo'])).toBe('derrota');
		expect(resultadoParaMi(meta({ resultado: '1/2-1/2' }), ['Yo'])).toBe('tablas');
		expect(resultadoParaMi(meta(), ['otro'])).toBe('desconocido');
	});
	it('filtrar', () => {
		const todos = [meta({ archivo: 'g' }), meta({ archivo: 'p', resultado: '0-1' })];
		expect(filtrar(todos, { resultado: 'derrota', misNombres: ['Yo'] }).map((m) => m.archivo)).toEqual(['p']);
		expect(filtrar(todos, { misNombres: ['Yo'] }).length).toBe(2);
	});
});
