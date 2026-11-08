# Comprobación manual: Fases 2 y 3 (la completa Franco)

Abrir con `npx tauri dev` (o el binario de `npx tauri build`).

- [ ] **Importar**: Importar → pegar las 5 partidas de `tests/fixtures/` → dice "4 nuevas, 1 repetidas". Repetir → "0 nuevas".
- [ ] **Lista**: aparecen con fecha, rivales y resultado para vos; el filtro funciona; el pie muestra la carpeta.
- [ ] **Análisis**: abrir una de chess.com; ←/→ recorren; tocar una jugada salta ahí; los relojes no se ven pero quedan en el PGN.
- [ ] **Rama**: retroceder 3 jugadas y mover otra pieza → aparece entre paréntesis. Comentarla, salir y volver a entrar: sigue ahí.
- [ ] **Promover / borrar**: "Hacer línea principal" sobre la rama la pasa al frente; "Borrar desde acá" la quita.
- [ ] **El archivo**: abrir el `.pgn` en un editor: la rama está como `( … )` y el comentario como `{ … }`.
- [ ] **Jugar**: nueva partida nivel 1, 10+0. El motor responde en menos de 1 s; el reloj corre del lado que toca.
- [ ] **Pista**: un toque marca la pieza; el segundo, la flecha.
- [ ] **Deshacer** con el motor pensando y después de su respuesta: vuelve a tu turno.
- [ ] **Retomar**: salir a mitad de partida → aparece "en curso"; tocarla → sigue con los relojes donde estaban.
- [ ] **Fin**: mate, rendirse o bandera → mensaje con el resultado y botón "Analizar esta partida".
- [ ] **Nivel**: jugar 3 partidas en nivel 1 y anotar si es demasiado fuerte o flojo (la tabla está en `src/adaptadores/motor.ts`, `NIVELES`).
