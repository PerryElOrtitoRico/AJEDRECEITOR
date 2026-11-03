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
	// TODO T04
	throw new Error('T04: no implementado');
}

export function parsearBestmove(linea: string): BestmoveUci | null {
	// TODO T04
	throw new Error('T04: no implementado');
}

export function comandoPosicion(fenInicial: string | null, ucis: string[]): string {
	// TODO T04
	throw new Error('T04: no implementado');
}

export function comandoGo(opciones: OpcionesGo): string {
	// TODO T04
	throw new Error('T04: no implementado');
}

export function comandosNivel(opciones: OpcionesNivel): string[] {
	// TODO T04
	throw new Error('T04: no implementado');
}
