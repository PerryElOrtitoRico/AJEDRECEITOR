import { describe, it, expect } from 'vitest';
import { parsearInfo, parsearBestmove, comandoPosicion, comandoGo, comandosNivel } from '../src/core/uci';

describe('T04 uci (visibles)', () => {
	it('parsearInfo', () => {
		const i = parsearInfo('info depth 12 seldepth 18 score cp 34 nodes 1 pv e2e4 e7e5');
		expect(i).toEqual({ profundidad: 12, cp: 34, pv: ['e2e4', 'e7e5'] });
	});
	it('parsearBestmove', () => {
		expect(parsearBestmove('bestmove e2e4 ponder e7e5')).toEqual({ mejor: 'e2e4', ponder: 'e7e5' });
		expect(parsearBestmove('bestmove (none)')).toBe(null);
	});
	it('comandos', () => {
		expect(comandoPosicion(null, ['e2e4'])).toBe('position startpos moves e2e4');
		expect(comandoGo({ movetimeMs: 300 })).toBe('go movetime 300');
		expect(comandosNivel({ skill: 3 })).toEqual(['setoption name Skill Level value 3']);
	});
});
