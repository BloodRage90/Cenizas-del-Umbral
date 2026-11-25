# Changelog

## 2026-11-25 · Objetivos claros y siluetas de arquetipo

- Todos los combates muestran un selector táctil de objetivo; el enemigo elegido y sus PG actuales permanecen visibles, sin depender de acertar al sprite en la arena.
- Las seis subclases declaran equipo físico propio en el renderer compartido: escudo-capa, hacha de furia, capucha con dagas, arco de rastreo, bastón rúnico y manto de ceniza. La misma variante se usa en creador, exploración y combate; no se cambian los sprites de NPC.
- Maela, Ordan, Iria, Darien, Sereth, Tovin y Elara reconocen una vez la raza y clase elegidas; la marca se migra dentro de `flags` sin invalidar partidas antiguas.
- El creador ya no superpone el pie antiguo del retrato dinámico, mantiene dos columnas legibles para sus seis tarjetas, no corta las etiquetas del preview y evita repetir el verbo de cada técnica.
- Nuevas regresiones: `combat-target-picker.cjs`, `npc-identity-lines.cjs` y cobertura ampliada de `hero-visuals.cjs`, `simple-creator.cjs` y `static-report.cjs`.

### Publicación

- GitHub contiene el código y los commits de esta rama. El Site publicado es independiente: después de subir cambios hay que volver a publicar desde Sites; no se crea otro Site automáticamente.

## 2026-11-25 · Ritmo inicial y contrato de combate

- La llegada a la plaza se compactó en tres escenas, con «Saltar», avance por Enter/Espacio/toque y autoacercamiento con un límite de 5 s; la cinemática solo se ejecuta en la plaza y queda protegida por `try/catch`.
- Interactuar prioriza el NPC de misión cuando está cerca, los toques en NPCs activan acercamiento suave y las charlas de Nilo, Tessa y Bren terminan tras una segunda vuelta con texto distinto.
- El movimiento de exploración y el autoacercamiento son más ágiles; el marcador de misión y el destino visible se conservan.
- El creador simple mantiene su acción principal visible en las cuatro resoluciones, sin texto cortado ni desbordamiento, y el botón «Empezar la aventura» queda fijado en horizontal.
- Los seis arquetipos comparten ahora un contrato de nombre entre creador y combate: Provocar, Furia de ceniza, Finta de sombra, Marcar objetivo, Llama Arcana y Proyectil de ceniza. Las acciones deshabilitadas muestran el motivo (turno, PI, alcance o espacios).
- Se añadió Furia de ceniza al motor; la acción deja su rastro en el registro y el próximo golpe recibe el bono anunciado. La vida de creador, exploración y combate mantiene una única fórmula.
- «Resolver rápido» y «Cierre automático» evitan confirmaciones innecesarias; el tutorial inicial explica «¡BLOQUEA!», «Aislar foco» y PI, y el objetivo/PG restante permanece en la franja de combate.
- Se eliminaron nombres técnicos de variantes del registro y se añadieron pruebas de contrato de arquetipos, prioridad de interacción y E2E responsive/primer clic.
- La charla inicial de Elara ya no presenta respuestas únicas disfrazadas: puedes reservarte la carta o compartirla, y la confianza y el diálogo de la siguiente línea quedan guardados.

### Evidencia visual

- Capturas antes/después del creador: `artifacts/ux/before/` y `artifacts/ux/after/` en 1280×720, 844×390, 667×375 y 390×844.

## 2026-11-24 · Resonancias II — pulso y ceniza

- Se reemplazaron las 25 pistas de la edición anterior por una nueva mezcla original: cuerdas sostenidas, arpegios, ganchos de sintetizador, bajo y percusión con variaciones por sección.
- Los siete temas de combate (`battle`, `forest-battle`, `vigilia-battle`, `custodian`, `ash`, `finale` y `training-battle`) ahora tienen riffs, fills de tom y crashes de cierre para que cada encuentro tenga una identidad propia.
- El prólogo, la exploración, los espacios de vínculo y el epílogo recibieron la misma revisión de capas, sin muestras ni melodías de terceros.
- Se actualizó el manifiesto de procedencia a `Resonancias II · pulso y ceniza` y el token global de caché a `2026-11-music-refresh-1`, evitando que el navegador conserve la edición anterior.

