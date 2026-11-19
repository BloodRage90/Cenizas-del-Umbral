# Informe RSI — Cenizas del Umbral

Fecha: 19 de noviembre de 2026

## Estado ejecutivo

El motor y las rutas narrativas cubiertas por la auditoría están corregidos y tienen regresiones automatizadas. La suite local queda en 49/49, la sintaxis de `dist/` es válida y la auditoría estática no encuentra duplicados conocidos, `TODO`/`FIXME` ni `catch` vacíos.

La aceptación final de navegador todavía no puede declararse: este entorno no contiene `npm`, `node_modules` ni Playwright. Tampoco se simularon campañas completas ni FPS; se dejan como tareas verificables, no como resultados inventados.

## FIX-1 a FIX-8

| Fix | Estado | Evidencia |
|---|---|---|
| FIX-1 doble ataque en `enemyTurn` | Cerrado | `tests/enemy-turn.cjs`, `tests/active-combat.cjs`, `tests/umbral.cjs` |
| FIX-2 `ready()` del archivo | Cerrado | `tests/ready-puzzle.cjs`, `tests/investigation.cjs` |
| FIX-3 Mara | Cerrado | `tests/mara-consistency.cjs` |
| FIX-4 victoria/recomposición de Ash | Cerrado | `tests/ash-victory.cjs`, `tests/chapel.cjs` |
| FIX-5 restauración temporal de CA | Cerrado | `tests/tech-effects.cjs`, `tests/combat-systems.cjs` |
| FIX-6 fallback de datos | Cerrado | `tests/race-verbs.cjs`, `tests/migration-integrity.cjs` en contexto aislado |
| FIX-7 ocho verbos raciales | Cerrado | `tests/race-verbs.cjs`, `tests/hero-visuals.cjs` |
| FIX-8 spots del monasterio | Cerrado | `tests/spots-overlap.cjs`, `tests/static-report.cjs` |

## Tareas explicitadas en la instrucción

| Tarea | Estado | Qué quedó verificable |
|---|---|---|
| TAREA 2 · técnicas | Cerrada | Filo reserva +2 para Guerrero, Llama reserva fuego, Sombra garantiza furtivo; logs y tests |
| TAREA 3 · verbos de clase | Cerrada | Embate, Registro y Discernir con spots, restricciones de clase y recompensas |
| TAREA 5 · creador | Cerrada en código | promesa racial, vista/estadísticas vivas y combate de prueba sin consecuencias |
| TAREA 11 · campanas/Coro | Cerrada en código | plaza, bosque, Umbral, pared de nombres, último nombre y líneas de Elara |
| TAREA 12 · identidad enemiga | Cerrada | cinco jefes con debilidad/resistencia/sprite y 20 variantes seleccionables |

El texto proporcionado enumera las tareas 2, 3, 5, 11 y 12 con criterios concretos; no invento criterios para las otras siete. Las capacidades anteriores del repositorio (combate lateral, carga WebP, creador simple/avanzado, 14 zonas y música) siguen cubiertas por `tests/static-report.cjs` y el changelog previo.

## Métricas RSI

- Iteraciones ejecutadas: 2.
- Suites Node: 49/49 pasadas.
- Archivos revisados por auditoría estática: 79.
- Variantes enemigas: 20.
- Matriz visual existente: 144 combinaciones.
- Carga inicial medida por la prueba de assets: 5,27 MiB (<15 MiB).
- Campañas A/B/C y FPS con 20 partículas: no ejecutados sin navegador/dependencias.

## Decisiones que requieren aprobación humana

1. Instalar Playwright y sus navegadores en el entorno de CI o permitir una ejecución E2E externa.
2. Confirmar si el laboratorio `training.html` debe conservarse como herramienta ATB independiente; el botón de práctica de la hoja ya usa el combate lateral `echo` cuando se abre dentro de la campaña.
3. Sustituir, si se desea, los 20 sprites existentes por arte final nuevo. No se inventó ni se afirmó arte final adicional.
4. Confirmar la métrica de rendimiento objetivo en un dispositivo móvil real (la prueba estática no mide FPS).

