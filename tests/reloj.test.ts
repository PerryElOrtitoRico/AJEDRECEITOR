import { describe, it, expect } from 'vitest';
import { crearReloj, iniciar, jugada, restante, caido, formato } from '../src/core/reloj';

describe('T03 reloj (visibles)', () => {
	it('corre el turno y suma el incremento', () => {
		let r = crearReloj({ baseSeg: 300, incSeg: 2 });
		r = iniciar(r, 'blancas', 1000);
		expect(restante(r, 'blancas', 6000)).toBe(295);
		expect(restante(r, 'negras', 6000)).toBe(300);
		r = jugada(r, 6000);
		expect(r.restanteSeg.blancas).toBe(297);
		expect(r.turno).toBe('negras');
	});
	it('caido', () => {
		const r = iniciar(crearReloj({ baseSeg: 10, incSeg: 0 }), 'negras', 0);
		expect(caido(r, 9999)).toBe(null);
		expect(caido(r, 10000)).toBe('negras');
	});
	it('formato', () => {
		expect(formato(300)).toBe('5:00');
		expect(formato(3723)).toBe('1:02:03');
		expect(formato(9.4)).toBe('0:09.4');
		expect(formato(-5)).toBe('0:00.0');
	});
});
