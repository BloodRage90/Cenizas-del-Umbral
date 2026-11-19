# Changelog

## 2026-11-19 · Fase 5 — identidad fijada y silueta jugable limpia

- Tras guardar un personaje válido, la partida fija raza, clase, subclase, género/presentación y nombre. La hoja que se abre desde la exploración usa `mode=view`, desactiva los controles y explica que es solo de consulta; «Juego nuevo» sigue creando una identidad nueva explícitamente.
- Los guardados antiguos incompletos no se bloquean: se abren en el creador para completar/migrar la identidad, sin sobrescribirlos en silencio.
- Exploración y vista de combate dejan de pintar los cuadrados, cruces y triángulos de depuración sobre el héroe. Se conserva el sprite de clase y las variantes generadas de raza, género y subclase (orejas, barba, escala, paleta y arma física).
- Las marcas de subclase en el sprite generado se redujeron a equipo legible (escudo, hacha, daga, brújula, bastón y foco), manteniendo la diferenciación sin overlays flotantes.

### Validación

- `node --test tests/*.cjs`: 39/39 pasados.
- `node --check dist/app.js dist/game.js dist/chapter.js dist/hero-visuals.js`: sin errores.
- `tests/character-lock.cjs` cubre bloqueo de identidad, modo consulta y reparación de guardados antiguos incompletos.

## 2026-11-19 · Fase 4 — creador simple y modo avanzado

- El creador abre ahora en modo simple con seis arquetipos jugables, tarjetas con retrato y sprite de combate, nombre obligatorio, tres sugerencias opcionales, género/presentación, raza compatible y una vista previa compartida con exploración y combate.
- `Personalizar (avanzado)` conserva las cuatro pestañas D&D 3.5. El cambio entre modos no pierde nombre ni elecciones; los guardados antiguos se abren en avanzado y los nuevos persisten `creatorMode`.
- Las builds recomendadas asignan automáticamente atributos, habilidades, dotes y equipo de nivel 1. El modo avanzado avisa de INT insuficiente para conjuros, atributo clave bajo, puntos sin gastar y ranuras de dote vacías, con corrección automática o continuación explícita.
- El modo simple limita la raza a las opciones compatibles de cada arquetipo y tiene una composición compacta específica para móvil horizontal. La matriz de arte y los marcadores pendientes están en `ART_ASSET_MATRIX.md`.
- El texto del creador mantiene el alcance actual: 4 actos y 14 zonas.

### Validación

- `node --test tests/*.cjs`: 38/38 pasados.
- `node --check dist/app.js`: sin errores.
- Playwright está declarado en `package.json`, pero no está instalado en este entorno; las pruebas E2E quedaron actualizadas y pendientes de ejecución con `npm install` y los navegadores de Playwright.

## 2026-11-19 · Fase 3 — timing, telegráficos y sonido de combate

- La animación de ataque tiene una ventana opcional de timing (corta, estándar o amplia), resolución única y bloqueo mientras la escena está ocupada.
- Los ataques enemigos muestran un telegráfico sobre el actor; se mantienen los números flotantes, la pausa de impacto y el temblor de cámara.
- Se añadió `combat-sfx.js` con señales procedurales para golpe, crítico, fallo, bloqueo, timing y telegráfico, además de un volumen de efectos independiente.
- La preferencia de cierre automático de tiradas parte activada y puede cambiarse desde el panel de combate.

### Validación

- `node --test tests/*.cjs`: 38/38 pasados.
- `node --check` sobre los módulos de combate modificados: sin errores.

## 2026-11-19 · Fase 1 — combate accesible y recursos ligeros

- Elara declara sus tres disciplinas de apoyo, así que Guerrero, Pícaro y Mago conservan técnicas combinadas alcanzables; se añadió `Provocar` (1 PI, −2 CA) como verbo propio del Guerrero.
- La arena anuncia `TU TURNO`, `ENEMIGO` o fin de encuentro; las previsualizaciones del mapa usan la etiqueta legible `ENEMIGO VISIBLE` en lugar del marcador geométrico de depuración.
- El carril de acciones en horizontal móvil tiene cabecera compacta, controles táctiles de 46 px, scroll real y una indicación visible para descubrir todas las acciones sin tapar la arena.
- Los retratos raciales y las escenas de producción se sirven como WebP; se retiraron los PNG duplicados y `scenes/plaza.png`. El tamaño de `dist/` baja a aproximadamente 112 MiB.
- El texto del creador describe la campaña real (4 actos y 14 zonas), y las pruebas cubren las técnicas disponibles con aliados reales, el nuevo verbo y la migración de assets.

### Validación

- `node --test tests/*.cjs`: 37/37 pasados.
- `node --check` sobre los módulos modificados: sin errores.

## 2026-11-19 · Fase 2 — grupo y técnicas con progreso

- El combate lateral admite hasta dos aliados además del protagonista. Elara, Ordan, Iria y Darien tienen perfiles de clase propios; el menú de grupo limita la selección y conserva sus PG.
- Los aliados usan el sprite de su clase en la arena, no el sprite genérico del enemigo. La tira de técnicas muestra coste, requisitos implícitos y descripción legible.
- `Provocar` está disponible desde el inicio; Filo Umbrío, Llama Arcana y Sombra Doble se desbloquean por vínculos narrativos antes de aparecer en el menú.
- Se añadió el selector de ritmo Turnos/Activo a las preferencias de combate y se guardó la elección sin alterar el modo D&D por defecto.

### Validación

- La suite de Node sigue en 37/37; cubre selección de dos aliados, técnicas bloqueadas por aprendizaje y técnicas habilitadas por las clases reales del grupo.

## 2026-11-18 · Fase 5 — combate activo y continuidad narrativa

- Se añadió defensa activa: cada descarga enemiga abre una ventana temporal bloqueable, con resolución única, reducción de daño y PI persistente (máximo 5).
- Se añadieron Filo Umbrío, Llama Arcana y Sombra Doble; requieren clases presentes en el grupo, consumen PI y dejan registro en el guardado.
- Se añadieron verbos de clase/raza en la creación y secretos raciales con ocho lecturas distintas, además del registro de defunción de Mara.
- Se incorporaron veinte variantes de enemigos con sprites existentes conectados a estadísticas y comportamiento visual propios.
- Se amplió el prólogo de la campaña: pregunta recurrente, motivación del Coro, motivo de la campana, entrada al Umbral y epílogos según la respuesta del jugador.
- La arena del Umbral muestra los nombres que el Coro intenta borrar; el combate sigue siendo lateral, por turnos y sin tablero.
- Se añadió `STORY_AUDIT.md`, y `REFERENCES.md`/`CREDITS.md` documentan las referencias externas sin vendorizar código.

### Validación de esta fase

- `node --test tests/*.cjs`: 37 archivos, 37 pasados.
- `node --check` sobre los módulos JavaScript modificados: sin errores.
- `npm test` y `npm run lint` no se pudieron ejecutar en este entorno porque no hay `npm`/`node_modules`; el equivalente directo con Node sí pasó.

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
## 2026-11-18 · Variantes de sprites jugables

- Generación determinista de un sprite por combinación de clase, raza, género y subclase (144 variantes), reutilizando las hojas pixel existentes.
- Las variantes se generan como texturas Phaser en tiempo de ejecución para exploración y como accesorios/siluetas visibles en la identidad y combate.
- Razas con silueta reconocible (orejas élficas, barba enana, gorro gnomo, colmillos orcos, escala Pequeña) y equipo de subclase distinguible.
- La prueba visual ahora exige 144 claves de sprite únicas.
