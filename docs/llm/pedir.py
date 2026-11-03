#!/usr/bin/env python3
"""Arma el pedido de una tarea, lo manda a LM Studio, guarda pedido y respuesta en registros/ y extrae los archivos.

Uso: python3 docs/llm/pedir.py <tarea.md> <qwen|gemma> <intento> [--error archivo] [--razonar low|medium] [--solo-ver] [--reextraer]

La tarea empieza con un comentario: <!-- archivos: src/core/a.ts | contexto: src/core/tipos.ts, tests/a.test.ts -->
- archivos: los que el modelo debe devolver completos (solo se escriben esos).
- contexto: archivos de solo lectura que se le muestran (contrato, test visible).
Los `// TODO Txx` de otras tareas se marcan como "lo completa otra subtarea" antes de mandar los archivos.
"""
import argparse
import json
import pathlib
import re
import sys
import time
import urllib.request

REPO = pathlib.Path(__file__).resolve().parents[2]
LLM = REPO / "docs" / "llm"
MODELOS = {"qwen": "qwen/qwen3.5-9b", "gemma": "google/gemma-4-e4b-qat"}
CONTEXTO = 8192

SYSTEM_TS = """Sos un programador TypeScript (modo estricto, módulos ES) cuidadoso. Te paso archivos con funciones marcadas `// TODO Txx`: completá solo las que nombra la tarea; las marcadas "lo completa otra subtarea" quedan exactamente como están.
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
- Sin explicaciones fuera de los bloques."""

RUTA_LINEA = r"(?m)^\s*(?://)?\s*((?:src|tests)/\S+\.ts)\s*$"


def leer_cabecera(texto):
    m = re.match(r"<!--\s*archivos:\s*(.*?)\s*\|\s*contexto:\s*(.*?)\s*-->\s*\n", texto)
    if not m:
        sys.exit("la tarea no tiene la cabecera <!-- archivos: … | contexto: … -->")
    lista = lambda s: [a.strip() for a in s.split(",") if a.strip()]
    return lista(m.group(1)), lista(m.group(2)), texto[m.end():]


def marcar_todos(codigo, tarea_id):
    """Los TODO de otras tareas pasan a 'lo completa otra subtarea'; los de esta quedan como TODO."""
    codigo = re.sub(r"// lo completa otra subtarea \((T\w+)\): no lo cambies", r"// TODO \1", codigo)

    def cambiar(m):
        tid = m.group(1)
        return m.group(0) if tid == tarea_id else f"// lo completa otra subtarea ({tid}): no lo cambies"
    return re.sub(r"// TODO (T\w+)", cambiar, codigo)


def extraer_bloques(respuesta):
    """Bloques de código con la ruta en la primera línea; si un bloque trae varios archivos, se separan por esas líneas."""
    bloques = {}
    cuerpos = [m.group(1) for m in re.finditer(r"```[a-zA-Z]*\n(.*?)```", respuesta, re.S)]
    if not cuerpos or not any(re.search(RUTA_LINEA, c) for c in cuerpos):
        cuerpos = [re.sub(r"(?m)^```[a-zA-Z]*\s*$", "", respuesta)]
    for cuerpo in cuerpos:
        actual, lineas = None, []
        for linea in cuerpo.split("\n"):
            r = re.match(RUTA_LINEA, linea)
            if r:
                if actual:
                    bloques[actual] = "\n".join(lineas)
                actual, lineas = r.group(1), []
            elif actual:
                lineas.append(linea)
        if actual:
            bloques[actual] = "\n".join(lineas)
    return bloques


