// Nombres de archivos de partidas. Funciones puras, sin acceso a archivos.

export interface FechaHora {
	a: number; // año
	m: number; // mes 1-12
	d: number; // día
	h: number;
	mi: number;
	s: number;
}

const CONFLICTO = /\.sync-conflict-\d{8}-\d{6}-[A-Z0-9]{7}\.pgn$/;

function dos(n: number): string {
	return String(n).padStart(2, '0');
}

export function limpiarNombre(s: string): string {
	const base = s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 20)
		.replace(/-+$/g, '');
	return base === '' ? 'anonimo' : base;
}

export function nombreArchivo(fecha: FechaHora, blancas: string, negras: string, id8: string): string {
	const dia = `${fecha.a}-${dos(fecha.m)}-${dos(fecha.d)}`;
	const hora = `${dos(fecha.h)}${dos(fecha.mi)}${dos(fecha.s)}`;
	return `${dia}_${hora}_${limpiarNombre(blancas)}-vs-${limpiarNombre(negras)}_${id8}.pgn`;
}

export function esArchivoPartida(nombre: string): boolean {
	return (
		nombre.endsWith('.pgn') &&
		!nombre.startsWith('.') &&
		!nombre.includes('.sync-conflict-') &&
		!nombre.endsWith('.tmp')
	);
}

export function esConflicto(nombre: string): boolean {
	return CONFLICTO.test(nombre);
}

export function originalDeConflicto(nombre: string): string | null {
	return CONFLICTO.test(nombre) ? nombre.replace(CONFLICTO, '.pgn') : null;
}
