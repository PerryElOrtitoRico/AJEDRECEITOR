// Limpieza de comentarios y NAGs que vienen de otros sitios. Funciones puras.

export interface RelojExtraido {
	relojSeg: number | null;
	resto: string;
}

export function extraerReloj(comentario: string): RelojExtraido {
	// TODO T02
	throw new Error('T02: no implementado');
}

export function quitarEvaluaciones(comentario: string): string {
	// TODO T02
	throw new Error('T02: no implementado');
}

export function esComentarioDeAnalisis(texto: string): boolean {
	// TODO T02
	throw new Error('T02: no implementado');
}

export function limpiarNags(nags: number[]): number[] {
	// TODO T02
	throw new Error('T02: no implementado');
}
