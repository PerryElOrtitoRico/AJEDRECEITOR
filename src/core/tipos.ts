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
