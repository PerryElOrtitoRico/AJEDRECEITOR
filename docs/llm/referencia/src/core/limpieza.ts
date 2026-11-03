// Limpieza de comentarios y NAGs que vienen de otros sitios. Funciones puras.

export interface RelojExtraido {
	relojSeg: number | null;
	resto: string;
}

const RELOJ = /\[%clk\s+(\d+):(\d{1,2}):(\d{1,2}(?:\.\d+)?)\]/;
const EVALUACIONES = /\[%(?:eval|emt|cal|csl|depth)\s[^\]]*\]/g;
const ANALISIS = /^(Inaccuracy|Mistake|Blunder)\. .* was best\.$/;

function compactar(texto: string): string {
	return texto.replace(/ {2,}/g, ' ').trim();
}

export function extraerReloj(comentario: string): RelojExtraido {
	const m = RELOJ.exec(comentario);
	if (!m) return { relojSeg: null, resto: compactar(comentario) };
	const seg = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
	return { relojSeg: seg, resto: compactar(comentario.replace(RELOJ, '')) };
}

export function quitarEvaluaciones(comentario: string): string {
	return compactar(comentario.replace(EVALUACIONES, ''));
}

export function esComentarioDeAnalisis(texto: string): boolean {
	const t = texto.trim();
	return ANALISIS.test(t) || t === 'Checkmate is now unavoidable.';
}

export function limpiarNags(nags: number[]): number[] {
	return nags.filter((n) => !(n >= 1 && n <= 6) && !(n >= 10 && n <= 19));
}
