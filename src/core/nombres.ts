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
	// TODO T01
	throw new Error('T01: no implementado');
}

export function nombreArchivo(fecha: FechaHora, blancas: string, negras: string, id8: string): string {
	// TODO T01
	throw new Error('T01: no implementado');
}

export function esArchivoPartida(nombre: string): boolean {
	// TODO T01
	throw new Error('T01: no implementado');
}

export function esConflicto(nombre: string): boolean {
	// TODO T01
	throw new Error('T01: no implementado');
}

export function originalDeConflicto(nombre: string): string | null {
	// TODO T01
	throw new Error('T01: no implementado');
}
