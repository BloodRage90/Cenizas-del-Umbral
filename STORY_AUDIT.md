# Auditoría narrativa — Cenizas del Umbral

Fecha: 2026-11-18
Fuente auditada: `dist/chapter.js` completo (631 líneas), junto con los módulos de combate, reglas de personaje e investigación.

## Tesis y pregunta recurrente

La historia ya sostiene una tesis clara: **nombrar es resistir; borrar es violencia**. El conflicto no es solo cerrar una anomalía, sino decidir quién tiene derecho a conservar el nombre, el consentimiento y la memoria de otra persona.

La pregunta que aparece, de forma explícita o implícita, en casi todos los actos es: **«¿Quién puede nombrar a otra persona y con qué derecho?»**. Conviene mantenerla como motivo recurrente en diálogos, documentos y la resolución del Coro.

## Continuidad actual por actos

### Acto I — Valdara, la carta y los testigos

- `plaza` presenta a Maela, el depósito y la desaparición administrativa de los vecinos.
- La llegada de la plaza se ejecuta solo cuando `state.place === 'plaza'` y falta `flags.intro`; `plazaArrival()` está protegida por `try/catch`.
- El jugador elige una ruta real: proteger a los testigos (`branch = 'maela'`) o seguir los documentos (`branch = 'depot'`). Ambas rutas convergen en Ordan, pero conservan pruebas distintas.
- Maela guarda testimonios; Nilo y Tessa aportan una escala civil del conflicto. Ordan introduce la campana y el primer Eco.
- La motivación del protagonista se formaliza en `mountainReason`: Valdara, compañeros, verdad o libertad.

### Acto II — Bosque, río y monasterio

- `bosque`, `lindero`, `embarcadero` y `molino` convierten la sospecha en evidencia material: raciones por celda, cargamentos y huellas de la Vigilia.
- Elara pasa de guardia que controla el acceso a compañera que comparte el riesgo; Iria ofrece una perspectiva territorial y puede unirse al grupo.
- El monasterio abre el archivo y la enfermería. Darien, Liora, Tomás y los cautivos hacen visible el costo humano de las sustituciones.
- La investigación del archivo exige relacionar acta, raciones y transcripciones. La elección de hipótesis/apoyo puede bloquear una conclusión incorrecta sin destruir la partida.
- El jugador puede rescatar a los cautivos desconectando la campana; la evacuación conserva a quienes tienen nombre y agencia.

### Acto III — Capilla y camino de montaña

- Sereth y Mara introducen la pérdida íntima: el deseo de conservar a alguien se convierte en justificación para borrar a otros.
- El Guardián de ceniza funciona como consecuencia física del sistema de soportes. Después de vencerlo, Ordan, Elara, Darien e Iria forman un círculo de aliados y la campaña continúa como decisión colectiva.
- `mountainReason` vuelve a aparecer en la transición y el epílogo; es la primera variación persistente del cierre.

### Acto IV — Umbral, Coro y regreso

- El registro original prueba que las firmas fueron añadidas después. El jugador puede insistir en que nadie sea un reemplazo o pedir que Ordan responda por su participación.
- El combate del Coro conserva tres vías legibles: apagar conductores, liberar nombres y fracturar el ancla. Rescatar a Sereth es opcional y cambia el epílogo.
- El cierre libera los nombres, devuelve a los cautivos y vuelve a Valdara. La escena final muestra a Maela leyendo los nombres, a Darien/Liora/Tomás regresando y a Ordan asumiendo responsabilidad.
- La pared de la cámara muestra nombres incompletos y el jugador responde a la pregunta recurrente «¿Qué llevarás tú cuando cruces el Umbral?». La respuesta se guarda en `questionAnswer` y modifica el texto del epílogo.
- Las variantes actuales del epílogo dependen de `mountainReason`, `serethSaved` y la respuesta del Umbral; la perspectiva racial se expresa en secretos, mitos e inscripciones, sin alterar las reglas ocultamente.

## Personajes y función dramática

