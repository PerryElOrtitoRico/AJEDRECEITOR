// Importación desde Lichess: URL de la API, separar el PGN múltiple, identificar partidas. Funciones puras.

export function urlLichess(usuario: string, opciones: { desdeMs?: number; max?: number }): string {
	let url = `https://lichess.org/api/games/user/${encodeURIComponent(usuario)}?clocks=true&evals=false&opening=false`;
	if (opciones.desdeMs !== undefined) url += `&since=${opciones.desdeMs}`;
	if (opciones.max !== undefined) url += `&max=${opciones.max}`;
	return url;
}

export function separarPartidas(texto: string): string[] {
	const partidas: string[] = [];
	let actual: string[] = [];
	const lineas = texto.split(/\r?\n/);
	lineas.forEach((linea, i) => {
		const empieza = linea.trimStart().startsWith('[Event ') && (i === 0 || (lineas[i - 1] ?? '').trim() === '');
		if (empieza && actual.join('').trim() !== '') {
			partidas.push(actual.join('\n').trim());
			actual = [];
		}
		actual.push(linea);
	});
	if (actual.join('').trim() !== '') partidas.push(actual.join('\n').trim());
	return partidas;
}

const SITE = /lichess\.org\/(?:game\/)?([A-Za-z0-9]{8})(?:\/(?:white|black))?\/?$/;

export function idLichess(cabecera: Record<string, string>): string | null {
	const gameId = cabecera['GameId'];
	if (gameId !== undefined && gameId !== '') return gameId;
	const m = SITE.exec(cabecera['Site'] ?? '');
	return m === null ? null : (m[1] as string);
}

const ETIQUETA = /^\[\w+\s+"/;

export function marcarImportada(pgn: string, origen: 'lichess' | 'chesscom', id: string): string {
	const lineas = pgn.split('\n');
	let ultima = -1;
	for (let i = 0; i < lineas.length; i++) {
		const l = (lineas[i] as string).trim();
		if (l === '') continue;
		if (!ETIQUETA.test(l)) break;
		ultima = i;
	}
	const hay = (clave: string) => lineas.some((l) => l.trim().startsWith(`[${clave} `));
	const nuevas: string[] = [];
	if (!hay('ImportId')) nuevas.push(`[ImportId "${origen}:${id}"]`);
	if (!hay('Origen')) nuevas.push(`[Origen "${origen}"]`);
	if (nuevas.length === 0) return pgn;
	if (ultima < 0) return nuevas.join('\n') + '\n\n' + pgn;
	lineas.splice(ultima + 1, 0, ...nuevas);
	return lineas.join('\n');
}
