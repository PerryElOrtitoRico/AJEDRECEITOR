# docs/llm — orquestación de qwen/Gemma

Método: `~/Escritorio/Hobbies/programacion/Proyectos/qwen-aprendizajes.md`. Plan: nota "Plan de implementación" del vault (Trabajo/Proyectos/Ajedrez).

## Cómo funciona una tarea
- `tareas/Txx-*.md`: la tarea. Cabecera `<!-- archivos: <los que el modelo devuelve> | contexto: <solo lectura> -->`.
- `src/core/*.ts`: esqueleto con `// TODO Txx` y `throw new Error('Txx: no implementado')`.
- `tests/*.test.ts`: tests **visibles** (los escribe Opus; el modelo los ve como contexto).
- `tests-ocultos/*.test.ts`: tests **ocultos** (Opus; nunca se mandan al modelo).
- `referencia/`: solución de Opus. Solo sirve para verificar que los tests están bien (`verificar_tarea.py`). **Nunca se manda ni se lee desde `pedir.py`.**
- Todos los `describe` empiezan con el id de la tarea (`T06 …`); `evaluar.sh Txx` corre `tsc` + `vitest -t Txx`.

## Ciclo
```bash
python3 docs/llm/verificar_tarea.py T01              # una vez, antes de mandar (con dependencias: T01 T09 T12)
docs/llm/modelo.sh gemma python3 docs/llm/pedir.py docs/llm/tareas/T01-nombres.md gemma 1
docs/llm/evaluar.sh T01                              # tsc + visibles + ocultos
docs/llm/modelo.sh qwen python3 docs/llm/pedir.py docs/llm/tareas/T01-nombres.md qwen 2 --error /ruta/error.txt   # corrección
docs/llm/aceptar.sh T01 ; git commit
```
Máximo 2 correcciones fallidas por tarea; después vuelve a Opus. Retrospectiva de cada pedido en `mejoras-qwen.md`.

## Orden y dependencias
T01 → T02 → T04 → T05 → T03 → T06 → T07 → T08 → T09 → T10 (usa T01) → T11 → T12 (usa T09 en los ocultos) → T13 → T14 (usa T09 en los ocultos).
Modelo: Gemma = T01 T02 T04 T05 T09 T11 T13 T14; qwen = T03 T06 T07 T08 T10 T12.

## Planilla
| Tarea | Modelo | Intentos | Resultado | Nota |
|---|---|---|---|---|
| T01 | gemma | 1 | verde | Al primer pedido (115 s, 745 tokens, stop). tsc, 4 visibles y 8 ocultos OK; no tocó otras funciones. |
