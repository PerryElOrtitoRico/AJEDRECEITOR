import { describe, it, expect } from 'vitest';
import { urlArchivos, urlsDeMeses, pgnsDeMes, idChesscom } from '../src/core/importar-chesscom';

describe('T13 importar-chesscom (visibles)', () => {
	it('urlArchivos', () => {
		expect(urlArchivos('FrancoStechina')).toBe('https://api.chess.com/pub/player/francostechina/games/archives');
	});
	it('urlsDeMeses', () => {
		const json = { archives: ['https://api.chess.com/pub/player/x/games/2026/10', 'https://api.chess.com/pub/player/x/games/2026/08'] };
		expect(urlsDeMeses(json)).toEqual([
			'https://api.chess.com/pub/player/x/games/2026/08',
			'https://api.chess.com/pub/player/x/games/2026/10',
		]);
		expect(urlsDeMeses(json, '2026-09')).toEqual(['https://api.chess.com/pub/player/x/games/2026/10']);
	});
	it('pgnsDeMes', () => {
		const json = { games: [{ url: 'u1', pgn: 'P1' }, { url: 'u2' }] };
		expect(pgnsDeMes(json)).toEqual([{ url: 'u1', pgn: 'P1' }]);
	});
	it('idChesscom', () => {
		expect(idChesscom('https://www.chess.com/game/live/123456789')).toBe('123456789');
		expect(idChesscom('https://www.chess.com/otra')).toBe(null);
	});
});
