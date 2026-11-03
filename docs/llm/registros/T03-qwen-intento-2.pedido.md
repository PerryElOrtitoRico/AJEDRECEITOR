<!-- modelo qwen/qwen3.5-9b, temperatura 0.2, max_tokens 5531, razonamiento no -->

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

# T03 · reloj.ts

Completá los seis `// TODO T03` de `src/core/reloj.ts`. El reloj es **inmutable**: cada función devuelve un `Reloj` nuevo (nunca modifiques el que te pasan) y el tiempo llega siempre por el parámetro `ahoraMs` (milisegundos); no uses `Date.now()`.

## crearReloj({ baseSeg, incSeg })
`{ baseSeg, incSeg, restanteSeg: { blancas: baseSeg, negras: baseSeg }, turno: null, desdeMs: null }`.

## iniciar(r, color, ahoraMs)
Copia de `r` con `turno: color` y `desdeMs: ahoraMs` (copiar también `restanteSeg`).

## restante(r, color, ahoraMs)
1. `guardado = r.restanteSeg[color]`.
2. Si `r.turno !== color` o `r.desdeMs === null`, devolver `guardado`.
3. Si no, `Math.max(0, guardado - (ahoraMs - r.desdeMs) / 1000)`.

## jugada(r, ahoraMs)
Termina el turno actual.
1. Si `r.turno === null` o `r.desdeMs === null`, devolver `r` sin cambios.
2. `quedan = restante(r, r.turno, ahoraMs)`.
3. Si `quedan > 0`, el nuevo tiempo de quien movió es `quedan + r.incSeg`; si `quedan` es 0, queda en 0 (sin incremento).
4. Devolver un reloj nuevo con ese valor en `restanteSeg[r.turno]`, `turno` = el otro color y `desdeMs: ahoraMs`.

## caido(r, ahoraMs)
`'blancas'` si `restante(r, 'blancas', ahoraMs) <= 0`; si no, `'negras'` si el de negras es `<= 0`; si no, `null`.

## formato(seg)
Primero `s = Math.max(0, seg)`.
- Menos de 10 s: `` `0:0${(Math.floor(s * 10 + 1e-6) / 10).toFixed(1)}` ``. Ejemplos: `9.4` → `0:09.4`, `0` → `0:00.0`, `9.99` → `0:09.9`.
- 10 s o más: `t = Math.floor(s)`, `h` horas, `m` minutos, segundos con 2 dígitos. Si `h > 0`: `H:MM:SS` (`1:02:03`); si no, `M:SS` (`5:00`, `0:10`, `10:00`).

No toques nada fuera de los seis cuerpos marcados con `// TODO T03`.

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
// tests/reloj.test.ts
import { describe, it, expect } from 'vitest';
import { crearReloj, iniciar, jugada, restante, caido, formato } from '../src/core/reloj';

describe('T03 reloj (visibles)', () => {
	it('corre el turno y suma el incremento', () => {
		let r = crearReloj({ baseSeg: 300, incSeg: 2 });
		r = iniciar(r, 'blancas', 1000);
		expect(restante(r, 'blancas', 6000)).toBe(295);
		expect(restante(r, 'negras', 6000)).toBe(300);
		r = jugada(r, 6000);
		expect(r.restanteSeg.blancas).toBe(297);
		expect(r.turno).toBe('negras');
	});
	it('caido', () => {
		const r = iniciar(crearReloj({ baseSeg: 10, incSeg: 0 }), 'negras', 0);
		expect(caido(r, 9999)).toBe(null);
		expect(caido(r, 10000)).toBe('negras');
	});
	it('formato', () => {
		expect(formato(300)).toBe('5:00');
		expect(formato(3723)).toBe('1:02:03');
		expect(formato(9.4)).toBe('0:09.4');
		expect(formato(-5)).toBe('0:00.0');
	});
});
```

---

# Archivos a completar

```ts
// src/core/reloj.ts
// Reloj de ajedrez. Inmutable: todo el tiempo se recibe por parámetro (ahoraMs), nunca se lee un reloj del sistema.
import type { Color } from './tipos';

