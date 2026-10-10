'use client';
import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import {cloud, densitySection, radialNodes, angularNodes, ELEMENTS, LETTERS, ORDER} from './model.js';
import './quantum-orbitals.css';
import SpectrumPlayer from './SpectrumPlayer.jsx';


// Impostazione per lo sviluppatore: true = orbitali reali, false = autostati Lz.
const USE_REAL_ORBITALS = true;
const mode = USE_REAL_ORBITALS ? 'real' : 'complex';

const EXPLANATIONS = {
  n: ['n · Guscio principale', 'n può assumere valori interi da 1 a 7 in questo atlante. Determina il guscio e, insieme a ℓ, la distribuzione radiale: quanto lontano dal nucleo è probabile trovare l’elettrone e dove si trovano i nodi radiali.', 'Nel modello idrogenoide l’energia dipende solo da n. Negli atomi con più elettroni dipende anche dalle interazioni: i gusci non si riempiono semplicemente in ordine di n. La vista adatta automaticamente la scala: consulta il raggio in a₀ per confrontare le dimensioni.'],
  l: ['ℓ · Sottoguscio e forma', 'ℓ va da 0 a n − 1. Le lettere s, p, d, f, g, h, i corrispondono a ℓ = 0, 1, 2, 3, 4, 5, 6. Questo numero determina il momento angolare orbitale e la struttura angolare della funzione d’onda. Per ricordare le forme degli orbitali reali: s (0) = sfera; p (1) = manubrio; d (2) = spesso quadrifoglio, ma d z² ha due lobi e un anello; f (3) = forme complesse a più lobi, che possiamo immaginare come “barocche”. Sono immagini indicative, non forme uniche per ogni sottoguscio.', 'Un sottoguscio contiene 2ℓ + 1 orbitali spaziali; ciascuno può ospitare al massimo due elettroni con spin opposto. Per esempio, d contiene 5 orbitali e può ospitare 10 elettroni.'],
  m: [mode==='real'?'Variante dell’orbitale':'mℓ · Numero magnetico', ...(mode==='real' ? ['Ogni sottoguscio comprende diverse varianti dell’orbitale: per esempio pₓ, pᵧ e pz. Questa manopola sceglie quale visualizzare. I numeri da −ℓ a +ℓ servono a identificarle.', 'Le varianti mostrate sono orbitali reali. Per un indice diverso da zero sono combinazioni degli stati +|m| e −|m|: l’indice non è quindi un valore definito del momento angolare lungo z. Cambiare variante non modifica gli elementi compatibili con il sottoguscio.'] : [ 'Nella modalità “Autostati di Lz”, mℓ va da −ℓ a +ℓ e determina la componente del momento angolare lungo l’asse z: Lz = mℓ ℏ. Non indica una traiettoria o la posizione dell’elettrone.', 'Nella modalità “Orbitali reali”, per un indice diverso da zero mostriamo combinazioni degli stati +|m| e −|m|, come pₓ e pᵧ. L’indice seleziona la combinazione e non è un valore definito di Lz. Cambiare m non cambia gli elementi evidenziati: la tavola verifica l’occupazione del sottoguscio n, ℓ.'])],
  section: ['Sezione della densità', 'La mappa mostra i valori di |ψ|² su un piano che passa per il nucleo. Non è una proiezione della nuvola: i punti davanti e dietro il piano non vengono sommati.', 'La scala dei colori è lineare e relativa: nero indica densità nulla, giallo indica il valore massimo della sezione attuale. Ogni sezione viene riscalata separatamente, quindi la stessa luminosità non permette di confrontare quantitativamente piani o orbitali diversi.', 'Un piano geometrico ha spessore nullo. La mappa non è la probabilità di trovare l’elettrone esattamente sul piano: per ottenere una probabilità bisogna integrare la densità in un volume. Alcuni piani possono avere densità nulla in tutta la sezione.'],
  angular: ['Nodi angolari · piani e coni', 'Sono direzioni in cui la parte angolare della funzione d’onda si annulla. Nel disegno diventano piani o superfici coniche che passano per il nucleo: non sono barriere né traiettorie.', 'I reticoli viola mostrano i nodi angolari; quelli dorati mostrano i nodi radiali. Un orbitale p reale ha un piano nodale. Gli orbitali d a quadrifoglio hanno due piani; d z² ha due superfici coniche, una sopra e una sotto il nucleo.', 'Cambiare variante modifica la geometria dei nodi. Il reticolo è limitato alla zona visualizzata, ma le superfici nodali continuano oltre. Le direzioni lungo l’asse z, quando nodali, non sono disegnate come superfici.'],
  nodes: ['Nodi radiali · superfici a probabilità nulla', 'Un nodo radiale è una superficie sferica, a una precisa distanza dal nucleo, su cui la funzione d’onda e la densità di probabilità si annullano. Il numero di nodi radiali è n − ℓ − 1.', 'Mostra nodi sovrappone un reticolo dorato su queste superfici: non è una traiettoria, un guscio materiale o una barriera. Il reticolo serve soltanto a rendere riconoscibile una regione vuota della nuvola.', '1s non ha nodi radiali; 2s ne ha uno; 3s ne ha due. 2p non ha nodi radiali, ma un orbitale p reale ha un piano nodale angolare. Questo comando mostra solo i nodi radiali. Le distanze sono espresse in raggi di Bohr (a₀) per Z = 1.'],
  density: ['La densità si riferisce a un elettrone?', 'Sì. Qui |ψ(r)|² è la densità di probabilità della posizione di un singolo elettrone nell’orbitale scelto. La probabilità di trovarlo in una regione si ottiene integrando |ψ|² sul volume di quella regione; sull’intero spazio vale 1 per una funzione normalizzata.', 'I 10.000 punti sono campioni di questa distribuzione: rappresentano possibili esiti di misure su sistemi preparati nello stesso stato. Non sono 10.000 elettroni e non disegnano una traiettoria.', 'Un orbitale può essere occupato da due elettroni con spin opposto. Nel modello a orbitali, il loro contributo alla densità numerica elettronica è 2|ψ|² e integra a 2, ma questa vista mostra sempre la distribuzione normalizzata di un solo elettrone. Non è la densità totale dell’atomo selezionato.']
};
function Explanation({topic}) {
  const dialog=useRef(null),trigger=useRef(null),titleId=useId();
  const [title,...paragraphs]=EXPLANATIONS[topic];
  return <><button type="button" className="qo-help" ref={trigger} aria-label={`Spiegazione: ${title}`} aria-haspopup="dialog" onClick={()=>dialog.current.showModal()}>i</button>
    <dialog ref={dialog} className="qo-dialog" aria-labelledby={titleId} onClose={()=>trigger.current?.focus()} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close();}}}>
      <div className="qo-dialog-head"><h2 id={titleId}>{title}</h2><button type="button" aria-label="Chiudi spiegazione" onClick={()=>dialog.current.close()}>×</button></div>
      {paragraphs.map(p=><p key={p}>{p}</p>)}
      <button type="button" className="qo-dialog-close" onClick={()=>dialog.current.close()}>Ho capito</button>
    </dialog></>;
}

