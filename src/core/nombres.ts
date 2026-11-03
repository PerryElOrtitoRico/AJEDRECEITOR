// Nombres de archivos de partidas. Funciones puras, sin acceso a archivos.

export interface FechaHora {
	a: number; // año
	m: number; // mes 1-12
	d: number; // día
	h: number;
	mi: number;
	s: number;
}

export function limpiarNombre(s: string): string {
	// 1. Normalizar y quitar acentos
	let limpio = s.normalize('NFD').replace(/[̀-ͯ]/g, '');

	// 2. Pasar a minúsculas
	limpio = limpio.toLowerCase();

	// 3. Cambiar caracteres no alfanuméricos por un solo '-'
	limpio = limpio.replace(/[^a-z0-9]+/g, '-');

	// 4. Quitar guiones del principio y del final
	limpio = limpio.replace(/^-+|-+$/g, '');

	// 5. Cortar a 20 caracteres y quitar guiones finales
	limpio = limpio.substring(0, 20);
	limpio = limpio.replace(/-+$/, '');

	// 6. Si quedó vacío, devolver 'anonimo'
	return limpio === '' ? 'anonimo' : limpio;
}

export function nombreArchivo(fecha: FechaHora, blancas: string, negras: string, id8: string): string {
	const nombreBlancas = limpiarNombre(blancas);
	const nombreNegras = limpiarNombre(negras);

	const mesStr = String(fecha.m).padStart(2, '0');
	const diaStr = String(fecha.d).padStart(2, '0');
	const horaStr = String(fecha.h).padStart(2, '0');
	const minStr = String(fecha.mi).padStart(2, '0');
	const segStr = String(fecha.s).padStart(2, '0');

	return `${fecha.a}-${mesStr}-${diaStr}_${horaStr}${minStr}${segStr}_${nombreBlancas}-vs-${nombreNegras}_${id8}.pgn`;
}

export function esArchivoPartida(nombre: string): boolean {
	if (nombre.startsWith('.') || nombre.endsWith('.tmp')) {
		return false;
	}
	if (nombre.includes('.sync-conflict-')) {
		return false;
	}
	return nombre.endsWith('.pgn');
}

export function esConflicto(nombre: string): boolean {
	const conflictoRegex = /\.sync-conflict-\d{8}-\d{6}-[A-Z0-9]{7}\.pgn$/;
	return conflictoRegex.test(nombre);
}

export function originalDeConflicto(nombre: string): string | null {
	const conflictoRegex = /\.sync-conflict-(\d{8}-\d{6}-[A-Z0-9]{7})\.(pgn)$/;
	const match = nombre.match(conflictoRegex);

	if (match) {
		// Reemplaza la parte del conflicto por .pgn
		const baseName = nombre.substring(0, match.index);
		return baseName + '.pgn';
	}
	return null;
}
