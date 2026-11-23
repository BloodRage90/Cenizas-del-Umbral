# Cenizas del Umbral

RPG narrativo de fantasía en español. JavaScript, HTML, CSS y Phaser; funciona como sitio estático, sin servidor de aplicación ni proceso de compilación.

## Ejecutar

Desde la raíz del proyecto:

```sh
python -m http.server 8000 --directory dist
```

Abrir http://localhost:8000. No abrir los HTML directamente como archivos.

## Pruebas

Se requiere Node.js. Desde la raíz:

```sh
node --test tests/*.cjs
```

### Playwright (navegador real)

El runner levanta automáticamente `scripts/serve.cjs` sobre `dist/` y prueba el menú, el creador, la navegación y el primer combate en 1280×720, 844×390, 667×375 y 390×844. La primera vez instala Chromium:

```sh
pnpm install
pnpm exec playwright install chromium
pnpm test:e2e
```

Para iterar más rápido puedes ejecutar solo escritorio o móviles:

```sh
pnpm test:e2e:desktop
pnpm test:e2e:mobile
```

El informe HTML queda en `playwright-report/` y las trazas, capturas y vídeos de fallos en `test-results/`; ambos directorios se ignoran en Git.

La auditoría estática RSI se puede ejecutar de forma independiente:

```sh
node scripts/rsi-audit.cjs
```

## Estructura

- `dist/`: código fuente servido directamente, imágenes, música y librería Phaser incluida. No borrar como si fuera una carpeta de compilación.
- `dist/chapter.js`: exploración, mapas, misiones y secuencias narrativas.
- `dist/combat.js`, `dist/umbral-battle.js`: combate por turnos.
- `dist/bell-cinema.js`: cinemática de la campana.
- `tests/`: pruebas de navegación, reglas, guardado y progresión.
- `ART_ASSET_MATRIX.md`: catálogo de arte disponible, marcadores y pendientes del creador simple.
- `AGENTS.md`: preferencias y reglas para el asistente de desarrollo.
- `docs/CONTINUIDAD.md`: contexto para continuar en Codex.

## Guardado y publicación

La partida se guarda en el navegador mediante localStorage. No está incluida en GitHub. Otra dirección web o navegador tendrá un guardado independiente.

El editor abre en modo simple para llegar al primer combate con una build validada. `Personalizar (avanzado)` conserva la hoja completa de D&D 3.5; los guardados anteriores se mantienen y se abren en ese modo para evitar cambios silenciosos.

Sitio existente: https://cenizas-del-umbral.bloodrage.chatgpt.site

El manifiesto `.openai/hosting.json` conserva la identidad de ese Site. Subir cambios a GitHub NO actualiza automáticamente el sitio publicado; se requiere publicación mediante Sites. No crear otro Site ni sustituir el identificador sin una solicitud explícita.

## Procedencia

Base: versión publicada 36, commit `6a2a68ca10e4d00d577077cce6b2bb41d64f8ea5` del repositorio de Sites. El destino solicitado es `BloodRage90/Cenizas-del-Umbral`.

Las imágenes y melodías originales del proyecto se incluyen. Consultar también los créditos musicales de la interfaz: las pistas de Kevin MacLeod conservan su atribución CC BY 4.0. No se concede una licencia general nueva mediante esta transferencia.
