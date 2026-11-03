// Pista de dos pasos: primero se resalta la pieza a mover, después la jugada completa.

export interface EstadoPista {
	fen: string;
	mejor: string; // jugada UCI, por ejemplo 'e2e4' o 'e7e8q'
	nivel: 1 | 2;
}

export function siguientePista(previa: EstadoPista | null, fen: string, mejorUci: string): EstadoPista {
	const nivel = previa !== null && previa.fen === fen ? 2 : 1;
	return { fen, mejor: mejorUci, nivel };
}

export function casillasAResaltar(estado: EstadoPista): string[] {
	if (estado.mejor.length < 4) return [];
	const desde = estado.mejor.slice(0, 2);
	const hasta = estado.mejor.slice(2, 4);
	return estado.nivel === 1 ? [desde] : [desde, hasta];
}
