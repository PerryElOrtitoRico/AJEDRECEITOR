<!-- modelo qwen/qwen3.5-9b, temperatura 0.2, max_tokens 4623, razonamiento no -->

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

# T09 · indice.ts (a): cabecera y metadatos

Completá los dos `// TODO T09` de `src/core/indice.ts`. Lo demás ("lo completa otra subtarea") queda como está. Los tipos `MetaPartida`, `Origen` y `Resultado` están en `tipos.ts` (ya importados o importalos de ahí).

## cabeceraDePgn(texto)
Lee las etiquetas `[Clave "Valor"]` del **primer** juego de un texto PGN, sin leer las jugadas. Devuelve `Record<string, string>`.
1. `texto.split(/\r?\n/)`; cada línea se recorta con `.trim()` (hay archivos que empiezan con espacios o tabulaciones).
2. Las líneas vacías se saltean.
3. Una línea es etiqueta si cumple `/^\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]\s*$/`. Guardar `cab[clave] = valor` y contar las etiquetas vistas.
4. Dentro del valor, `\"` pasa a `"` y `\\` a `\` (`.replace(/\\(["\\])/g, '$1')`).
5. Si una línea no vacía **no** es etiqueta y ya se vio al menos una etiqueta: cortar el bucle (empezaron las jugadas; no se leen más etiquetas del segundo juego). Si todavía no se vio ninguna, seguir.
6. Texto vacío o sin etiquetas → `{}`.

## metaDesdeCabecera(archivo, modificado, cabecera, plies)
Arma un `MetaPartida`:
- `archivo`, `modificado`, `plies`: tal cual.
- `fecha`: auxiliar `fechaNormalizada(valor)`: si `valor` cumple `/^(\d{4})[.-](\d{2})[.-](\d{2})$/` → `AAAA-MM-DD` (con guiones); si no (`????.??.??`, `2026.??.??`, `undefined`) → `''`. `fecha = fechaNormalizada(cabecera.Date) || fechaNormalizada(cabecera.UTCDate)`.
- `blancas` = `cabecera.White ?? '?'`; `negras` = `cabecera.Black ?? '?'`.
- `resultado`: `cabecera.Result` si es exactamente `'1-0'`, `'0-1'` o `'1/2-1/2'`; cualquier otra cosa o ausente → `'*'`.
- `origen`: si `ImportId` empieza con `lichess:` → `'lichess'`; si empieza con `chesscom:` → `'chesscom'`; si no, si `Origen` es uno de `'app' | 'lichess' | 'chesscom' | 'manual'` → ese; si no → `'app'`.
- `enCurso`: `cabecera.EnCurso === '1'`.

No toques nada fuera de los dos cuerpos marcados con `// TODO T09`.

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
import type { Archivo, MetaPartida } from './tipos';
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
		if (lineaRecortada.length === 0) {
			continue;
		}

		const regexEtiqueta = /^\[(\w+)\s+"((?:[^"\\]|\\.)*)"\]\s*$/;
		const match = lineaRecortada.match(regexEtiqueta);

		if (match) {
			const clave = match[1];
			let valor = match[2];
			// Reemplazar secuencias de escape: \" -> ", \\ -> \
			valor = valor.replace(/\\(["\\])/g, '$1');
			cabecera[clave] = valor;
			etiquetasVistas = true;
		} else if (etiquetasVistas) {
			// Si no es etiqueta y ya vimos etiquetas, hemos entrado en jugadas
			break;
		}
	}

	return cabecera;
}

function fechaNormalizada(valor: string | undefined): string {
	if (!valor) return '';
	const fechaRegex = /^(\d{4})[.-](\d{2})[.-](\d{2})$/;
	const match = valor.match(fechaRegex);
	if (match) {
		// Formato AAAA-MM-DD
		return `${match[1]}-${match[2]}-${match[3]}`;
	}
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
	if (importId?.startsWith('lichess:')) {
		origen = 'lichess';
	} else if (importId?.startsWith('chesscom:')) {
		origen = 'chesscom';
	} else {
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
	// lo completa otra subtarea (T10): no lo cambies
	throw new Error('T10: no implementado');
}

export function ordenar(indice: MetaPartida[]): MetaPartida[] {
	// lo completa otra subtarea (T10): no lo cambies
	throw new Error('T10: no implementado');
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
tsc --noEmit falla en src/core/indice.ts (6 errores, todos arreglables sin cambiar la lógica):
a) Cambiaste el import de la línea 2. Tiene que quedar EXACTAMENTE como estaba, con los tipos que usás:
import type { Archivo, MetaPartida, Origen, Resultado } from './tipos';
(errores: indice.ts(69,17), (72,25): Cannot find name 'Resultado'; (75,14), (84,26): Cannot find name 'Origen'.)
b) noUncheckedIndexedAccess: match[1] y match[2] son string | undefined.
indice.ts(33,12): error TS18048: 'valor' is possibly 'undefined'.   ← línea: valor = valor.replace(/\\(["\\])/g, '$1');
indice.ts(34,13): error TS2538: Type 'undefined' cannot be used as an index type.   ← línea: cabecera[clave] = valor;
Corrección: después de `const match = ...; if (match) {` poné `const clave = match[1] ?? ''; let valor = match[2] ?? '';` y escribí `cabecera[clave] = valor` solo si `clave !== ''`.
Dejá intactas las funciones de T10 y T11 ("lo completa otra subtarea") y el resto del archivo. Devolvé el archivo completo.
```

Completá los `// TODO T09`. Devolvé estos archivos completos, cada uno en su bloque: src/core/indice.ts.
