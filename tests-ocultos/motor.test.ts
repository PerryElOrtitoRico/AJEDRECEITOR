import { Motor, NIVELES, type Trabajador } from '../src/adaptadores/motor';

// Worker falso que habla UCI. demoraMs = null → nunca responde bestmove (hasta un "stop").
function falso(demoraMs: number | null, mudo = false) {
	const enviados: string[] = [];
	let terminado = false;
	const w: Trabajador = {
		onmessage: null,
		terminate: () => { terminado = true; },
		postMessage(m) {
			enviados.push(m);
			const r = (l: string, ms = 0) => setTimeout(() => w.onmessage?.({ data: l }), ms);
			if (mudo) return;
			if (m === 'uci') r('uciok');
			if (m === 'isready') r('readyok');
			if (m.startsWith('go') && demoraMs !== null) { r('info depth 1 score cp 10 pv e2e4'); r('bestmove e2e4 ponder e7e5', demoraMs); }
			if (m === 'stop') r('bestmove d2d4');
		},
	};
	return { w, enviados, terminado: () => terminado };
}

describe('motor', () => {
	it('respuesta normal con nivel y posición', async () => {
		const f = falso(5);
		const m = new Motor(() => f.w, 200);
		expect(await m.mejorJugada(null, ['e2e4'], NIVELES[0]!)).toBe('e2e4');
		expect(f.enviados).toContain('setoption name Skill Level value 0');
		expect(f.enviados).toContain('position startpos moves e2e4');
		expect(f.enviados).toContain('go depth 1');
	});
	it('búsquedas en cola, en orden', async () => {
		const f = falso(5);
		const m = new Motor(() => f.w, 200);
		const r = await Promise.all([m.mejorJugada(null, [], NIVELES[1]!), m.mejorJugada(null, [], NIVELES[2]!)]);
		expect(r).toEqual(['e2e4', 'e2e4']);
		expect(f.enviados.filter((x) => x.startsWith('go'))).toEqual(['go depth 2', 'go depth 4']);
	});
	it('cancelación con stop y tiempo máximo', async () => {
		const f = falso(null);
		const m = new Motor(() => f.w, 50);
		const p = m.mejorJugada(null, [], NIVELES[4]!);
		setTimeout(() => m.detener(), 10);
		expect(await p).toBe('d2d4');
		expect(await m.mejorJugada(null, [], NIVELES[4]!)).toBe('d2d4'); // se pasó del tiempo máximo: stop
	});
	it('motor mudo → null y se recrea', async () => {
		let creados = 0;
		const m = new Motor(() => { creados++; return falso(0, true).w; }, 20);
		expect(await m.mejorJugada(null, [], NIVELES[0]!)).toBeNull();
		expect(await m.mejorJugada(null, [], NIVELES[0]!)).toBeNull();
		expect(creados).toBe(2);
	});
});
