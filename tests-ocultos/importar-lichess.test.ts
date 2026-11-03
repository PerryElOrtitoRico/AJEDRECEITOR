import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { urlLichess, separarPartidas, idLichess, marcarImportada } from '../src/core/importar-lichess';
import { cabeceraDePgn } from '../src/core/indice';

describe('T12 importar-lichess (ocultos)', () => {
	it('urlLichess codifica el usuario y solo pone lo dado', () => {
		expect(urlLichess('a b', { max: 3 })).toBe(
			'https://lichess.org/api/games/user/a%20b?clocks=true&evals=false&opening=false&max=3',
		);
		expect(urlLichess('x', { desdeMs: 0 })).toContain('&since=0');
	});
	it('separar 3 partidas seguidas', () => {
		const g = (n: string) => `[Event "${n}"]\n[White "A"]\n\n1. e4 e5 1-0`;
		const r = separarPartidas(`${g('1')}\n\n\n${g('2')}\n\n${g('3')}\n\n\n`);
		expect(r).toEqual([g('1'), g('2'), g('3')]);
	});
	it('separar texto vacío o solo espacios', () => {
		expect(separarPartidas('')).toEqual([]);
		expect(separarPartidas('  \n\n \n')).toEqual([]);
	});
	it('separar una sola partida sin comentarios', () => {
		expect(separarPartidas('[Event "x"]\n\n1. e4 *')).toEqual(['[Event "x"]\n\n1. e4 *']);
	});
	it('un [Event dentro de un comentario sin línea vacía antes no corta', () => {
		const t = '[Event "x"]\n\n1. e4 { nota\n[Event "no"] } *';
		expect(separarPartidas(t)).toHaveLength(1);
	});
	it('CRLF', () => {
		expect(separarPartidas('[Event "a"]\r\n\r\n1. e4 *\r\n\r\n[Event "b"]\r\n\r\n1. d4 *\r\n')).toHaveLength(2);
	});
	it('partida real con espacios al principio', () => {
		const t = readFileSync('tests/fixtures/partida1.txt', 'utf8');
		const r = separarPartidas(t);
		expect(r).toHaveLength(1);
		expect(r[0]?.startsWith('[Event')).toBe(true);
	});
	it('idLichess: GameId primero, luego Site', () => {
		expect(idLichess({ GameId: 'AAAAAAAA', Site: 'https://lichess.org/BBBBBBBB' })).toBe('AAAAAAAA');
		expect(idLichess({ Site: 'https://lichess.org/AbCdEfGh' })).toBe('AbCdEfGh');
		expect(idLichess({ Site: 'https://lichess.org/AbCdEfGh/black' })).toBe('AbCdEfGh');
		expect(idLichess({ Site: 'https://lichess.org/game/FxxYCveC' })).toBe('FxxYCveC');
		expect(idLichess({ Site: 'Chess.com' })).toBe(null);
		expect(idLichess({ Site: 'https://lichess.org/' })).toBe(null);
		expect(idLichess({})).toBe(null);
	});
	it('idLichess con las cabeceras reales', () => {
		const c = cabeceraDePgn(readFileSync('tests/fixtures/partida1.txt', 'utf8'));
		expect(idLichess(c)).toBe('FxxYCveC');
	});
	it('marcarImportada agrega después de la última etiqueta y es idempotente', () => {
		const base = '[Event "a"]\n[Site "b"]\n[Result "1-0"]\n\n1. e4 e5 1-0';
		const una = marcarImportada(base, 'lichess', 'AbCdEfGh');
		expect(una).toBe('[Event "a"]\n[Site "b"]\n[Result "1-0"]\n[ImportId "lichess:AbCdEfGh"]\n[Origen "lichess"]\n\n1. e4 e5 1-0');
		expect(marcarImportada(una, 'lichess', 'AbCdEfGh')).toBe(una);
	});
	it('marcarImportada completa solo lo que falta y sirve para chess.com', () => {
		const r = marcarImportada('[White "a"]\n[Origen "chesscom"]\n\n1. e4 *', 'chesscom', '123');
		expect(r).toBe('[White "a"]\n[Origen "chesscom"]\n[ImportId "chesscom:123"]\n\n1. e4 *');
	});
	it('marcarImportada no toca el movetext que tenga corchetes', () => {
		const r = marcarImportada('[White "a"]\n\n1. e4 { [%clk 0:01:00] } *', 'lichess', 'X1');
		expect(r.endsWith('1. e4 { [%clk 0:01:00] } *')).toBe(true);
	});
});
