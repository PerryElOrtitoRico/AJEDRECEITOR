import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { normalizarMovetext, huella } from '../src/core/huella';
import { cabeceraDePgn } from '../src/core/indice';

function movetextDe(texto: string): string {
	return texto
		.split(/\r?\n/)
		.filter((l) => !l.trim().startsWith('['))
		.join('\n');
}
function huellaDe(archivo: string): string {
	const t = readFileSync(`tests/fixtures/${archivo}`, 'utf8');
	return huella(cabeceraDePgn(t), movetextDe(t));
}

describe('T14 huella (ocultos)', () => {
	it('quita comentarios, variantes anidadas, NAG, números y resultado', () => {
		expect(normalizarMovetext('1. e4 e5 (1... c5 (1... e6 {x}) 2. Nf3) 2. Nf3 $5 {[%clk 0:01:00] bien} Nc6 1/2-1/2')).toBe('e4 e5 Nf3 Nc6');
	});
	it('une las jugadas partidas por el salto de línea', () => {
		expect(normalizarMovetext('7. Nc3 Nf6 8.\nfxe5 Nxe4\n9. O-O')).toBe('Nc3 Nf6 fxe5 Nxe4 O-O');
		expect(normalizarMovetext('1.e4 e5 2...Nc6')).toBe('e4 e5 Nc6');
	});
	it('símbolos de anotación !? no cuentan', () => {
		expect(normalizarMovetext('1. e4! e5?! 2. Nf3!!')).toBe('e4 e5 Nf3');
	});
	it('texto vacío', () => {
		expect(normalizarMovetext('')).toBe('');
		expect(normalizarMovetext('  *  ')).toBe('');
		expect(huella({}, '')).toMatch(/^[0-9a-f]{8}$/);
	});
	it('la huella es estable (valor fijo FNV-1a)', () => {
		expect(huella({ White: 'A', Black: 'B', Date: '2026.10.29' }, '1. e4 e5 *')).toBe(huella({ White: 'A', Black: 'B', Date: '2026-10-29' }, 'e4 e5'));
		expect(huella({}, '')).toBe('13fe3a3b');
	});
	it('comentarios distintos dan la misma huella; una jugada distinta, otra', () => {
		const cab = { White: 'A', Black: 'B', Date: '2026-10-29' };
		expect(huella(cab, '1. e4 {uno} e5 2. Nf3 *')).toBe(huella(cab, '1. e4 e5 2. Nf3 {dos} *'));
		expect(huella(cab, '1. e4 e5 2. Nf3 *')).not.toBe(huella(cab, '1. e4 e5 2. Nc3 *'));
	});
	it('nombres con otra capitalización y fecha con puntos o guiones', () => {
		const m = '1. e4 e5';
		expect(huella({ White: 'Perry', Black: 'Motor', Date: '2026.10.29' }, m)).toBe(huella({ White: 'PERRY', Black: 'motor', Date: '2026-10-29' }, m));
		expect(huella({ White: 'A', Black: 'B', Date: '2026.10.29' }, m)).not.toBe(huella({ White: 'A', Black: 'B', Date: '2026.10.30' }, m));
		expect(huella({ White: 'A', Black: 'B' }, m)).not.toBe(huella({ White: 'B', Black: 'A' }, m));
	});
	it('la Partida1 y la Partida2 de ejemplo (idénticas) dan la misma huella', () => {
		expect(huellaDe('partida1.txt')).toBe(huellaDe('partida2.txt'));
	});
	it('las partidas distintas dan huellas distintas', () => {
		const hs = ['partida1.txt', 'partida3.txt', 'partida4.txt', 'partida5.txt'].map(huellaDe);
		expect(new Set(hs).size).toBe(4);
	});
});
