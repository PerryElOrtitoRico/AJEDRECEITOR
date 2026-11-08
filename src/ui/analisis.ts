// Análisis a mano, sin motor: recorrer, hacer ramas, comentar, promover y borrar. Guarda tras cada cambio.
import { agregarJugada, anotar, borrarRama, buscarNodo, camino, promoverRama } from '../core/arbol';
import type { Color, Partida } from '../core/tipos';
import { jugar } from '../adaptadores/reglas';
import type { Ctx } from './main';
import { esc, htmlJugadas } from './jugadas';
import { crearTablero } from './tablero';

export function pantallaAnalisis(app: HTMLElement, ctx: Ctx, archivo: string): () => void {
	app.innerHTML = `
		<div class="fila"><button id="volver">← Partidas</button><strong id="titulo"></strong><span id="estado" class="suave"></span></div>
		<div class="con-tablero">
			<div><div class="tablero" id="tablero"></div>
				<div class="fila" style="margin-top:8px">
					<button id="inicio" title="Inicio">⏮</button><button id="atras" title="← Atrás">◀</button>
					<button id="adelante" title="→ Adelante">▶</button><button id="fin" title="Final">⏭</button>
					<button id="girar">Girar</button>
				</div></div>
			<div>
				<div class="caja jugadas" id="jugadas"></div>
				<textarea id="comentario" rows="3" placeholder="Comentario de esta jugada"></textarea>
				<div class="fila" style="margin-top:8px"><button id="promover">Hacer línea principal</button><button id="borrar">Borrar desde acá</button></div>
			</div>
		</div>`;
	const $ = <T extends HTMLElement>(s: string) => app.querySelector<T>(s)!;
	let partida: Partida | null = null;
	let actual = 'n0';
	let orientacion: Color = 'blancas';

	const tablero = crearTablero($('#tablero'), (uci) => {
		const nodo = partida && buscarNodo(partida, actual);
		const hecha = nodo && jugar(nodo.fen, uci);
		const r = hecha && agregarJugada(partida!, actual, hecha.san, hecha.uci, hecha.fen);
		if (r) cambiar(r.partida, r.nodo.id);
		else pintar();
	});

	const pintar = () => {
		if (!partida) return;
		const nodo = buscarNodo(partida, actual) ?? partida.raiz;
		tablero.mostrar({ fen: nodo.fen, orientacion, movible: true, ultima: nodo.uci });
		$('#jugadas').innerHTML = htmlJugadas(partida.raiz, actual);
		$('#jugadas').querySelector('.actual')?.scrollIntoView({ block: 'nearest' });
		const com = $<HTMLTextAreaElement>('#comentario');
		if (document.activeElement !== com) com.value = nodo.comentario;
		$<HTMLButtonElement>('#promover').disabled = $<HTMLButtonElement>('#borrar').disabled = actual === 'n0';
	};

	const cambiar = (nueva: Partida | null, id = actual) => {
		if (!nueva) return;
		partida = nueva;
		actual = id;
		pintar();
		$('#estado').textContent = 'guardando…';
		ctx.repo.guardar(archivo, nueva).then(
			() => ($('#estado').textContent = 'guardado'),
			(e) => ($('#estado').innerHTML = `<span class="error">No se pudo guardar: ${esc(String(e))}</span>`),
		);
	};

	const ir = (id: string | undefined) => {
		if (id) { actual = id; pintar(); }
	};
	const padre = () => camino(partida!, actual).at(-2)?.id;
	const hijo = () => buscarNodo(partida!, actual)?.hijos[0]?.id;
	const ultimo = () => { let n = buscarNodo(partida!, actual); while (n?.hijos[0]) n = n.hijos[0]; return n?.id; };

	$('#volver').onclick = () => ctx.ir({ tipo: 'lista' });
	$('#inicio').onclick = () => ir('n0');
	$('#atras').onclick = () => ir(padre());
	$('#adelante').onclick = () => ir(hijo());
	$('#fin').onclick = () => ir(ultimo());
	$('#girar').onclick = () => { orientacion = orientacion === 'blancas' ? 'negras' : 'blancas'; pintar(); };
	$('#jugadas').onclick = (e) => ir((e.target as HTMLElement).dataset.id);
	$<HTMLTextAreaElement>('#comentario').onchange = (e) => cambiar(anotar(partida!, actual, (e.target as HTMLTextAreaElement).value.trim()));
	$('#promover').onclick = () => cambiar(promoverRama(partida!, actual));
	$('#borrar').onclick = () => {
		if (confirm('¿Borrar esta jugada y todo lo que sigue?')) { const p = padre(); cambiar(borrarRama(partida!, actual), p); }
	};
	const teclas = (e: KeyboardEvent) => {
		if (!partida || e.target instanceof HTMLTextAreaElement) return;
		const acciones: Record<string, () => void> = { ArrowLeft: () => ir(padre()), ArrowRight: () => ir(hijo()), Home: () => ir('n0'), End: () => ir(ultimo()) };
		acciones[e.key]?.();
	};
	document.addEventListener('keydown', teclas);

	ctx.repo.abrir(archivo).then(
		(p) => {
			if (!p) { $('#estado').innerHTML = '<span class="error">El archivo no tiene una partida válida.</span>'; return; }
			partida = p;
			const c = p.cabecera;
			$('#titulo').textContent = `${c.White ?? '?'} – ${c.Black ?? '?'}  ${c.Result ?? ''}`;
			if (ctx.misNombres.some((n) => n.toLowerCase() === (c.Black ?? '').toLowerCase())) orientacion = 'negras';
			pintar();
		},
		(e) => ($('#estado').innerHTML = `<span class="error">No se pudo abrir: ${esc(String(e))}</span>`),
	);
	return () => { document.removeEventListener('keydown', teclas); tablero.destruir(); };
}
