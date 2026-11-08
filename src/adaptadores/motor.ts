// Stockfish en un Worker, hablando UCI. Una búsqueda por vez (cola), con tiempo máximo y cancelación.
import { comandoGo, comandoPosicion, comandosNivel, parsearBestmove } from '../core/uci';

export interface Trabajador {
	postMessage(mensaje: string): void;
	onmessage: ((e: { data: unknown }) => void) | null;
	terminate(): void;
}

export interface Busqueda {
	skill: number; // 0..20
	profundidad?: number;
	movetimeMs?: number;
}

// Calibrar jugando: el nivel 1 tiene que ganarle a alguien de ~500 en chess.com solo a veces.
export const NIVELES: Busqueda[] = [
	{ skill: 0, profundidad: 1 },
	{ skill: 2, profundidad: 2 },
	{ skill: 5, profundidad: 4 },
	{ skill: 10, profundidad: 6 },
	{ skill: 15, profundidad: 10 },
];
export const PISTA: Busqueda = { skill: 20, movetimeMs: 500 };

export class Motor {
	private w: Trabajador | null = null;
	private espera: { prefijo: string; resolver: (linea: string | null) => void } | null = null;
	private cola: Promise<unknown> = Promise.resolve();

	constructor(private crear: () => Trabajador, private tiempoMaxMs = 10_000) {}

	// Mejor jugada en UCI, o null si el motor no respondió o no hay jugadas.
	mejorJugada(fenInicial: string | null, ucis: string[], b: Busqueda): Promise<string | null> {
		const tarea = this.cola.then(() => this.buscar(fenInicial, ucis, b));
		this.cola = tarea.catch(() => null);
		return tarea;
	}

	// Corta la búsqueda en curso; su promesa se resuelve con lo que el motor tenga.
	detener(): void {
		if (this.espera?.prefijo === 'bestmove') this.w?.postMessage('stop');
	}

	cerrar(): void {
		this.espera?.resolver(null);
		this.w?.terminate();
		this.w = null;
	}

	private esperar(prefijo: string, ms: number): Promise<string | null> {
		return new Promise((resolver) => {
			const t = setTimeout(() => fin(null), ms);
			const fin = (linea: string | null) => {
				clearTimeout(t);
				this.espera = null;
				resolver(linea);
			};
			this.espera = { prefijo, resolver: fin };
		});
	}

	private async arrancar(): Promise<boolean> {
		if (this.w) return true;
		this.w = this.crear();
		this.w.onmessage = (e) => {
			const linea = String(e.data);
			if (this.espera && linea.startsWith(this.espera.prefijo)) this.espera.resolver(linea);
		};
		const listo = this.esperar('uciok', this.tiempoMaxMs);
		this.w.postMessage('uci');
		if (await listo) return true;
		this.cerrar();
		return false;
	}

	private async buscar(fenInicial: string | null, ucis: string[], b: Busqueda): Promise<string | null> {
		if (!(await this.arrancar()) || !this.w) return null;
		for (const c of comandosNivel({ skill: b.skill })) this.w.postMessage(c);
		const listo = this.esperar('readyok', this.tiempoMaxMs);
		this.w.postMessage('isready');
		if (!(await listo)) return this.cerrar(), null;
		const respuesta = this.esperar('bestmove', this.tiempoMaxMs);
		this.w.postMessage(comandoPosicion(fenInicial, ucis));
		this.w.postMessage(comandoGo({ ...(b.profundidad ? { profundidad: b.profundidad } : {}), ...(b.movetimeMs ? { movetimeMs: b.movetimeMs } : {}) }));
		let linea = await respuesta;
		if (linea === null && this.w) {
			const tarde = this.esperar('bestmove', 1000);
			this.w.postMessage('stop');
			linea = await tarde;
			if (linea === null) this.cerrar();
		}
		return linea ? (parsearBestmove(linea)?.mejor ?? null) : null;
	}
}
