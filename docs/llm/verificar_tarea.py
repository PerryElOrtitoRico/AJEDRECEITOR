#!/usr/bin/env python3
"""Verifica una tarea ANTES de mandarla: copia el repo a un directorio temporal, pone encima la solución de
referencia de Opus (docs/llm/referencia/<ruta>) y corre tsc + visibles + ocultos de esa tarea.
Uso: python3 docs/llm/verificar_tarea.py Txx [Txx ...]    (si una tarea depende de otra, pasar también la otra)
Cada tarea se identifica por su archivo docs/llm/tareas/Txx-*.md, cuyo comentario inicial lista los archivos
(<!-- archivos: src/core/a.ts, ... | contexto: ... -->).
"""
import pathlib, re, shutil, subprocess, sys, tempfile

REPO = pathlib.Path(__file__).resolve().parents[2]


def archivos_de(tid):
    md = next((REPO / "docs/llm/tareas").glob(f"{tid}-*.md"))
    m = re.match(r"<!--\s*archivos:\s*(.*?)\s*\|", md.read_text(encoding="utf-8"))
    return [a.strip() for a in m.group(1).split(",")]


def main():
    ids = sys.argv[1:]
    if not ids:
        sys.exit(__doc__)
    with tempfile.TemporaryDirectory() as tmp:
        t = pathlib.Path(tmp) / "repo"
        shutil.copytree(REPO, t, ignore=shutil.ignore_patterns("node_modules", ".git", "registros", "referencia"))
        (t / "node_modules").symlink_to(REPO / "node_modules")
        for tid in ids:
            for ruta in archivos_de(tid):
                ref = REPO / "docs/llm/referencia" / ruta
                if not ref.exists():
                    sys.exit(f"falta la referencia {ref}")
                shutil.copy(ref, t / ruta)
        r = subprocess.run(["bash", "-c", f"docs/llm/evaluar.sh '{ids[-1]}'"], cwd=t, text=True, capture_output=True)
        print(r.stdout, r.stderr)
        sys.exit(r.returncode)


main()
