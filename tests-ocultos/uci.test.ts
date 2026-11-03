import { describe, it, expect } from 'vitest';
import { parsearInfo, parsearBestmove, comandoPosicion, comandoGo, comandosNivel } from '../src/core/uci';

describe('T04 uci (ocultos)', () => {
	it('info con mate y negativo', () => {
		expect(parsearInfo('info depth 5 score mate -3 pv a2a3')).toEqual({ profundidad: 5, mate: -3, pv: ['a2a3'] });
	});
	it('info con lowerbound y upperbound', () => {
		expect(parsearInfo('info depth 9 score cp 120 lowerbound nodes 5 pv d2d4 d7d5')).toEqual({
			profundidad: 9,
			cp: 120,
			pv: ['d2d4', 'd7d5'],
		});
		expect(parsearInfo('info depth 9 score cp -20 upperbound pv d2d4')?.cp).toBe(-20);
	});
	it('espacios de más', () => {
		expect(parsearInfo('  info   depth  3   score  cp  7   pv   e2e4  ')).toEqual({ profundidad: 3, cp: 7, pv: ['e2e4'] });
	});
	it('sin pv o pv vacío o no es info', () => {
		expect(parsearInfo('info depth 1 currmove e2e4 currmovenumber 1')).toBe(null);
		expect(parsearInfo('info depth 4 score cp 3 pv')).toBe(null);
		expect(parsearInfo('bestmove e2e4')).toBe(null);
		expect(parsearInfo('')).toBe(null);
	});
	it('bestmove', () => {
		expect(parsearBestmove('bestmove e7e8q')).toEqual({ mejor: 'e7e8q' });
		expect(parsearBestmove('bestmove e2e4 ponder e7e5')).toEqual({ mejor: 'e2e4', ponder: 'e7e5' });
		expect(parsearBestmove('bestmove')).toBe(null);
		expect(parsearBestmove('info depth 1')).toBe(null);
	});
	it('comandoPosicion', () => {
		expect(comandoPosicion(null, [])).toBe('position startpos');
		const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
		expect(comandoPosicion(fen, [])).toBe(`position fen ${fen}`);
		expect(comandoPosicion(fen, ['e7e5', 'g1f3'])).toBe(`position fen ${fen} moves e7e5 g1f3`);
	});
	it('comandoGo', () => {
		expect(comandoGo({ profundidad: 8 })).toBe('go depth 8');
		expect(comandoGo({ movetimeMs: 300, profundidad: 8 })).toBe('go movetime 300 depth 8');
		expect(comandoGo({})).toBe('go depth 8');
	});
	it('comandosNivel', () => {
		expect(comandosNivel({ skill: 0, limitarElo: 1350 })).toEqual([
			'setoption name Skill Level value 0',
			'setoption name UCI_LimitStrength value true',
			'setoption name UCI_Elo value 1350',
		]);
	});
});
