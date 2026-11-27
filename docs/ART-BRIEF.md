# Cenizas del Umbral · brief de arte jugable

## Estado de esta iteración

**PLACEHOLDER — pendiente de aprobación de arte final.** El juego ya usa seis
tiras PNG transparentes para los protagonistas fijos y no se inventan nuevos
assets en este bloque. Este documento fija el contrato para reemplazarlas por
hojas pixel-art definitivas sin cambiar las claves de guardado ni el motor.

La hoja de combate es la fuente de verdad para Cael, Eiren, Soren, Kaira,
Vesper y Nimra. La exploración procedural actual no es arte final: comparte
cabeza y torso, añade capas vectoriales y repite pasos. La Fase 2a genera primero
hojas conceptuales de frente/perfil/espalda para aprobar identidad; solo después
se producirán los atlas 4×6 de caminar/reposo y las poses físicas `hurt`,
`critical` y `down`. Las referencias conceptuales son externas al runtime y no
se han integrado. Soren requiere limpiar el fondo de la referencia generada y
Nimra requiere separar sus efectos mágicos antes de producir RGBA definitivo.

Las hojas actuales son reutilizables y funcionales:

En combate se conserva una tira lateral por protagonista. En exploración se
genera un atlas direccional 5×4 desde la hoja base de cuatro ángulos: cinco
pasos seguros (`0,1,2,3,2`) por `down`, `left`, `right` y `up`. El equipo,
la silueta racial y la presentación del personaje se pintan sobre esa misma
figura; nunca se filtran `windup`, `strike` ni `hurt` durante el desplazamiento.

| Id | Personaje | Archivo actual | Poses | Estado |
| --- | --- | --- | --- | --- |
| guardia | Cael · Guardia del puente | `dist/combat-heroes/guardia.png` | idle, wind-up, strike, hurt, critical | marcador integrado |
| explorador | Eiren · Explorador | `dist/combat-heroes/explorador.png` | idle, wind-up, strike, hurt, critical | marcador integrado |
| tejedor | Soren · Tejedor de ceniza | `dist/combat-heroes/tejedor.png` | idle, wind-up, strike, hurt, critical | marcador integrado |
| berserker | Kaira · Berserker de ceniza | `dist/combat-heroes/berserker.png` | idle, wind-up, strike, hurt, critical | marcador integrado |
| sombra | Vesper · Sombra | `dist/combat-heroes/sombra.png` | idle, wind-up, strike, hurt, critical | marcador integrado |
| arcanista | Nimra · Arcanista | `dist/combat-heroes/arcanista.png` | idle, wind-up, strike, hurt, critical | marcador integrado |

## Pose de vida crítica

Cuando una unidad queda con **25 % de PG o menos**, el combate activa el estado
persistente `low-health`: la silueta respira con dificultad, se inclina y la
barra de vida recibe un contorno de peligro. El estado se evalúa en cada render,
por lo que aparece inmediatamente al cruzar el umbral y permanece hasta que la
vida vuelve a superar el 25 % (o la unidad cae). La pose no depende de recibir
otro golpe.

Las tiras de combate heredadas todavía tienen cuatro celdas físicas. El contrato
expone una quinta pose lógica (`critical`) y, hasta aprobar su celda de arte final,
reutiliza la celda `hurt` como **marcador técnico**. En exploración cada personaje
se genera como un atlas 5×4: cinco pasos seguros por cada ángulo (`down`, `left`,
`right`, `up`) a partir de la hoja direccional base, con su equipo y silueta.

## Contrato técnico de una hoja

- PNG RGBA con fondo transparente.
- Cuatro celdas físicas en una fila (`grid: [4, 1]`) y una quinta pose lógica
  (`critical` → celda 3 mientras el arte final no esté aprobado), todas con el
  mismo lienzo y
  punto de apoyo en los pies.
- 256×256 px por celda como mínimo; 1024×256 px para la tira preferida.
- Orden de poses: `idle`, `windup`, `strike`, `hurt`, `critical`. El KO se
  compone con el estado `down` (rotación y escala del contenedor), no se debe
  dibujar como una sexta pose falsa.
- La silueta, arma y equipo deben estar integrados en el personaje. No se
  permiten cuadros, triángulos, cruces, runas o tintes como sustitutos de arte.
- La tira lateral se usa en creador y combate; el atlas direccional de
  exploración conserva su silueta, equipo, escala y pivote. Cuando se apruebe
  arte final, puede reemplazar ambos recursos sin cambiar las claves de
  guardado ni el contrato de poses.

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

