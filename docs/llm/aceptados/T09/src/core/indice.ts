// Índice de partidas: leer cabeceras PGN, mantener la lista al día, ordenar y filtrar. Funciones puras.
import type { Archivo, MetaPartida, Origen, Resultado } from './tipos';
import { esArchivoPartida } from './nombres';

export type ResultadoParaMi = 'victoria' | 'derrota' | 'tablas' | 'en curso' | 'desconocido';

export interface ActualizacionIndice {
	indice: MetaPartida[]; // las entradas que se reutilizan
	aLeer: string[]; // archivos nuevos o con otro `modificado`
	eliminados: string[]; // estaban en el índice y ya no están en la carpeta
}

// --- Cabecera y metadatos (T09) ---

export function cabeceraDePgn(texto: string): Record<string, string> {
	const cabecera: Record<string, string> = {};
	let etiquetasVistas = false;
	const lineas = texto.split(/\r?\n/);

	for (const linea of lineas) {
		const lineaRecortada = linea.trim();
		if (lineaRecortada.length === 0) {
			continue;
		}

		const regexEtiqueta = /^\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]\s*$/;
		const match = lineaRecortada.match(regexEtiqueta);

		if (match) {
			const clave = match[1] ?? '';
			let valor = match[2] ?? '';
			// Reemplazar secuencias de escape: \" -> ", \\ -> \
			valor = valor.replace(/\\(["\\])/g, '$1');
			if (clave !== '') {
				cabecera[clave] = valor;
			}
			etiquetasVistas = true;
		} else if (etiquetasVistas) {
			// Si no es etiqueta y ya vimos etiquetas, hemos entrado en jugadas
			break;
		}
	}

	return cabecera;
}

function fechaNormalizada(valor: string | undefined): string {
	if (!valor) return '';
	const fechaRegex = /^(\d{4})[.-](\d{2})[.-](\d{2})$/;
	const match = valor.match(fechaRegex);
	if (match) {
		// Formato AAAA-MM-DD
		return `${match[1]}-${match[2]}-${match[3]}`;
	}
	return '';
}

export function metaDesdeCabecera(
	archivo: string,
	modificado: number,
	cabecera: Record<string, string>,
	plies: number,
): MetaPartida {
	const fechaDate = fechaNormalizada(cabecera.Date);
	const fechaUTCDate = fechaNormalizada(cabecera.UTCDate);
	const fecha = fechaDate || fechaUTCDate;

	const blancas = cabecera.White ?? '?';
	const negras = cabecera.Black ?? '?';

	let resultado: Resultado = '*';
	const resStr = cabecera.Result;
	if (resStr === '1-0' || resStr === '0-1' || resStr === '1/2-1/2') {
		resultado = resStr as Resultado;
	}

	let origen: Origen = 'app';
	const importId = cabecera.ImportId;
	if (importId?.startsWith('lichess:')) {
		origen = 'lichess';
	} else if (importId?.startsWith('chesscom:')) {
		origen = 'chesscom';
	} else {
		const origenStr = cabecera.Origen;
		if (origenStr === 'app' || origenStr === 'lichess' || origenStr === 'chesscom' || origenStr === 'manual') {
			origen = origenStr as Origen;
		}
	}

	const enCurso = cabecera.EnCurso === '1';

	return {
		archivo: archivo.substring(archivo.lastIndexOf('/') + 1),
		modificado: modificado,
		fecha: fecha,
		blancas: blancas as string,
		negras: negras as string,
		resultado: resultado,
		origen: origen,
		plies: plies,
		enCurso: enCurso,
	};
}

// --- Mantener y ordenar (T10) ---

export function actualizarIndice(viejo: MetaPartida[], listado: Archivo[]): ActualizacionIndice {
	// TODO T10
	throw new Error('T10: no implementado');
}

export function ordenar(indice: MetaPartida[]): MetaPartida[] {
	// TODO T10
	throw new Error('T10: no implementado');
}

// --- Resultado para mí y filtro (T11) ---

export function resultadoParaMi(meta: MetaPartida, misNombres: string[]): ResultadoParaMi {
	// TODO T11
	throw new Error('T11: no implementado');
}

export function filtrar(
	indice: MetaPartida[],
	opciones: { resultado?: ResultadoParaMi; misNombres: string[] },
): MetaPartida[] {
	// TODO T11
	throw new Error('T11: no implementado');
}
