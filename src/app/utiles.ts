// Pequeños puentes entre el núcleo y la app (azar, fecha local).
import { nombreArchivo as nombreDelNucleo } from '../core/nombres';

export function id8(): string {
	return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}

export function nombreArchivo(d: Date, blancas: string, negras: string): string {
	const f = { a: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), h: d.getHours(), mi: d.getMinutes(), s: d.getSeconds() };
	return nombreDelNucleo(f, blancas, negras, id8());
}

