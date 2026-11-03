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

const ETIQUETA = /^\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]\s*$/;

export function cabeceraDePgn(texto: string): Record<string, string> {
	const cab: Record<string, string> = {};
	let vistas = 0;
	for (const cruda of texto.split(/\r?\n/)) {
		const linea = cruda.trim();
		if (linea === '') continue;
		const m = ETIQUETA.exec(linea);
		if (m === null) {
			if (vistas > 0) break;
			continue;
		}
		vistas++;
		cab[m[1] as string] = (m[2] as string).replace(/\\(["\\])/g, '$1');
	}
	return cab;
}

function fechaNormalizada(valor: string | undefined): string {
	const m = /^(\d{4})[.-](\d{2})[.-](\d{2})$/.exec(valor ?? '');
	return m === null ? '' : `${m[1]}-${m[2]}-${m[3]}`;
}

export function metaDesdeCabecera(
	archivo: string,
	modificado: number,
	cabecera: Record<string, string>,
	plies: number,
): MetaPartida {
	const fecha = fechaNormalizada(cabecera['Date']) || fechaNormalizada(cabecera['UTCDate']);
	const r = cabecera['Result'];
	const resultado: Resultado = r === '1-0' || r === '0-1' || r === '1/2-1/2' ? r : '*';
	const importId = cabecera['ImportId'] ?? '';
	const declarado = cabecera['Origen'];
	let origen: Origen = 'app';
	if (importId.startsWith('lichess:')) origen = 'lichess';
	else if (importId.startsWith('chesscom:')) origen = 'chesscom';
	else if (declarado === 'lichess' || declarado === 'chesscom' || declarado === 'manual' || declarado === 'app')
		origen = declarado;
	return {
		archivo,
		fecha,
		blancas: cabecera['White'] ?? '?',
		negras: cabecera['Black'] ?? '?',
		resultado,
		origen,
		plies,
		modificado,
		enCurso: cabecera['EnCurso'] === '1',
	};
}

// --- Mantener y ordenar (T10) ---

export function actualizarIndice(viejo: MetaPartida[], listado: Archivo[]): ActualizacionIndice {
	const porNombre = new Map(viejo.map((m) => [m.archivo, m]));
	const indice: MetaPartida[] = [];
	const aLeer: string[] = [];
	const presentes = new Set<string>();
	for (const a of listado) {
		if (!esArchivoPartida(a.nombre)) continue;
		presentes.add(a.nombre);
		const previo = porNombre.get(a.nombre);
		if (previo !== undefined && previo.modificado === a.modificado) indice.push(previo);
		else aLeer.push(a.nombre);
	}
	const eliminados = viejo.filter((m) => !presentes.has(m.archivo)).map((m) => m.archivo);
	return { indice, aLeer, eliminados };
}

export function ordenar(indice: MetaPartida[]): MetaPartida[] {
	return [...indice].sort((a, b) => {
		if (a.fecha === '' && b.fecha !== '') return 1;
		if (b.fecha === '' && a.fecha !== '') return -1;
		if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
		return b.modificado - a.modificado;
	});
}

// --- Resultado para mí y filtro (T11) ---

export function resultadoParaMi(meta: MetaPartida, misNombres: string[]): ResultadoParaMi {
	if (meta.enCurso) return 'en curso';
	const mios = misNombres.map((n) => n.toLowerCase());
	const soyBlancas = mios.includes(meta.blancas.toLowerCase());
	const soyNegras = mios.includes(meta.negras.toLowerCase());
	if (soyBlancas === soyNegras) return 'desconocido';
	if (meta.resultado === '1/2-1/2') return 'tablas';
	if (meta.resultado === '*') return 'desconocido';
	const ganaronBlancas = meta.resultado === '1-0';
	return ganaronBlancas === soyBlancas ? 'victoria' : 'derrota';
}

export function filtrar(
	indice: MetaPartida[],
	opciones: { resultado?: ResultadoParaMi; misNombres: string[] },
): MetaPartida[] {
	const { resultado, misNombres } = opciones;
	if (resultado === undefined) return [...indice];
	return indice.filter((m) => resultadoParaMi(m, misNombres) === resultado);
}
