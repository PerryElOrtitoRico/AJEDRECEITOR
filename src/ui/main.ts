// Arranque: elige el almacén (Tauri o memoria en el navegador) y cambia de pantalla.
import './estilos.css';
import { AlmacenMemoria } from '../adaptadores/almacen-memoria';
import { AlmacenTauri } from '../adaptadores/almacen-tauri';
import { AlmacenCapacitor, Permisos } from '../adaptadores/almacen-capacitor';
import { Capacitor } from '@capacitor/core';
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
const enAndroid = Capacitor.isNativePlatform();
const almacen = enTauri ? new AlmacenTauri() : enAndroid ? new AlmacenCapacitor() : new AlmacenMemoria();
// El Worker de verdad cumple Trabajador; solo difiere el tipo del evento.
const motor = new Motor(() => new Worker('engine/stockfish-19-lite-single.js') as unknown as Trabajador);
let salir: () => void = () => {};

const ctx: Ctx = {
	repo: new Repositorio(almacen),
	motor,
	carpeta: enTauri ? await (almacen as AlmacenTauri).carpeta() : enAndroid ? (almacen as AlmacenCapacitor).carpeta : '(navegador: en memoria, se pierde al cerrar)',
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
// En Android, sin "acceso a todos los archivos" no se ven las partidas de Syncthing: se pide antes de entrar.
async function arrancar(): Promise<void> {
	if (!enAndroid || (await Permisos.estado()).concedido) return ctx.ir({ tipo: 'lista' });
	app.innerHTML = `<h1>AJEDRECEITOR</h1><div class="caja"><p>Para ver las partidas que sincroniza Syncthing en <b>${ctx.carpeta}</b>, la app necesita el permiso <b>Acceso a todos los archivos</b>.</p><button id="permiso">Dar permiso</button></div>`;
	document.getElementById('permiso')!.onclick = () => void Permisos.pedir();
	document.addEventListener('visibilitychange', async function alVolver() {
		if (document.visibilityState === 'visible' && (await Permisos.estado()).concedido) {
			document.removeEventListener('visibilitychange', alVolver);
			ctx.ir({ tipo: 'lista' });
		}
	});
}
void arrancar();
