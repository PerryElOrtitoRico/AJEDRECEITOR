<!-- modelo qwen/qwen3.5-9b, temperatura 0.2, max_tokens 4013, razonamiento no -->

## system

Sos un programador TypeScript (modo estricto, módulos ES) cuidadoso. Te paso archivos con funciones marcadas `// TODO Txx`: completá solo las que nombra la tarea; las marcadas "lo completa otra subtarea" quedan exactamente como están.
Reglas:
- Sin librerías, sin `any`, sin DOM, sin fs. Las funciones son puras: no modifican sus argumentos (devolvé valores nuevos) y no usan estado global.
- No cambies nombres, parámetros, tipos ni `import` que ya están, ni lo que ya está hecho. Podés agregar funciones auxiliares sin exportar. Los tipos del contrato (src/core/tipos.ts) no se redefinen.
- Las funciones no lanzan excepciones por entrada mala: devuelven `null` o el valor que indica la tarea.
- Mantené cada archivo en 120 líneas o menos. Nombres y comentarios en español.
- No crees ni modifiques otros archivos.
- Devolvé cada archivo completo (nada de '...') en su propio bloque de código, con la ruta en la primera línea como comentario: un bloque por archivo, nunca dos archivos en el mismo bloque. Ejemplo:
```ts
// src/core/ejemplo.ts
export function doble(n: number): number {
	return 2 * n;
}
```
- Sin explicaciones fuera de los bloques.

## user

# T10 · indice.ts (b): actualizar y ordenar

Completá los dos `// TODO T10` de `src/core/indice.ts`. No modifiques los arreglos que recibís (devolvé arreglos nuevos). `esArchivoPartida` ya está importado de `./nombres`.

## actualizarIndice(viejo, listado)
`viejo` son las entradas guardadas (`MetaPartida[]`); `listado` los archivos que hay ahora en la carpeta (`Archivo[]`, con `nombre` y `modificado`). Devuelve `{ indice, aLeer, eliminados }`.
1. `porNombre = new Map(viejo.map(m => [m.archivo, m]))`.
2. Recorrer `listado` en orden. Ignorar los que `!esArchivoPartida(a.nombre)`. Anotar el nombre en un `Set` de presentes.
3. Si hay entrada previa con el **mismo** `modificado`: ponerla en `indice`.
4. Si no hay entrada previa o el `modificado` es otro: poner el nombre en `aLeer` (y **no** en `indice`).
5. `eliminados`: los `archivo` de `viejo` que no están en el conjunto de presentes.

## ordenar(indice)
Copia (`[...indice]`) ordenada con `sort`:
1. Una entrada con `fecha === ''` va después de una que tiene fecha.
2. Si las dos tienen fecha distinta: la más nueva primero (las fechas `AAAA-MM-DD` se comparan como texto).
3. Si empatan: mayor `modificado` primero (`b.modificado - a.modificado`). Esto también vale entre las que no tienen fecha.

No toques nada fuera de los dos cuerpos marcados con `// TODO T10`.

---

# Archivos de solo lectura (no los devuelvas)

```ts
// src/core/tipos.ts
// Contrato de tipos del núcleo. Lo escribe Opus; nadie más lo modifica ni lo redefine.

export type Color = 'blancas' | 'negras';
export type Resultado = '1-0' | '0-1' | '1/2-1/2' | '*';
export type Origen = 'app' | 'lichess' | 'chesscom' | 'manual';

export interface Nodo {
	id: string; // único en la partida: 'n0' (raíz), 'n1', 'n2'...
	san: string; // '' en la raíz
	uci: string; // '' en la raíz
	fen: string; // posición DESPUÉS de la jugada
	comentario: string; // '' si no hay
	relojSeg: number | null; // [%clk] tras la jugada, en segundos
	hijos: Nodo[]; // hijos[0] = línea principal; el resto son ramas
}

export interface Partida {
	cabecera: Record<string, string>; // Event, Site, Date, White, Black, Result, ImportId...
	raiz: Nodo;
}

export interface MetaPartida {
	archivo: string; // solo el nombre, sin carpeta
	fecha: string; // 'AAAA-MM-DD' o ''
	blancas: string;
	negras: string;
	resultado: Resultado;
	origen: Origen;
	plies: number; // jugadas de la línea principal
	modificado: number; // ms epoch
	enCurso: boolean;
}

export interface Archivo {
	nombre: string;
	modificado: number;
}

export interface Almacen {
	listar(): Promise<Archivo[]>;
	leer(nombre: string): Promise<string>;
	escribir(nombre: string, texto: string): Promise<void>; // atómico
	borrar(nombre: string): Promise<void>;
}
```

