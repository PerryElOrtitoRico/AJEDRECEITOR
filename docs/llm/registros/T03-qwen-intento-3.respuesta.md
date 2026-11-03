```ts
// src/core/reloj.ts
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
	return {
		baseSeg: r.baseSeg,
		incSeg: r.incSeg,
		restanteSeg: { ...r.restanteSeg },
		turno: color,
		desdeMs: ahoraMs,
	};
}

export function jugada(r: Reloj, ahoraMs: number): Reloj {
	if (r.turno === null || r.desdeMs === null) {
		return { ...r };
	}
	const guardado = r.restanteSeg[r.turno];
	const transcurrido = (ahoraMs - r.desdeMs) / 1000;
	let quedan = Math.max(0, guardado - transcurrido);
	
	if (quedan > 0) {
		quedan += r.incSeg;
	}

	const otroColor: Color = r.turno === 'blancas' ? 'negras' : 'blancas';
	return {
		baseSeg: r.baseSeg,
		incSeg: r.incSeg,
		restanteSeg: {
			blancas: r.turno === 'blancas' ? quedan : r.restanteSeg.blancas,
			negras: r.turno === 'negras' ? quedan : r.restanteSeg.negras,
		},
		turno: otroColor,
		desdeMs: ahoraMs,
	};
}

export function restante(r: Reloj, color: Color, ahoraMs: number): number {
	const guardado = r.restanteSeg[color];
	if (r.turno !== color || r.desdeMs === null) {
		return guardado;
	}
	return Math.max(0, guardado - (ahoraMs - r.desdeMs) / 1000);
}

export function caido(r: Reloj, ahoraMs: number): Color | null {
	const blancas = restante(r, 'blancas', ahoraMs);
	if (blancas <= 0) return 'blancas';
	
	const negras = restante(r, 'negras', ahoraMs);
	if (negras <= 0) return 'negras';
	
	return null;
}

export function formato(seg: number): string {
	const s = Math.max(0, seg);
	
	if (s < 10) {
		const valor = Math.floor(s * 10 + 1e-6) / 10;
		return `0:0${valor.toFixed(1)}`;
	}
	
	const t = Math.floor(s);
	const h = Math.floor(t / 3600);
	let resto = t % 3600;
	const m = Math.floor(resto / 60);
	const ss = resto % 60;
	
	if (h > 0) {
		return `${h}:${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
	} else {
		return `${m}:${ss.toString().padStart(2, '0')}`;
	}
}
```

<!-- 75 s · entrada 3069 · salida 932 · finish_reason stop -->