export interface Reloj {
	baseSeg: number;
	incSeg: number;
	restanteSeg: { blancas: number; negras: number };
	turno: Color | null; // de quién corre el tiempo; null = detenido
	desdeMs: number | null; // instante en que empezó a correr el turno actual
}

export function crearReloj(config: { baseSeg: number; incSeg: number }): Reloj {
	return {
		baseSeg: config.baseSeg,
		incSeg: config.incSeg,
		restanteSeg: { blancas: config.baseSeg, negras: config.baseSeg },
		turno: null,
		desdeMs: null,
	};
}

export function iniciar(r: Reloj, color: Color, ahoraMs: number): Reloj {
	return {
		baseSeg: r.baseSeg,
		incSeg: r.incSeg,
		restanteSeg: { ...r.restanteSeg },
		turno: color,
		desdeMs: ahoraMs,
	};
}

export function jugada(r: Reloj, ahoraMs: number): Reloj {
	if (r.turno === null || r.desdeMs === null) {
		return { ...r };
	}
	const guardado = r.restanteSeg[r.turno];
	const transcurrido = (ahoraMs - r.desdeMs) / 1000;
	let quedan = Math.max(0, guardado - transcurrido);
	
	if (quedan > 0) {
		quedan += r.incSeg;
	}

	const otroColor: Color = r.turno === 'blancas' ? 'negras' : 'blancas';
	return {
		baseSeg: r.baseSeg,
		incSeg: r.incSeg,
		restanteSeg: {
			blancas: r.restanteSeg.blancas,
			negras: r.restanteSeg.negras,
		},
		turno: otroColor,
		desdeMs: ahoraMs,
	};
}

export function restante(r: Reloj, color: Color, ahoraMs: number): number {
	const guardado = r.restanteSeg[color];
	if (r.turno !== color || r.desdeMs === null) {
		return guardado;
	}
	return Math.max(0, guardado - (ahoraMs - r.desdeMs) / 1000);
}

export function caido(r: Reloj, ahoraMs: number): Color | null {
	const blancas = restante(r, 'blancas', ahoraMs);
	if (blancas <= 0) return 'blancas';
	
	const negras = restante(r, 'negras', ahoraMs);
	if (negras <= 0) return 'negras';
	
	return null;
}

export function formato(seg: number): string {
	const s = Math.max(0, seg);
	
	if (s < 10) {
		const valor = Math.floor(s * 10 + 1e-6) / 10;
		return `0:0${valor.toFixed(1)}`;
	}
	
	const t = Math.floor(s);
	const h = Math.floor(t / 3600);
	let resto = t % 3600;
	const m = Math.floor(resto / 60);
	const ss = resto % 60;
	
	if (h > 0) {
		return `${h}:${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
	} else {
		return `${m}:${ss.toString().padStart(2, '0')}`;
	}
}
```

---

# Error al compilar o testear (corregilo)

```
Fallan 4 tests, todos por el mismo bug en jugada(r, ahoraMs): calculás `quedan` (con el incremento) pero nunca lo guardás; el reloj devuelto copia r.restanteSeg tal cual.
Ejemplo: tests/reloj.test.ts "corre el turno y suma el incremento": AssertionError: expected 300 to be 297 (blancas tenía que quedar en 297 = 300 - 6 + 3, quedó en 300).
Otro: expected { blancas: 60, negras: 60 } to deeply equal { blancas: 57, negras: 56 }; y con baseSeg 5, incSeg 3 y 9 s de espera: expected 5 to be 0.
Línea con el error: dentro del return de jugada, `blancas: r.restanteSeg.blancas, negras: r.restanteSeg.negras,`.
Contrato (paso 4): devolver un reloj nuevo con `quedan` (ya con el incremento sumado, o 0) en `restanteSeg[r.turno]`, `turno` = el otro color y `desdeMs: ahoraMs`. Es decir: restanteSeg: { ...r.restanteSeg, [r.turno]: quedan }.
Además el paso 2 dice quedan = restante(r, r.turno, ahoraMs) (usá esa función en vez de recalcularlo) y el paso 1 devuelve `r` sin cambios.
Arreglá solo jugada.
```

Completá los `// TODO T03`. Devolvé estos archivos completos, cada uno en su bloque: src/core/reloj.ts.
