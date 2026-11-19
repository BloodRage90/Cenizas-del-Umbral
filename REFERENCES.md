# Referencias de diseño

Estas referencias se consultaron como patrones de diseño. No se copió código ni se incorporó una dependencia de terceros en `dist/`.

| Repositorio | Tareas | Qué se estudió/adaptó | Licencia / integración |
|---|---|---|---|
| [googlechrome/modern-web-guidance](https://github.com/googlechrome/modern-web-guidance) | RSI / responsive UI | Recomendaciones de controles táctiles, accesibilidad y carga de imágenes | Referencia; no se copió código. La búsqueda CLI no pudo ejecutarse porque `npx` no está instalado en este entorno |
| [donth77/reach-the-relay](https://github.com/donth77/reach-the-relay) | 1, 8 | Orden de turnos y lectura de la línea temporal | Referencia; no se integró código |
| [luigi3141/aetheria](https://github.com/luigi3141/aetheria) | 1 | Separación de escena y estado de combate | Referencia; no se integró código |
| [jvandeus/TriggerBattleSystem](https://github.com/jvandeus/TriggerBattleSystem) | 2 | Modelo declarativo de técnicas combinadas | Adaptado a `dist/combat-systems.js`; no se copió código |
| [KonstantinDjairo/Chrono-Trigger-C](https://github.com/KonstantinDjairo/Chrono-Trigger-C) | 2 | Idea de fórmulas de daño compuestas | Referencia conceptual; no se integró código |
| [networkingguru/incursion-roguelike](https://github.com/networkingguru/incursion-roguelike) | 4 | Convertir rasgos de raza en verbos jugables | Referencia; no se integró código |
| [TheDroidYourLookingFor/EmberQuest](https://github.com/TheDroidYourLookingFor/EmberQuest) | 4, 5 | Flujo de creación con raza y clase | Referencia; no se integró código |
| [alife-sdk/ai](https://github.com/alife-sdk/ai) / [visual-novel-dialogue](https://github.com/robingamedev/visual-novel-dialogue) | 4, 9 | Diálogo condicional y estados narrativos | Referencia; no se integró código |
| [gvorbeck/codex-quest](https://github.com/gvorbeck/codex-quest) | 5 | Creación como asistente con previsualización | Referencia; no se integró código |
| [vykymoon/rpg-character-creator](https://github.com/vykymoon/rpg-character-creator) | 5 | Estructura por pasos y validación | Referencia; no se integró código |
| [Chupacharcos/Adaptive-Music-Engine](https://github.com/Chupacharcos/Adaptive-Music-Engine) | 7 | Crossfade entre capas/contextos | El repositorio actual conserva un crossfade propio; no se vendoriza código. Verificar licencia MIT antes de una futura integración |

El motor sigue siendo Phaser 3 + JavaScript sin build. Las claves `cenizas-character-v1` y `cenizas-campaign-v2` no se modifican.
