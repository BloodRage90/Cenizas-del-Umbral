const assert=require('node:assert/strict');
const fs=require('node:fs');
const game=fs.readFileSync('dist/game.js','utf8');
const app=fs.readFileSync('dist/app.js','utf8');
const chapter=fs.readFileSync('dist/chapter.js','utf8');
const css=fs.readFileSync('dist/style.css','utf8');

assert(game.includes('characterLocked'),'la partida conserva el estado de personaje fijado');
assert(game.includes('characterReadyBridge(character)'),'los guardados antiguos incompletos pueden repararse');
assert(game.includes("character.html?mode=view"),'la hoja se abre en modo consulta tras guardar');
assert(chapter.includes('character.html?campaign=1&mode=view'),'la hoja del capítulo también queda en modo consulta');
assert(game.includes('Este personaje ya está fijado'),'un segundo guardado no puede sustituir al protagonista');
assert(app.includes('lockedMode')&&app.includes('Personaje fijado al comenzar esta partida'),'la hoja bloqueada informa que solo es de consulta');
assert(app.includes('creator-locked')&&css.includes('.locked-banner'),'el modo consulta desactiva los controles y tiene estilo propio');
console.log('PASS: el personaje queda fijado al comenzar y la hoja durante la partida es de consulta.');
