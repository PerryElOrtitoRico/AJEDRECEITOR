// Importación desde chess.com: URLs de la API pública y lectura de sus respuestas JSON. Funciones puras.

export interface PgnChesscom {
	url: string; // enlace de la partida ('' si no vino)
	pgn: string;
}

export function urlArchivos(usuario: string): string {
	// TODO T13
	throw new Error('T13: no implementado');
}

export function urlsDeMeses(json: unknown, desde?: string): string[] {
	// TODO T13
	throw new Error('T13: no implementado');
}

export function pgnsDeMes(json: unknown): PgnChesscom[] {
	// TODO T13
	throw new Error('T13: no implementado');
}

export function idChesscom(url: string): string | null {
	// TODO T13
	throw new Error('T13: no implementado');
}
