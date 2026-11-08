// Partida contra Stockfish: reloj, pista de dos pasos, deshacer, tablas y rendirse. Guarda tras cada jugada.
import { formato, restante } from '../core/reloj';
import { casillasAResaltar, siguientePista, type EstadoPista } from '../core/pista';
import type { Color } from '../core/tipos';
import { NIVELES, PISTA } from '../adaptadores/motor';
import * as S from '../app/sesion-juego';
import type { Ctx, Pantalla } from './main';
import { esc } from './jugadas';
import { crearTablero } from './tablero';

export interface Nueva { miColor: Color; nivel: number; baseSeg: number; incSeg: number }

export function pantallaJuego(app: HTMLElement, ctx: Ctx, p: Extract<Pantalla, { tipo: 'juego' }>): () => void {
	app.innerHTML = `
		<div class="fila"><button id="volver">← Partidas</button><strong id="titulo"></strong><span id="estado" class="suave"></span></div>
		<div class="con-tablero">
			<div><div class="fila"><span class="reloj" id="reloj-arriba"></span></div>
				<div class="tablero" id="tablero"></div>
				<div class="fila" style="margin-top:8px"><span class="reloj" id="reloj-abajo"></span></div></div>
			<div class="caja">
				<p id="mensaje"></p>
				<div class="fila"><button id="pista">Pista</button><button id="deshacer">Deshacer</button><button id="tablas">Tablas</button><button id="rendirse">Rendirse</button></div>
				<div class="fila"><button id="analizar" hidden>Analizar esta partida</button></div>
			</div>
		</div>`;
	const $ = <T extends HTMLElement>(s: string) => app.querySelector<T>(s)!;
	let s: S.Sesion | null = null;
	let archivo = p.archivo ?? null;
	let pista: EstadoPista | null = null;
	let marcas: string[] = [];
	let guardando = Promise.resolve();

	const tablero = crearTablero($('#tablero'), (uci) => actualizar(s && S.mover(s, uci, Date.now())));

	const guardar = (sesion: S.Sesion) => {
		guardando = guardando.then(async () => {
			if (archivo) await ctx.repo.guardar(archivo, sesion.partida);
			else archivo = await ctx.repo.crear(sesion.partida);
			$('#estado').textContent = 'guardado';
		}).catch((e) => { $('#estado').innerHTML = `<span class="error">No se pudo guardar: ${esc(String(e))}</span>`; });
	};

	const pintar = () => {
		if (!s) return;
		const mia = s.fin === null && !S.turnoDelMotor(s);
		tablero.mostrar({ fen: S.fenActual(s), orientacion: s.miColor, movible: mia, ultima: S.jugadas(s).at(-1)?.uci ?? '', marcas });
		$('#mensaje').textContent = s.fin ? `Terminó: ${s.fin.resultado} (${s.fin.motivo}).` : mia ? 'Te toca.' : 'Piensa el motor…';
		for (const id of ['pista', 'deshacer', 'tablas', 'rendirse']) $<HTMLButtonElement>(`#${id}`).disabled = s.fin !== null || (id === 'pista' && !mia);
		$('#analizar').hidden = s.fin === null;
		relojes();
	};

	const relojes = () => {
		if (!s) return;
		const ahora = Date.now();
		const [abajo, arriba]: [Color, Color] = s.miColor === 'blancas' ? ['blancas', 'negras'] : ['negras', 'blancas'];
		for (const [id, c] of [['#reloj-abajo', abajo], ['#reloj-arriba', arriba]] as const) {
			const seg = restante(s.reloj, c, ahora);
			const el = $(id);
			el.textContent = `${c === s.miColor ? 'Vos' : 'Motor'} ${formato(seg)}`;
			el.className = `reloj${s.reloj.turno === c ? ' corre' : ''}${seg < 20 ? ' poco' : ''}`;
		}
	};

	const actualizar = (nueva: S.Sesion | null) => {
		if (!nueva) return pintar(); // jugada ilegal: vuelve la pieza
		const cambio = nueva !== s;
		s = nueva;
		marcas = [];
		pintar();
		if (cambio) guardar(nueva);
		if (S.turnoDelMotor(nueva)) void jugarMotor(nueva);
	};

	const jugarMotor = async (antes: S.Sesion) => {
		const nivel = NIVELES[antes.nivel - 1] ?? NIVELES[0]!;
		const uci = await ctx.motor.mejorJugada(null, S.ucis(antes), nivel);
		if (s !== antes) return; // deshiciste, te rendiste o se cayó la bandera mientras pensaba
		if (!uci) { $('#mensaje').textContent = 'El motor no respondió. Probá Deshacer o volvé a abrir la partida.'; return; }
		actualizar(S.mover(antes, uci, Date.now()));
	};

	const tic = setInterval(() => {
		if (!s || s.fin) return;
		const t = S.porTiempo(s, Date.now());
		t !== s ? actualizar(t) : relojes();
	}, 200);

	$('#volver').onclick = () => ctx.ir({ tipo: 'lista' });
	$('#analizar').onclick = () => archivo && guardando.then(() => ctx.ir({ tipo: 'analisis', archivo: archivo! }));
	$('#deshacer').onclick = () => { if (s) { ctx.motor.detener(); actualizar(S.deshacer(s, Date.now())); } };
	$('#tablas').onclick = () => s && confirm('¿Ofrecer tablas? (el motor acepta)') && actualizar(S.tablas(s));
	$('#rendirse').onclick = () => s && confirm('¿Rendirte?') && (ctx.motor.detener(), actualizar(S.rendirse(s)));
	$('#pista').onclick = async () => {
		if (!s) return;
		const antes = s;
		$<HTMLButtonElement>('#pista').disabled = true;
		const mejor = await ctx.motor.mejorJugada(null, S.ucis(antes), PISTA);
		if (s !== antes || !mejor) return pintar();
		pista = siguientePista(pista, S.fenActual(antes), mejor);
		marcas = casillasAResaltar(pista);
		pintar();
	};

	(async () => {
		if (p.nueva) {
			actualizar(S.crearSesion({ ...p.nueva, miNombre: ctx.misNombres[0]!, ahora: new Date() }));
		} else if (archivo) {
			const partida = await ctx.repo.abrir(archivo);
			if (!partida) { $('#mensaje').textContent = 'No se pudo leer la partida.'; return; }
			s = S.retomar(partida, ctx.misNombres, Date.now());
			pintar();
			if (S.turnoDelMotor(s)) void jugarMotor(s);
		}
		const c = s!.partida.cabecera;
		$('#titulo').textContent = `${c.White} – ${c.Black} · ${c.TimeControl}`;
	})().catch((e) => ($('#mensaje').textContent = `Error: ${e}`));

	return () => { clearInterval(tic); tablero.destruir(); };
}