| Personaje | Deseo/temor observable en el código | Arco o consecuencia actual |
|---|---|---|
| Protagonista | Elegir por qué continuar y qué pruebas conservar | `mountainReason`, decisiones de ruta, final variable |
| Elara | Reparar el daño de una guardia que obedecía sin preguntar; encontrar a Darien | Pasa de control fronterizo a aliada; puede actuar manual o automáticamente |
| Ordan | Reparar la campana y admitir que ayudó a ocultar el mecanismo | Guía técnica, se ofrece como sustituto y luego asume responsabilidad pública |
| Darien | Mantener unidos a los cautivos y dejar registro de lo ocurrido | Es rescatado, evacúa al grupo y vuelve a la plaza |
| Iria | Mantener seguros los senderos y que nadie siga una voz a solas | Testigo del bosque; puede unirse al cruce y al campamento |
| Maela | Proteger a las familias y que las copias no dependan de un solo viajero | Guarda testimonios y recibe al grupo en el epílogo |
| Sereth | Conservar la voz de Mara y sostener el sello | Antagonista trágica; puede ser rescatada o quedar atrapada |
| Mara | Ser recordada como una persona presente, no como una voz prestada | Su silencio revela que el Coro no la devuelve |
| Liora/Tomás | Cuidar y evacuar a quienes no pueden defenderse | Hacen visible el rescate colectivo |
| Tovin | Recuperar suministros y la trazabilidad de las entregas | Vendedor, testigo logístico y recompensa secundaria |
| Nilo/Tessa/Bren | Sobrevivir al borrado en la vida cotidiana | Refuerzan que el conflicto afecta a la comunidad, no solo a héroes |
| Coro | Repetir nombres para mantener la continuidad del Umbral | Cree que borrar una versión del accidente equivale a matar de nuevo; ofrece un reemplazo porque teme quedarse sin testimonio. El jugador puede rechazar esa lógica liberando los nombres. |

## Decisiones con consecuencias verificables

1. Maela o depósito: cambia la prueba obtenida y el tono de Ordan.
2. Tiradas de habilidades: Diplomacia, Engañar, Buscar, Abrir cerraduras, Esconderse, Intimidar, Trepar, Concentración, Descifrar escritura y Averiguar intenciones ofrecen rutas alternativas, sin bloquear la campaña.
3. Rescate de cautivos: `captivesFreed` abre la capilla y cambia quién aparece en el patio.
4. Respuesta a Ordan: `ordanResponse` conserva reproche, confianza o colaboración.
5. Motivo de montaña: cuatro textos de epílogo distintos.
6. Sereth: `serethSaved` cambia la última declaración y el destino de la antagonista.
7. Mecanismos frente a daño directo: ambos caminos son posibles; el balance todavía debe verificarse con el nuevo sistema de PI/bloqueo.

## Picos emocionales ya presentes

- Maela detiene al escriba y conserva el primer aviso.
- Elara reconoce la voz falsa de Darien en las raíces.
- Darien organiza la evacuación con la orden «de uno en uno».
- La figura de Mara pierde su contorno y se revela como memoria superpuesta.
- Ordan admite que también ayudó a ocultar lo ocurrido.
- Maela lee los nombres uno por uno en el regreso.

## Gaps y riesgos antes de ampliar la narrativa

- Las variantes de raza son rutas de observación y diálogo; todavía no abren finales exclusivos. Cualquier final racial debe aprobarse para no convertir la identidad en un modificador oculto.
- Las escenas de `mountainReason`, `questionAnswer` y `serethSaved` son texto y flags persistentes; las consecuencias sistémicas posteriores requieren balance y una prueba de regresión propia.
- Los nombres de enemigos y NPC deben permanecer ligados a sus diseños visuales; no se debe reutilizar el sprite del protagonista para reemplazos.
- La auditoría no autoriza reescribir diálogos existentes: las ampliaciones deben ser aditivas, condicionadas por flags y cubiertas por pruebas.

## Plan de validación narrativa

- Probar una partida nueva hasta el creador, el prólogo, plaza, bosque, monasterio, capilla y Umbral.
- Reanudar guardados antiguos sin `flags.intro`, con `level`/`hp` inválidos y con combate guardado.
- Verificar ambas ramas de plaza, rescate/no rescate de Sereth y las cuatro razones de montaña.
- Capturar una matriz de personajes y comprobar que raza, género, clase y subclase cambian presentación, verbos y estadísticas sin alterar la continuidad.
- Mantener este documento como contrato de continuidad: cualquier cambio narrativo posterior debe actualizarlo y añadir una prueba.

## Adenda PR 5 — mundo reactivo e inventario

- `racialSecret` ahora resuelve `raceVerbs[raza][zona]` para las 14 zonas. La
  entrada base del creador permanece intacta; las variantes son texto
  adicional y no otorgan bonificadores ocultos.
- Maela, Ordan, Sereth y el Umbral añaden una línea opcional según clase. La
  línea solo aparece al interactuar con el secreto y conserva una alternativa
  neutra; no modifica `mountainReason`, `serethSaved` ni los finales.
- Las Criptas tienen cuatro corredores transitables y dos polígonos bloqueados
  para agua/estructuras. `scripts/crypts-overlay.cjs` permite revisar la
  correspondencia con el fondo sin alterar el arte.
- La mochila muestra ranuras, descripción contextual, comparación de la capa y
  acceso al mapa. Es una capa de interfaz sobre los mismos `state.items` y no
  cambia las reglas de guardado.
