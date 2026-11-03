import { describe, it, expect } from 'vitest';
import { limpiarNombre, nombreArchivo, esArchivoPartida, esConflicto, originalDeConflicto } from '../src/core/nombres';

describe('T01 nombres (ocultos)', () => {
	it('acentos y eñes', () => {
		expect(limpiarNombre('Año Ñandú')).toBe('ano-nandu');
		expect(limpiarNombre('José  Pérez')).toBe('jose-perez');
	});
	it('vacío o solo símbolos', () => {
		expect(limpiarNombre('')).toBe('anonimo');
		expect(limpiarNombre('???')).toBe('anonimo');
		expect(limpiarNombre('  --  ')).toBe('anonimo');
	});
	it('recorta a 20 caracteres', () => {
		expect(limpiarNombre('a'.repeat(40))).toBe('a'.repeat(20));
		expect(limpiarNombre('abcdefghi jklmnopqr stuv')).toBe('abcdefghi-jklmnopqr');
	});
	it('guiones juntos y de los extremos', () => {
		expect(limpiarNombre('__Franco__Stechina__')).toBe('franco-stechina');
	});
	it('nombreArchivo rellena con ceros', () => {
		const f = { a: 2026, m: 1, d: 2, h: 3, mi: 4, s: 5 };
		expect(nombreArchivo(f, '', 'X', 'zzzzzzzz')).toBe('2026-01-02_030405_anonimo-vs-x_zzzzzzzz.pgn');
	});
	it('esArchivoPartida', () => {
		expect(esArchivoPartida('.syncthing.partida.pgn.tmp')).toBe(false);
		expect(esArchivoPartida('.oculto.pgn')).toBe(false);
		expect(esArchivoPartida('partida.txt')).toBe(false);
		expect(esArchivoPartida('a.sync-conflict-20261030-153045-ABCDEFG.pgn')).toBe(false);
		expect(esArchivoPartida('indice.json')).toBe(false);
	});
	it('esConflicto con id de 7 caracteres', () => {
		expect(esConflicto('a.sync-conflict-20261030-153045-ABC1234.pgn')).toBe(true);
		expect(esConflicto('a.sync-conflict-20261030-153045-ABC123.pgn')).toBe(false);
		expect(esConflicto('a.pgn')).toBe(false);
	});
	it('originalDeConflicto', () => {
		expect(originalDeConflicto('2026-10-30_x_a_b_12345678.sync-conflict-20261031-000000-Z9Y8X7W.pgn')).toBe(
			'2026-10-30_x_a_b_12345678.pgn',
		);
		expect(originalDeConflicto('normal.pgn')).toBe(null);
	});
});
