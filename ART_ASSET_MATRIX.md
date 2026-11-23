# Matriz de arte del creador simple

Esta matriz describe el arte que existe hoy en el repositorio. No presenta las
variantes procedurales como ilustraciones finales: son capas de presentación
que mantienen la coherencia entre la vista previa, la exploración y el combate.

| Arquetipo | Clase/subclase | Base jugable | Diferencia visible actual | Estado |
| --- | --- | --- | --- | --- |
| Guardia del puente | Guerrero · Guardia | `identity-warrior-pixel.webp` | Escudo/emblema de guardia, silueta de armadura | Arte base disponible; falta una hoja exclusiva del arquetipo |
| Berserker de ceniza | Guerrero · Berserker | `identity-warrior-pixel.webp` | Arma pesada, paleta ceniza y postura agresiva | Arte base + marcador de equipo; falta hoja exclusiva |
| Sombra | Pícaro · Sombra | `identity-rogue-pixel.webp` | Capa oscura, daga y media luna | Arte base disponible; falta hoja exclusiva |
| Explorador | Pícaro · Explorador | `identity-rogue-pixel.webp` | Arco, brújula y acento verde | Arte base disponible; falta hoja exclusiva |
| Arcanista | Mago · Arcanista | `identity-mage-pixel.webp` | Bastón, foco y aura arcana | Arte base disponible; falta hoja exclusiva |
| Tejedor de ceniza | Mago · Tejedor | `identity-mage-ash-pixel.webp` | Proyectil de ceniza, aura cálida y alcance | Hoja de clase disponible; falta hoja racial exclusiva |

## Razas y presentación

Las ocho razas compatibles del modo simple reutilizan los retratos existentes
de `dist/portraits/*-{mujer,hombre,no-binario}.webp`. La escena jugable añade
rasgos de silueta con el perfil centralizado en `dist/hero-visuals.js` y las
capas CSS/Phaser correspondientes: orejas élficas, barba enana, gorro gnomo,
tamaño Pequeño, paleta orca y colmillos semiorcos. El género cambia detalles
de presentación (trenza, cinta o fajín), no los atributos.

Cada tarjeta del modo simple combina el retrato de referencia compatible con
la hoja de clase (`identity-warrior-pixel.webp`, `identity-rogue-pixel.webp`,
`identity-mage-pixel.webp` o `identity-mage-ash-pixel.webp`). Así el jugador ve
la clase y el equipo antes de elegir; el retrato grande de la derecha sigue
siendo la vista viva de su raza y género actuales.

## Marcadores y trabajo de arte pendiente

- No existe todavía una hoja pixel-art definitiva para cada combinación raza ×
  arquetipo × género (el catálogo completo sería mucho mayor que las seis
  bases actuales). El modo simple no finge que esas hojas existan: el perfil
  procedural queda documentado como **marcador de integración**.
- La tarjeta de vista previa y la hoja final usan el mismo sprite de clase y
  los mismos rasgos raciales que la exploración y el combate. Si se entrega
  una hoja definitiva, debe sustituir solo `heroVisuals.assets()`/el selector
  de identidad y conservar las claves de perfil para no romper guardados.
- Las imágenes raster existentes son arte del proyecto y se conservan; no se
  generaron assets finales nuevos en esta fase.

## Salidas y Criptas · PR 5

Las salidas que ya están pintadas en las escenas se marcan como
`scene-painted` en `chapter.js`; no se reemplaza el fondo por un icono genérico.
Las tres salidas que todavía no tienen una puerta/escalera legible quedan
marcadas explícitamente como arte pendiente:

| Solicitud | Uso | Estado |
| --- | --- | --- |
| `spot-door.webp` | Mirador del bosque y salidas que solo tienen poste | Pendiente de aprobación y arte final |
| `spot-stairs.webp` | Escalera taller → criptas y regreso de las criptas | Pendiente de aprobación y arte final |

La herramienta `scripts/crypts-overlay.cjs --write` produce una superposición
de QA sobre `dist/scenes/criptas.webp`; los polígonos verdes son transitables y
los rojos son agua/estructuras bloqueadas. No se genera ni se sustituye arte
runtime.

## Arte modular · PR 6

`CenizasHeroVisuals.compose()` está preparado detrás de la bandera
`CENIZAS_MODULAR_HERO`. Mientras no exista la decisión del propietario sobre
pixel art nativo frente a ilustración suave, y mientras no se entreguen las
capas WebP, la bandera permanece apagada y el juego reutiliza las cuatro hojas
 existentes. No se inventaron capas finales ni se copiaron assets externos.

