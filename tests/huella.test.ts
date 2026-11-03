import { describe, it, expect } from 'vitest';
import { normalizarMovetext, huella } from '../src/core/huella';

describe('T14 huella (visibles)', () => {
	it('normalizarMovetext', () => {
		expect(normalizarMovetext('1. e4 {bien} e5 2. Nf3 $1 (2. f4) Nc6 1-0')).toBe('e4 e5 Nf3 Nc6');
		expect(normalizarMovetext('8.\nfxe5 8... Nf6')).toBe('fxe5 Nf6');
	});
	it('huella', () => {
		const h = huella({ White: 'A', Black: 'B', Date: '2026.10.29' }, '1. e4 e5 *');
		expect(h).toMatch(/^[0-9a-f]{8}$/);
		expect(huella({ White: 'a', Black: 'b', Date: '2026-10-29' }, '1.e4 {x} e5')).toBe(h);
	});
});
