# Changelog

## 2026-11-18 · Variantes jugables visibles

- Se corrigió el flujo que siempre mostraba el `traveler` humano: mapa y capítulo cargan las cuatro hojas de sprites de clase, incluida la variante Tejedor de ceniza.
- La selección guardada se resuelve con un perfil visual único en `dist/hero-visuals.js`; raza, género y subclase cambian escala, rasgos de silueta, accesorio y emblema.
- El renderer lateral usa la misma clase canónica que el creador, por lo que una maga elfa ya no aparece como un guerrero humano al entrar en combate.
- Se añadió una prueba automática de las 144 combinaciones de raza, subclase y género y se conservaron los 36 tests existentes en verde.

## 2026-11-18 · Fase 4

- Se añadió una tira de orden de turnos accesible en la cabecera de la arena lateral, con estado actual y unidades derrotadas.
- El orden se desplaza horizontalmente en pantallas estrechas sin recuperar el tablero ni sus controles.
- Las comprobaciones opcionales cubren diez habilidades en doce rutas (cerraduras, sigilo, arcano, trepar, información, intención, escritura, concentración, intimidación y mecanismos) sin alterar las rutas principales.

## 2026-11-18 · Fase 3

- Escenas y mapas convertidos a WebP sin retirar los originales que todavía usa el compositor del prólogo.
- `chapter.js` precarga únicamente la zona actual y el siguiente destino; las demás escenas se solicitan al viajar.
- Se centralizó la versión de caché en `dist/assets.js` y se aplicó a música y fuentes de la banda sonora.
- Los sprites de exploración, NPC y encuentros tienen variantes WebP para que la carga estimada del capítulo quede por debajo de 15 MiB.
- Se añadió `dist/favicon.ico` y el servidor de pruebas reconoce WebP, MP4, MP3 e ICO.
- Se retiraron ocho assets huérfanos verificados: siete retratos raciales genéricos y `scenes/plaza.png`.
- El panel lateral de combate en horizontal mantiene todas las acciones visibles con objetivos táctiles de 48 px; la arena sigue siendo lateral y sin tablero.
- Se capturaron smoke tests de Playwright en 1280×720, 844×390, 667×375 y 390×844 sin errores de consola ni desbordamiento horizontal.

### Pendiente

- La conversión de audio a formatos comprimidos adicionales y una barra de progreso por escena requieren una decisión sobre el presupuesto de calidad/latencia.
- Las variantes visuales de clase/subclase siguen usando las capas y paletas existentes; el arte original de cada variante queda marcado en la auditoría de identidad.
- La migración completa a tilemaps de Tiled, iluminación dinámica de Phaser y un sistema de partículas/parallax por zona queda fuera de esta iteración; las 14 rutas actuales se conservan sin cambiar el lore.
- La música adaptativa por capas y el ajuste estadístico basado en telemetría necesitan una sesión de balance aprobada; la ruta de ataques y la ruta de mecanismos ya son jugables y están cubiertas por regresión.
- La especificación E2E de Playwright quedó incluida en `tests/e2e/campaign.spec.cjs`; su ejecución requiere instalar las dependencias de `package.json` y el navegador de Playwright en el equipo que publique.

## 2026-11-18 · Fase 2

- Razas, clases, subclases, géneros y modificadores se centralizaron en `dist/character-data.js`.
- Se añadieron efectos mecánicos de Guardia, Berserker, Sombra, Explorador, Arcanista y Tejedor.
- Exploración y combate seleccionan el sprite base según clase y Tejedor; raza, tamaño y género aplican escala/paleta de presentación.
- La matriz automática cubre 144 combinaciones jugables.
- Los modificadores de habilidad se leen desde el mismo módulo que usa la hoja y el combate; se retiraron de las descripciones los rasgos raciales sin implementación efectiva.

## 2026-11-18 · Fase 1

- Se estabilizó la migración de guardados, la cinematica de plaza y el combate lateral por turnos.
- Se actualizaron las pruebas de `battle-scene.js`, incluida la garantía de resolución única y el bloqueo durante una animación.
- Se exigió nombre de personaje y se corrigieron etiquetas accesibles del creador y del mapa.
