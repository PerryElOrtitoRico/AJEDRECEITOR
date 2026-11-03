<!-- modelo google/gemma-4-e4b-qat, temperatura 0.2, max_tokens 6973, razonamiento no -->

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

# T14 · huella.ts

Completá los dos `// TODO T14`. La huella identifica una partida por sus jugadas, para detectar duplicados cuando no hay enlace (las partidas de chess.com pegadas no traen ID).

## normalizarMovetext(texto)
Deja solo las jugadas, separadas por un espacio.
1. Quitar comentarios: `texto.replace(/\{[^}]*\}/g, ' ')`.
2. Quitar variantes, también las anidadas: repetir `t = t.replace(/\([^()]*\)/g, ' ')` mientras el texto siga cambiando.
3. Quitar NAGs (`/\$\d+/g`) y números de jugada (`/\d+\.+/g`: `12.`, `12...`, `1.e4`) reemplazándolos por un espacio.
4. `t.split(/\s+/)`; a cada pieza quitarle los `!` y `?` del final (`/[!?]+$/`); descartar las vacías y los resultados `1-0`, `0-1`, `1/2-1/2`, `*`.
5. Unir con un espacio. Por cómo se corta, `8.\nfxe5` queda `fxe5`.
Ejemplo: `1. e4 {bien} e5 2. Nf3 $1 (2. f4) Nc6 1-0` → `e4 e5 Nf3 Nc6`. Texto vacío → `''`.

## huella(cabecera, movetext)
1. Fecha: auxiliar `fechaNormalizada(valor)`: si cumple `/^(\d{4})[.-](\d{2})[.-](\d{2})$/` → `AAAA-MM-DD`; si no → `''`. `fecha = fechaNormalizada(cabecera.Date) || fechaNormalizada(cabecera.UTCDate)`.
2. `base = [White en minúsculas, Black en minúsculas, fecha, normalizarMovetext(movetext)].join('|')` (un nombre que falte es `''`).
3. FNV-1a de 32 bits sobre los códigos de caracteres de `base`:
   `let h = 0x811c9dc5; for (let i = 0; i < base.length; i++) { h ^= base.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }`
4. Devolver `h.toString(16).padStart(8, '0')`.

No toques nada fuera de los dos cuerpos marcados con `// TODO T14`.

---

# Archivos de solo lectura (no los devuelvas)

```ts
// tests/huella.test.ts
import { describe, it, expect } from 'vitest';
import { normalizarMovetext, huella } from '../src/core/huella';

describe('T14 huella (visibles)', () => {
	it('normalizarMovetext', () => {
		expect(normalizarMovetext('1. e4 {bien} e5 2. Nf3 $1 (2. f4) Nc6 1-0')).toBe('e4 e5 Nf3 Nc6');
		expect(normalizarMovetext('8.\nfxe5 8... Nf6')).toBe('fxe5 Nf6');
	});
	it('huella', () => {
		const h = huella({ White: 'A', Black: 'B', Date: '2026.10.29' }, '1. e4 e5 *');
		expect(h).toMatch(/^[0-9a-f]{8}$/);
		expect(huella({ White: 'a', Black: 'b', Date: '2026-10-29' }, '1.e4 {x} e5')).toBe(h);
	});
});
```

---

# Archivos a completar

```ts
// src/core/huella.ts
// Huella de una partida: identidad estable para detectar duplicados cuando no hay enlace. Funciones puras.

export function normalizarMovetext(texto: string): string {
	// TODO T14
	throw new Error('T14: no implementado');
}

export function huella(cabecera: Record<string, string>, movetext: string): string {
	// TODO T14
	throw new Error('T14: no implementado');
}
```

Completá los `// TODO T14`. Devolvé estos archivos completos, cada uno en su bloque: src/core/huella.ts.