const SUBSHELL_SHAPES = ['sfera', 'manubrio', 'quadrifoglio', 'forme complesse', 'forme complesse', 'forme complesse', 'forme complesse'];
function describeOrbital(n,l,m) {
  let shape;
  if(l===0) shape='Simmetria sferica attorno al nucleo.';
  else if(mode!=='real') shape='Densità simmetrica attorno all’asse z; il colore mostra la fase della funzione d’onda.';
  else if(l===1) shape=`Due lobi lungo l’asse ${m===0?'z':m>0?'x':'y'}.`;
  else if(l===2) shape=m===0?'Due lobi lungo z e un anello centrale.':m===1?'Quattro lobi nel piano xz, tra gli assi.':m===-1?'Quattro lobi nel piano yz, tra gli assi.':m===2?'Quattro lobi lungo gli assi x e y.':'Quattro lobi nel piano xy, tra gli assi.';
  else shape=`Struttura angolare complessa del sottoguscio ${LETTERS[l]}; la variante seleziona la distribuzione dei lobi.`;
  const nodes=n-l-1;
  return shape+' '+(nodes===0?'Nessun nodo radiale.':nodes===1?'Un nodo radiale: una superficie sferica dove la probabilità si annulla.':`${nodes} nodi radiali: superfici sferiche dove la probabilità si annulla.`);
}

