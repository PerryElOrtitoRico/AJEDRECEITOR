import { describe, it, expect } from 'vitest';
import { urlLichess, separarPartidas, idLichess, marcarImportada } from '../src/core/importar-lichess';

describe('T12 importar-lichess (visibles)', () => {
	it('urlLichess', () => {
		expect(urlLichess('Franco_Stechina', {})).toBe(
			'https://lichess.org/api/games/user/Franco_Stechina?clocks=true&evals=false&opening=false',
		);
		expect(urlLichess('x', { desdeMs: 5, max: 10 })).toBe(
			'https://lichess.org/api/games/user/x?clocks=true&evals=false&opening=false&since=5&max=10',
		);
	});
	it('separarPartidas', () => {
		const t = '[Event "a"]\n\n1. e4 *\n\n[Event "b"]\n\n1. d4 *\n';
		expect(separarPartidas(t)).toEqual(['[Event "a"]\n\n1. e4 *', '[Event "b"]\n\n1. d4 *']);
	});
	it('idLichess', () => {
		expect(idLichess({ GameId: 'AbCdEfGh' })).toBe('AbCdEfGh');
		expect(idLichess({ Site: 'https://lichess.org/game/FxxYCveC' })).toBe('FxxYCveC');
		expect(idLichess({ Site: '?' })).toBe(null);
	});
	it('marcarImportada', () => {
		const r = marcarImportada('[Event "a"]\n[Site "b"]\n\n1. e4 *', 'lichess', 'AbCdEfGh');
		expect(r).toBe('[Event "a"]\n[Site "b"]\n[ImportId "lichess:AbCdEfGh"]\n[Origen "lichess"]\n\n1. e4 *');
	});
});
