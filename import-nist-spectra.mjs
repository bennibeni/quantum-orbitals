import fs from 'node:fs/promises';
import {ELEMENTS} from './model.js';
const base='https://physics.nist.gov/PhysRefData/Handbook/';
const clean=s=>s.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&Aring;/g,'Å').replace(/\s+/g,' ').trim();
async function get(url){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(url+' '+r.status);return r.text();}
const index=await get(base+'element_name.htm');
const links=[...index.matchAll(/href="(Tables\/[^" ]+table1\.htm)"/gi)].map(m=>m[1].replace('table1','table2'));
const result={},errors=[];let next=0;
await fs.mkdir('nist-source',{recursive:true});
async function worker(){while(next<links.length){const path=links[next++],source=base+path;
try{const html=await get(source);await fs.writeFile('nist-source/'+path.split('/').pop(),html);
let medium=null,element=null,parsed=0,excludedIons=0;const lines=[];
for(const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
 const text=clean(row[1]);if(/Air.*Wavelength/.test(text))medium='air';else if(/Vacuum.*Wavelength/.test(text))medium='vacuum';
 const cells=[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>clean(m[1]));
 if(cells.length!==4)continue;
 const species=cells[2].match(/^([A-Z][a-z]?) (I+)$/);if(!species)continue;
 element=ELEMENTS.find(e=>e.symbol===species[1]);if(!element)throw Error('Unknown symbol');parsed++;
 if(species[2]!=='I'){excludedIons++;continue;}
 const intensity=Number(cells[0].match(/^([0-9]+(?:\.[0-9]+)?)/)?.[1]);const nm=Number(cells[1].replace(/\s/g,''))/10;
 if(!Number.isFinite(nm)||!(intensity>0)||nm<380||nm>750||medium!=='air')continue;
 lines.push({nm,intensity,species:species[1]+' I',medium,reference:cells[3],intensityLabel:cells[0]});
}
if(!element||!parsed)throw Error('No parsed rows: '+path);
lines.sort((a,b)=>a.nm-b.nm);result[element.z]={name:element.name,source,retrieved:'2026-10-10',lines,parsedRows:parsed,excludedIonRows:excludedIons};
}catch(e){errors.push(String(e));}}
}
await Promise.all([worker(),worker(),worker(),worker()]);
if(errors.length){console.error(errors);process.exitCode=1;}else{await fs.writeFile('spectra-data.json',JSON.stringify(result,null,2));console.log(JSON.stringify({pages:links.length,elements:Object.keys(result).length,playable:Object.values(result).filter(s=>s.lines.length).length,lines:Object.values(result).reduce((a,s)=>a+s.lines.length,0),maxLines:Math.max(...Object.values(result).map(s=>s.lines.length)),empty:Object.values(result).filter(s=>!s.lines.length).map(s=>s.name)}));}
