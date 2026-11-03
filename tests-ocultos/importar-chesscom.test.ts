import { describe, it, expect } from 'vitest';
import { urlArchivos, urlsDeMeses, pgnsDeMes, idChesscom } from '../src/core/importar-chesscom';

const base = 'https://api.chess.com/pub/player/x/games/';

describe('T13 importar-chesscom (ocultos)', () => {
	it('urlArchivos pasa a minúsculas y codifica', () => {
		expect(urlArchivos('Franco_Stechina')).toBe('https://api.chess.com/pub/player/franco_stechina/games/archives');
	});
	it('meses desordenados quedan ordenados', () => {
		const json = { archives: [`${base}2026/10`, `${base}2025/12`, `${base}2026/02`] };
		expect(urlsDeMeses(json)).toEqual([`${base}2025/12`, `${base}2026/02`, `${base}2026/10`]);
	});
	it('desde incluye el mes indicado', () => {
		const json = { archives: [`${base}2026/09`, `${base}2026/10`] };
		expect(urlsDeMeses(json, '2026-09')).toEqual([`${base}2026/09`, `${base}2026/10`]);
		expect(urlsDeMeses(json, '2026-10')).toEqual([`${base}2026/10`]);
	});
	it('desde mayor que todos', () => {
		expect(urlsDeMeses({ archives: [`${base}2026/10`] }, '2027-01')).toEqual([]);
	});
	it('URL con barra final', () => {
		expect(urlsDeMeses({ archives: [`${base}2026/10/`] }, '2026-10')).toEqual([`${base}2026/10/`]);
	});
	it('entradas inválidas', () => {
		expect(urlsDeMeses({ archives: [`${base}2026/10`, 5, null, 'basura'] })).toEqual([`${base}2026/10`]);
		expect(urlsDeMeses({})).toEqual([]);
		expect(urlsDeMeses(null)).toEqual([]);
		expect(urlsDeMeses('x')).toEqual([]);
		expect(urlsDeMeses({ archives: 'no' })).toEqual([]);
	});
	it('pgnsDeMes', () => {
		expect(pgnsDeMes({})).toEqual([]);
		expect(pgnsDeMes(null)).toEqual([]);
		expect(pgnsDeMes({ games: [] })).toEqual([]);
		const json = { games: [{ url: 'a', pgn: 'PGN-A' }, { url: 'b' }, { url: 'c', pgn: '' }, { pgn: 'PGN-D' }, 7] };
		expect(pgnsDeMes(json)).toEqual([{ url: 'a', pgn: 'PGN-A' }, { url: '', pgn: 'PGN-D' }]);
	});
	it('idChesscom', () => {
		expect(idChesscom('https://www.chess.com/game/live/123456789/')).toBe('123456789');
		expect(idChesscom('https://www.chess.com/game/daily/987')).toBe('987');
		expect(idChesscom('https://www.chess.com/game/live/123?tab=analysis')).toBe('123');
		expect(idChesscom('https://www.chess.com/game/live/abc')).toBe(null);
		expect(idChesscom('')).toBe(null);
	});
});
