// Carpeta de partidas: índice en memoria, abrir, guardar e importar.
import { huella, normalizarMovetext } from '../core/huella';
import { idLichess } from '../core/importar-lichess';
import { lineaPrincipal } from '../core/arbol';
import { esConflicto } from '../core/nombres';
import { actualizarIndice, cabeceraDePgn, metaDesdeCabecera, ordenar } from '../core/indice';
import { nombreArchivo } from './utiles';
import type { Almacen, MetaPartida, Partida } from '../core/tipos';
import { escribirPgn, leerPgn, leerPgns } from '../adaptadores/pgnio';

const sinCabecera = (texto: string) => texto.split('\n').filter((l) => !l.trim().startsWith('[')).join('\n');

export class Repositorio {
	indice: MetaPartida[] = [];
	private huellas = new Map<string, string>(); // archivo → huella

	constructor(private almacen: Almacen) {}

	// shortcut: el índice vive solo en memoria y se rearma al abrir la app; persistir indice.json si la carpeta pasa de ~1000 partidas
	async refrescar(): Promise<MetaPartida[]> {
		const archivos = await this.almacen.listar();
		const { indice, aLeer, eliminados } = actualizarIndice(this.indice, archivos);
		for (const e of eliminados) this.huellas.delete(e);
		const listado = new Map(archivos.map((a) => [a.nombre, a.modificado]));
		const nuevas: MetaPartida[] = [];
		for (const archivo of aLeer) {
			try {
				const texto = await this.almacen.leer(archivo);
				const cabecera = cabeceraDePgn(texto);
				const movetext = normalizarMovetext(sinCabecera(texto)).trim();
				nuevas.push(metaDesdeCabecera(archivo, listado.get(archivo) ?? 0, cabecera, movetext ? movetext.split(' ').length : 0));
				this.huellas.set(archivo, huella(cabecera, sinCabecera(texto)));
			} catch {
				// archivo borrado o ilegible entre listar y leer: se reintenta en el próximo refresco
			}
		}
		this.indice = ordenar([...indice.filter((m) => !aLeer.includes(m.archivo)), ...nuevas]);
		return this.indice;
	}

	async abrir(archivo: string): Promise<Partida | null> {
		return leerPgn(await this.almacen.leer(archivo));
	}

	async guardar(archivo: string, partida: Partida): Promise<void> {
		await this.almacen.escribir(archivo, escribirPgn(partida));
	}

	// Copias que deja Syncthing cuando dos dispositivos editan la misma partida.
	async conflictos(): Promise<string[]> {
		return (await this.almacen.listar()).map((a) => a.nombre).filter(esConflicto);
	}

	async borrar(archivo: string): Promise<void> {
		await this.almacen.borrar(archivo);
	}

	// Archivo nuevo con nombre único, a partir de la cabecera.
	async crear(partida: Partida, ahora = new Date()): Promise<string> {
		const archivo = nombreArchivo(ahora, partida.cabecera.White ?? '?', partida.cabecera.Black ?? '?');
		await this.guardar(archivo, partida);
		return archivo;
	}

	// Importa un texto con una o varias partidas (pegado o de un .pgn/.txt). Devuelve cuántas nuevas y cuántas repetidas.
	async importar(texto: string): Promise<{ nuevas: number; repetidas: number; invalidas: number }> {
		await this.refrescar();
		const conocidas = new Set(this.huellas.values());
		const r = { nuevas: 0, repetidas: 0, invalidas: 0 };
		for (const partida of leerPgns(texto)) {
			if (partida.raiz.hijos.length === 0) { r.invalidas++; continue; }
			const h = huella(partida.cabecera, lineaPrincipal(partida).map((n) => n.san).join(' '));
			if (conocidas.has(h)) { r.repetidas++; continue; }
			conocidas.add(h);
			const lichess = (partida.cabecera.Site ?? '').includes('lichess') ? idLichess(partida.cabecera) : null;
			partida.cabecera.Origen = lichess ? 'lichess' : /chess\.com/i.test(partida.cabecera.Site ?? '') ? 'chesscom' : 'manual';
			partida.cabecera.ImportId = lichess ? `lichess:${lichess}` : `${partida.cabecera.Origen}:h${h}`;
			const fecha = (partida.cabecera.Date ?? partida.cabecera.UTCDate ?? '').replace(/\./g, '-');
			const hora = partida.cabecera.UTCTime ?? '00:00:00';
			const cuando = new Date(`${fecha}T${hora}`);
			await this.crear(partida, isNaN(cuando.getTime()) ? new Date() : cuando);
			r.nuevas++;
		}
		await this.refrescar();
		return r;
	}
}
