// Protocolo UCI: leer líneas del motor y armar comandos. Funciones puras sobre texto.

export interface InfoUci {
	profundidad: number;
	cp?: number;
	mate?: number;
	pv: string[];
}

export interface BestmoveUci {
	mejor: string;
	ponder?: string;
}

export interface OpcionesGo {
	movetimeMs?: number;
	profundidad?: number;
}

export interface OpcionesNivel {
	skill: number;
	limitarElo?: number;
}

export function parsearInfo(linea: string): InfoUci | null {
	const t = linea.trim().split(/\s+/);
	if (t[0] !== 'info') return null;
	const iDepth = t.indexOf('depth');
	const iPv = t.indexOf('pv');
	if (iDepth < 0 || iPv < 0) return null;
	const pv = t.slice(iPv + 1);
	const profundidad = Number(t[iDepth + 1]);
	if (pv.length === 0 || !Number.isFinite(profundidad)) return null;
	const info: InfoUci = { profundidad, pv };
	const iScore = t.indexOf('score');
	if (iScore >= 0) {
		const valor = Number(t[iScore + 2]);
		if (t[iScore + 1] === 'cp' && Number.isFinite(valor)) info.cp = valor;
		if (t[iScore + 1] === 'mate' && Number.isFinite(valor)) info.mate = valor;
	}
	return info;
}

export function parsearBestmove(linea: string): BestmoveUci | null {
	const t = linea.trim().split(/\s+/);
	if (t[0] !== 'bestmove') return null;
	const mejor = t[1];
	if (mejor === undefined || mejor === '(none)') return null;
	const iPonder = t.indexOf('ponder');
	const ponder = iPonder >= 0 ? t[iPonder + 1] : undefined;
	return ponder === undefined ? { mejor } : { mejor, ponder };
}

export function comandoPosicion(fenInicial: string | null, ucis: string[]): string {
	const base = fenInicial === null ? 'position startpos' : `position fen ${fenInicial}`;
	return ucis.length === 0 ? base : `${base} moves ${ucis.join(' ')}`;
}

export function comandoGo(opciones: OpcionesGo): string {
	const partes = ['go'];
	if (opciones.movetimeMs !== undefined) partes.push('movetime', String(opciones.movetimeMs));
	if (opciones.profundidad !== undefined) partes.push('depth', String(opciones.profundidad));
	if (partes.length === 1) partes.push('depth', '8');
	return partes.join(' ');
}

export function comandosNivel(opciones: OpcionesNivel): string[] {
	const cmds = [`setoption name Skill Level value ${opciones.skill}`];
	if (opciones.limitarElo !== undefined) {
		cmds.push('setoption name UCI_LimitStrength value true');
		cmds.push(`setoption name UCI_Elo value ${opciones.limitarElo}`);
	}
	return cmds;
}
