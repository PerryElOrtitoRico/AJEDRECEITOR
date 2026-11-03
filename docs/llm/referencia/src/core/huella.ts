// Huella de una partida: identidad estable para detectar duplicados cuando no hay enlace. Funciones puras.

export function normalizarMovetext(texto: string): string {
	let t = texto.replace(/\{[^}]*\}/g, ' ');
	let anterior = '';
	while (anterior !== t) {
		anterior = t;
		t = t.replace(/\([^()]*\)/g, ' ');
	}
	t = t.replace(/\$\d+/g, ' ').replace(/\d+\.+/g, ' ');
	return t
		.split(/\s+/)
		.map((j) => j.replace(/[!?]+$/, ''))
		.filter((j) => j !== '' && !['1-0', '0-1', '1/2-1/2', '*'].includes(j))
		.join(' ');
}

function fechaNormalizada(valor: string | undefined): string {
	const m = /^(\d{4})[.-](\d{2})[.-](\d{2})$/.exec(valor ?? '');
	return m === null ? '' : `${m[1]}-${m[2]}-${m[3]}`;
}

export function huella(cabecera: Record<string, string>, movetext: string): string {
	const fecha = fechaNormalizada(cabecera['Date']) || fechaNormalizada(cabecera['UTCDate']);
	const base = [
		(cabecera['White'] ?? '').toLowerCase(),
		(cabecera['Black'] ?? '').toLowerCase(),
		fecha,
		normalizarMovetext(movetext),
	].join('|');
	let h = 0x811c9dc5;
	for (let i = 0; i < base.length; i++) {
		h ^= base.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h.toString(16).padStart(8, '0');
}
