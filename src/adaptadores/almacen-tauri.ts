// Carpeta de partidas en la PC, a través de los comandos de src-tauri/src/lib.rs.
import { invoke } from '@tauri-apps/api/core';
import type { Almacen, Archivo } from '../core/tipos';

export class AlmacenTauri implements Almacen {
	listar = () => invoke<Archivo[]>('listar');
	leer = (nombre: string) => invoke<string>('leer', { nombre });
	escribir = (nombre: string, texto: string) => invoke<void>('escribir', { nombre, texto });
	borrar = (nombre: string) => invoke<void>('borrar', { nombre });
	carpeta = () => invoke<string>('carpeta');
}