```ts
// src/core/nombres.ts
// Nombres de archivos de partidas. Funciones puras, sin acceso a archivos.

export interface FechaHora {
	a: number; // año
	m: number; // mes 1-12
	d: number; // día
	h: number;
	mi: number;
	s: number;
}

export function limpiarNombre(s: string): string {
	// 1. Normalizar y quitar acentos
	let limpio = s.normalize('NFD').replace(/[̀-ͯ]/g, '');

	// 2. Pasar a minúsculas
	limpio = limpio.toLowerCase();

	// 3. Cambiar caracteres no alfanuméricos por un solo '-'
	limpio = limpio.replace(/[^a-z0-9]+/g, '-');

	// 4. Quitar guiones del principio y del final
	limpio = limpio.replace(/^-+|-+$/g, '');

	// 5. Cortar a 20 caracteres y quitar guiones finales
	limpio = limpio.substring(0, 20);
	limpio = limpio.replace(/-+$/, '');

	// 6. Si quedó vacío, devolver 'anonimo'
	return limpio === '' ? 'anonimo' : limpio;
}

export function nombreArchivo(fecha: FechaHora, blancas: string, negras: string, id8: string): string {
	const nombreBlancas = limpiarNombre(blancas);
	const nombreNegras = limpiarNombre(negras);

	const mesStr = String(fecha.m).padStart(2, '0');
	const diaStr = String(fecha.d).padStart(2, '0');
	const horaStr = String(fecha.h).padStart(2, '0');
	const minStr = String(fecha.mi).padStart(2, '0');
	const segStr = String(fecha.s).padStart(2, '0');

	return `${fecha.a}-${mesStr}-${diaStr}_${horaStr}${minStr}${segStr}_${nombreBlancas}-vs-${nombreNegras}_${id8}.pgn`;
}

export function esArchivoPartida(nombre: string): boolean {
	if (nombre.startsWith('.') || nombre.endsWith('.tmp')) {
		return false;
	}
	if (nombre.includes('.sync-conflict-')) {
		return false;
	}
	return nombre.endsWith('.pgn');
}

export function esConflicto(nombre: string): boolean {
	const conflictoRegex = /\.sync-conflict-\d{8}-\d{6}-[A-Z0-9]{7}\.pgn$/;
	return conflictoRegex.test(nombre);
}

export function originalDeConflicto(nombre: string): string | null {
	const conflictoRegex = /\.sync-conflict-(\d{8}-\d{6}-[A-Z0-9]{7})\.(pgn)$/;
	const match = nombre.match(conflictoRegex);

	if (match) {
		// Reemplaza la parte del conflicto por .pgn
		const baseName = nombre.substring(0, match.index);
		return baseName + '.pgn';
	}
	return null;
}
```

