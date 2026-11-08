// Almacén en memoria: para tests y para simular otro dispositivo.
import type { Almacen, Archivo } from '../core/tipos';

export class AlmacenMemoria implements Almacen {
	archivos = new Map<string, { texto: string; modificado: number }>();
	private reloj = 0;

	async listar(): Promise<Archivo[]> {
		return [...this.archivos].map(([nombre, a]) => ({ nombre, modificado: a.modificado }));
	}
	async leer(nombre: string): Promise<string> {
		const a = this.archivos.get(nombre);
		if (!a) throw new Error(`no existe ${nombre}`);
		return a.texto;
	}
	async escribir(nombre: string, texto: string): Promise<void> {
		this.archivos.set(nombre, { texto, modificado: ++this.reloj });
	}
	async borrar(nombre: string): Promise<void> {
		this.archivos.delete(nombre);
	}
}