### Validación musical

- `node tests/music.cjs`: 25 pistas estéreo decodificadas, con duración, headroom y crossfade válidos.
- `pnpm.cmd test`: todas las suites en verde.
- `pnpm.cmd lint`: limpio.

## 2026-11-24 · PR3 — locomoción diagonal y recuperación de pestaña

- Se centralizó la normalización de vectores para que teclado, joystick y movimiento guionado mantengan la misma velocidad cardinal; las diagonales ya no recorren `√2` veces más distancia.
- Se añadió `VisibilityGuard`: al ocultar o desenfocar la pestaña se detienen controles, animaciones y seguimiento; se descartan `game.loop.delta`/`elapsed` acumulados y se ignora exactamente el primer frame al volver.
- Se cubrieron cadencia diagonal/cardinal a 30/60/144 FPS, pausa de cinco segundos, recuperación sin desplazamiento fantasma, sin ráfaga de poses y con un único cambio de pose útil.
- Se reemplazó el fallback plano de d6/d8 por siluetas facetadas con volumen, pips y sombreado; el d20 conserva sus caras numeradas y la animación de caída.
- El carril de cinco dados de ataque queda en una sola fila acotada en horizontal; ya no intercepta `Tirar dados` en 667×375.
- Se aumentó el tamaño mínimo visible, se añadió brillo de material y easing de rebote; se evitó `backface-visibility` porque ocultaba las caras durante el giro.
- La matriz E2E completa pasó en las cuatro resoluciones (`20/20`) y el flujo de campaña aislado pasó (`8/8`) tras el ajuste.

### Antes → después

| Hallazgo               | Antes                                                                            | Después                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Movimiento diagonal    | Teclado y joystick podían recorrer más distancia que un movimiento cardinal.     | Ambos pasan por el mismo normalizador y conservan la velocidad cardinal.                        |
| Delta acumulado        | Una pestaña oculta podía entregar un delta grande al volver.                     | `VisibilityGuard` pone el delta/elapsed a cero y descarta el primer frame de recuperación.      |
| Animación al recuperar | El primer frame podía cambiar varias poses o pasos seguidos.                     | La transición no mueve ni cambia poses; el primer frame útil permite como máximo un cambio.     |
| Dados de combate       | d6/d8 se dibujaban como una figura plana y cinco dados podían envolver el botón. | Cada poliedro tiene una silueta 3D legible; el carril conserva una fila y el botón queda libre. |
| Giro de las caras      | El acabado 3D podía dejar las caras ocultas durante la rotación.                 | Las caras permanecen visibles, con brillo y rebote, respetando `prefers-reduced-motion`.        |

### Riesgos conocidos

- El runner HTTP de Playwright no puede abrir `127.0.0.1` en este entorno (`ERR_NETWORK_ACCESS_DENIED`/`ERR_CONNECTION_TIMED_OUT`); la cobertura determinista de locomoción sí corre en Node y la suite completa queda verde.
- La navegación desde una pestaña oculta depende de los eventos nativos `blur`, `focus` y `visibilitychange`; si un WebView no los emite, el límite de `Math.min(delta, 40)` sigue evitando saltos grandes, pero no puede detectar la suspensión anticipadamente.

### Validación PR3

- Regresión de `main` (`pnpm.cmd test`) ejecutada antes de cerrar la rama: todas las suites en verde; no se observan regresiones frente a la línea base.
- `pnpm.cmd test`: todas las suites en verde.
- `pnpm.cmd lint`: limpio.
- `node --check dist/locomotion.js dist/game.js dist/chapter.js`: limpio.
- `tests/locomotion-cadence.cjs`: diagonales dentro de 2% y recuperación de pestaña verificada.

## 2026-11-22 · Auditoría: estabilización y arreglos de identidad interinos

