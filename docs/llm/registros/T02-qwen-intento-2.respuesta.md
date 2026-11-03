```ts
// src/core/limpieza.ts
// Limpieza de comentarios y NAGs que vienen de otros sitios. Funciones puras.

export interface RelojExtraido {
	relojSeg: number | null;
	resto: string;
}

/**
 * Compacta un texto: reemplaza secuencias de 2 o más espacios por uno solo y recorta.
 */
function compactar(texto: string): string {
	return texto.replace(/\s{2,}/g, ' ').trim();
}

export function extraerReloj(comentario: string): RelojExtraido {
	const regex = /\[%clk\s+(\d+):(\d{1,2}):(\d{1,2}(?:\.\d+)?)\]/;
	const match = comentario.match(regex);

	if (!match) {
		return { relojSeg: null, resto: compactar(comentario) };
	}

	const horas = Number(match[1] ?? '0');
	const minutos = Number(match[2] ?? '0');
	const segundos = parseFloat(match[3]);

	const relojSeg = (horas * 3600) + (minutos * 60) + segundos;

	const resto = comentario.replace(regex, '').trim();

	return { relojSeg, resto: compactar(resto) };
}

export function quitarEvaluaciones(comentario: string): string {
	const regex = /\[%(?:eval|emt|cal|csl|depth)\s[^\]]*\]/g;
	const resultado = comentario.replace(regex, '');
	return compactar(resultado);
}

export function esComentarioDeAnalisis(texto: string): boolean {
	const trimmedText = texto.trim();
	const regexAnalisis = /^(Inaccuracy|Mistake|Blunder)\. .* was best\.$/;
	
	return regexAnalisis.test(trimmedText) || trimmedText === 'Checkmate is now unavoidable.';
}

export function limpiarNags(nags: number[]): number[] {
	const nagsFiltrados: number[] = [];
	for (const nag of nags) {
		// Conservar si no está en [1..6] ni en [10..19]
		const esNAGNoDeseado = (nag >= 1 && nag <= 6) || (nag >= 10 && nag <= 19);
		if (!esNAGNoDeseado) {
			nagsFiltrados.push(nag);
		}
	}
	return nagsFiltrados;
}
```

<!-- 136 s · entrada 1981 · salida 564 · finish_reason stop -->
