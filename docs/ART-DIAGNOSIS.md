# Diagnóstico de arte y animación

Estado: `PLACEHOLDER_PENDING_APPROVAL` · 27 de noviembre de 2026

Este diagnóstico toma las seis tiras de combate de `dist/combat-heroes/` como
canon de solo lectura. No se reescriben ni se recolorean esos archivos.

## Flujo actual

| Módulo | Comportamiento actual | Qué debe desaparecer en la integración final |
| --- | --- | --- |
| `dist/hero-visuals.js` | `paintWalkCanvas()` copia la hoja compartida `hero-vigilia.webp` a un atlas 5×4 y añade `drawWalkIdentity()`/`drawWalkEquipment()` con polígonos, líneas y capas de color. | Toda la generación procedural de identidad y sus capas vectoriales. El módulo debe leer el manifiesto de atlas aprobados; solo puede conservar utilidades de escala/pivote sin dibujar identidad. |
| `dist/chapter.js` | `ensureHeroWalkVariant()` genera en tiempo de ejecución el atlas direccional desde `hero-vigilia.webp`; `walkDirectional` marca ese recurso. | La rama `paintWalkCanvas(...)` y el fallback de `ensureHeroVariant()` para protagonistas fijos. El mapa debe cargar el WebP 4×6 aprobado de cada protagonista. |
| `dist/game.js` | La escena legado repite el mismo camino procedural 5×4 para el puente inicial. | Sustituirlo por el atlas aprobado conservando la clave de guardado y el punto de apoyo. |
| `dist/locomotion.js` | Selecciona filas por dirección y avanza un ciclo seguro; el ritmo/pivote son reutilizables. | Mantener la selección de dirección y el reloj, pero tomar `columns`, `rows`, `pivot`, `fps` y el ciclo desde `hero-atlas.json`. |
| `dist/battle-visuals.js` | Usa las tiras canónicas 4×1. `critical` apunta temporalmente a la celda `hurt` y el halo vive en CSS. | Conectar celdas físicas propias para `hurt`, `critical` y `down`; el halo queda como efecto complementario. |
| `dist/combat-polish.css` | `low-health` añade respiración, desplazamiento, sombra y contorno. | Conservar como efecto de estado, nunca como sustituto de una pose física. |

## Evidencia de la incoherencia

- `hero-vigilia.webp` es una base compartida de cuatro orientaciones. La capa
  procedural cambia color, capa y arma, pero no conserva cara, peinado ni silueta
  del personaje de combate.
- Cael, Eiren, Soren, Kaira, Vesper y Nimra sí tienen hojas laterales distintas
  en combate; por eso esas hojas son la fuente de verdad para paleta, pelo,
  ropa, arma, escala y postura.
- El atlas actual declara cinco pasos, pero el ciclo es `0,1,2,3,2`: el quinto
  paso es una repetición segura y no una celda de arte nueva. Esto se mantiene
  como marcador técnico hasta aprobar hojas 4×6 definitivas.

## Contrato pendiente de aprobación

Cada protagonista necesita un atlas propio WebP RGBA de 320×320 por celda:

- caminar: 4 direcciones × 6 cuadros;
- reposo: 4 direcciones × 4 cuadros;
- combate: `idle`, `windup`, `strike`, `hurt` (3 cuadros), `critical`
  (4 cuadros), `down` (2 cuadros);
- pivote común en `(160,292)`, contorno oscuro de 2 px y máximo 32 colores;
- mismo pelo, rostro, ropa, paleta, arma y silueta que su hoja de combate.

Hasta que la hoja de aprobación sea aceptada, el manifiesto y el juego deben
seguir mostrando explícitamente `PLACEHOLDER_ART_PENDING_APPROVAL` y no se debe
declarar resuelta la identidad visual.
