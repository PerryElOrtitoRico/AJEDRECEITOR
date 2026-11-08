// Pantalla de inicio: partidas, filtro, nueva partida e importar.
import { filtrar, resultadoParaMi, type ResultadoParaMi } from '../core/indice';
import type { Ctx } from './main';
import { esc } from './jugadas';

const RESULTADOS: ResultadoParaMi[] = ['victoria', 'derrota', 'tablas', 'en curso', 'desconocido'];

export function pantallaLista(app: HTMLElement, ctx: Ctx): () => void {
	app.innerHTML = `
		<h1>Partidas</h1>
		<div class="fila">
			<button id="nueva">Nueva partida contra el motor</button>
			<button id="importar">Importar</button>
			<select id="filtro"><option value="">Todas</option>${RESULTADOS.map((r) => `<option>${r}</option>`).join('')}</select>
		</div>
		<form id="form-nueva" class="caja" hidden>
			<div class="fila">
				<label>Color <select name="color"><option value="blancas">Blancas</option><option value="negras">Negras</option><option value="azar">Al azar</option></select></label>
				<label>Nivel <select name="nivel">${[1, 2, 3, 4, 5].map((n) => `<option>${n}</option>`).join('')}</select></label>
				<label>Minutos <input name="min" type="number" min="1" max="180" value="10" style="width:5em"></label>
				<label>Incremento (s) <input name="inc" type="number" min="0" max="60" value="0" style="width:5em"></label>
				<button>Jugar</button>
			</div>
		</form>
		<div id="caja-importar" class="caja" hidden>
			<p class="suave">Pegá una o varias partidas en PGN (de chess.com o Lichess), o elegí un archivo .pgn o .txt. Las repetidas se saltean.</p>
			<textarea id="texto" rows="8"></textarea>
			<div class="fila"><input id="archivo" type="file" accept=".pgn,.txt" multiple><button id="hacer-importar">Importar</button><span id="msg-importar"></span></div>
		</div>
		<div id="conflictos"></div>
		<table><thead><tr><th>Fecha</th><th>Blancas</th><th>Negras</th><th>Para mí</th><th>Jugadas</th><th>Origen</th></tr></thead><tbody id="filas"></tbody></table>
		<p class="suave" id="pie"></p>`;
	const $ = <T extends HTMLElement>(s: string) => app.querySelector<T>(s)!;

	const pintar = async () => {
		const indice = await ctx.repo.refrescar();
		const r = $<HTMLSelectElement>('#filtro').value as ResultadoParaMi | '';
		const lista = filtrar(indice, { misNombres: ctx.misNombres, ...(r ? { resultado: r } : {}) });
		$('#filas').innerHTML = lista.map((m) => `
			<tr data-archivo="${esc(m.archivo)}" data-curso="${m.enCurso ? 1 : ''}">
				<td>${esc(m.fecha || '?')}</td><td>${esc(m.blancas)}</td><td>${esc(m.negras)}</td>
				<td>${m.enCurso ? '<span class="etiqueta">en curso</span>' : resultadoParaMi(m, ctx.misNombres)}</td>
				<td>${Math.ceil(m.plies / 2)}</td><td>${m.origen}</td>
			</tr>`).join('') || '<tr><td colspan="6" class="suave">No hay partidas.</td></tr>';
		const conflictos = await ctx.repo.conflictos();
		// shortcut: solo avisa; resolver a mano en la carpeta. Agregar "conservar original / las dos" cuando aparezca el primero
		$('#conflictos').innerHTML = conflictos.length
			? `<div class="caja error">Syncthing dejó ${conflictos.length} copia(s) en conflicto (dos dispositivos editaron la misma partida). Revisalas en la carpeta: ${conflictos.map(esc).join(', ')}</div>` : '';
		$('#pie').textContent = `Carpeta: ${ctx.carpeta} · ${indice.length} partidas`;
	};
	const refrescar = () => void pintar().catch((e) => ($('#pie').textContent = `Error al leer la carpeta: ${e}`));

	$('#filtro').onchange = refrescar;
	$('#filas').onclick = (e) => {
		const tr = (e.target as HTMLElement).closest('tr');
		const archivo = tr?.dataset.archivo;
		if (archivo) ctx.ir(tr.dataset.curso ? { tipo: 'juego', archivo } : { tipo: 'analisis', archivo });
	};
	$('#nueva').onclick = () => ($('#form-nueva').hidden = !$('#form-nueva').hidden);
	$('#importar').onclick = () => ($('#caja-importar').hidden = !$('#caja-importar').hidden);
	$<HTMLFormElement>('#form-nueva').onsubmit = (e) => {
		e.preventDefault();
		const f = new FormData(e.target as HTMLFormElement);
		const color = f.get('color') === 'azar' ? (Math.random() < 0.5 ? 'blancas' : 'negras') : (f.get('color') as 'blancas' | 'negras');
		ctx.ir({ tipo: 'juego', nueva: { miColor: color, nivel: Number(f.get('nivel')), baseSeg: Number(f.get('min')) * 60, incSeg: Number(f.get('inc')) } });
	};
	$('#hacer-importar').onclick = async () => {
		const msg = $('#msg-importar');
		const archivos = [...($<HTMLInputElement>('#archivo').files ?? [])];
		const texto = [$<HTMLTextAreaElement>('#texto').value, ...(await Promise.all(archivos.map((a) => a.text())))].join('\n\n');
		try {
			const r = await ctx.repo.importar(texto);
			msg.textContent = `${r.nuevas} nuevas, ${r.repetidas} repetidas${r.invalidas ? `, ${r.invalidas} sin jugadas` : ''}.`;
			$<HTMLTextAreaElement>('#texto').value = '';
			refrescar();
		} catch (e) {
			msg.textContent = `No se pudo importar: ${e}`;
		}
	};

	refrescar();
	const cada30 = setInterval(refrescar, 30_000);
	const alVolver = () => document.visibilityState === 'visible' && refrescar();
	document.addEventListener('visibilitychange', alVolver);
	return () => {
		clearInterval(cada30);
		document.removeEventListener('visibilitychange', alVolver);
	};
}
