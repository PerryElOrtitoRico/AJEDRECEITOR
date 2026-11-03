import { describe, it, expect } from 'vitest';
import { extraerReloj, quitarEvaluaciones, esComentarioDeAnalisis, limpiarNags } from '../src/core/limpieza';

describe('T02 limpieza (ocultos)', () => {
	it('reloj con horas y décimas', () => {
		expect(extraerReloj('[%clk 1:02:03]').relojSeg).toBe(3723);
		expect(extraerReloj('[%clk 1:02:03.4]').relojSeg).toBeCloseTo(3723.4);
		expect(extraerReloj('[%clk 0:09:59.9]').relojSeg).toBeCloseTo(599.9);
	});
	it('comentario mixto', () => {
		const c = '[%eval 0.17] [%clk 0:03:00] buen cambio';
		expect(extraerReloj(c)).toEqual({ relojSeg: 180, resto: '[%eval 0.17] buen cambio' });
		expect(quitarEvaluaciones(c)).toBe('[%clk 0:03:00] buen cambio');
		expect(quitarEvaluaciones(extraerReloj(c).resto)).toBe('buen cambio');
	});
	it('sin reloj y cadena vacía', () => {
		expect(extraerReloj('')).toEqual({ relojSeg: null, resto: '' });
		expect(extraerReloj('  solo texto  ')).toEqual({ relojSeg: null, resto: 'solo texto' });
	});
	it('quitarEvaluaciones borra todas las clases', () => {
		expect(quitarEvaluaciones('[%eval #-3]')).toBe('');
		expect(quitarEvaluaciones('a [%emt 0:00:01] b [%cal Ge2e4] c [%csl Gd4] d [%depth 20]')).toBe('a b c d');
		expect(quitarEvaluaciones('')).toBe('');
	});
	it('corchetes que no son comandos se conservan', () => {
		expect(quitarEvaluaciones('[nota] ojo con [Dd4] aquí')).toBe('[nota] ojo con [Dd4] aquí');
		expect(extraerReloj('[nota] [%clk 0:00:10]').resto).toBe('[nota]');
	});
	it('esComentarioDeAnalisis', () => {
		expect(esComentarioDeAnalisis('Inaccuracy. Qd2 was best.')).toBe(true);
		expect(esComentarioDeAnalisis('Mistake. Bxf7+ was best.')).toBe(true);
		expect(esComentarioDeAnalisis('Checkmate is now unavoidable.')).toBe(true);
		expect(esComentarioDeAnalisis('Blunder. Nf3 was better.')).toBe(false);
		expect(esComentarioDeAnalisis('Mi Blunder. Nf3 was best.')).toBe(false);
		expect(esComentarioDeAnalisis('')).toBe(false);
	});
	it('limpiarNags', () => {
		expect(limpiarNags([1, 2, 3, 4, 5, 6])).toEqual([]);
		expect(limpiarNags([10, 15, 19])).toEqual([]);
		expect(limpiarNags([7, 9, 20, 140])).toEqual([7, 9, 20, 140]);
		expect(limpiarNags([])).toEqual([]);
	});
});
