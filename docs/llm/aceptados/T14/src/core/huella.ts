// Huella de una partida: identidad estable para detectar duplicados cuando no hay enlace. Funciones puras.

export function normalizarMovetext(texto: string): string {
	if (!texto) {
		return '';
	}

	let t = texto;

	// 1. Quitar comentarios: { ... }
	t = t.replace(/\{[^}]*\}/g, ' ');

	// 2. Quitar variantes, también las anidadas: ( ... )
	let prevT = '';
	while (t !== prevT) {
		prevT = t;
		t = t.replace(/\([^()]*\)/g, ' ');
	}

	// 3. Quitar NAGs (\$\d+) y números de jugada (\d+\.+/)
	t = t.replace(/\$\d+/g, ' ');
	t = t.replace(/\d+\.+/g, ' ');

	// 4. Procesar jugadas
	const jugadas = t.split(/\s+/);
	const jugadasFiltradas: string[] = [];

	for (const jugada of jugadas) {
		// Quitar ! y ? del final
		let limpia = jugada.replace(/[!?]+$/, '');

		// Descartar vacías y resultados de terminación/empate
		if (limpia && !['1-0', '0-1', '1/2-1/2', '*'].includes(limpia)) {
			jugadasFiltradas.push(limpia);
		}
	}

	// 5. Unir con un espacio
	return jugadasFiltradas.join(' ');
}

function fechaNormalizada(valor: string): string {
	if (!valor) return '';
	const regex = /^(\d{4})[.-](\d{2})[.-](\d{2})$/;
	const match = valor.match(regex);
	if (match) {
		const [_, year, month, day] = match;
		return `${year}-${month}-${day}`;
	}
	return '';
}

export function huella(cabecera: Record<string, string>, movetext: string): string {
	// 1. Fecha
	const date1 = fechaNormalizada(cabecera.Date ?? '');
	const date2 = fechaNormalizada(cabecera.UTCDate ?? '');
	const fecha = date1 || date2 || '';

	// 2. Base
	const white = (cabecera.White || '').toLowerCase();
	const black = (cabecera.Black || '').toLowerCase();
	const normalizedMoves = normalizarMovetext(movetext);

	const base = [white, black, fecha, normalizedMoves].join('|');

	// 3. FNV-1a de 32 bits
	let h = 0x811c9dc5;
	for (let i = 0; i < base.length; i++) {
		h ^= base.charCodeAt(i);
		// Math.imul simula multiplicación de 32 bits con overflow
		h = Math.imul(h, 0x01000193) >>> 0;
	}

	// 4. Devolver hash en hexadecimal
	return h.toString(16).padStart(8, '0');
}
