import { describe, it, expect } from 'vitest';
import { crearReloj, iniciar, jugada, restante, caido, formato } from '../src/core/reloj';

describe('T03 reloj (ocultos)', () => {
	it('sin iniciar no corre', () => {
		const r = crearReloj({ baseSeg: 60, incSeg: 0 });
		expect(r.turno).toBe(null);
		expect(restante(r, 'blancas', 99999)).toBe(60);
		expect(caido(r, 99999)).toBe(null);
	});
	it('el incremento se suma después de la jugada, no antes', () => {
		let r = iniciar(crearReloj({ baseSeg: 100, incSeg: 5 }), 'blancas', 0);
		expect(restante(r, 'blancas', 10000)).toBe(90);
		r = jugada(r, 10000);
		expect(r.restanteSeg.blancas).toBe(95);
		expect(restante(r, 'negras', 10000)).toBe(100);
	});
	it('bandera exacta en 0', () => {
		const r = iniciar(crearReloj({ baseSeg: 3, incSeg: 0 }), 'blancas', 0);
		expect(caido(r, 2999)).toBe(null);
		expect(caido(r, 3000)).toBe('blancas');
		expect(restante(r, 'blancas', 99999)).toBe(0);
	});
	it('dos jugadas seguidas alternan el turno', () => {
		let r = iniciar(crearReloj({ baseSeg: 60, incSeg: 1 }), 'blancas', 0);
		r = jugada(r, 4000);
		r = jugada(r, 9000);
		expect(r.restanteSeg).toEqual({ blancas: 57, negras: 56 });
		expect(r.turno).toBe('blancas');
		expect(r.desdeMs).toBe(9000);
	});
	it('base 0 con incremento', () => {
		let r = iniciar(crearReloj({ baseSeg: 0, incSeg: 3 }), 'blancas', 0);
		expect(caido(r, 0)).toBe('blancas');
		r = jugada(r, 0);
		expect(r.restanteSeg.blancas).toBe(0);
	});
	it('jugada antes de iniciar no cambia nada', () => {
		const r = crearReloj({ baseSeg: 60, incSeg: 2 });
		expect(jugada(r, 5000)).toEqual(r);
	});
	it('es inmutable', () => {
		const r = crearReloj({ baseSeg: 60, incSeg: 2 });
		const copia = JSON.parse(JSON.stringify(r));
		const r2 = iniciar(r, 'blancas', 0);
		jugada(r2, 5000);
		expect(r).toEqual(copia);
		expect(r2.turno).toBe('blancas');
		expect(r2.restanteSeg).toEqual({ blancas: 60, negras: 60 });
	});
	it('si el tiempo se acabó antes de jugar no hay incremento', () => {
		let r = iniciar(crearReloj({ baseSeg: 5, incSeg: 3 }), 'blancas', 0);
		r = jugada(r, 9000);
		expect(r.restanteSeg.blancas).toBe(0);
	});
	it('formato', () => {
		expect(formato(0)).toBe('0:00.0');
		expect(formato(9.99)).toBe('0:09.9');
		expect(formato(10)).toBe('0:10');
		expect(formato(59.9)).toBe('0:59');
		expect(formato(600)).toBe('10:00');
		expect(formato(3600)).toBe('1:00:00');
		expect(formato(-1)).toBe('0:00.0');
		expect(formato(0.04)).toBe('0:00.0');
	});
});
