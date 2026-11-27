# Cenizas del Umbral · brief de arte jugable

## Estado de esta iteración

**PLACEHOLDER — pendiente de aprobación de arte final.** El juego ya usa seis
tiras PNG transparentes para los protagonistas fijos y no se inventan nuevos
assets en este bloque. Este documento fija el contrato para reemplazarlas por
hojas pixel-art definitivas sin cambiar las claves de guardado ni el motor.

Las hojas actuales son reutilizables y funcionales:

En exploración, mientras no exista una hoja 6×4 aprobada, se genera un atlas
temporal 4×4 que repite únicamente la celda `idle` de cada tira. La locomoción
añade espejo, cadencia y un balanceo leve; nunca usa `windup`, `strike` ni
`hurt`. Esto evita que el protagonista parezca atacar al desplazarse y deja
claro qué parte debe sustituirse por arte final.

| Id | Personaje | Archivo actual | Poses | Estado |
| --- | --- | --- | --- | --- |
| guardia | Cael · Guardia del puente | `dist/combat-heroes/guardia.png` | idle, wind-up, strike, hurt | marcador integrado |
| explorador | Eiren · Explorador | `dist/combat-heroes/explorador.png` | idle, wind-up, strike, hurt | marcador integrado |
| tejedor | Soren · Tejedor de ceniza | `dist/combat-heroes/tejedor.png` | idle, wind-up, strike, hurt | marcador integrado |
| berserker | Kaira · Berserker de ceniza | `dist/combat-heroes/berserker.png` | idle, wind-up, strike, hurt | marcador integrado |
| sombra | Vesper · Sombra | `dist/combat-heroes/sombra.png` | idle, wind-up, strike, hurt | marcador integrado |
| arcanista | Nimra · Arcanista | `dist/combat-heroes/arcanista.png` | idle, wind-up, strike, hurt | marcador integrado |

## Contrato técnico de una hoja

- PNG RGBA con fondo transparente.
- Cuatro celdas en una fila (`grid: [4, 1]`), todas con el mismo lienzo y
  punto de apoyo en los pies.
- 256×256 px por celda como mínimo; 1024×256 px para la tira preferida.
- Orden de poses: `idle`, `windup`, `strike`, `hurt`. El KO se compone con el
  estado `down` (rotación y escala del contenedor), no se debe dibujar como una
  quinta pose falsa.
- La silueta, arma y equipo deben estar integrados en el personaje. No se
  permiten cuadros, triángulos, cruces, runas o tintes como sustitutos de arte.
- El mismo archivo se debe poder usar en creador, exploración y combate; si se
  necesita una hoja de caminar, debe conservar el mismo diseño y pivote.

## Dirección visual por protagonista

Cada personaje es fijo y tiene identidad propia. La lista es una guía para el
arte final; no altera el lore ni los nombres existentes.

### Cael · Guardia del puente

Guerrero masculino. Silueta ancha, escudo grande en el brazo izquierdo, espada
larga y capa azul con broche de puente. Idle firme, wind-up levantando el
escudo, strike con la espada, hurt protegiendo el torso.

### Eiren · Explorador

Pícaro masculino. Silueta ligera, arco corto, carcaj visible y capa verde de
viaje. Idle con una mano en el arco, wind-up tensando la cuerda, strike
disparando, hurt en retirada. No debe compartir la capucha ni las dagas de
Sombra.

### Soren · Tejedor de ceniza

Mago masculino orco. Hombros anchos, colmillos y manto oscuro con brasas
flotando alrededor del bastón. Idle con humo contenido, wind-up concentrando
ceniza, strike lanzando el proyectil, hurt perdiendo chispas.

### Kaira · Berserker de ceniza

Guerrera femenina orca. Silueta musculosa, hacha doble, vendas y manto rojo
rasgado. Idle inclinada hacia delante, wind-up con ambas hachas, strike en arco
amplio, hurt con una rodilla en tierra. No debe parecer una Guardia recoloreada.

### Vesper · Sombra

Pícara femenina mediana. Silueta baja, capucha violeta, dos dagas separadas y
pasos cortos. Idle agazapada, wind-up ocultando una daga, strike cruzado, hurt
desapareciendo hacia atrás. No debe compartir arco, carcaj o postura de
Explorador.

### Nimra · Arcanista

Maga femenina gnoma. Escala pequeña, bastón rúnico y foco violeta en la mano;
la cabeza y las manos deben leerse incluso a tamaño de combate. Idle flotación
leve, wind-up formando un sello, strike con llama arcana, hurt con el foco
apagándose.

## Variantes y alcance

El modo simple juega con estos seis diseños fijos. El modo avanzado conserva la
compatibilidad D&D y sus perfiles raciales, pero no se anuncia como un catálogo
de 144 hojas pintadas: las variantes de `dist/hero-visuals.js` son un marcador
de integración hasta que exista arte aprobado. Las diferencias de raza/género
en avanzado deben seguir siendo legibles sin reemplazar la silueta de la clase.

## Flujo de aprobación

1. Entregar una prueba de seis tiras con la misma escala y pivote.
2. Revisar una captura en creador, exploración y combate a 1280×720 y 390×844.
3. Aprobar o pedir cambios de silueta/equipo.
4. Ejecutar `node scripts/build-hero-atlases.cjs` para validar y publicar el
   manifiesto.

