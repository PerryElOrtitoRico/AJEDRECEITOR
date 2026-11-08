// Reglas de ajedrez sobre chessops. Todo entra y sale como FEN, SAN o UCI.
import { Chess, normalizeMove } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen';
import { makeSan, parseSan } from 'chessops/san';
import { makeSquare, parseUci, roleToChar } from 'chessops/util';
import { chessgroundDests } from 'chessops/compat';
import type { Move, NormalMove } from 'chessops/types';
import type { Color, Resultado } from '../core/tipos';

export const FEN_INICIAL = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export interface JugadaHecha {
	san: string;
	uci: string; // UCI estándar (enroque e1g1), el que entiende Stockfish
	fen: string;
}

export interface Estado {
	fin: boolean;
	resultado?: Resultado;
	motivo?: 'jaque mate' | 'ahogado' | 'material insuficiente' | 'cincuenta jugadas';
}

export function posicion(fen: string): Chess | null {
	const setup = parseFen(fen);
	if (setup.isErr) return null;
	const pos = Chess.fromSetup(setup.value);
	return pos.isErr ? null : pos.value;
}

export function turno(fen: string): Color {
	return fen.split(' ')[1] === 'b' ? 'negras' : 'blancas';
}

// Destinos legales por casilla, en el formato que usa chessground.
export function destinos(fen: string): Map<string, string[]> {
	const pos = posicion(fen);
	return pos ? (chessgroundDests(pos) as Map<string, string[]>) : new Map();
}

export function jugadasLegales(fen: string): string[] {
	const pos = posicion(fen);
	if (!pos) return [];
	const ucis: string[] = [];
	for (const [desde, hastas] of pos.allDests()) {
		for (const hasta of hastas) {
			const base = makeSquare(desde) + makeSquare(hasta);
			const corona = pos.board.pawn.has(desde) && (hasta >> 3 === 0 || hasta >> 3 === 7);
			if (corona) for (const r of 'qrbn') ucis.push(base + r);
			else ucis.push(uciEstandar(pos, { from: desde, to: hasta }));
		}
	}
	return [...new Set(ucis)];
}

// chessops representa el enroque como "rey toma su torre" (e1h1); también da e1g1 como destino.
function esEnroqueInterno(pos: Chess, m: NormalMove): boolean {
	return pos.board.king.has(m.from) && pos.board.rook.has(m.to) && pos.board[pos.turn].has(m.to);
}

function uciEstandar(pos: Chess, m: NormalMove): string {
	if (esEnroqueInterno(pos, m)) {
		const destino = (m.to & 7) > (m.from & 7) ? m.from + 2 : m.from - 2;
		return makeSquare(m.from) + makeSquare(destino);
	}
	return makeSquare(m.from) + makeSquare(m.to) + (m.promotion ? roleToChar(m.promotion) : '');
}

// Acepta SAN ("Nf3", "O-O", "e8=Q") o UCI ("g1f3", "e1g1", "e7e8q"). Ilegal → null.
export function jugar(fen: string, jugada: string): JugadaHecha | null {
	const pos = posicion(fen);
	if (!pos) return null;
	let move: Move | undefined = /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(jugada) ? parseUci(jugada) : undefined;
	if (move) move = normalizeMove(pos, move);
	else move = parseSan(pos, jugada);
	if (!move || !pos.isLegal(move) || !('from' in move)) return null;
	const san = makeSan(pos, move);
	const uci = uciEstandar(pos, move);
	pos.play(move);
	return { san, uci, fen: makeFen(pos.toSetup()) };
}

export function enJaque(fen: string): boolean {
	return posicion(fen)?.isCheck() ?? false;
}

export function estado(fen: string): Estado {
	const pos = posicion(fen);
	if (!pos) return { fin: false };
	if (pos.isCheckmate()) return { fin: true, resultado: pos.turn === 'white' ? '0-1' : '1-0', motivo: 'jaque mate' };
	if (pos.isStalemate()) return { fin: true, resultado: '1/2-1/2', motivo: 'ahogado' };
	if (pos.isInsufficientMaterial()) return { fin: true, resultado: '1/2-1/2', motivo: 'material insuficiente' };
	// shortcut: no detecta la triple repetición (necesita el historial), agregarla si molesta en partidas reales
	if (pos.halfmoves >= 100) return { fin: true, resultado: '1/2-1/2', motivo: 'cincuenta jugadas' };
	return { fin: false };
}
