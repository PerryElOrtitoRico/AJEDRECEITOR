<!-- modelo google/gemma-4-e4b-qat, temperatura 0.2, max_tokens 7184, razonamiento no -->

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

# T05 · pista.ts

Completá los dos `// TODO T05` de `src/core/pista.ts`. La pista tiene dos pasos: la primera pulsación resalta la pieza a mover; la segunda, también la casilla de destino.

## siguientePista(previa, fen, mejorUci)
Devuelve un `EstadoPista` nuevo `{ fen, mejor: mejorUci, nivel }` (no modifica `previa`):
- `nivel` es `2` si `previa` no es `null` y `previa.fen === fen` (misma posición: se pulsó otra vez);
- en cualquier otro caso (sin previa o posición distinta) es `1`.
Nunca pasa de 2.

## casillasAResaltar(estado)
1. Si `estado.mejor.length < 4`, devolver `[]`.
2. `desde = estado.mejor.slice(0, 2)`, `hasta = estado.mejor.slice(2, 4)` (de `e7e8q` salen `e7` y `e8`).
3. Nivel 1 → `[desde]`; nivel 2 → `[desde, hasta]`.

No toques nada fuera de los dos cuerpos marcados con `// TODO T05`.

---

# Archivos de solo lectura (no los devuelvas)

```ts
// tests/pista.test.ts
import { describe, it, expect } from 'vitest';
import { siguientePista, casillasAResaltar } from '../src/core/pista';

describe('T05 pista (visibles)', () => {
	it('primera y segunda pulsación', () => {
		const a = siguientePista(null, 'fen1', 'e2e4');
		expect(a).toEqual({ fen: 'fen1', mejor: 'e2e4', nivel: 1 });
		expect(casillasAResaltar(a)).toEqual(['e2']);
		const b = siguientePista(a, 'fen1', 'e2e4');
		expect(b.nivel).toBe(2);
		expect(casillasAResaltar(b)).toEqual(['e2', 'e4']);
	});
});
```

---

# Archivos a completar

```ts
// src/core/pista.ts
// Pista de dos pasos: primero se resalta la pieza a mover, después la jugada completa.

export interface EstadoPista {
	fen: string;
	mejor: string; // jugada UCI, por ejemplo 'e2e4' o 'e7e8q'
	nivel: 1 | 2;
}

export function siguientePista(previa: EstadoPista | null, fen: string, mejorUci: string): EstadoPista {
	// TODO T05
	throw new Error('T05: no implementado');
}

export function casillasAResaltar(estado: EstadoPista): string[] {
	// TODO T05
	throw new Error('T05: no implementado');
}
```

Completá los `// TODO T05`. Devolvé estos archivos completos, cada uno en su bloque: src/core/pista.ts.
