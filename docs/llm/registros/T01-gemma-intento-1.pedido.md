<!-- modelo google/gemma-4-e4b-qat, temperatura 0.2, max_tokens 6793, razonamiento no -->

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

# T01 · nombres.ts

Completá los cinco `// TODO T01` de `src/core/nombres.ts`. Son funciones puras sobre texto.

## limpiarNombre(s)
1. `s.normalize('NFD')` y quitar las marcas de acento (`/[̀-ͯ]/g`).
2. Pasar a minúsculas.
3. Cambiar cada tramo de caracteres que no sean `a-z` ni `0-9` por un solo `-`.
4. Quitar los guiones del principio y del final.
5. Cortar a 20 caracteres y volver a quitar guiones del final.
6. Si quedó vacío, devolver `'anonimo'`.

## nombreArchivo(fecha, blancas, negras, id8)
`AAAA-MM-DD_HHMMSS_<blancas>-vs-<negras>_<id8>.pgn`, con mes, día, hora, minuto y segundo de 2 dígitos (con cero a la izquierda) y los nombres pasados por `limpiarNombre`.
Ejemplo: `2026-10-30_153045_perry-vs-motor-nivel-3_a1b2c3d4.pgn`.

## esArchivoPartida(nombre)
`true` solo si termina en `.pgn`, no empieza con `.`, no contiene `.sync-conflict-` y no termina en `.tmp`.

## esConflicto(nombre) y originalDeConflicto(nombre)
Usá la expresión `/\.sync-conflict-\d{8}-\d{6}-[A-Z0-9]{7}\.pgn$/`.
- `esConflicto`: `true` si el nombre la cumple.
- `originalDeConflicto`: si la cumple, devolver el nombre reemplazando esa parte por `.pgn`; si no, `null`.
  Ejemplo: `x.sync-conflict-20261030-153045-ABCDEFG.pgn` → `x.pgn`.

No toques nada fuera de los cinco cuerpos marcados con `// TODO T01`.

---

# Archivos de solo lectura (no los devuelvas)

```ts
// tests/nombres.test.ts
import { describe, it, expect } from 'vitest';
import { limpiarNombre, nombreArchivo, esArchivoPartida, esConflicto, originalDeConflicto } from '../src/core/nombres';

describe('T01 nombres (visibles)', () => {
	it('limpiarNombre', () => {
		expect(limpiarNombre('Perry')).toBe('perry');
		expect(limpiarNombre('Motor nivel 3')).toBe('motor-nivel-3');
		expect(limpiarNombre('')).toBe('anonimo');
	});
	it('nombreArchivo', () => {
		const f = { a: 2026, m: 10, d: 30, h: 15, mi: 30, s: 45 };
		expect(nombreArchivo(f, 'Perry', 'Motor nivel 3', 'a1b2c3d4')).toBe(
			'2026-10-30_153045_perry-vs-motor-nivel-3_a1b2c3d4.pgn',
		);
	});
	it('esArchivoPartida', () => {
		expect(esArchivoPartida('x.pgn')).toBe(true);
		expect(esArchivoPartida('x.pgn.tmp')).toBe(false);
	});
	it('conflictos', () => {
		const c = 'x.sync-conflict-20261030-153045-ABCDEFG.pgn';
		expect(esConflicto(c)).toBe(true);
		expect(originalDeConflicto(c)).toBe('x.pgn');
		expect(originalDeConflicto('x.pgn')).toBe(null);
	});
});
```

---

# Archivos a completar

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
	// TODO T01
	throw new Error('T01: no implementado');
}

export function nombreArchivo(fecha: FechaHora, blancas: string, negras: string, id8: string): string {
	// TODO T01
	throw new Error('T01: no implementado');
}

export function esArchivoPartida(nombre: string): boolean {
	// TODO T01
	throw new Error('T01: no implementado');
}

export function esConflicto(nombre: string): boolean {
	// TODO T01
	throw new Error('T01: no implementado');
}

export function originalDeConflicto(nombre: string): string | null {
	// TODO T01
	throw new Error('T01: no implementado');
}
```

Completá los `// TODO T01`. Devolvé estos archivos completos, cada uno en su bloque: src/core/nombres.ts.
