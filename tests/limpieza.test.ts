import { describe, it, expect } from 'vitest';
import { extraerReloj, quitarEvaluaciones, esComentarioDeAnalisis, limpiarNags } from '../src/core/limpieza';

describe('T02 limpieza (visibles)', () => {
	it('extraerReloj', () => {
		expect(extraerReloj('[%clk 0:03:00]')).toEqual({ relojSeg: 180, resto: '' });
		expect(extraerReloj('hola')).toEqual({ relojSeg: null, resto: 'hola' });
	});
	it('quitarEvaluaciones', () => {
		expect(quitarEvaluaciones('[%eval 0.17] bien')).toBe('bien');
	});
	it('esComentarioDeAnalisis', () => {
		expect(esComentarioDeAnalisis('Blunder. Nf3 was best.')).toBe(true);
		expect(esComentarioDeAnalisis('buena jugada')).toBe(false);
	});
	it('limpiarNags', () => {
		expect(limpiarNags([1, 7, 14])).toEqual([7]);
	});
});
