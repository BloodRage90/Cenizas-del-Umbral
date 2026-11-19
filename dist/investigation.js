(function(root){
const documents={
 oath:{flag:'archiveOath',label:'Libro encuadernado',title:'Acta del primer cierre',text:'«Comparecemos por voluntad propia». Trece años atrás, cada custodio trazó su nombre de una manera distinta. Al margen figura Ordan como responsable de la campana.'},
 captives:{flag:'archiveCaptives',label:'Cuaderno de raciones',title:'Relación del ala oeste',text:'Darien: ala oeste, enfermería. La entrega lleva la anotación «traslado bajo custodia». No hay solicitud del interesado ni fecha de salida.'},
 copies:{flag:'archiveCopies',label:'Papeles sueltos',title:'Registro reciente',text:'Reconoces nombres del cuaderno de raciones. En firmas diferentes se repiten la misma inclinación, una raya partida y el mismo remate. Al pie: «transcrito por orden de la priora». No hay originales adjuntos.'},
 maraDeath:{flag:'maraDeath',label:'Registro de defunción de Mara',title:'Registro de defunción de Mara, hija de Sereth',text:'Registro de defunción · año 47. Mara, hija de Sereth, murió durante la inundación del río. La inscripción termina con una línea añadida después: «su nombre permanece bajo custodia». No hay firma de la familia.'}
};
const required=['oath','captives','copies'];
function read(s,id){const d=documents[id];if(!d)return false;const fresh=!s.flags[d.flag];s.flags[d.flag]=true;s.flags.archiveReviewRequired=false;return fresh;}
function ready(s){return required.every(id=>s.flags[documents[id].flag]);}
function deduce(s,claim,support){if(s.flags.archiveCompared)return 'complete';if(s.flags.archiveReviewRequired)return 'review';if(!ready(s))return 'incomplete';if(claim==='substitution'&&support==='consent'){s.flags.archiveCompared=true;s.flags.archiveDeduction=true;return 'solved';}s.flags.archiveReviewRequired=true;s.flags.archiveMistakes=(s.flags.archiveMistakes||0)+1;return 'contradiction';}
function hint(s){if(!required.some(id=>s.flags[documents[id].flag]))return 'Sereth habló de proteger personas. ¿Dejarían algún rastro cotidiano aquí, aunque hayan borrado sus nombres de la ciudad?';if(!ready(s))return 'No basta con saber dónde está Darien. Busca algo que permita contrastar la explicación de Sereth con lo que se hacía antes.';return 'Distingue una firma copiada de una decisión tomada. ¿Qué acredita cada papel, y qué no puede acreditar?';}
const api={documents,required,read,ready,deduce,hint};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasInvestigation=api;
})(typeof window!=='undefined'?window:globalThis);
