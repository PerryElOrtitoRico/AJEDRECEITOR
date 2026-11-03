// Importación desde chess.com: URLs de la API pública y lectura de sus respuestas JSON. Funciones puras.

export interface PgnChesscom {
	url: string; // enlace de la partida ('' si no vino)
	pgn: string;
}

/**
 * Verifica si un valor es un objeto no nulo.
 */
const esObjeto = (x: unknown): x is Record<string, unknown> =>
	typeof x === 'object' && x !== null;

export function urlArchivos(usuario: string): string {
	return `https://api.chess.com/pub/player/${encodeURIComponent(usuario.toLowerCase())}/games/archives`;
}

export function urlsDeMeses(json: unknown, desde?: string): string[] {
	if (!esObjeto(json) || !Array.isArray(json.archives)) {
		return [];
	}

	const archives = json.archives;
	const meses: { url: string; mes: string }[] = [];
	const regex = /\/(\d{4})\/(\d{2})\/?$/;

	for (const item of archives) {
		if (typeof item === 'string') {
			const match = item.match(regex);
			if (match) {
				const anio = match[1];
				const mes = match[2];
				const mesStr = `${anio}-${mes}`;
				// Guardar la URL tal cual viene, sin agregar barra final si no la tenía.
				meses.push({ url: item, mes: mesStr });
			}
		}
	}

	let filtrados = meses;
	if (desde !== undefined) {
		filtrados = meses.filter(m => m.mes >= desde);
	}

	// Ordenar de más viejo a más nuevo (alfabéticamente funciona para AAAA-MM)
	filtrados.sort((a, b) => a.mes.localeCompare(b.mes));
	return filtrados.map(m => m.url);
}

export function pgnsDeMes(json: unknown): PgnChesscom[] {
	if (!esObjeto(json) || !Array.isArray(json.games)) {
		return [];
	}

	const games = json.games;
	const resultados: PgnChesscom[] = [];

	for (const game of games) {
		if (esObjeto(game) && typeof game.pgn === 'string' && game.pgn.trim().length > 0) {
			const url = typeof game.url === 'string' ? game.url : '';
			resultados.push({ url: url, pgn: game.pgn });
		}
	}

	return resultados;
}

export function idChesscom(url: string): string | null {
	const regex = /\/game\/(?:live|daily)\/(\d+)\/?(?:[?#].*)?$/;
	const match = url.match(regex);
	return match?.[1] ?? null;
}
