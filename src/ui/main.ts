// Arranque: elige el almacén (Tauri o memoria en el navegador) y cambia de pantalla.
import './estilos.css';
import { AlmacenMemoria } from '../adaptadores/almacen-memoria';
import { AlmacenTauri } from '../adaptadores/almacen-tauri';
import { Motor, type Trabajador } from '../adaptadores/motor';
import { Repositorio } from '../app/repositorio';
import { pantallaAnalisis } from './analisis';
import { pantallaJuego, type Nueva } from './juego';
import { pantallaLista } from './lista';

export type Pantalla = { tipo: 'lista' } | { tipo: 'analisis'; archivo: string } | { tipo: 'juego'; archivo?: string; nueva?: Nueva };

export interface Ctx {
	repo: Repositorio;
	motor: Motor;
	carpeta: string;
	misNombres: string[];
	ir: (p: Pantalla) => void;
}

const app = document.getElementById('app')!;
const enTauri = '__TAURI_INTERNALS__' in window;
const almacen = enTauri ? new AlmacenTauri() : new AlmacenMemoria();
// El Worker de verdad cumple Trabajador; solo difiere el tipo del evento.
const motor = new Motor(() => new Worker('engine/stockfish-19-lite-single.js') as unknown as Trabajador);
let salir: () => void = () => {};

const ctx: Ctx = {
	repo: new Repositorio(almacen),
	motor,
	carpeta: enTauri ? await (almacen as AlmacenTauri).carpeta() : '(navegador: en memoria, se pierde al cerrar)',
	misNombres: ['FrancoStechina', 'Franco_Stechina'],
	ir(p) {
		salir();
		app.replaceChildren();
		motor.detener();
		salir =
			p.tipo === 'lista' ? pantallaLista(app, ctx)
			: p.tipo === 'analisis' ? pantallaAnalisis(app, ctx, p.archivo)
			: pantallaJuego(app, ctx, p);
	},
};
ctx.ir({ tipo: 'lista' });
