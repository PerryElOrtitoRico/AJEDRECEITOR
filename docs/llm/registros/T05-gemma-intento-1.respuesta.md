```ts
// src/core/pista.ts
// Pista de dos pasos: primero se resalta la pieza a mover, después la jugada completa.

export interface EstadoPista {
	fen: string;
	mejor: string; // jugada UCI, por ejemplo 'e2e4' o 'e7e8q'
	nivel: 1 | 2;
}

export function siguientePista(previa: EstadoPista | null, fen: string, mejorUci: string): EstadoPista {
	let nivel: 1 | 2 = 1;

	if (previa !== null && previa.fen === fen) {
		// Misma posición: se pulsó otra vez
		nivel = 2;
	}

	return {
		fen: fen,
		mejor: mejorUci,
		nivel: nivel,
	};
}

export function casillasAResaltar(estado: EstadoPista): string[] {
	// 1. Si estado.mejor.length < 4, devolver []
	if (estado.mejor.length < 4) {
		return [];
	}

	const { nivel } = estado;

	if (nivel === 1) {
		// Nivel 1 → [desde]
		// La jugada UCI es 'desde' + 'hasta' (ej: 'e2e4').
		// 'desde' son los primeros 2 caracteres.
		const desde = estado.mejor.slice(0, 2);
		return [desde];
	} else {
		// Nivel 2 → [desde, hasta]
		// 'desde' = slice(0, 2)
		// 'hasta' = slice(2, 4)
		const desde = estado.mejor.slice(0, 2);
		const hasta = estado.mejor.slice(2, 4);
		return [desde, hasta];
	}
}
```

<!-- 65 s · entrada 1058 · salida 439 · finish_reason stop -->