const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
function DensitySection({n,l,m,plane,extent}){
  const canvas=useRef(null);
  const section=useMemo(()=>densitySection(n,l,m,mode,plane,extent),[n,l,m,plane,extent]);
  useEffect(()=>{const ctx=canvas.current.getContext('2d');if(!ctx)return;const {size,values,max}=section;canvas.current.width=size;canvas.current.height=size;const img=ctx.createImageData(size,size);
    for(let i=0;i<values.length;i++){const t=max?values[i]/max:0;img.data[4*i]=Math.round(255*Math.min(1,t*2));img.data[4*i+1]=Math.round(235*t);img.data[4*i+2]=Math.round(160*Math.sin(Math.PI*t));img.data[4*i+3]=255;}ctx.putImageData(img,0,0);
  },[section]);
  return <div className="qo-section-map"><div className="qo-section-axes"><span>{plane[1]} ↑</span><canvas ref={canvas} role="img" aria-label={`Sezione ${plane} della densità ${n}${LETTERS[l]}, variante ${m}`}/><span>{plane[0]} →</span></div><p>Da −{extent.toFixed(1)} a +{extent.toFixed(1)} a₀ su entrambi gli assi · nucleo al centro.</p><div className="qo-density-legend"><span>0</span><i/><span>Massimo della sezione</span></div>{section.max===0 && <p className="qo-zero-section" role="status">La densità è nulla in tutta questa sezione.</p>}</div>;
}

