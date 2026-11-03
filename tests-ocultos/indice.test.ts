import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import type { MetaPartida } from '../src/core/tipos';
import {
	cabeceraDePgn, metaDesdeCabecera, actualizarIndice, ordenar, resultadoParaMi, filtrar,
} from '../src/core/indice';

function meta(extra: Partial<MetaPartida> = {}): MetaPartida {
	return {
		archivo: 'a.pgn', fecha: '2026-10-30', blancas: 'Yo', negras: 'Motor', resultado: '1-0',
		origen: 'app', plies: 10, modificado: 100, enCurso: false, ...extra,
	};
}

describe('T09 indice: cabecera y meta (ocultos)', () => {
	it('comillas escapadas', () => {
		expect(cabeceraDePgn('[White "Juan \\"El Rey\\" Pérez"]\n\n1. e4 *')).toEqual({ White: 'Juan "El Rey" Pérez' });
	});
	it('espacios y tabulaciones antes de [', () => {
		expect(cabeceraDePgn('    [Event "x"]\n\t[Site "y"]\n\n1. e4 *')).toEqual({ Event: 'x', Site: 'y' });
	});
	it('solo el primer juego y sin leer las jugadas', () => {
		const t = '[White "A"]\n[Black "B"]\n\n1. e4 e5 [%clk 0:01:00] 1-0\n\n[White "C"]\n[Black "D"]\n\n1. d4 *';
		expect(cabeceraDePgn(t)).toEqual({ White: 'A', Black: 'B' });
	});
	it('texto vacío o sin cabecera', () => {
		expect(cabeceraDePgn('')).toEqual({});
		expect(cabeceraDePgn('1. e4 e5 *')).toEqual({});
	});
	it('CRLF', () => {
		expect(cabeceraDePgn('[A "1"]\r\n[B "2"]\r\n\r\n1. e4 *')).toEqual({ A: '1', B: '2' });
	});
	it('cabeceras reales de chess.com y Lichess', () => {
		const lichess = cabeceraDePgn(readFileSync('tests/fixtures/partida1.txt', 'utf8'));
		expect(lichess['GameId']).toBe('FxxYCveC');
		expect(lichess['White']).toBeTruthy();
		const chesscom = cabeceraDePgn(readFileSync('tests/fixtures/partida3.txt', 'utf8'));
		expect(chesscom['Site']).toBe('Chess.com');
		expect(chesscom['Date']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
	it('fecha: acepta puntos y guiones, ? da vacío, usa UTCDate si falta Date', () => {
		const f = (c: Record<string, string>) => metaDesdeCabecera('x.pgn', 1, c, 0).fecha;
		expect(f({ Date: '2026.10.30' })).toBe('2026-10-30');
		expect(f({ Date: '2026-10-29' })).toBe('2026-10-29');
		expect(f({ Date: '????.??.??' })).toBe('');
		expect(f({ Date: '2026.??.??' })).toBe('');
		expect(f({ UTCDate: '2026.10.28' })).toBe('2026-10-28');
		expect(f({})).toBe('');
	});
	it('sin Event, Round ni Site es válido', () => {
		const m = metaDesdeCabecera('x.pgn', 1, { White: 'A', Black: 'B', Result: '1-0', Date: '2026-10-29' }, 3);
		expect(m.blancas).toBe('A');
		expect(m.resultado).toBe('1-0');
	});
	it('resultado raro da *', () => {
		expect(metaDesdeCabecera('x', 1, { Result: 'basura' }, 0).resultado).toBe('*');
		expect(metaDesdeCabecera('x', 1, {}, 0).resultado).toBe('*');
		expect(metaDesdeCabecera('x', 1, { Result: '1/2-1/2' }, 0).resultado).toBe('1/2-1/2');
	});
	it('origen', () => {
		const o = (c: Record<string, string>) => metaDesdeCabecera('x', 1, c, 0).origen;
		expect(o({ ImportId: 'lichess:AbCdEfGh' })).toBe('lichess');
		expect(o({ ImportId: 'chesscom:123' })).toBe('chesscom');
		expect(o({ Origen: 'manual' })).toBe('manual');
		expect(o({ Origen: 'rarisimo' })).toBe('app');
		expect(o({ ImportId: 'chesscom:1', Origen: 'lichess' })).toBe('chesscom');
		expect(o({})).toBe('app');
	});
	it('enCurso y nombres faltantes', () => {
		expect(metaDesdeCabecera('x', 1, { EnCurso: '1' }, 0).enCurso).toBe(true);
		expect(metaDesdeCabecera('x', 1, { EnCurso: '0' }, 0).enCurso).toBe(false);
		expect(metaDesdeCabecera('x', 7, {}, 4)).toMatchObject({ blancas: '?', negras: '?', plies: 4, modificado: 7, archivo: 'x' });
	});
});

describe('T10 indice: actualizar y ordenar (ocultos)', () => {
	it('índice vacío: todo se lee', () => {
		const r = actualizarIndice([], [{ nombre: 'a.pgn', modificado: 1 }, { nombre: 'b.pgn', modificado: 2 }]);
		expect(r).toEqual({ indice: [], aLeer: ['a.pgn', 'b.pgn'], eliminados: [] });
	});
	it('mismo modificado no relee y conserva la entrada', () => {
		const e = meta({ archivo: 'a.pgn', modificado: 5 });
		const r = actualizarIndice([e], [{ nombre: 'a.pgn', modificado: 5 }]);
		expect(r.indice).toEqual([e]);
		expect(r.aLeer).toEqual([]);
	});
	it('modificado distinto se relee y sale del índice', () => {
		const r = actualizarIndice([meta({ archivo: 'a.pgn', modificado: 5 })], [{ nombre: 'a.pgn', modificado: 6 }]);
		expect(r).toEqual({ indice: [], aLeer: ['a.pgn'], eliminados: [] });
	});
	it('archivo desaparecido', () => {
		const r = actualizarIndice([meta({ archivo: 'a.pgn' })], []);
		expect(r.eliminados).toEqual(['a.pgn']);
	});
	it('ignora lo que no es partida', () => {
		const r = actualizarIndice([], [
			{ nombre: 'a.pgn.tmp', modificado: 1 }, { nombre: '.syncthing.a.pgn.tmp', modificado: 1 },
			{ nombre: 'x.sync-conflict-20261030-153045-ABCDEFG.pgn', modificado: 1 },
			{ nombre: 'notas.txt', modificado: 1 }, { nombre: 'ok.pgn', modificado: 1 },
		]);
		expect(r.aLeer).toEqual(['ok.pgn']);
	});
	it('no modifica sus argumentos', () => {
		const viejo = [meta()];
		const antes = JSON.stringify(viejo);
		actualizarIndice(viejo, []);
		expect(JSON.stringify(viejo)).toBe(antes);
	});
	it('ordenar: fecha desc, empate por modificado desc, sin fecha al final', () => {
		const o = ordenar([
			meta({ archivo: 'sin1', fecha: '', modificado: 1 }),
			meta({ archivo: 'vieja', fecha: '2026-01-01', modificado: 50 }),
			meta({ archivo: 'nuevaA', fecha: '2026-10-30', modificado: 10 }),
			meta({ archivo: 'nuevaB', fecha: '2026-10-30', modificado: 20 }),
			meta({ archivo: 'sin2', fecha: '', modificado: 2 }),
		]);
		expect(o.map((m) => m.archivo)).toEqual(['nuevaB', 'nuevaA', 'vieja', 'sin2', 'sin1']);
	});
	it('ordenar no modifica el original', () => {
		const lista = [meta({ archivo: 'a', fecha: '2026-01-01' }), meta({ archivo: 'b', fecha: '2026-02-01' })];
		ordenar(lista);
		expect(lista.map((m) => m.archivo)).toEqual(['a', 'b']);
	});
});

describe('T11 indice: resultado para mí y filtro (ocultos)', () => {
	it('con negras', () => {
		expect(resultadoParaMi(meta({ blancas: 'Motor', negras: 'Yo', resultado: '0-1' }), ['Yo'])).toBe('victoria');
		expect(resultadoParaMi(meta({ blancas: 'Motor', negras: 'Yo', resultado: '1-0' }), ['Yo'])).toBe('derrota');
	});
	it('usuarios con mayúsculas distintas y varios nombres', () => {
		expect(resultadoParaMi(meta({ blancas: 'FRANCOSTECHINA' }), ['FrancoStechina', 'Franco_Stechina'])).toBe('victoria');
		expect(resultadoParaMi(meta({ blancas: 'franco_stechina' }), ['FrancoStechina', 'Franco_Stechina'])).toBe('victoria');
	});
	it('contra uno mismo es desconocido', () => {
		expect(resultadoParaMi(meta({ blancas: 'Yo', negras: 'yo' }), ['Yo'])).toBe('desconocido');
	});
	it('en curso tiene prioridad', () => {
		expect(resultadoParaMi(meta({ enCurso: true, resultado: '*' }), ['Yo'])).toBe('en curso');
	});
	it('resultado * sin estar en curso es desconocido', () => {
		expect(resultadoParaMi(meta({ resultado: '*' }), ['Yo'])).toBe('desconocido');
	});
	it('tablas', () => {
		expect(resultadoParaMi(meta({ resultado: '1/2-1/2', blancas: 'Motor', negras: 'Yo' }), ['Yo'])).toBe('tablas');
	});
	it('filtrar', () => {
		const lista = [
			meta({ archivo: '1' }),
			meta({ archivo: '2', resultado: '0-1' }),
			meta({ archivo: '3', resultado: '1/2-1/2' }),
			meta({ archivo: '4', enCurso: true, resultado: '*' }),
			meta({ archivo: '5', blancas: 'Otro', negras: 'Otro2' }),
		];
		const f = (r: 'victoria' | 'derrota' | 'tablas' | 'en curso' | 'desconocido') =>
			filtrar(lista, { resultado: r, misNombres: ['yo'] }).map((m) => m.archivo);
		expect(f('victoria')).toEqual(['1']);
		expect(f('derrota')).toEqual(['2']);
		expect(f('tablas')).toEqual(['3']);
		expect(f('en curso')).toEqual(['4']);
		expect(f('desconocido')).toEqual(['5']);
		expect(filtrar(lista, { misNombres: ['yo'] }).length).toBe(5);
		expect(filtrar([], { resultado: 'victoria', misNombres: [] })).toEqual([]);
	});
});
