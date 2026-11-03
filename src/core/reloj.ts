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
	// TODO T03
	throw new Error('T03: no implementado');
}

export function iniciar(r: Reloj, color: Color, ahoraMs: number): Reloj {
	// TODO T03
	throw new Error('T03: no implementado');
}

export function jugada(r: Reloj, ahoraMs: number): Reloj {
	// TODO T03
	throw new Error('T03: no implementado');
}

export function restante(r: Reloj, color: Color, ahoraMs: number): number {
	// TODO T03
	throw new Error('T03: no implementado');
}

export function caido(r: Reloj, ahoraMs: number): Color | null {
	// TODO T03
	throw new Error('T03: no implementado');
}

export function formato(seg: number): string {
	// TODO T03
	throw new Error('T03: no implementado');
}
