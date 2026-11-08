// Envoltorio de chessground: muestra un FEN y avisa las jugadas en UCI.
import { Chessground } from 'chessground';
import type { Key } from 'chessground/types';
import type { DrawShape } from 'chessground/draw';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import type { Color } from '../core/tipos';
import { destinos, enJaque, jugar, turno } from '../adaptadores/reglas';

export interface Vista {
	fen: string;
	orientacion: Color;
	movible: boolean;
	ultima?: string; // UCI de la última jugada
	marcas?: string[]; // 1 casilla → círculo; 2 → flecha (pista)
}

const cg = (c: Color) => (c === 'blancas' ? 'white' : 'black');

const PIEZAS = [['q', '♛', 'Dama'], ['r', '♜', 'Torre'], ['b', '♝', 'Alfil'], ['n', '♞', 'Caballo']] as const;

// Selector de coronación: un <dialog> modal con las 4 piezas. Esc o tocar afuera → null.
function elegirPieza(): Promise<string | null> {
	const d = document.createElement('dialog');
	d.className = 'coronar';
	d.innerHTML = `<p>Coronar en:</p><div class="fila">${PIEZAS.map(([p, g, n]) => `<button value="${p}" title="${n}" aria-label="${n}"><span>${g}</span>${n}</button>`).join('')}</div>`;
	document.body.append(d);
	return new Promise((resolver) => {
		d.onclick = (e) => {
			const b = (e.target as HTMLElement).closest('button');
			if (b || e.target === d) d.close(b?.value ?? '');
		};
		d.onclose = () => { resolver(d.returnValue || null); d.remove(); };
		d.showModal();
	});
}

export function crearTablero(el: HTMLElement, alMover: (uci: string) => void) {
	let fen = '';
	let ultima: Vista | null = null;
	const api = Chessground(el, {
		premovable: { enabled: false },
		movable: { free: false, showDests: true },
		events: {
			move: (desde, hasta) => {
				const uci = desde + hasta;
				if (jugar(fen, uci)) return alMover(uci);
				// solo una coronación es ilegal sin pieza: se elige con el selector; cancelar vuelve la pieza
				elegirPieza().then((p) => (p ? alMover(uci + p) : ultima && tablero.mostrar(ultima)));
			},
		},
	});
	// chessground guarda la posición del tablero; si algo de arriba cambia de alto (p. ej. "guardado"), los toques quedan corridos.
	const recalcular = () => api.state.dom.bounds.clear();
	for (const evento of ['touchstart', 'mousedown'] as const) el.addEventListener(evento, recalcular, { capture: true, passive: true });
	const tablero = {
		mostrar(v: Vista): void {
			ultima = v;
			fen = v.fen;
			const t = cg(turno(v.fen));
			api.set({
				fen: v.fen,
				orientation: cg(v.orientacion),
				turnColor: t,
				check: enJaque(v.fen),
				lastMove: v.ultima ? [v.ultima.slice(0, 2) as Key, v.ultima.slice(2, 4) as Key] : [],
				movable: { color: v.movible ? t : undefined, dests: (v.movible ? destinos(v.fen) : new Map()) as Map<Key, Key[]> },
			});
			const [orig, dest] = (v.marcas ?? []) as Key[];
			const forma: DrawShape[] = orig ? [{ orig, ...(dest ? { dest } : {}), brush: 'green' }] : [];
			api.setAutoShapes(forma);
		},
		destruir: () => api.destroy(),
	};
	return tablero;
}
