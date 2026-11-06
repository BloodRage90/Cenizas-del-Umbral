(function(root){
const CAPE='Capa de la Vigilia';
function wearing(s){return s.equipped==='vigilia'&&s.items.includes(CAPE);}
function profile(rules,c,s){const p=rules.profile(c,s.level);if(wearing(s)){p.ac++;p.flat++;}return p;}
function collect(s){if(!s.flags.millAccepted||!s.flags.millEcho1||!s.flags.millEcho2||s.flags.millRecovered)return false;s.flags.millRecovered=true;return true;}
function claim(s){if(!s.flags.millRecovered||s.flags.millReward)return false;s.flags.millReward=true;s.gold+=20;s.potions++;if(!s.items.includes(CAPE))s.items.push(CAPE);return true;}
function toggle(s){if(s.combat||!s.items.includes(CAPE))return false;s.equipped=wearing(s)?null:'vigilia';return true;}
const api={CAPE,wearing,profile,collect,claim,toggle};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasEquipment=api;
})(typeof window!=='undefined'?window:globalThis);
