```ts
// src/core/uci.ts
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
	if (iDepth === -1 || iPv === -1) return null;
	const profundidad = Number(t[iDepth + 1]);
	if (!Number.isFinite(profundidad)) return null;
	const pv = t.slice(iPv + 1);
	if (pv.length === 0) return null;
	const info: InfoUci = { profundidad, pv };
	const iScore = t.indexOf('score');
	if (iScore !== -1) {
		const tipo = t[iScore + 1];
		const valor = Number(t[iScore + 2]);
		if (tipo === 'cp' && Number.isFinite(valor)) info.cp = valor;
		else if (tipo === 'mate' && Number.isFinite(valor)) info.mate = valor;
	}
	return info;
}

export function parsearBestmove(linea: string): BestmoveUci | null {
	const t = linea.trim().split(/\s+/);
	if (t[0] !== 'bestmove') return null;
	const mejor = t[1];
	if (!mejor || mejor === '(none)') return null;
	const mejorMove: BestmoveUci = { mejor };
	const iPonder = t.indexOf('ponder');
	if (iPonder !== -1 && iPonder + 1 < t.length) {
		const ponder = t[iPonder + 1];
		if (ponder) mejorMove.ponder = ponder;
	}
	return mejorMove;
}

export function comandoPosicion(fenInicial: string | null, ucis: string[]): string {
	let comando = fenInicial === null ? 'position startpos' : `position fen ${fenInicial}`;
	if (ucis.length > 0) comando += ` moves ${ucis.join(' ')}`;
	return comando;
}

export function comandoGo(opciones: OpcionesGo): string {
	const partes: string[] = ['go'];
	if (opciones.movetimeMs !== undefined) partes.push(`movetime ${opciones.movetimeMs}`);
	if (opciones.profundidad !== undefined) partes.push(`depth ${opciones.profundidad}`);
	else if (!opciones.movetimeMs && !opciones.profundidad) partes.push('depth 8');
	return partes.join(' ');
}

export function comandosNivel(opciones: OpcionesNivel): string[] {
	const comandos: string[] = [`setoption name Skill Level value ${opciones.skill}`];
	if (opciones.limitarElo !== undefined) {
		comandos.push('setoption name UCI_LimitStrength value true');
		comandos.push(`setoption name UCI_Elo value ${opciones.limitarElo}`);
	}
	return comandos;
}
```

<!-- 520 s · entrada 2594 · salida 784 · finish_reason stop -->
