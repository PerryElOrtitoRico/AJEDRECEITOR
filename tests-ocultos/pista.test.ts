import { describe, it, expect } from 'vitest';
import { siguientePista, casillasAResaltar } from '../src/core/pista';

describe('T05 pista (ocultos)', () => {
	it('la tercera pulsación sigue en 2', () => {
		const a = siguientePista(null, 'f', 'e2e4');
		const b = siguientePista(a, 'f', 'e2e4');
		expect(siguientePista(b, 'f', 'e2e4').nivel).toBe(2);
	});
	it('cambio de posición reinicia', () => {
		const b = siguientePista(siguientePista(null, 'f1', 'e2e4'), 'f1', 'e2e4');
		expect(siguientePista(b, 'f2', 'd7d5')).toEqual({ fen: 'f2', mejor: 'd7d5', nivel: 1 });
	});
	it('guarda el mejor nuevo y no modifica la previa', () => {
		const previa = { fen: 'f', mejor: 'a2a3', nivel: 1 as const };
		const n = siguientePista(previa, 'f', 'b2b3');
		expect(n).toEqual({ fen: 'f', mejor: 'b2b3', nivel: 2 });
		expect(previa.nivel).toBe(1);
	});
	it('coronación', () => {
		expect(casillasAResaltar({ fen: 'f', mejor: 'e7e8q', nivel: 2 })).toEqual(['e7', 'e8']);
		expect(casillasAResaltar({ fen: 'f', mejor: 'e7e8q', nivel: 1 })).toEqual(['e7']);
	});
	it('mejor inválido', () => {
		expect(casillasAResaltar({ fen: 'f', mejor: 'e2', nivel: 1 })).toEqual([]);
		expect(casillasAResaltar({ fen: 'f', mejor: '', nivel: 2 })).toEqual([]);
	});
});
