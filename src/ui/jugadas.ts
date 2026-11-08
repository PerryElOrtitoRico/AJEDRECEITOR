// Lista de jugadas con ramas y comentarios, como en un libro: 1. e4 e5 (1... c5 2. Nf3) 2. Nf3
import type { Nodo } from '../core/tipos';

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function jugada(padre: Nodo, n: Nodo, conNumero: boolean, actual: string): string {
	const [, t, , , , num] = padre.fen.split(' ');
	const numero = t === 'w' ? `<span class="num">${num}.</span>` : conNumero ? `<span class="num">${num}...</span>` : '';
	const com = n.comentario ? `<span class="com">${esc(n.comentario)}</span>` : '';
	return `${numero}<span class="j${n.id === actual ? ' actual' : ''}" data-id="${n.id}">${esc(n.san)}</span>${com}`;
}

function linea(padre: Nodo, conNumero: boolean, actual: string): string {
	let html = '';
	let numero = conNumero;
	for (let p: Nodo | undefined = padre; p && p.hijos[0]; p = p.hijos[0]) {
		const [principal, ...ramas] = p.hijos as [Nodo, ...Nodo[]];
		html += jugada(p, principal, numero, actual);
		numero = principal.comentario !== '';
		for (const r of ramas) {
			html += ` <span class="rama">(${jugada(p, r, true, actual)}${linea(r, r.comentario !== '', actual)})</span> `;
			numero = true;
		}
	}
	return html;
}

export function htmlJugadas(raiz: Nodo, actual: string): string {
	const com = raiz.comentario ? `<span class="com">${esc(raiz.comentario)}</span>` : '';
	return com + linea(raiz, true, actual) || '<span class="suave">Sin jugadas. Mové una pieza para empezar.</span>';
}
