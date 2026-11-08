// Partida contra el motor. Inmutable: cada acción devuelve una sesión nueva; el tiempo llega por parámetro.
import { agregarJugada, borrarRama, lineaPrincipal } from '../core/arbol';
import { caido, crearReloj, iniciar, jugada, restante, type Reloj } from '../core/reloj';
import type { Color, Partida, Resultado } from '../core/tipos';
import { FEN_INICIAL, estado, jugar, turno } from '../adaptadores/reglas';

export interface Sesion {
	partida: Partida;
	miColor: Color;
	nivel: number; // 1..5, índice+1 de NIVELES
	reloj: Reloj;
	fin: { resultado: Resultado; motivo: string } | null;
}

const otro = (c: Color): Color => (c === 'blancas' ? 'negras' : 'blancas');
const gana = (c: Color): Resultado => (c === 'blancas' ? '1-0' : '0-1');
const fechaPgn = (d: Date) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

export function crearSesion(o: { miColor: Color; nivel: number; baseSeg: number; incSeg: number; miNombre: string; ahora: Date }): Sesion {
	const motor = `Stockfish nivel ${o.nivel}`;
	const cabecera: Record<string, string> = {
		Event: 'Partida contra el motor', Site: 'Ajedrez', Date: fechaPgn(o.ahora),
		White: o.miColor === 'blancas' ? o.miNombre : motor, Black: o.miColor === 'blancas' ? motor : o.miNombre,
		Result: '*', TimeControl: o.incSeg ? `${o.baseSeg}+${o.incSeg}` : `${o.baseSeg}`,
		Nivel: String(o.nivel), Origen: 'app', EnCurso: '1',
	};
	const raiz = { id: 'n0', san: '', uci: '', fen: FEN_INICIAL, comentario: '', relojSeg: null, hijos: [] };
	return { partida: { cabecera, raiz }, miColor: o.miColor, nivel: o.nivel, reloj: crearReloj(o), fin: null };
}

export const jugadas = (s: Sesion) => lineaPrincipal(s.partida);
export const fenActual = (s: Sesion) => jugadas(s).at(-1)?.fen ?? s.partida.raiz.fen;
export const ucis = (s: Sesion) => jugadas(s).map((n) => n.uci);
export const turnoDelMotor = (s: Sesion) => s.fin === null && turno(fenActual(s)) !== s.miColor;

function terminar(s: Sesion, resultado: Resultado, motivo: string): Sesion {
	const cabecera: Record<string, string> = { ...s.partida.cabecera, Result: resultado, Termination: motivo };
	delete cabecera.EnCurso;
	return { ...s, partida: { ...s.partida, cabecera }, reloj: { ...s.reloj, turno: null, desdeMs: null }, fin: { resultado, motivo } };
}

// Jugada de cualquiera de los dos (UCI). Ilegal o partida terminada → null.
export function mover(s: Sesion, uci: string, ahoraMs: number): Sesion | null {
	if (s.fin) return null;
	const caida = porTiempo(s, ahoraMs);
	if (caida.fin) return caida;
	const fen = fenActual(s);
	const hecha = jugar(fen, uci);
	if (!hecha) return null;
	const mueve = turno(fen);
	const r = s.reloj.turno === null ? iniciar(s.reloj, mueve, ahoraMs) : s.reloj;
	const reloj = jugada(r, ahoraMs);
	const ultimo = jugadas(s).at(-1)?.id ?? 'n0';
	const agregado = agregarJugada(s.partida, ultimo, hecha.san, hecha.uci, hecha.fen);
	if (!agregado) return null;
	agregado.nodo.relojSeg = Math.round(restante(reloj, mueve, ahoraMs) * 10) / 10;
	const nueva: Sesion = { ...s, partida: agregado.partida, reloj };
	const e = estado(hecha.fen);
	if (e.fin) return terminar(nueva, e.resultado ?? '*', e.motivo ?? '');
	return repeticiones(nueva, hecha.fen) >= 3 ? terminar(nueva, '1/2-1/2', 'triple repetición') : nueva;
}

// Misma posición = mismas piezas, turno, enroques y captura al paso (los 4 primeros campos del FEN; chessops solo
// escribe la casilla al paso cuando la captura es legal, como pide la regla).
const clave = (fen: string) => fen.split(' ').slice(0, 4).join(' ');
function repeticiones(s: Sesion, fen: string): number {
	return [s.partida.raiz.fen, ...jugadas(s).map((n) => n.fen)].filter((f) => clave(f) === clave(fen)).length;
}

export function porTiempo(s: Sesion, ahoraMs: number): Sesion {
	const c = s.fin ? null : caido(s.reloj, ahoraMs);
	// shortcut: no da tablas si al rival le falta material para dar mate (regla FIDE); agregar si pasa seguido
	return c ? terminar(s, gana(otro(c)), 'tiempo') : s;
}

// Vuelve a tu turno anterior: quita tu última jugada y la respuesta del motor, si la hubo. El tiempo gastado no vuelve.
export function deshacer(s: Sesion, ahoraMs: number): Sesion {
	if (s.fin) return s;
	const linea = jugadas(s);
	let i = linea.length - 1;
	while (i >= 0 && turno(linea[i]!.fen) === s.miColor) i--; // tras mi jugada le toca al otro
	const mia = linea[i];
	if (!mia) return s;
	const partida = borrarRama(s.partida, mia.id);
	if (!partida) return s;
	// cobra lo gastado a quien tenía el turno (sin incremento) y vuelve a correr el tuyo
	const cobrado = s.reloj.turno === null ? s.reloj : jugada({ ...s.reloj, incSeg: 0 }, ahoraMs);
	const reloj = s.reloj.turno === null ? s.reloj : { ...iniciar(cobrado, s.miColor, ahoraMs), incSeg: s.reloj.incSeg };
	return { ...s, partida, reloj };
}

export const rendirse = (s: Sesion) => (s.fin ? s : terminar(s, gana(otro(s.miColor)), 'abandono'));
// shortcut: el motor siempre acepta las tablas; si se vuelve un atajo para no perder, que acepte solo con evaluación pareja
export const tablas = (s: Sesion) => (s.fin ? s : terminar(s, '1/2-1/2', 'acuerdo'));

// Retoma una partida guardada con EnCurso: color, nivel y relojes desde la cabecera y los [%clk]. El reloj corre desde ahoraMs.
export function retomar(partida: Partida, misNombres: string[], ahoraMs: number): Sesion {
	const c = partida.cabecera;
	const soyBlancas = misNombres.some((n) => n.toLowerCase() === (c.White ?? '').toLowerCase());
	const [base, inc] = (c.TimeControl ?? '600').split('+').map(Number);
	const reloj = crearReloj({ baseSeg: base || 600, incSeg: inc || 0 });
	for (const n of lineaPrincipal(partida)) if (n.relojSeg !== null) reloj.restanteSeg[otro(turno(n.fen))] = n.relojSeg;
	const s: Sesion = { partida, miColor: soyBlancas ? 'blancas' : 'negras', nivel: Number(c.Nivel) || 1, reloj, fin: null };
	return lineaPrincipal(partida).length ? { ...s, reloj: iniciar(reloj, turno(fenActual(s)), ahoraMs) } : s;
}