```ts
// tests/indice.test.ts
import { describe, it, expect } from 'vitest';
import type { MetaPartida } from '../src/core/tipos';
import {
	cabeceraDePgn, metaDesdeCabecera, actualizarIndice, ordenar, resultadoParaMi, filtrar,
} from '../src/core/indice';

function meta(extra: Partial<MetaPartida> = {}): MetaPartida {
	return {
		archivo: 'a.pgn', fecha: '2026-10-30', blancas: 'Yo', negras: 'Motor', resultado: '1-0',
		origen: 'app', plies: 10, modificado: 100, enCurso: false, ...extra,
	};
}

describe('T09 indice: cabecera y meta (visibles)', () => {
	it('cabeceraDePgn', () => {
		const c = cabeceraDePgn('[Event "Casual"]\n[White "Yo"]\n\n1. e4 e5 *');
		expect(c).toEqual({ Event: 'Casual', White: 'Yo' });
	});
	it('metaDesdeCabecera', () => {
		const m = metaDesdeCabecera('x.pgn', 5, { Date: '2026.10.30', White: 'A', Black: 'B', Result: '0-1' }, 12);
		expect(m).toEqual({
			archivo: 'x.pgn', fecha: '2026-10-30', blancas: 'A', negras: 'B', resultado: '0-1',
			origen: 'app', plies: 12, modificado: 5, enCurso: false,
		});
	});
});

describe('T10 indice: actualizar y ordenar (visibles)', () => {
	it('actualizarIndice', () => {
		const viejo = [meta({ archivo: 'a.pgn', modificado: 1 }), meta({ archivo: 'b.pgn', modificado: 2 })];
		const r = actualizarIndice(viejo, [{ nombre: 'a.pgn', modificado: 1 }, { nombre: 'c.pgn', modificado: 3 }]);
		expect(r.indice.map((m) => m.archivo)).toEqual(['a.pgn']);
		expect(r.aLeer).toEqual(['c.pgn']);
		expect(r.eliminados).toEqual(['b.pgn']);
	});
	it('ordenar', () => {
		const o = ordenar([meta({ archivo: 'v', fecha: '' }), meta({ archivo: 'a', fecha: '2026-01-01' }), meta({ archivo: 'b', fecha: '2026-02-01' })]);
		expect(o.map((m) => m.archivo)).toEqual(['b', 'a', 'v']);
	});
});

describe('T11 indice: resultado para mí y filtro (visibles)', () => {
	it('resultadoParaMi', () => {
		expect(resultadoParaMi(meta(), ['yo'])).toBe('victoria');
		expect(resultadoParaMi(meta({ resultado: '0-1' }), ['Yo'])).toBe('derrota');
		expect(resultadoParaMi(meta({ resultado: '1/2-1/2' }), ['Yo'])).toBe('tablas');
		expect(resultadoParaMi(meta(), ['otro'])).toBe('desconocido');
	});
	it('filtrar', () => {
		const todos = [meta({ archivo: 'g' }), meta({ archivo: 'p', resultado: '0-1' })];
		expect(filtrar(todos, { resultado: 'derrota', misNombres: ['Yo'] }).map((m) => m.archivo)).toEqual(['p']);
		expect(filtrar(todos, { misNombres: ['Yo'] }).length).toBe(2);
	});
});
```

---

# Archivos a completar

