// Importación desde Lichess: URL de la API, separar el PGN múltiple, identificar partidas. Funciones puras.

export function urlLichess(usuario: string, opciones: { desdeMs?: number; max?: number }): string {
	const base = `https://lichess.org/api/games/user/${encodeURIComponent(usuario)}?clocks=true&evals=false&opening=false`;
	const params: string[] = [];
	if (opciones.desdeMs !== undefined) params.push(`since=${opciones.desdeMs}`);
	if (opciones.max !== undefined) params.push(`max=${opciones.max}`);
	return params.length > 0 ? `${base}&${params.join('&')}` : base;
}

export function separarPartidas(texto: string): string[] {
	if (!texto || texto.trim() === '') return [];
	const lineas = texto.split(/\r?\n/);
	const resultado: string[] = [];
	let acumulado: string[] = [];
	
	for (let i = 0; i < lineas.length; i++) {
		const linea = lineas[i];
		if (linea === undefined) continue;
		
		const empiezaNueva = linea.trimStart().startsWith('[Event ') && 
		                    (i === 0 || (lineas[i - 1] ?? '').trim() === '');
		
		if (empiezaNueva) {
			if (acumulado.length > 0) {
				resultado.push(acumulado.join('\n').trim());
				acumulado = [];
			}
			acumulado.push(linea);
		} else {
			acumulado.push(linea);
		}
	}
	
	if (acumulado.length > 0) {
		resultado.push(acumulado.join('\n').trim());
	}
	return resultado;
}

export function idLichess(cabecera: Record<string, string>): string | null {
	if (cabecera.GameId && cabecera.GameId.trim() !== '') return cabecera.GameId;
	const site = cabecera.Site ?? '';
	const regex = /lichess\.org\/(?:game\/)?([A-Za-z0-9]{8})(?:\/(?:white|black))?\/?$/;
	const match = site.match(regex);
	return match?.[1] ?? null;
}

export function marcarImportada(pgn: string, origen: 'lichess' | 'chesscom', id: string): string {
	const lineas = pgn.split('\n');
	let ultimaEtiqueta = -1;
	
	for (let i = 0; i < lineas.length; i++) {
		const linea = lineas[i];
		if (linea === undefined) continue;
		if (linea.trim() === '') continue;
		if (/^\[\w+\s+"/.test(linea)) {
			ultimaEtiqueta = i;
		} else if (!/^\[/.test(linea)) {
			break;
		}
	}
	
	const hay = (clave: string) => lineas.some((l) => l.trim().startsWith(`[${clave} `));
	const hayImportId = hay('ImportId');
	const hayOrigen = hay('Origen');
	
	const nuevas: string[] = [];
	if (!hayImportId) nuevas.push(`[ImportId "${origen}:${id}"]`);
	if (!hayOrigen) nuevas.push(`[Origen "${origen}"]`);
	
	if (nuevas.length === 0) return pgn;
	
	if (ultimaEtiqueta < 0) {
		return nuevas.join('\n') + '\n\n' + pgn;
	}
	
	lineas.splice(ultimaEtiqueta + 1, 0, ...nuevas);
	return lineas.join('\n');
}
