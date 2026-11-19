# Registro RSI — Cenizas del Umbral

Este registro distingue las comprobaciones ejecutadas en Node de las verificaciones de navegador que requieren dependencias externas.

## Iteración 1 — 2026-11-19

### Fallos detectados

- `enemyTurn()` podía resolver un golpe fuera de la rama de aviso.
- El archivo trataba el registro de Mara como requisito.
- El Guardián de ceniza podía quedarse con 0 PG sin resolver el encuentro.
- Las técnicas reducían CA sin ciclo de restauración.
- Faltaban defensas cuando el módulo de datos no se cargaba.
- Había una colisión entre el secreto racial y la inscripción del monasterio.

### Fixes aplicados

- FIX-1/FIX-2/FIX-4/FIX-5/FIX-6/FIX-8 en `dist/combat.js`, `dist/investigation.js`, `dist/combat-systems.js` y `dist/chapter.js`.
- Se conservaron migración por campo, copia de respaldo y aviso de guardado inválido.
- Se añadieron efectos diferidos de las técnicas y debilidades/resistencias de los jefes.

### Tests añadidos o ajustados

- `tests/chapel.cjs`, `tests/combat-systems.cjs`, `tests/investigation.cjs`.
- Suite existente: 39/39 pasados.

### Resultado

- Suites Node: 39/39.
- `node --check dist/*.js`: limpio.
- Auditoría visual/E2E: pendiente; el entorno no tiene Playwright instalado.

### Próximo paso

- Convertir cada corrección y tarea explícita en una suite focalizada y ejecutar la auditoría estática.

## Iteración 2 — 2026-11-19

### Fallos detectados

- La cobertura de regresiones no estaba separada por cada FIX/TAREA.
- El botón de práctica podía derivar al laboratorio ATB heredado en lugar del combate lateral de campaña.
- La auditoría estática no tenía un comando reproducible.

### Fixes aplicados

- Se añadieron diez suites focalizadas: enemigo, puzle, Mara, Ash, técnicas, razas, spots, campanas, variantes y migración.
- El botón de práctica envía `practice-combat` al capítulo; el encuentro `echo` se marca como práctica y restaura el checkpoint sin botín, flags ni pérdida de Brasas.
- Se añadió `scripts/rsi-audit.cjs` y se incorporó al comando `npm test`.
- Se documentaron las ocho correcciones y las tareas explícitas en `REPORT.md` y `CHANGELOG.md`.

### Resultado

- Suites Node: 49/49 pasados.
- Auditoría RSI estática: limpia (79 archivos fuente revisados).
- Sintaxis: todos los `dist/*.js` pasan `node --check`.
- Presupuesto estático de assets: 5,27 MiB iniciales según `tests/asset-budget.cjs`.

### Próximo paso

- Instalar dependencias y ejecutar Playwright en 1280×720, 844×390, 667×375 y 390×844; después repetir dos iteraciones limpias de navegador.

