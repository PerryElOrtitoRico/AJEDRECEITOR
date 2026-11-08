import { readFileSync } from 'node:fs';
import { FEN_INICIAL, estado, jugadasLegales, jugar } from '../src/adaptadores/reglas';
import { escribirPgn, leerPgn } from '../src/adaptadores/pgnio';
import { contarPlies, lineaPrincipal } from '../src/core/arbol';

const fixture = (n: number) => readFileSync(`tests/fixtures/partida${n}.txt`, 'utf8');

describe('reglas', () => {
	it('20 jugadas iniciales; acepta SAN y UCI', () => {
		expect(jugadasLegales(FEN_INICIAL)).toHaveLength(20);
		expect(jugar(FEN_INICIAL, 'Nf3')?.uci).toBe('g1f3');
		expect(jugar(FEN_INICIAL, 'e2e4')?.san).toBe('e4');
		expect(jugar(FEN_INICIAL, 'e2e5')).toBeNull();
	});
	it('enroque en UCI estándar y coronación', () => {
		const fen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
		expect(jugadasLegales(fen)).toContain('e1g1');
		expect(jugadasLegales(fen)).not.toContain('e1h1');
		expect(jugar(fen, 'e1g1')?.san).toBe('O-O');
		expect(jugar(fen, 'O-O-O')?.uci).toBe('e1c1');
		const c = jugar('8/P6k/8/8/8/8/8/K7 w - - 0 1', 'a7a8n');
		expect(c?.san).toBe('a8=N');
		expect(jugadasLegales('8/P6k/8/8/8/8/8/K7 w - - 0 1')).toContain('a7a8q');
	});
	it('mate, ahogado y material insuficiente', () => {
		expect(estado('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3')).toMatchObject({ fin: true, resultado: '0-1', motivo: 'jaque mate' });
		expect(estado('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1').motivo).toBe('ahogado');
		expect(estado('8/8/4k3/8/8/3K4/8/8 w - - 0 1').motivo).toBe('material insuficiente');
		expect(estado(FEN_INICIAL).fin).toBe(false);
	});
});

describe('pgnio', () => {
	it.each([1, 2, 3, 4, 5])('lee la partida %i y la ida y vuelta es estable', (n) => {
		const p = leerPgn(fixture(n));
		expect(p).not.toBeNull();
		expect(contarPlies(p!)).toBeGreaterThan(10);
		const texto = escribirPgn(p!);
		const otra = leerPgn(texto)!;
		expect(otra).toEqual(p);
		expect(escribirPgn(otra)).toBe(texto);
	});
	it('Lichess: relojes a relojSeg y conserva comentarios propios', () => {
		const p = leerPgn(fixture(1))!;
		const linea = lineaPrincipal(p);
		expect(linea[0]!.relojSeg).not.toBeNull();
		expect(p.cabecera.GameId).toBe('FxxYCveC');
		expect(escribirPgn(p)).toContain('[%clk');
	});
	it('variantes anidadas, quita evaluaciones y textos de análisis', () => {
		const p = leerPgn('[Result "*"]\n\n1. e4 { [%eval 0.3] [%clk 0:03:00] bien } e5 (1... c5 { sici } 2. Nf3 (2. c3 $5)) 2. Nf3 { Mistake. Nc3 was best. } *')!;
		const e4 = p.raiz.hijos[0]!;
		expect(e4.comentario).toBe('bien');
		expect(e4.relojSeg).toBe(180);
		expect(e4.hijos.map((h) => h.san)).toEqual(['e5', 'c5']);
		expect(e4.hijos[1]!.hijos[0]!.hijos.map((h) => h.san)).toEqual([]);
		expect(e4.hijos[1]!.hijos.map((h) => h.san)).toEqual(['Nf3', 'c3']);
		expect(e4.hijos[0]!.hijos[0]!.comentario).toBe('');
		const ids = new Set<string>();
		const rec = (n: typeof p.raiz) => { ids.add(n.id); n.hijos.forEach(rec); };
		rec(p.raiz);
		expect(ids.size).toBe(7);
		const texto = escribirPgn(p);
		expect(texto).not.toContain('eval');
		expect(texto).toContain('( 1... c5');
	});
	it('FEN inicial y texto sin partida', () => {
		const fen = '8/P6k/8/8/8/8/8/K7 w - - 0 1';
		const p = leerPgn(`[SetUp "1"]\n[FEN "${fen}"]\n\n1. a8=Q *`)!;
		expect(p.raiz.fen).toBe(fen);
		expect(p.raiz.hijos[0]!.san).toBe('a8=Q');
		expect(leerPgn('')?.raiz.hijos ?? []).toEqual([]);
	});
});
