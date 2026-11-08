import { crearSesion, deshacer, fenActual, jugadas, mover, porTiempo, rendirse, retomar, tablas, turnoDelMotor } from '../src/app/sesion-juego';
import { escribirPgn, leerPgn } from '../src/adaptadores/pgnio';

const nueva = (miColor: 'blancas' | 'negras' = 'blancas') =>
	crearSesion({ miColor, nivel: 2, baseSeg: 60, incSeg: 2, miNombre: 'FrancoStechina', ahora: new Date(2026, 10, 8) });

describe('sesion-juego', () => {
	it('cabecera, jugadas, reloj con incremento y [%clk]', () => {
		let s = nueva();
		expect(s.partida.cabecera).toMatchObject({ White: 'FrancoStechina', Black: 'Stockfish nivel 2', Date: '2026.11.08', EnCurso: '1', TimeControl: '60+2' });
		s = mover(s, 'e2e4', 0)!;
		expect(turnoDelMotor(s)).toBe(true);
		s = mover(s, 'e7e5', 10_000)!;
		expect(s.reloj.restanteSeg.negras).toBe(52);
		expect(jugadas(s).map((n) => n.relojSeg)).toEqual([62, 52]);
		expect(mover(s, 'e1e3', 11_000)).toBeNull();
	});
	it('mate termina, quita EnCurso y pone Result', () => {
		let s = nueva('negras');
		for (const [i, u] of ['f2f3', 'e7e5', 'g2g4', 'd8h4'].entries()) s = mover(s, u, i * 1000)!;
		expect(s.fin).toEqual({ resultado: '0-1', motivo: 'jaque mate' });
		expect(s.partida.cabecera.EnCurso).toBeUndefined();
		expect(s.partida.cabecera.Result).toBe('0-1');
		expect(mover(s, 'a2a3', 5000)).toBeNull();
	});
	it('deshacer quita mi jugada y la del motor', () => {
		let s = mover(mover(mover(nueva(), 'e2e4', 0)!, 'e7e5', 1000)!, 'g1f3', 2000)!;
		s = deshacer(s, 3000); // motor pensando: quita solo Nf3
		expect(jugadas(s).map((n) => n.san)).toEqual(['e4', 'e5']);
		s = deshacer(s, 4000); // quita e5 y e4
		expect(jugadas(s)).toEqual([]);
		expect(s.reloj.incSeg).toBe(2);
	});
	it('tiempo, rendirse y tablas', () => {
		const s = mover(nueva(), 'e2e4', 0)!;
		expect(porTiempo(s, 61_000).fin).toEqual({ resultado: '1-0', motivo: 'tiempo' });
		expect(mover(s, 'e7e5', 61_000)!.fin?.motivo).toBe('tiempo');
		expect(rendirse(s).fin?.resultado).toBe('0-1');
		expect(tablas(s).fin?.resultado).toBe('1/2-1/2');
	});
	it('guardar a mitad de partida y retomar', () => {
		let s = mover(mover(nueva('negras'), 'd2d4', 0)!, 'g8f6', 5000)!;
		const otra = retomar(leerPgn(escribirPgn(s.partida))!, ['francostechina'], 100_000);
		expect(otra.miColor).toBe('negras');
		expect(otra.nivel).toBe(2);
		expect(otra.reloj.restanteSeg).toEqual({ blancas: 62, negras: 57 });
		expect(otra.reloj.turno).toBe('blancas');
		expect(fenActual(otra)).toBe(fenActual(s));
	});
});
