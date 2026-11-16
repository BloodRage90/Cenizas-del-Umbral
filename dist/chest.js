(function(root){
'use strict';
function status(s){return s.flags.chestOpened?'empty':s.flags.chestDefeated||s.chestLuck>=11?'ready':s.chestLuck?'guarded':'sealed';}
function luck(s,die){if(s.chestLuck)return s.chestLuck;if(!Number.isInteger(die)||die<1||die>20)throw Error('Invalid d20');s.chestLuck=die;return die;}
function collect(s){if(status(s)!=='ready')return false;s.flags.chestOpened=true;s.gold+=25;s.potions+=2;if(!s.items.includes('Medallón de la Vigilia'))s.items.push('Medallón de la Vigilia');return true;}
const api={status,luck,collect};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasChest=api;
})(typeof window!=='undefined'?window:globalThis);
