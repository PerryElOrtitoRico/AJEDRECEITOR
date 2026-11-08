// Lectura y escritura de PGN con variantes sobre chessops.
import { ChildNode, Node, emptyHeaders, makeComment, makePgn, parsePgn, startingPosition } from 'chessops/pgn';
import type { Game, PgnNodeData } from 'chessops/pgn';
import { makeFen } from 'chessops/fen';
import { esComentarioDeAnalisis, extraerReloj, quitarEvaluaciones } from '../core/limpieza';
import type { Nodo, Partida } from '../core/tipos';
import { jugar } from './reglas';

// Limpia un comentario del sitio: reloj aparte, sin evaluaciones ni textos que revelan la mejor jugada.
function limpiarComentario(crudos: string[]): { comentario: string; relojSeg: number | null } {
	let relojSeg: number | null = null;
	const textos: string[] = [];
	for (const crudo of crudos) {
		const r = extraerReloj(crudo);
		if (r.relojSeg !== null) relojSeg = r.relojSeg;
		const texto = quitarEvaluaciones(r.resto).trim();
		if (texto !== '' && !esComentarioDeAnalisis(texto)) textos.push(texto);
	}
	return { comentario: textos.join(' '), relojSeg };
}

// Primer juego del texto. Jugadas ilegales cortan esa rama. Texto sin juego → null.
export function leerPgn(texto: string): Partida | null {
	return leerPgns(texto)[0] ?? null;
}

// Todos los juegos del texto (PGN múltiple). Los que tienen un FEN inválido se descartan.
export function leerPgns(texto: string): Partida[] {
	return parsePgn(texto, emptyHeaders).flatMap((juego) => {
		const p = convertirJuego(juego);
		return p ? [p] : [];
	});
}

function convertirJuego(juego: Game<PgnNodeData>): Partida | null {
	const inicio = startingPosition(juego.headers);
	if (inicio.isErr) return null;
	let contador = 0;
	const raiz: Nodo = { id: 'n0', san: '', uci: '', fen: makeFen(inicio.value.toSetup()), comentario: '', relojSeg: null, hijos: [] };
	const llenar = (padre: Nodo, hijos: ChildNode<PgnNodeData>[]): void => {
		for (const hijo of hijos) {
			const hecha = jugar(padre.fen, hijo.data.san);
			if (!hecha) continue;
			const { comentario, relojSeg } = limpiarComentario([...(hijo.data.startingComments ?? []), ...(hijo.data.comments ?? [])]);
			const nodo: Nodo = { id: `n${++contador}`, ...hecha, comentario, relojSeg, hijos: [] };
			padre.hijos.push(nodo);
			llenar(nodo, hijo.children);
		}
	};
	llenar(raiz, juego.moves.children);
	raiz.comentario = limpiarComentario(juego.comments ?? []).comentario;
	return { cabecera: Object.fromEntries(juego.headers), raiz };
}

export function escribirPgn(p: Partida): string {
	const convertir = (nodo: Nodo): ChildNode<PgnNodeData> => {
		const comentario = makeComment({ text: nodo.comentario, ...(nodo.relojSeg !== null ? { clock: nodo.relojSeg } : {}) });
		const hijo = new ChildNode<PgnNodeData>({ san: nodo.san, ...(comentario ? { comments: [comentario] } : {}) });
		hijo.children = nodo.hijos.map(convertir);
		return hijo;
	};
	const moves = new Node<PgnNodeData>();
	moves.children = p.raiz.hijos.map(convertir);
	const cabecera = new Map(Object.entries(p.cabecera));
	return makePgn({ headers: cabecera, moves, ...(p.raiz.comentario ? { comments: [p.raiz.comentario] } : {}) });
}
