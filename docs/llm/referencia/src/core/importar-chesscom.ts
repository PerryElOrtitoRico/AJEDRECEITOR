// Importación desde chess.com: URLs de la API pública y lectura de sus respuestas JSON. Funciones puras.

export interface PgnChesscom {
	url: string; // enlace de la partida ('' si no vino)
	pgn: string;
}

export function urlArchivos(usuario: string): string {
	return `https://api.chess.com/pub/player/${encodeURIComponent(usuario.toLowerCase())}/games/archives`;
}

function esObjeto(x: unknown): x is Record<string, unknown> {
	return typeof x === 'object' && x !== null;
}

export function urlsDeMeses(json: unknown, desde?: string): string[] {
	if (!esObjeto(json) || !Array.isArray(json['archives'])) return [];
	const meses: { url: string; mes: string }[] = [];
	for (const u of json['archives']) {
		if (typeof u !== 'string') continue;
		const m = /(\d{4})\/(\d{2})\/?$/.exec(u);
		if (m === null) continue;
		meses.push({ url: u, mes: `${m[1]}-${m[2]}` });
	}
	return meses
		.filter((x) => desde === undefined || x.mes >= desde)
		.sort((a, b) => (a.mes < b.mes ? -1 : a.mes > b.mes ? 1 : 0))
		.map((x) => x.url);
}

export function pgnsDeMes(json: unknown): PgnChesscom[] {
	if (!esObjeto(json) || !Array.isArray(json['games'])) return [];
	const salida: PgnChesscom[] = [];
	for (const g of json['games']) {
		if (!esObjeto(g) || typeof g['pgn'] !== 'string' || g['pgn'] === '') continue;
		salida.push({ url: typeof g['url'] === 'string' ? g['url'] : '', pgn: g['pgn'] });
	}
	return salida;
}

export function idChesscom(url: string): string | null {
	const m = /\/game\/(?:live|daily)\/(\d+)\/?(?:[?#].*)?$/.exec(url);
	return m === null ? null : (m[1] as string);
}