def escribir(bloques, archivos):
    for ruta, codigo in bloques.items():
        if ruta in archivos:
            (REPO / ruta).write_text(codigo.strip("\n") + "\n", encoding="utf-8")
            print("  escrito", ruta)
        else:
            print("  IGNORADO (no es de la tarea)", ruta)
    for ruta in archivos:
        if ruta not in bloques:
            print("  FALTA en la respuesta", ruta)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("tarea")
    ap.add_argument("modelo", choices=MODELOS)
    ap.add_argument("intento", type=int)
    ap.add_argument("--error")
    ap.add_argument("--razonar")
    ap.add_argument("--solo-ver", action="store_true")
    ap.add_argument("--max", type=int, default=0)
    ap.add_argument("--reextraer", action="store_true", help="no pide nada: vuelve a extraer la respuesta guardada")
    a = ap.parse_args()

    tarea_path = pathlib.Path(a.tarea)
    tarea_id = tarea_path.name.split("-")[0]
    archivos, contexto, tarea = leer_cabecera(tarea_path.read_text(encoding="utf-8"))
    etiqueta = f"{tarea_id}-{a.modelo}-intento-{a.intento}"
    reg = LLM / "registros"
    reg.mkdir(exist_ok=True)

    if a.reextraer:
        contenido = (reg / f"{etiqueta}.respuesta.md").read_text(encoding="utf-8")
        escribir(extraer_bloques(contenido), archivos)
        return

    ctx = [f"```ts\n// {r}\n{(REPO / r).read_text(encoding='utf-8').rstrip()}\n```" for r in contexto]
    bloques_arch = []
    for ruta in archivos:
        p = REPO / ruta
        codigo = marcar_todos(p.read_text(encoding="utf-8"), tarea_id)
        p.write_text(codigo, encoding="utf-8")
        bloques_arch.append(f"```ts\n// {ruta}\n{codigo.rstrip()}\n```")

    user = (tarea.strip() + "\n\n---\n\n# Archivos de solo lectura (no los devuelvas)\n\n" + "\n\n".join(ctx)
            + "\n\n---\n\n# Archivos a completar\n\n" + "\n\n".join(bloques_arch))
    if a.error:
        user += ("\n\n---\n\n# Error al compilar o testear (corregilo)\n\n```\n"
                 + pathlib.Path(a.error).read_text(encoding="utf-8").strip() + "\n```")
    user += (f"\n\nCompletá los `// TODO {tarea_id}`. Devolvé estos archivos completos, cada uno en su bloque: "
             f"{', '.join(archivos)}.")

    estimado = int((len(SYSTEM_TS) + len(user)) / 3.4)
    max_tokens = a.max or max(1000, CONTEXTO - estimado - 64)
    cuerpo = {"model": MODELOS[a.modelo], "temperature": 0.2, "max_tokens": max_tokens,
              "messages": [{"role": "system", "content": SYSTEM_TS}, {"role": "user", "content": user}]}
    if a.razonar:
        cuerpo["reasoning_effort"] = a.razonar
    cab = (f"<!-- modelo {MODELOS[a.modelo]}, temperatura 0.2, max_tokens {max_tokens}, "
           f"razonamiento {a.razonar or 'no'} -->\n\n")
    (reg / f"{etiqueta}.pedido.md").write_text(cab + "## system\n\n" + SYSTEM_TS + "\n\n## user\n\n" + user + "\n",
                                                encoding="utf-8")
    if a.solo_ver:
        print(f"pedido guardado (sin mandar): estimado {estimado} tokens")
        return

    t0 = time.time()
    req = urllib.request.Request("http://localhost:1234/v1/chat/completions", data=json.dumps(cuerpo).encode(),
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=1800) as r:
        resp = json.load(r)
    seg = time.time() - t0
    ch = resp["choices"][0]
    contenido = ch["message"].get("content") or ""
    razon = ch["message"].get("reasoning_content") or ch["message"].get("reasoning") or ""
    uso = resp.get("usage", {})
    pie = (f"\n\n<!-- {seg:.0f} s · entrada {uso.get('prompt_tokens')} · salida {uso.get('completion_tokens')} · "
           f"finish_reason {ch.get('finish_reason')} -->\n")
    (reg / f"{etiqueta}.respuesta.md").write_text(contenido + pie, encoding="utf-8")
    if razon:
        (reg / f"{etiqueta}.razonamiento.md").write_text(razon, encoding="utf-8")

    print(f"{etiqueta}: {seg:.0f} s, entrada {uso.get('prompt_tokens')}, salida {uso.get('completion_tokens')}, "
          f"finish_reason {ch.get('finish_reason')}, razonamiento {len(razon)} caracteres")
    if ch.get("finish_reason") == "length":
        print("respuesta cortada: no se extrae nada")
        return
    escribir(extraer_bloques(contenido), archivos)


if __name__ == "__main__":
    main()