function OrbitalCanvas({data,zoom,angle,onAngle,label,nodes,showNodes,angular,showAngular}){
  const ref=useRef(null),drag=useRef(null);
  useEffect(()=>{
    const canvas=ref.current;const ctx=canvas.getContext('2d');if(!ctx)return;
    const draw=()=>{
      const {width:w,height:h}=canvas.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
      const scale=Math.min(w,h)*.43/data.radius*zoom;
      const project=(x,y,z)=>{const x1=x*Math.cos(angle[0])+y*Math.sin(angle[0]);const y1=-x*Math.sin(angle[0])+y*Math.cos(angle[0]);return [w/2+x1*scale,h/2-(z*Math.cos(angle[1])-y1*Math.sin(angle[1]))*scale];};
      ctx.lineWidth=1;ctx.font='12px system-ui';
      for(const [x,y,z,name] of [[1,0,0,'x'],[0,1,0,'y'],[0,0,1,'z']]){const p=project(x*data.radius,y*data.radius,z*data.radius);ctx.strokeStyle='#41516a';ctx.beginPath();ctx.moveTo(w/2,h/2);ctx.lineTo(...p);ctx.stroke();ctx.fillStyle='#adbdd1';ctx.fillText(name,p[0]+5,p[1]);}
      for(const point of data.points){const [x,y]=project(point.x,point.y,point.z);const hue=((point.phase/(2*Math.PI)*360+185)%360+360)%360;ctx.fillStyle=`hsla(${hue},85%,68%,.42)`;ctx.fillRect(x,y,1.6,1.6);}
      if(showNodes){
        ctx.save();ctx.strokeStyle='#ffd479';ctx.lineWidth=1;ctx.globalAlpha=.75;
        for(const radius of nodes){
          // Silhouette and three rotated great circles describe each nodal sphere.
          ctx.beginPath();ctx.arc(w/2,h/2,radius*scale,0,2*Math.PI);ctx.stroke();
          ctx.setLineDash([3,4]);
          for(let plane=0;plane<3;plane++){ctx.beginPath();for(let j=0;j<=120;j++){const t=j/120*2*Math.PI,a=radius*Math.cos(t),b=radius*Math.sin(t);const p=plane===0?project(a,b,0):plane===1?project(a,0,b):project(0,a,b);if(j===0)ctx.moveTo(...p);else ctx.lineTo(...p);}ctx.stroke();}
          ctx.setLineDash([]);
        }
        ctx.restore();
      }
      if(showAngular){
        ctx.save();ctx.strokeStyle='#d9a0ff';ctx.lineWidth=1;ctx.globalAlpha=.65;
        const radius=data.radius;
        const line=points=>{ctx.beginPath();points.forEach((p,i)=>{const xy=project(...p);if(i===0)ctx.moveTo(...xy);else ctx.lineTo(...xy);});ctx.stroke();};
        for(const phi of angular.planes){
          const c=Math.cos(phi),s=Math.sin(phi);
          line(Array.from({length:97},(_,i)=>{const t=i*Math.PI/48;return [radius*Math.cos(t)*c,radius*Math.cos(t)*s,radius*Math.sin(t)];}));
          for(const f of [-.5,0,.5]){const span=radius*Math.sqrt(1-f*f);line([[-span*c,-span*s,f*radius],[span*c,span*s,f*radius]]);line([[f*radius*c,f*radius*s,-span],[f*radius*c,f*radius*s,span]]);}
        }
        for(const u of angular.cones){
          const s=Math.sqrt(1-u*u);
          for(const f of [.5,1])line(Array.from({length:97},(_,i)=>{const t=i*Math.PI/48;return [radius*f*s*Math.cos(t),radius*f*s*Math.sin(t),radius*f*u];}));
          for(let j=0;j<8;j++){const t=j*Math.PI/4;line([[0,0,0],[radius*s*Math.cos(t),radius*s*Math.sin(t),radius*u]]);}
        }
        ctx.restore();
      }
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(w/2,h/2,2.6,0,Math.PI*2);ctx.fill();
    };
    draw();const observer=new ResizeObserver(draw);observer.observe(canvas);return()=>observer.disconnect();
  },[data,zoom,angle,nodes,showNodes,angular,showAngular]);
  return <canvas ref={ref} className="qo-canvas" role="img" aria-label={label} onPointerDown={e=>{drag.current=[e.clientX,e.clientY,...angle];e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current){const [x,y,a,b]=drag.current;onAngle([a+(e.clientX-x)*.01,b+(e.clientY-y)*.01]);}}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}/>;
}

