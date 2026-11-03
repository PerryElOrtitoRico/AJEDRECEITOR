// Índice de partidas: leer cabeceras PGN, mantener la lista al día, ordenar y filtrar. Funciones puras.
import type { Archivo, MetaPartida } from './tipos';
import { esArchivoPartida } from './nombres';

export type ResultadoParaMi = 'victoria' | 'derrota' | 'tablas' | 'en curso' | 'desconocido';

export interface ActualizacionIndice {
	indice: MetaPartida[]; // las entradas que se reutilizan
	aLeer: string[]; // archivos nuevos o con otro `modificado`
	eliminados: string[]; // estaban en el índice y ya no están en la carpeta
}

// --- Cabecera y metadatos (T09) ---

export function cabeceraDePgn(texto: string): Record<string, string> {
	// TODO T09
	throw new Error('T09: no implementado');
}

export function metaDesdeCabecera(
	archivo: string,
	modificado: number,
	cabecera: Record<string, string>,
	plies: number,
): MetaPartida {
	// TODO T09
	throw new Error('T09: no implementado');
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
