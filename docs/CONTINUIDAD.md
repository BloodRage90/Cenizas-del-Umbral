# Continuar el desarrollo con Codex

## Estado de partida

La historia principal implementada recorre Valdara, el bosque, el monasterio y el Umbral. Incluye capítulo final y epílogo. La versión 36 mejoró la cinemática de la campana del paso de montaña: carro, rueda desprendida, rebotes, cámara, polvo y sonido opcional. Puede repetirse desde el diario.

## Decisiones aceptadas

- Combate por turnos, adaptación de D&D 3.5; no afirmar fidelidad completa al reglamento.
- Joystick en exploración; flechas para mover durante combate.
- Elara admite control manual o automático; elegir al comenzar el combate.
- Personajes establecidos: sus diálogos no deben abrir edición de sus hojas.
- Animaciones fluidas y NPC con identidad visual propia, nunca clones del protagonista.
- Entradas visibles, colisiones coherentes y acceso por proximidad. Evitar paredes invisibles.
- Indicaciones discretas en objetos mediante destellos; nombres de NPC visibles.
- Música diferenciada por zona. Escenas legibles con pausa/continuar; respetar preferencias de cierre automático de combate.
- Preservar claves y compatibilidad del guardado existente; no borrar localStorage para resolver errores.

## Prioridades que requieren revisión real

No considerar todos los pedidos históricos terminados: revisar calidad visual del combate y locomoción, presentación de inventario estilo RPG, adaptación horizontal/móvil y dificultad de defensa activa. No cambiar estas áreas a ciegas; reproducir el problema antes de editar.

## Método de trabajo

Leer AGENTS.md, examinar los módulos afectados y realizar cambios acotados. Ejecutar las pruebas relacionadas. Para navegación, verificar que cada interacción sea alcanzable y corresponda al paisaje. No regenerar fondos si el cambio se resuelve en lógica o coordenadas.

Para desarrollo local basta un servidor HTTP de archivos estáticos. Para modificar la versión publicada, conservar la identidad Sites y utilizar su flujo de publicación. El repositorio GitHub y Sites no se sincronizan automáticamente.

## Guion y bestiario de referencia

Estos documentos de Google no se incluyen en el repositorio. Requieren acceso a la cuenta conectada y lectura de su versión vigente si se amplía la historia:

- Guion: https://docs.google.com/document/d/1vl3B80VaJUUHUJt-UmWVYrgq5Nrg7rbGvcPrMKE68lI/edit
- Bestiario: https://docs.google.com/document/d/1xeHq1GAqP45JTVcYzQp_SKiD9y42r6XfCCSm7vrle7Q/edit
