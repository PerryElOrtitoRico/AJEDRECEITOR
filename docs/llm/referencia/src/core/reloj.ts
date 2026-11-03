// Reloj de ajedrez. Inmutable: todo el tiempo se recibe por parámetro (ahoraMs), nunca se lee un reloj del sistema.
import type { Color } from './tipos';

export interface Reloj {
	baseSeg: number;
	incSeg: number;
	restanteSeg: { blancas: number; negras: number };
	turno: Color | null; // de quién corre el tiempo; null = detenido
	desdeMs: number | null; // instante en que empezó a correr el turno actual
}

export function crearReloj(config: { baseSeg: number; incSeg: number }): Reloj {
	return {
		baseSeg: config.baseSeg,
		incSeg: config.incSeg,
		restanteSeg: { blancas: config.baseSeg, negras: config.baseSeg },
		turno: null,
		desdeMs: null,
	};
}

export function iniciar(r: Reloj, color: Color, ahoraMs: number): Reloj {
	return { ...r, restanteSeg: { ...r.restanteSeg }, turno: color, desdeMs: ahoraMs };
}

export function restante(r: Reloj, color: Color, ahoraMs: number): number {
	const guardado = r.restanteSeg[color];
	if (r.turno !== color || r.desdeMs === null) return guardado;
	return Math.max(0, guardado - (ahoraMs - r.desdeMs) / 1000);
}

export function jugada(r: Reloj, ahoraMs: number): Reloj {
	if (r.turno === null || r.desdeMs === null) return r;
	const quedan = restante(r, r.turno, ahoraMs);
	const nuevo = quedan > 0 ? quedan + r.incSeg : 0;
	const otro: Color = r.turno === 'blancas' ? 'negras' : 'blancas';
	return {
		...r,
		restanteSeg: { ...r.restanteSeg, [r.turno]: nuevo },
		turno: otro,
		desdeMs: ahoraMs,
	};
}

export function caido(r: Reloj, ahoraMs: number): Color | null {
	if (restante(r, 'blancas', ahoraMs) <= 0) return 'blancas';
	if (restante(r, 'negras', ahoraMs) <= 0) return 'negras';
	return null;
}

function dos(n: number): string {
	return String(n).padStart(2, '0');
}

export function formato(seg: number): string {
	const s = Math.max(0, seg);
	if (s < 10) return `0:0${(Math.floor(s * 10 + 1e-6) / 10).toFixed(1)}`;
	const t = Math.floor(s);
	const h = Math.floor(t / 3600);
	const m = Math.floor((t % 3600) / 60);
	return h > 0 ? `${h}:${dos(m)}:${dos(t % 60)}` : `${m}:${dos(t % 60)}`;
}
