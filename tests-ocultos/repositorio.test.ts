import { readFileSync } from 'node:fs';
import { AlmacenMemoria } from '../src/adaptadores/almacen-memoria';
import { Repositorio } from '../src/app/repositorio';
import { anotar } from '../src/core/arbol';

const fixture = (n: number) => readFileSync(`tests/fixtures/partida${n}.txt`, 'utf8');

describe('repositorio', () => {
	it('importa, detecta duplicados (Partida1 = Partida2) y limpia evaluaciones', async () => {
		const almacen = new AlmacenMemoria();
		const repo = new Repositorio(almacen);
		const r = await repo.importar([1, 2, 3, 4, 5].map(fixture).join('\n\n'));
		expect(r).toEqual({ nuevas: 4, repetidas: 1, invalidas: 0 });
		expect(repo.indice).toHaveLength(4);
		expect(repo.indice.map((m) => m.origen).sort()).toEqual(['chesscom', 'chesscom', 'chesscom', 'lichess']);
		expect(repo.indice.every((m) => m.plies > 10 && m.fecha !== '')).toBe(true);
		expect((await repo.importar(fixture(3))).repetidas).toBe(1);
	});
	it('guardar y reabrir conserva comentarios; índice incremental y borrados', async () => {
		const almacen = new AlmacenMemoria();
		const repo = new Repositorio(almacen);
		await repo.importar(fixture(1));
		const archivo = repo.indice[0]!.archivo;
		const p = await repo.abrir(archivo);
		const id = p!.raiz.hijos[0]!.id;
		await repo.guardar(archivo, anotar(p!, id, 'mi idea')!);
		expect((await repo.abrir(archivo))!.raiz.hijos[0]!.comentario).toBe('mi idea');
		await almacen.escribir('x.tmp', 'basura');
		await almacen.escribir('a.sync-conflict-20261101-101010-ABCDEFG.pgn', fixture(3));
		await repo.refrescar();
		expect(repo.indice).toHaveLength(1);
		await repo.borrar(archivo);
		expect(await repo.refrescar()).toEqual([]);
	});
	it('sincronización simulada: lo creado en A aparece en B', async () => {
		const a = new AlmacenMemoria();
		const b = new AlmacenMemoria();
		await new Repositorio(a).importar(fixture(4));
		for (const [n, x] of a.archivos) await b.escribir(n, x.texto);
		expect(await new Repositorio(b).refrescar()).toHaveLength(1);
	});
});
