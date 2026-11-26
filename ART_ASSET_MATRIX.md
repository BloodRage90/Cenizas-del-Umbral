# Matriz de arte del creador simple

Esta matriz describe el arte que existe hoy en el repositorio. No presenta las
variantes procedurales como ilustraciones finales: son capas de presentación
que mantienen la coherencia entre la vista previa, la exploración y el combate.

| Arquetipo | Clase/subclase | Base jugable | Diferencia visible actual | Estado |
| --- | --- | --- | --- | --- |
| Guardia del puente | Guerrero · Guardia | `combat-heroes/guardia.png` | Escudo, espada larga y capa azul; cuatro poses de combate | Hoja exclusiva integrada |
| Berserker de ceniza | Guerrero · Berserker | `combat-heroes/berserker.png` | Hacha doble, manto rojo y postura de carga; cuatro poses | Hoja exclusiva integrada |
| Sombra | Pícaro · Sombra | `combat-heroes/sombra.png` | Capucha violeta, dos dagas y silueta baja; cuatro poses | Hoja exclusiva integrada |
| Explorador | Pícaro · Explorador | `combat-heroes/explorador.png` | Arco, carcaj y capa verde; cuatro poses | Hoja exclusiva integrada |
| Arcanista | Mago · Arcanista | `combat-heroes/arcanista.png` | Bastón con foco violeta y túnica clara; cuatro poses | Hoja exclusiva integrada |
| Tejedor de ceniza | Mago · Tejedor | `combat-heroes/tejedor.png` | Manto oscuro, bastón de ascua y humo; cuatro poses | Hoja exclusiva integrada |

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

- Las seis hojas de combate aprobadas corresponden a los protagonistas fijos
  del modo simple (Guardia, Explorador, Tejedor, Berserker, Sombra y Arcanista).
  El motor las selecciona por subclase; no vuelve a la hoja genérica de clase.
- No existe todavía una hoja pixel-art definitiva para cada combinación raza ×
  arquetipo × género del modo avanzado (el catálogo completo sería mucho mayor
  que las seis bases actuales). En avanzado, el perfil procedural queda
  documentado como **marcador de integración**.
- La tarjeta de vista previa y la hoja final conservan sus retratos y rasgos
  raciales. El combate del modo simple usa ahora las seis hojas exclusivas de
  `dist/combat-heroes/`; el selector de identidad se mantiene por compatibilidad
  y las claves de guardado no cambian.
- Las seis tiras PNG se derivaron de la hoja de poses aprobada y son transparentes
  (4 poses por protagonista). La cinemática de plaza adjunta sigue siendo una
  referencia de composición; no se usa como sprite de combate.