```ts
// src/core/indice.ts
// Índice de partidas: leer cabeceras PGN, mantener la lista al día, ordenar y filtrar. Funciones puras.
import type { Archivo, MetaPartida, Origen, Resultado } from './tipos';
import { esArchivoPartida } from './nombres';

export type ResultadoParaMi = 'victoria' | 'derrota' | 'tablas' | 'en curso' | 'desconocido';

export interface ActualizacionIndice {
	indice: MetaPartida[]; // las entradas que se reutilizan
	aLeer: string[]; // archivos nuevos o con otro `modificado`
	eliminados: string[]; // estaban en el índice y ya no están en la carpeta
}

// --- Cabecera y metadatos (T09) ---

export function cabeceraDePgn(texto: string): Record<string, string> {
	const cabecera: Record<string, string> = {};
	let etiquetasVistas = false;
	const lineas = texto.split(/\r?\n/);

	for (const linea of lineas) {
		const lineaRecortada = linea.trim();
		if (lineaRecortada.length === 0) continue;

		const regexEtiqueta = /^\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]\s*$/;
		const match = lineaRecortada.match(regexEtiqueta);

		if (match) {
			const clave = match[1] ?? '';
			let valor = match[2] ?? '';
			valor = valor.replace(/\\(["\\])/g, '$1');
			if (clave !== '') cabecera[clave] = valor;
			etiquetasVistas = true;
		} else if (etiquetasVistas) break;
	}

	return cabecera;
}

function fechaNormalizada(valor: string | undefined): string {
	if (!valor) return '';
	const fechaRegex = /^(\d{4})[.-](\d{2})[.-](\d{2})$/;
	const match = valor.match(fechaRegex);
	if (match) return `${match[1]}-${match[2]}-${match[3]}`;
	return '';
}

export function metaDesdeCabecera(
	archivo: string,
	modificado: number,
	cabecera: Record<string, string>,
	plies: number,
): MetaPartida {
	const fechaDate = fechaNormalizada(cabecera.Date);
	const fechaUTCDate = fechaNormalizada(cabecera.UTCDate);
	const fecha = fechaDate || fechaUTCDate;

	const blancas = cabecera.White ?? '?';
	const negras = cabecera.Black ?? '?';

	let resultado: Resultado = '*';
	const resStr = cabecera.Result;
	if (resStr === '1-0' || resStr === '0-1' || resStr === '1/2-1/2') {
		resultado = resStr as Resultado;
	}

	let origen: Origen = 'app';
	const importId = cabecera.ImportId;
	if (importId?.startsWith('lichess:')) origen = 'lichess';
	else if (importId?.startsWith('chesscom:')) origen = 'chesscom';
	else {
		const origenStr = cabecera.Origen;
		if (origenStr === 'app' || origenStr === 'lichess' || origenStr === 'chesscom' || origenStr === 'manual') {
			origen = origenStr as Origen;
		}
	}

	const enCurso = cabecera.EnCurso === '1';

	return {
		archivo: archivo.substring(archivo.lastIndexOf('/') + 1),
		modificado: modificado,
		fecha: fecha,
		blancas: blancas as string,
		negras: negras as string,
		resultado: resultado,
		origen: origen,
		plies: plies,
		enCurso: enCurso,
	};
}

// --- Mantener y ordenar (T10) ---

export function actualizarIndice(viejo: MetaPartida[], listado: Archivo[]): ActualizacionIndice {
	const porNombre = new Map<string, MetaPartida>(viejo.map(m => [m.archivo, m]));
	const presentes = new Set<string>();
	const aLeer: string[] = [];
	const eliminados: string[] = [];
	const indice: MetaPartida[] = [];

	for (const archivo of listado) {
		if (!esArchivoPartida(archivo.nombre)) continue;
		presentes.add(archivo.nombre);
		const entrada = porNombre.get(archivo.nombre);
		if (entrada && entrada.modificado === archivo.modificado) {
			indice.push(entrada);
			continue;
		}
		aLeer.push(archivo.nombre);
	}

	for (const m of viejo) {
		if (!presentes.has(m.archivo)) eliminados.push(m.archivo);
	}

	return { indice, aLeer, eliminados };
}

export function ordenar(indice: MetaPartida[]): MetaPartida[] {
	const copia = [...indice];
	copia.sort((a, b) => {
		const tieneFechaA = a.fecha !== '';
		const tieneFechaB = b.fecha !== '';

		if (tieneFechaA && !tieneFechaB) return -1;
		if (!tieneFechaA && tieneFechaB) return 1;

		if (a.fecha === '' || b.fecha === '') {
			return b.modificado - a.modificado;
		}

		const comp = a.fecha.localeCompare(b.fecha);
		if (comp !== 0) return comp;

		return b.modificado - a.modificado;
	});

	return copia;
}

// --- Resultado para mí y filtro (T11) ---

export function resultadoParaMi(meta: MetaPartida, misNombres: string[]): ResultadoParaMi {
	// lo completa otra subtarea (T11): no lo cambies
	throw new Error('T11: no implementado');
}

export function filtrar(
	indice: MetaPartida[],
	opciones: { resultado?: ResultadoParaMi; misNombres: string[] },
): MetaPartida[] {
	// lo completa otra subtarea (T11): no lo cambies
	throw new Error('T11: no implementado');
}
```

---

# Error al compilar o testear (corregilo)

```
actualizarIndice ya está bien. Queda UN solo error, en ordenar: las fechas salen de la más vieja a la más nueva y tienen que salir de la más NUEVA a la más vieja.
Test: tests/indice.test.ts:38 expect(o.map((m) => m.archivo)).toEqual(['b', 'a', 'v']) (a tiene fecha 2026-01-01, b 2026-02-01) → recibió ['a','b','v'] en el sentido contrario.
Línea que está mal (en ordenar):
		const comp = a.fecha.localeCompare(b.fecha);
Reemplazarla EXACTAMENTE por:
		const comp = b.fecha.localeCompare(a.fecha);
No cambies nada más en ordenar ni en actualizarIndice. Si podés, sacá los comentarios y líneas en blanco sobrantes para bajar de 154 a menos de 120 líneas (el archivo todavía tiene que crecer con T11). Devolvé el archivo completo.
```

Completá los `// TODO T10`. Devolvé estos archivos completos, cada uno en su bloque: src/core/indice.ts.
