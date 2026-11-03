<!-- modelo qwen/qwen3.5-9b, temperatura 0.2, max_tokens 6354, razonamiento no -->

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

# T02 · limpieza.ts

Completá los cuatro `// TODO T02` de `src/core/limpieza.ts`. Sirve para limpiar comentarios de partidas importadas (Lichess/chess.com).

Función auxiliar sugerida (sin exportar): `compactar(texto)` = cambiar cada tramo de 2 o más espacios por uno solo y recortar (`.trim()`).

## extraerReloj(comentario)
Devuelve `{ relojSeg, resto }`.
1. Buscar `/\[%clk\s+(\d+):(\d{1,2}):(\d{1,2}(?:\.\d+)?)\]/`.
2. Si no hay coincidencia: `{ relojSeg: null, resto: compactar(comentario) }`.
3. Si hay: `relojSeg` = horas×3600 + minutos×60 + segundos (los segundos pueden traer décimas: `Number(...)`).
4. `resto` = el comentario sin ese comando, pasado por `compactar`.
Ejemplos: `'[%clk 0:03:00]'` → `{ relojSeg: 180, resto: '' }`; `'[%eval 0.17] [%clk 0:03:00] buen cambio'` → `{ relojSeg: 180, resto: '[%eval 0.17] buen cambio' }`.

## quitarEvaluaciones(comentario)
Borrar los comandos `[%eval …]`, `[%emt …]`, `[%cal …]`, `[%csl …]` y `[%depth …]` (regex `/\[%(?:eval|emt|cal|csl|depth)\s[^\]]*\]/g`) y devolver `compactar(...)`. **No** borra `[%clk …]` ni otros corchetes del usuario como `[nota]`.

## esComentarioDeAnalisis(texto)
Con `texto.trim()`: `true` si cumple `/^(Inaccuracy|Mistake|Blunder)\. .* was best\.$/` o si es exactamente `Checkmate is now unavoidable.`; si no, `false`.

## limpiarNags(nags)
Devuelve un arreglo nuevo sin los NAG del 1 al 6 ni del 10 al 19. Los demás se conservan en su orden.

No toques nada fuera de los cuatro cuerpos marcados con `// TODO T02`.

---

# Archivos de solo lectura (no los devuelvas)

```ts
// tests/limpieza.test.ts
import { describe, it, expect } from 'vitest';
import { extraerReloj, quitarEvaluaciones, esComentarioDeAnalisis, limpiarNags } from '../src/core/limpieza';

describe('T02 limpieza (visibles)', () => {
	it('extraerReloj', () => {
		expect(extraerReloj('[%clk 0:03:00]')).toEqual({ relojSeg: 180, resto: '' });
		expect(extraerReloj('hola')).toEqual({ relojSeg: null, resto: 'hola' });
	});
	it('quitarEvaluaciones', () => {
		expect(quitarEvaluaciones('[%eval 0.17] bien')).toBe('bien');
	});
	it('esComentarioDeAnalisis', () => {
		expect(esComentarioDeAnalisis('Blunder. Nf3 was best.')).toBe(true);
		expect(esComentarioDeAnalisis('buena jugada')).toBe(false);
	});
	it('limpiarNags', () => {
		expect(limpiarNags([1, 7, 14])).toEqual([7]);
	});
});
```

---

# Archivos a completar

```ts
// src/core/limpieza.ts
// Limpieza de comentarios y NAGs que vienen de otros sitios. Funciones puras.

export interface RelojExtraido {
	relojSeg: number | null;
	resto: string;
}

/**
 * Compacta un texto: reemplaza secuencias de 2 o más espacios por uno solo y recorta.
 */
function compactar(texto: string): string {
	return texto.replace(/\s{2,}/g, ' ').trim();
}

export function extraerReloj(comentario: string): RelojExtraido {
	const regex = /\[%clk\s+(\d+):(\d{1,2}):(\d{1,2}(?:\.\d+)?)\]/;
	const match = comentario.match(regex);

	if (!match) {
		return { relojSeg: null, resto: compactar(comentario) };
	}

	const horas = parseInt(match[1], 10);
	const minutos = parseInt(match[2], 10);
	const segundos = parseFloat(match[3]);

	const relojSeg = (horas * 3600) + (minutos * 60) + segundos;

	const resto = comentario.replace(regex, '').trim();

	return { relojSeg, resto: compactar(resto) };
}

export function quitarEvaluaciones(comentario: string): string {
	const regex = /\[%(?:eval|emt|cal|csl|depth)\s[^\]]*\]/g;
	const resultado = comentario.replace(regex, '');
	return compactar(resultado);
}

export function esComentarioDeAnalisis(texto: string): boolean {
	const trimmedText = texto.trim();
	const regexAnalisis = /^(Inaccuracy|Mistake|Blunder)\. .* was best\.$/;
	
	return regexAnalisis.test(trimmedText) || trimmedText === 'Checkmate is now unavoidable.';
}

export function limpiarNags(nags: number[]): number[] {
	const nagsFiltrados: number[] = [];
	for (const nag of nags) {
		// Conservar si no está en [1..6] ni en [10..19]
		const esNAGNoDeseado = (nag >= 1 && nag <= 6) || (nag >= 10 && nag <= 19);
		if (!esNAGNoDeseado) {
			nagsFiltrados.push(nag);
		}
	}
	return nagsFiltrados;
}
```

---

# Error al compilar o testear (corregilo)

```
tsc --noEmit falla (tsconfig con noUncheckedIndexedAccess: match[1] es string | undefined):
src/core/limpieza.ts(23,25): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.   ← línea: const horas = parseInt(match[1], 10);
src/core/limpieza.ts(24,27): error TS2345: igual   ← línea: const minutos = parseInt(match[2], 10);
src/core/limpieza.ts(25,30): error TS2345: igual   ← línea: const segundos = parseFloat(match[3]);
Corrección: usar Number(match[1] ?? '0'), Number(match[2] ?? '0'), Number(match[3] ?? '0') (los segundos pueden traer décimas). No cambies nada más.
```

Completá los `// TODO T02`. Devolvé estos archivos completos, cada uno en su bloque: src/core/limpieza.ts.
