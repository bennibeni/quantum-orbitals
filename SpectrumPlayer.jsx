'use client';
import React,{useEffect,useId,useRef,useState} from 'react';
import {SPECTRA,audioFrequency,spectralColor} from './spectra.js';
export default function SpectrumPlayer({element}){
 const spectrum=SPECTRA[element.z],session=useRef(null),dialog=useRef(null),info=useRef(null),heading=useId();
 const [playing,setPlaying]=useState(false),[volume,setVolume]=useState(.2),[error,setError]=useState('');
 const stop=()=>{const s=session.current;session.current=null;if(s){clearTimeout(s.timer);s.ctx.close().catch(()=>{});}setPlaying(false);};
 useEffect(()=>()=>{const s=session.current;session.current=null;if(s){clearTimeout(s.timer);s.ctx.close().catch(()=>{});}},[]);
 useEffect(()=>{const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
 useEffect(()=>{const s=session.current;if(s?.master)s.master.gain.setTargetAtTime(volume*.5,s.ctx.currentTime,.03);},[volume]);
 const play=async()=>{
  if(session.current){stop();return;}setError('');
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){setError('Audio non supportato da questo browser.');return;}
  let ctx;
  try{ctx=new Audio();const s={ctx};session.current=s;setPlaying(true);await ctx.resume();if(session.current!==s)return;
   const master=ctx.createGain();s.master=master;master.gain.value=volume*.5;master.connect(ctx.destination);
   const envelope=ctx.createGain();envelope.connect(master);const t=ctx.currentTime;envelope.gain.setValueAtTime(0,t);envelope.gain.linearRampToValueAtTime(1,t+.08);envelope.gain.setValueAtTime(1,t+4.7);envelope.gain.linearRampToValueAtTime(0,t+5);
   const sum=spectrum.lines.reduce((a,b)=>a+b.intensity,0);
   for(const line of spectrum.lines){const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=audioFrequency(line.nm);gain.gain.value=line.intensity/sum;osc.connect(gain);gain.connect(envelope);osc.start(t);osc.stop(t+5.05);}
   s.timer=setTimeout(()=>{if(session.current===s)stop();},5150);
  }catch{if(session.current?.ctx===ctx)stop();setError('Impossibile avviare l’audio. Riprova con il pulsante.');}
 };
 if(!spectrum||!spectrum.lines.length)return <div className="qo-spectrum"><p>{!spectrum?`La raccolta NIST Strong Lines importata nell’app non copre ${element.name}. Audio non disponibile in questa versione.`:`Nella tabella NIST consultata per ${element.name} non sono presenti righe utilizzabili dell’atomo neutro tra 380 e 750 nm con intensità numerica positiva.`}</p><p>Questo non significa che non esistano dati spettrali per l’elemento. L’app usa esclusivamente atomi neutri.</p>{spectrum && <a href={spectrum.source} target="_blank" rel="noreferrer">Tabella NIST consultata ↗</a>}</div>;

 const max=Math.max(...spectrum.lines.map(l=>l.intensity));
 return <section className="qo-spectrum" aria-label={'Spettro sonoro di '+element.name}>
 <div className="qo-label-help"><h3>Ascolta lo spettro · {element.name}</h3><button type="button" className="qo-help" ref={info} aria-label="Come funziona la sonificazione" aria-haspopup="dialog" onClick={()=>dialog.current.showModal()}>i</button></div>
 <p>{spectrum.lines.length} righe NIST dell’atomo neutro tra 380 e 750 nm · selezione Strong Lines, non spettro completo.</p>
 <svg viewBox="0 0 800 92" role="img" aria-label={'Righe spettrali selezionate di '+element.name+', da 380 a 750 nanometri'} className="qo-spectrum-strip"><rect x="0" y="0" width="800" height="70" fill="#05080e"/>{spectrum.lines.map(line=><line key={line.nm+'-'+line.reference} x1={10+(line.nm-380)/370*780} x2={10+(line.nm-380)/370*780} y1={65-55*line.intensity/max} y2="65" stroke={spectralColor(line.nm)} strokeWidth="2"><title>{line.nm.toFixed(3)} nm · intensità relativa {line.intensity}</title></line>)}<text x="10" y="88" fill="#a6b8ce" fontSize="13">380 nm</text><text x="730" y="88" fill="#a6b8ce" fontSize="13">750 nm</text></svg>
 <div className="qo-spectrum-actions"><button type="button" onClick={play}>{playing?'Ferma audio':'Ascolta lo spettro'}</button><label>Volume<input aria-label="Volume dello spettro" type="range" min="0" max=".5" step=".01" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label><span role="status">{playing?'In riproduzione · 5 secondi':error||'Audio avviato solo su richiesta'}</span></div>
 <p>Sonificazione delle righe luminose, indipendente dall’orbitale visualizzato. Colori indicativi; altezza delle righe proporzionale all’intensità relativa.</p><a href={spectrum.source} target="_blank" rel="noreferrer">Dati delle righe · NIST ↗</a>
 <dialog ref={dialog} className="qo-dialog" aria-labelledby={heading} onClose={()=>info.current?.focus()}><div className="qo-dialog-head"><h2 id={heading}>Dalla luce al suono</h2><button type="button" aria-label="Chiudi spiegazione audio" onClick={()=>dialog.current.close()}>×</button></div>
 <p>Non è il rumore dell’atomo. Ogni riga luminosa diventa una sinusoide: la frequenza ottica è ridotta di un fattore mille miliardi (10⁻¹²), senza arrotondare alle note di un pianoforte. Le onde sono suonate insieme.</p>
 <p>Usiamo le righe utilizzabili della raccolta NIST Strong Lines tra 380 e 750 nm, con intensità positiva. Sono ammesse solo le specie contrassegnate con I (atomi neutri); II e gli altri stadi di ionizzazione sono esclusi. Le lunghezze d’onda in aria sono convertite approssimativamente con c/λ. L’ampiezza audio è proporzionale all’intensità tabulata e normalizzata sul totale delle righe selezionate.</p>
 <p>Le intensità dipendono dalle condizioni di emissione: questo timbro non è un suono unico universale dell’elemento, né una replica dell’audio ACS. Le righe indicano transizioni energetiche; le tre manopole descrivono invece la forma di un orbitale e non controllano l’audio.</p>
 <p>Ispirazione: <a href="https://www.acs.org/pressroom/headline-science/elements-sounds.html" target="_blank" rel="noreferrer">progetto di W. Walker Smith presentato da ACS</a>.</p><button type="button" className="qo-dialog-close" onClick={()=>dialog.current.close()}>Ho capito</button></dialog>
 </section>;
}
