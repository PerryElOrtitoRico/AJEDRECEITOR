// Importación desde Lichess: URL de la API, separar el PGN múltiple, identificar partidas. Funciones puras.

export function urlLichess(usuario: string, opciones: { desdeMs?: number; max?: number }): string {
	// TODO T12
	throw new Error('T12: no implementado');
}

export function separarPartidas(texto: string): string[] {
	// TODO T12
	throw new Error('T12: no implementado');
}

export function idLichess(cabecera: Record<string, string>): string | null {
	// TODO T12
	throw new Error('T12: no implementado');
}

export function marcarImportada(pgn: string, origen: 'lichess' | 'chesscom', id: string): string {
	// TODO T12
	throw new Error('T12: no implementado');
}
