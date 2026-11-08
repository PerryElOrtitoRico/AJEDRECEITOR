// Carpeta de partidas en Android: Documents/Ajedrez/partidas, la misma que sincroniza Syncthing.
import { registerPlugin } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import type { Almacen, Archivo } from '../core/tipos';

const CARPETA = 'Ajedrez/partidas';
const donde = (nombre: string) => ({ path: `${CARPETA}/${nombre}`, directory: Directory.Documents });

// Plugin propio (android/app/src/main/java/com/ajedrez/app/PermisosPlugin.java).
export const Permisos = registerPlugin<{ estado(): Promise<{ concedido: boolean }>; pedir(): Promise<void> }>('Permisos');

export class AlmacenCapacitor implements Almacen {
	carpeta = `Documents/${CARPETA}`;

	async listar(): Promise<Archivo[]> {
		await Filesystem.mkdir({ path: CARPETA, directory: Directory.Documents, recursive: true }).catch(() => {});
		const { files } = await Filesystem.readdir({ path: CARPETA, directory: Directory.Documents });
		return files.filter((f) => f.type === 'file').map((f) => ({ nombre: f.name, modificado: f.mtime }));
	}
	async leer(nombre: string): Promise<string> {
		return String((await Filesystem.readFile({ ...donde(nombre), encoding: Encoding.UTF8 })).data);
	}
	// Escritura atómica: .tmp y renombrar (Syncthing ignora *.tmp).
	async escribir(nombre: string, texto: string): Promise<void> {
		await Filesystem.writeFile({ ...donde(`${nombre}.tmp`), data: texto, encoding: Encoding.UTF8 });
		await Filesystem.deleteFile(donde(nombre)).catch(() => {}); // rename no pisa en todos los Android
		await Filesystem.rename({ from: `${CARPETA}/${nombre}.tmp`, to: `${CARPETA}/${nombre}`, directory: Directory.Documents, toDirectory: Directory.Documents });
	}
	async borrar(nombre: string): Promise<void> {
		await Filesystem.deleteFile(donde(nombre));
	}
}
