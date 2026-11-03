import { describe, it, expect } from 'vitest';
import { limpiarNombre, nombreArchivo, esArchivoPartida, esConflicto, originalDeConflicto } from '../src/core/nombres';

describe('T01 nombres (visibles)', () => {
	it('limpiarNombre', () => {
		expect(limpiarNombre('Perry')).toBe('perry');
		expect(limpiarNombre('Motor nivel 3')).toBe('motor-nivel-3');
		expect(limpiarNombre('')).toBe('anonimo');
	});
	it('nombreArchivo', () => {
		const f = { a: 2026, m: 10, d: 30, h: 15, mi: 30, s: 45 };
		expect(nombreArchivo(f, 'Perry', 'Motor nivel 3', 'a1b2c3d4')).toBe(
			'2026-10-30_153045_perry-vs-motor-nivel-3_a1b2c3d4.pgn',
		);
	});
	it('esArchivoPartida', () => {
		expect(esArchivoPartida('x.pgn')).toBe(true);
		expect(esArchivoPartida('x.pgn.tmp')).toBe(false);
	});
	it('conflictos', () => {
		const c = 'x.sync-conflict-20261030-153045-ABCDEFG.pgn';
		expect(esConflicto(c)).toBe(true);
		expect(originalDeConflicto(c)).toBe('x.pgn');
		expect(originalDeConflicto('x.pgn')).toBe(null);
	});
});
