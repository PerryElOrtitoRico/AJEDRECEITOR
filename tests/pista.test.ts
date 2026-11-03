import { describe, it, expect } from 'vitest';
import { siguientePista, casillasAResaltar } from '../src/core/pista';

describe('T05 pista (visibles)', () => {
	it('primera y segunda pulsación', () => {
		const a = siguientePista(null, 'fen1', 'e2e4');
		expect(a).toEqual({ fen: 'fen1', mejor: 'e2e4', nivel: 1 });
		expect(casillasAResaltar(a)).toEqual(['e2']);
		const b = siguientePista(a, 'fen1', 'e2e4');
		expect(b.nivel).toBe(2);
		expect(casillasAResaltar(b)).toEqual(['e2', 'e4']);
	});
});