- **Elara en combate ya no es un clon del protagonista.** `combat.js` declara `look` para su unidad y `battle-visuals.js` la dibuja como `ally` con su propia hoja de poses. La hoja se restauró del historial (`dist/combat-elara.png`, eliminada en `7aefb3e` por no tener referencias) como `dist/elara-combat.webp`; los combates ya guardados sin `look` también se resuelven por `id`. Pruebas: `tests/battle-look.cjs`.
- **Locomoción de hojas de pose.** Las hojas de héroe 2×2 son poses de combate orientadas a la derecha; `locomotion.js` ya no cicla poses de tajo al caminar, voltea el sprite al ir a la izquierda y descansa en el fotograma neutro. Las hojas 4×4 (Elara) no cambian. Pruebas: `tests/locomotion-pose-sheet.cjs`.
- La etiqueta del turno automático de Elara muestra `ALIADA (IA)` en lugar de `TU TURNO`.
- Se retiró de `chapter.html` un texto de desarrollo visible al jugador.
- `tests/e2e/campaign.spec.cjs` usa el creador en modo simple (`#simple-*`, `data-simple-archetype`) y se añadió un test del modo avanzado.
- Pendiente (requiere arte): hojas de caminata de cuatro direcciones, capas por raza y subclase, y unificar las tres rutas de render del héroe.

## 2026-11-19 · Poda final de estilos y sprites no usados

- Se eliminaron `hero-sprites.png`, `hero-walk-v2.webp`, `combat-elara.png` y `enemy-sprite-sheet.png`: no tenían una ruta de ejecución activa.
- Se retiraron las reglas CSS heredadas de tablero, duelo y movimiento (`#board`, `.cell`, `.unit`, `#duel` y controles asociados) de las superficies de juego actuales; el laboratorio `training.html` conserva su tablero aislado.
- Las previsualizaciones y marcadores del mapa usan la identidad vigente o `traveler-portrait.png`; se conserva `hero-vigilia.webp` porque todavía alimenta la previsualización de la capa equipada.
- `tests/legacy-assets.cjs` ahora bloquea el regreso de esos archivos y selectores legacy.

## 2026-11-19 · Limpieza de recursos legacy

- Se retiró `battle-renders.html`, un prototipo visual que ya no participa en ninguna ruta del juego.
- Se eliminaron duplicados PNG/WebP y retratos de raza sin género que no tienen referencias en el runtime; las versiones comprimidas y los sprites de enemigos conectados se conservan.
- Se añadió `tests/legacy-assets.cjs` para impedir que vuelvan a entrar prototipos o recursos huérfanos.
- Se conserva `training.html` porque sigue siendo la ruta de práctica independiente enlazada desde la música y el fallback del creador.

## 2026-11-19 · RSI — correcciones de motor, narrativa y pruebas de regresión

- FIX-1: `enemyTurn()` ya no duplica golpes ni daña durante la apertura; se cubren Ash, Eco y Custodio con turnos anunciados.
- FIX-2/FIX-3: el archivo se resuelve con sus tres fuentes obligatorias, el registro de Mara es opcional y la relación queda como «hija de Sereth».
- FIX-4/FIX-5: el Guardián de ceniza exige soportes para recomponerse, pero gana al cerrar ambos; las reducciones temporales de CA se restauran al ciclo siguiente.
- FIX-6/FIX-7/FIX-8: datos defensivos sin `character-data.js`, ocho verbos raciales únicos y secreto racial del monasterio separado de la inscripción.
- TAREA 2/3/5/11/12: técnicas con efectos diferidos verificables, verbos de clase explorables, promesa racial en el creador, combate de prueba sin consecuencias, campanas y pared de nombres, y veinte variantes enemigas conectadas.
- Se añadieron diez suites RSI focalizadas y `scripts/rsi-audit.cjs`; la suite completa queda en 49/49 y la auditoría estática no detecta `TODO`, `FIXME`, `catch` vacío ni duplicados conocidos.

### Validación RSI

- `node --test tests/*.cjs`: 49/49 pasados.
- `node --check dist/*.js`: sin errores.
- `node scripts/rsi-audit.cjs`: limpio.
- Playwright/E2E no se ejecutó en este entorno porque no están disponibles `npm` ni `node_modules`; queda documentado en `REPORT.md`.

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
