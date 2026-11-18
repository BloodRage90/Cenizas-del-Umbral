# Decisiones de diseño pendientes

Estas decisiones quedan visibles para aprobación antes de una futura iteración de arte o rendimiento:

1. **Formato de escenas y sprites:** WebP queda como formato de ejecución y PNG se conserva como fuente para poder regenerar el prólogo y las hojas de animación. La compresión AVIF y el audio alternativo se posponen hasta medir compatibilidad en los dispositivos objetivo.
2. **Sprites de clase/subclase:** se reutilizan las hojas pixel existentes y se aplican capas de raza, tamaño, género y subclase. Crear hojas nuevas para cada combinación sería un trabajo de arte separado y no se inventa aquí.
3. **Combate:** la interfaz publicada es lateral, por turnos, sin tablero ni movimiento visible. El motor conserva coordenadas internas para no romper guardados y encuentros antiguos; `noBoard` desactiva alcance/movimiento en la presentación actual.
4. **Carga de escenas:** se precarga la escena actual y el primer destino conocido. Una zona nueva se solicita al entrar y se convierte a WebP mediante la misma ruta de assets.
5. **Introducción:** el video MP4 sigue siendo la secuencia de entrada y el plano pixel sirve de poster/fallback; no se reemplaza el guion ni la narración sin aprobación de la premisa.
6. **Escala de producción:** tilemaps de Tiled, luces dinámicas y música adaptativa por capas se mantienen como siguiente fase; aplicarlos ahora cambiaría el renderer de las 14 zonas y requiere validar rendimiento en teléfonos objetivo.
