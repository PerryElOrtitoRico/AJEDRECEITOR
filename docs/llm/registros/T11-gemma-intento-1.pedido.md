<!-- modelo google/gemma-4-e4b-qat, temperatura 0.2, max_tokens 5019, razonamiento no -->

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

# T11 · indice.ts (c): resultado para mí y filtro

Completá los dos `// TODO T11` de `src/core/indice.ts`. `ResultadoParaMi` ya está definido en el archivo.

## resultadoParaMi(meta, misNombres)
Orden de decisión:
1. Si `meta.enCurso` → `'en curso'`.
2. `mios = misNombres.map(n => n.toLowerCase())`. `soyBlancas = mios.includes(meta.blancas.toLowerCase())`, `soyNegras` igual con `meta.negras`.
3. Si `soyBlancas === soyNegras` (ninguno o los dos colores son míos) → `'desconocido'`.
4. Si `meta.resultado === '1/2-1/2'` → `'tablas'`.
5. Si `meta.resultado === '*'` → `'desconocido'`.
6. `ganaronBlancas = meta.resultado === '1-0'`. Si `ganaronBlancas === soyBlancas` → `'victoria'`; si no → `'derrota'`.

## filtrar(indice, { resultado, misNombres })
Si `resultado` es `undefined`, devolver una copia de todo (`[...indice]`). Si no, `indice.filter(m => resultadoParaMi(m, misNombres) === resultado)`.

No toques nada fuera de los dos cuerpos marcados con `// TODO T11`.

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
		const comp = b.fecha.localeCompare(a.fecha);
		if (comp !== 0) return comp;
		return b.modificado - a.modificado;
	});
	return copia;
}

// --- Resultado para mí y filtro (T11) ---

export function resultadoParaMi(meta: MetaPartida, misNombres: string[]): ResultadoParaMi {
	// TODO T11
	throw new Error('T11: no implementado');
}

export function filtrar(
	indice: MetaPartida[],
	opciones: { resultado?: ResultadoParaMi; misNombres: string[] },
): MetaPartida[] {
	// TODO T11
	throw new Error('T11: no implementado');
}
```

Completá los `// TODO T11`. Devolvé estos archivos completos, cada uno en su bloque: src/core/indice.ts.