/** Standalone; CSS scoped with qo-* classes. onSelectionChange receives {n,l,m,mode,element}. */
export default function QuantumOrbitals({className='',onSelectionChange}){
  const [q,setQ]=useState({n:3,l:2,m:0}),[preview,setPreview]=useState(null),[z,setZ]=useState(null);
  const largeDialog=useRef(null),expandButton=useRef(null);
  const [hoveredElement,setHoveredElement]=useState(null),[focusedElement,setFocusedElement]=useState(null);
  const inspectedElement=ELEMENTS[(hoveredElement??focusedElement)-1];
  const [showSection,setShowSection]=useState(false),[sectionPlane,setSectionPlane]=useState('xz');
  const [showAngular,setShowAngular]=useState(false);
  const [showNodes,setShowNodes]=useState(false);
  const [zoom,setZoom]=useState(1),[angle,setAngle]=useState([.45,.25]);
  const {n,l,m}=preview||q,key=`${n}${LETTERS[l]}`,filterKey=`${q.n}${LETTERS[q.l]}`,element=ELEMENTS[z-1];
  const angular=useMemo(()=>angularNodes(l,m,mode),[l,m]);
  const nodes=useMemo(()=>radialNodes(n,l),[n,l]);
  const data=useMemo(()=>cloud(n,l,m,mode),[n,l,m,mode]);
  const shownCount=ELEMENTS.filter(e=>e.config[key]>0).length;
  const description=describeOrbital(n,l,m);
  const count=ELEMENTS.filter(e=>e.config[filterKey]>0).length;
  useEffect(()=>{onSelectionChange?.({n,l,m,mode,element});},[n,l,m,mode,element,onSelectionChange]);
  const choose=(field,value)=>{setPreview(null);setQ(old=>{const next={...old,[field]:value};next.l=Math.min(next.l,next.n-1);next.m=Math.max(-next.l,Math.min(next.m,next.l));return next;});};
  const preset=(n,l,m)=>{setPreview(null);setQ({n,l,m});setZoom(1);};
  return <section className={`qo-root ${className}`} aria-label="Atlante degli orbitali atomici">
    <header className="qo-header"><div><h1>Atlante quantistico<span>.</span></h1><p>Tre numeri. Una funzione d’onda. Esplora lo spazio delle probabilità.</p></div><span className="qo-badge">MODELLO IDROGENOIDE · Z = 1</span></header>
    <section className="qo-explore" aria-label="Tavola e anteprima sincronizzata">
      <div className="qo-sidebar"><aside className="qo-controls"><span className="qo-eyebrow">01 / SCEGLI LO STATO</span><h2>Le tre manopole</h2>
      {[['n','Guscio principale',1,7,q.n],['l','Sottoguscio',0,q.n-1,q.l],['m',mode==='real'?'Variante dell’orbitale':'Numero magnetico',-q.l,q.l,q.m]].map(([field,title,min,max,value])=><div className="qo-control" key={field}><span><span className="qo-label-help">{title}<Explanation topic={field}/></span><strong>{field==='l'?'ℓ':field==='m'?(mode==='real'?'m':'mℓ'):field}</strong></span><select aria-label={title} value={value} onChange={e=>choose(field,Number(e.target.value))}>{range(min,max).map(v=><option key={v} value={v}>{field==='l'?`${LETTERS[v]} (${v}) · ${SUBSHELL_SHAPES[v]}`:v}</option>)}</select></div>)}
      <p className="qo-note">{mode==='real'?'La variante sceglie una delle forme del sottoguscio.':'Gli stati +m e −m hanno la stessa densità, ma fasi differenti. m non è una semplice rotazione della forma.'}</p>
      <div className="qo-presets">{[[1,0,0,'1s'],[2,1,1,mode==='real'?'2pₓ':'2p'],[3,2,0,'3d'],[4,3,2,'4f']].map(([a,b,c,title])=><button key={title} onClick={()=>{preset(a,b,c);}}>{title}</button>)}</div>
    </aside>
      <aside className="qo-live-preview" aria-label="Anteprima della densità sempre visibile">
        <div className="qo-preview-caption"><div className="qo-label-help"><span className="qo-eyebrow">02 / DENSITÀ DI PROBABILITÀ</span><Explanation topic="density"/></div><h3>{key} · {mode==='real'?'variante':'mℓ'} {m}</h3><p>Orbitale mostrato: {key} · Filtro tavola: {filterKey}</p><p className="qo-shape-description">{description}</p></div>
        <OrbitalCanvas angular={angular} showAngular={showAngular} nodes={nodes} showNodes={showNodes} data={data} zoom={zoom} angle={angle} onAngle={setAngle} label={`Anteprima sincronizzata: ${key}, variante ${m}. Trascina per ruotare.`}/>
        <div className="qo-preview-actions"><button type="button" onClick={()=>setAngle(a=>[a[0]+.3,a[1]])}>Ruota</button><button type="button" onClick={()=>{setAngle([.45,.25]);setZoom(1);}}>Ripristina</button><button type="button" ref={expandButton} aria-haspopup="dialog" onClick={()=>largeDialog.current.showModal()}>Ingrandisci</button></div>
        <div className="qo-nodes-control"><label><input type="checkbox" checked={showAngular} onChange={e=>setShowAngular(e.target.checked)}/> Mostra nodi angolari</label><Explanation topic="angular"/></div>{showAngular && <p className="qo-angular-caption">{l===0?'Nessun nodo angolare per gli orbitali s.':'Reticoli viola: superfici nodali angolari.'}</p>}<div className="qo-nodes-control"><label><input type="checkbox" checked={showNodes} onChange={e=>setShowNodes(e.target.checked)}/> Mostra nodi radiali</label><Explanation topic="nodes"/></div>{showNodes && <p className="qo-nodes-caption">{nodes.length?`Reticoli dorati: ${nodes.map(r=>r.toFixed(2)).join(' · ')} a₀ dal nucleo.`:'Nessun nodo radiale per questo orbitale.'}</p>}
        <div className="qo-orbital-context"><p><strong>Guscio {n}:</strong> {n*n} orbitali possibili.</p><p><strong>Sottoguscio {key}:</strong> {2*l+1} {2*l+1===1?'variante':'varianti'}, fino a {2*(2*l+1)} elettroni.</p><p>{shownCount>0?`Il sottoguscio ${key} è occupato in ${shownCount} elementi del modello.`:`${key} è matematicamente ammesso, ma non occupato nelle configurazioni fondamentali del modello.`}</p><p className="qo-atlas-note">Atlante: 140 orbitali nei gusci da 1 a 7. Di questi, 59 appartengono ai sottogusci usati nelle configurazioni del modello.</p></div>
      </aside></div>
    <section className="qo-periodic"><div className="qo-section-title"><div><span className="qo-eyebrow">03 / COLLEGA ALLA CHIMICA</span><h2>Dove compare il sottoguscio {filterKey}?</h2></div><span className="qo-badge">{count} ELEMENTI COMPATIBILI</span></div><p>Tutti gli elementi compatibili sono evidenziati in verde: contengono elettroni in {filterKey}, anche nei gusci interni. La compatibilità dipende da n e ℓ, non da m.</p>
      <div className="qo-legend"><strong>Legenda</strong><span><i className="qo-swatch-lit"/> Compatibile: sottoguscio occupato</span><span><i className="qo-swatch-empty"/> Sottoguscio vuoto</span><span><i className="qo-swatch-selected"/> Elemento aperto nel dettaglio</span></div>
      <p className="qo-match-status" role="status">{count ? <><strong>{count} elementi compatibili con {filterKey}.</strong> Clicca una cella per aprire il dettaglio.</> : <><strong>{filterKey} è un sottoguscio matematicamente ammesso.</strong> Non è occupato nelle configurazioni fondamentali del modello: la tavola senza celle verdi non indica un errore. La funzione d’onda resta esplorabile.</>}</p>
      <p className="qo-element-inspector" aria-live="polite" aria-atomic="true">{inspectedElement ? <><strong>{inspectedElement.name}</strong> · {inspectedElement.config[filterKey]||0} {(inspectedElement.config[filterKey]||0)===1?'elettrone':'elettroni'} nel sottoguscio {filterKey}{inspectedElement.approximate?' · modello semplificato':''}</> : <>Passa su una cella o raggiungila con il tasto Tab per leggere il nome dell’elemento.</>}</p>
      <div className="qo-table-scroll" tabIndex={0} aria-label="Tavola periodica, scorrimento orizzontale"><div className="qo-table">{range(1,18).map(g=><span className="qo-group" key={`g${g}`} style={{gridColumn:g,gridRow:1}}>{g}</span>)}{ELEMENTS.map(e=><button key={e.z} style={{gridColumn:e.col,gridRow:e.row+1}} className={`qo-element ${e.config[filterKey]>0?'qo-lit':'qo-unoccupied'} ${z===e.z?'qo-selected':''}`} aria-pressed={z===e.z} aria-label={`${e.name}, numero atomico ${e.z}, ${e.config[filterKey]>0?'compatibile, ':'non compatibile, '}${e.config[filterKey]||0} elettroni in ${filterKey}${e.approximate?', modello Aufbau semplificato':''}`} title={`${e.name} · Z=${e.z}${e.approximate?' · modello semplificato':''}`} onMouseEnter={()=>setHoveredElement(e.z)} onMouseLeave={()=>setHoveredElement(null)} onFocus={()=>setFocusedElement(e.z)} onBlur={()=>setFocusedElement(null)} onClick={()=>setZ(e.z)}><small>{e.z}</small><strong>{e.symbol}</strong></button>)}<span className="qo-series" style={{gridColumn:'1 / 3',gridRow:10}}>Lantanoidi</span><span className="qo-series" style={{gridColumn:'1 / 3',gridRow:11}}>Attinoidi</span><span className="qo-placeholder" style={{gridColumn:3,gridRow:7}}>57–71</span><span className="qo-placeholder" style={{gridColumn:3,gridRow:8}}>89–103</span></div></div>
      <div className="qo-detail-heading"><h3>Dettaglio dell’elemento scelto</h3>{element && <button onClick={()=>setZ(null)}>Chiudi dettaglio</button>}</div>
      {element ? <><div className="qo-detail" aria-live="polite"><div className="qo-config"><h3>{element.name} · atomo neutro · {z} elettroni</h3><p>{element.approximate?'Modello Aufbau semplificato (Z > 92): possibili eccezioni, non una configurazione fondamentale verificata.':'Configurazione fondamentale · riferimento NIST H–U.'}</p><p className="qo-detail-hint">Esplora un sottoguscio: questi pulsanti aggiornano solo il disegno. Il filtro della tavola resta {filterKey}.</p><div className="qo-config-buttons">{ORDER.filter(k=>element.config[k]>0).map(k=><button className={k===key?'qo-active':''} key={k} onClick={()=>setPreview({n:Number(k[0]),l:LETTERS.indexOf(k[1]),m:0})}>{k}<sup>{element.config[k]}</sup></button>)}</div><p><strong>{element.config[key]||0} elettroni in {key}</strong> / capacità {2*(2*l+1)}. La tavola resta filtrata su {filterKey}.</p></div></div>
      <SpectrumPlayer key={element.z} element={element}/>
      <h3 className="qo-occupancy-title">Elettroni negli orbitali {key}</h3><p className="qo-note">Ogni casella è un orbitale. ↑ indica un elettrone; ↑↓ indica due elettroni con spin opposto, non un movimento. Clicca una casella per visualizzarne la forma.</p>
      <div className="qo-boxes" aria-label={`Schema di Hund del sottoguscio ${key}`} >{range(-l,l).map((v,i)=>{const electrons=element.config[key]||0,k=2*l+1,occupancy=Number(electrons>i)+Number(electrons>k+i);return <div key={v}><button aria-label={`Visualizza ${key}, ${mode==='real'?'variante':'mℓ'} ${v}: ${occupancy} elettroni`} aria-pressed={v===m} className={v===m?'qo-active':''} onClick={()=>setPreview({n,l,m:v})}><span className="qo-spin" aria-hidden="true">{occupancy===2?'↑↓':occupancy===1?'↑':'—'}</span><span className="qo-electron-count">{occupancy} {occupancy===1?'elettrone':'elettroni'}</span><span className="qo-sr"> orbitale {v}</span></button><small>{mode==='real'?'Variante':'mℓ'} {v}</small></div>;})}</div><p className="qo-note">Caselle: schema didattico di Hund. L’ordine delle caselle degeneri è convenzionale; non assegna una posizione o un m misurato ai singoli elettroni.</p></> : <p className="qo-note">Nessun elemento selezionato: la tavola mostra tutti i risultati compatibili. Scegli una cella per consultarne configurazione e caselle elettroniche.</p>}
    </section>
    </section>
    <dialog className="qo-dialog qo-large-dialog" ref={largeDialog} aria-label="Densità di probabilità ingrandita" onClose={()=>expandButton.current?.focus()} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close();}}}>
      <div className="qo-large-close"><button type="button" onClick={()=>largeDialog.current.close()}>Chiudi vista ingrandita ×</button></div>
      <div className="qo-view"><div className="qo-view-title"><div><div className="qo-label-help"><span className="qo-eyebrow">02 / DENSITÀ DI PROBABILITÀ</span><Explanation topic="density"/></div><h2>{key} <small>{mode==='real'?'variante':'mℓ'} = {m}</small></h2></div><span className="qo-badge">|ψ|²</span></div>
      <div className="qo-section-controls"><label><input type="checkbox" checked={showSection} onChange={e=>setShowSection(e.target.checked)}/> Mostra sezione</label><Explanation topic="section"/>{showSection && <label>Piano <select aria-label="Piano della sezione" value={sectionPlane} onChange={e=>setSectionPlane(e.target.value)}><option value="xy">xy</option><option value="xz">xz</option><option value="yz">yz</option></select></label>}</div>
      {showSection ? <DensitySection n={n} l={l} m={m} plane={sectionPlane} extent={data.radius/zoom}/> : <OrbitalCanvas angular={angular} showAngular={showAngular} nodes={nodes} showNodes={showNodes} data={data} zoom={zoom} angle={angle} onAngle={setAngle} label={`Nuvola tridimensionale ${key}, indice ${m}, ${mode==='real'?'orbitale reale':'autostato Lz'}. Nodi radiali: ${n-l-1}. Trascina per ruotare; controlli alternativi sotto.`}/>}

      {!showSection && <><div className="qo-nodes-control"><label><input type="checkbox" checked={showAngular} onChange={e=>setShowAngular(e.target.checked)}/> Mostra nodi angolari</label><Explanation topic="angular"/></div>{showAngular && <p className="qo-angular-caption">{l===0?'Nessun nodo angolare per gli orbitali s.':'Reticoli viola: superfici nodali angolari.'}</p>}<div className="qo-nodes-control"><label><input type="checkbox" checked={showNodes} onChange={e=>setShowNodes(e.target.checked)}/> Mostra nodi radiali</label><Explanation topic="nodes"/></div>{showNodes && <p className="qo-nodes-caption">{nodes.length?`Reticoli dorati: ${nodes.map(r=>r.toFixed(2)).join(' · ')} a₀ dal nucleo.`:'Nessun nodo radiale per questo orbitale.'}</p>}
</>}
      <div className="qo-view-tools">{!showSection && <><span>Trascina per ruotare</span><button onClick={()=>setAngle(a=>[a[0]+.3,a[1]])} aria-label="Ruota orizzontalmente">↔</button><button onClick={()=>setAngle(a=>[a[0],a[1]+.3])} aria-label="Ruota verticalmente">↕</button></>}<button onClick={()=>{if(!showSection)setAngle([.45,.25]);setZoom(1);}}>{showSection?'Ripristina zoom':'Ripristina vista'}</button><label>Zoom <input aria-label="Zoom" type="range" min="0.5" max="2" step="0.05" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label></div>
      {!showSection && <p className="qo-shape-description">{description}</p>}<div className="qo-metrics">{!showSection && <div><strong>{n-l-1}</strong><span className="qo-label-help">nodi radiali <Explanation topic="nodes"/></span></div>}<div><strong>{2*l+1}</strong><span>orbitali nel sottoguscio</span></div><div><strong>{data.radius.toFixed(1)} a₀</strong><span>raggio al 99,5% · scala adattiva</span></div></div>
      <p className="qo-note">La nuvola descrive un singolo elettrone: 10.000 campioni di probabilità, non 10.000 elettroni. Il colore indica la fase di ψ; nella base reale distingue i due segni. Dimensioni in raggi di Bohr per Z = 1.</p>
    </div>
    </dialog>
    <footer className="qo-footer"><p>Le forme sono soluzioni idrogenoidi, non orbitali quantitativi degli atomi selezionati. I gusci g, h e i sono esplorabili anche se non occupati nelle configurazioni qui mostrate.</p><a href="https://dlmf.nist.gov/18.39" target="_blank" rel="noreferrer">Funzioni d’onda · NIST DLMF ↗</a><a href="https://math.nist.gov/DFTdata/atomdata/configuration.html" target="_blank" rel="noreferrer">Configurazioni H–U · NIST ↗</a></footer>
    <footer className="qo-projects-footer"><a href="https://links-page-bennibeni.vercel.app/">← All projects</a><span>Chimica · Atlante quantistico</span></footer>
  </section>;
}
