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

