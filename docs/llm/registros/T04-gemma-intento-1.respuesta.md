```ts
// src/core/uci.ts
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
	if (t[0] !== 'info') {
		return null;
	}

	const iDepth = t.indexOf('depth');
	const iPv = t.indexOf('pv');

	if (iDepth === -1 || iPv === -1) {
		return null;
	}

	const profundidad = Number(t[iDepth + 1]);
	if (!Number.isFinite(profundidad)) {
		return null;
	}

	const pv = t.slice(iPv + 1);
	if (pv.length === 0) {
		return null;
	}

	const info: InfoUci = { profundidad, pv };

	const iScore = t.indexOf('score');
	if (iScore !== -1) {
		const tipo = t[iScore + 1];
		const valor = Number(t[iScore + 2]);

		if (tipo === 'cp' && Number.isFinite(valor)) {
			info.cp = valor;
		} else if (tipo === 'mate' && Number.isFinite(valor)) {
			info.mate = valor;
		}
	}

	return info;
}

export function parsearBestmove(linea: string): BestmoveUci | null {
	const t = linea.trim().split(/\s+/);
	if (t[0] !== 'bestmove') {
		return null;
	}

	const mejor = t[1];
	if (!mejor || mejor === '(none)') {
		return null;
	}

	const mejorMove: BestmoveUci = { mejor };

	const iPonder = t.indexOf('ponder');
	if (iPonder !== -1 && iPonder + 1 < t.length) {
		const ponder = t[iPonder + 1];
		if (ponder) {
			(mejorMove as any).ponder = ponder;
		}
	}

	return mejorMove;
}

export function comandoPosicion(fenInicial: string | null, ucis: string[]): string {
	let comando = fenInicial === null ? 'position startpos' : `position fen ${fenInicial}`;
	if (ucis.length > 0) {
		command += ` moves ${ucis.join(' ')}`;
	}
	return command;
}

export function comandoGo(opciones: OpcionesGo): string {
	const partes: string[] = ['go'];
	const opcionesGo: string[] = [];

	if (opciones.movetimeMs !== undefined) {
		opcionesGo.push(`movetime ${opciones.movetimeMs}`);
	}
	if (opciones.profundidad !== undefined) {
		opcionesGo.push(`depth ${opciones.profundidad}`);
	} else if (!opciones.movetimeMs && !opciones.profundidad) {
		// Si no hay ninguna opción, agregar profundidad 8 por defecto
		opcionesGo.push('depth 8');
	}

	return [
		...partes,
		...opcionesGo
	].join(' ');
}

export function comandosNivel(opciones: OpcionesNivel): string[] {
	const comandos: string[] = [];

	// Primer elemento: setoption name Skill Level value ${skill}
	comandos.push(`setoption name Skill Level value ${opciones.skill}`);

	if (opciones.limitarElo !== undefined) {
		// Si hay limitarElo, agregar UCI_LimitStrength
		comandos.push('setoption name UCI_LimitStrength value true');
		// Y UCI_Elo
		comandos.push(`setoption name UCI_Elo value ${opciones.limitarElo}`);
	}

	return comandos;
}
```

<!-- 131 s · entrada 1709 · salida 1034 · finish_reason stop -->
