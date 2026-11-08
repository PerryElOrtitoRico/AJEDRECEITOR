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

export function crearTablero(el: HTMLElement, alMover: (uci: string) => void) {
	let fen = '';
	const api = Chessground(el, {
		premovable: { enabled: false },
		movable: { free: false, showDests: true },
		events: {
			move: (desde, hasta) => {
				// shortcut: corona siempre en dama; agregar un selector si alguna vez hace falta subcoronar
				const uci = desde + hasta;
				alMover(jugar(fen, uci) ? uci : uci + 'q');
			},
		},
	});
	// chessground guarda la posición del tablero; si algo de arriba cambia de alto (p. ej. "guardado"), los toques quedan corridos.
	const recalcular = () => api.state.dom.bounds.clear();
	for (const evento of ['touchstart', 'mousedown'] as const) el.addEventListener(evento, recalcular, { capture: true, passive: true });
	return {
		mostrar(v: Vista): void {
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
}
