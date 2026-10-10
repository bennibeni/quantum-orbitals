export const LETTERS = 'spdfghi';
const symbols = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
const names = 'Idrogeno Elio Litio Berillio Boro Carbonio Azoto Ossigeno Fluoro Neon Sodio Magnesio Alluminio Silicio Fosforo Zolfo Cloro Argon Potassio Calcio Scandio Titanio Vanadio Cromo Manganese Ferro Cobalto Nichel Rame Zinco Gallio Germanio Arsenico Selenio Bromo Kripton Rubidio Stronzio Ittrio Zirconio Niobio Molibdeno Tecnezio Rutenio Rodio Palladio Argento Cadmio Indio Stagno Antimonio Tellurio Iodio Xenon Cesio Bario Lantanio Cerio Praseodimio Neodimio Promezio Samario Europio Gadolinio Terbio Disprosio Olmio Erbio Tulio Itterbio Lutezio Afnio Tantalio Tungsteno Renio Osmio Iridio Platino Oro Mercurio Tallio Piombo Bismuto Polonio Astato Radon Francio Radio Attinio Torio Protoattinio Uranio Nettunio Plutonio Americio Curio Berkelio Californio Einsteinio Fermio Mendelevio Nobelio Laurenzio Rutherfordio Dubnio Seaborgio Bohrio Hassio Meitnerio Darmstadtio Roentgenio Copernicio Nihonio Flerovio Moscovio Livermorio Tennesso Oganesson'.split(' ');
export const ORDER = ['1s','2s','2p','3s','3p','4s','3d','4p','5s','4d','5p','6s','4f','5d','6p','7s','5f','6d','7p'];
// Neutral ground configurations H–U: NIST DFT reference table. Beyond U:
// deliberately labelled as a simplified Aufbau model, not experimental data.
const exceptions = {24:{'3d':5,'4s':1},29:{'3d':10,'4s':1},41:{'4d':4,'5s':1},42:{'4d':5,'5s':1},44:{'4d':7,'5s':1},45:{'4d':8,'5s':1},46:{'4d':10,'5s':0},47:{'4d':10,'5s':1},57:{'4f':0,'5d':1},58:{'4f':1,'5d':1},64:{'4f':7,'5d':1},78:{'5d':9,'6s':1},79:{'5d':10,'6s':1},89:{'5f':0,'6d':1},90:{'5f':0,'6d':2},91:{'5f':2,'6d':1},92:{'5f':3,'6d':1}};
export function configuration(z) {
  let left=z; const result={};
  for(const key of ORDER){const cap=2*(2*LETTERS.indexOf(key[1])+1); result[key]=Math.min(left,cap); left-=result[key];}
  return {...result,...exceptions[z]};
}
export const ELEMENTS=symbols.map((symbol,i)=>{
  const z=i+1; let row,col;
  if(z===1){row=1;col=1;} else if(z===2){row=1;col=18;}
  else if(z<=18){row=z<=10?2:3;const offset=z-(row===2?3:11);col=offset<2?offset+1:offset+11;}
  else if(z<=54){row=z<=36?4:5;col=z-(row===4?18:36);}
  else if(z>=57&&z<=71){row=9;col=z-54;}
  else if(z>=89&&z<=103){row=10;col=z-86;}
  else {row=z<=86?6:7;const start=row===6?54:86;col=z-start; if(col>2)col-=14;}
  return {z,symbol,name:names[i],row,col,config:configuration(z),approximate:z>92};
});
export function laguerre(k,a,x){let prev=1;if(k===0)return prev;let cur=1+a-x;for(let j=2;j<=k;j++){const next=((2*j-1+a-x)*cur-(j-1+a)*prev)/j;prev=cur;cur=next;}return cur;}
export function legendre(l,m,x){let p=1;for(let j=1;j<=m;j++)p*=-(2*j-1)*Math.sqrt(Math.max(0,1-x*x));if(l===m)return p;let q=x*(2*m+1)*p;if(l===m+1)return q;for(let j=m+2;j<=l;j++){const next=((2*j-1)*x*q-(j+m-1)*p)/(j-m);p=q;q=next;}return q;}
export function radial(n,l,r){const rho=2*r/n;return Math.exp(-rho/2)*rho**l*laguerre(n-l-1,2*l+1,rho);}
function distribution(fn,min,max,size=4096){const step=(max-min)/size;const cdf=new Float64Array(size);let sum=0;for(let i=0;i<size;i++){sum+=fn(min+(i+.5)*step);cdf[i]=sum;}return u=>{const target=u*sum;let lo=0,hi=size-1;while(lo<hi){const mid=(lo+hi)>>1;if(cdf[mid]<target)lo=mid+1;else hi=mid;}const previous=lo?cdf[lo-1]:0;const frac=(target-previous)/(cdf[lo]-previous||1);return min+(lo+frac)*step;};}
export function cloud(n,l,m,mode='complex',count=10000){
  if(!Number.isInteger(n)||n<1||n>7||!Number.isInteger(l)||l<0||l>=n||!Number.isInteger(m)||Math.abs(m)>l)throw new RangeError('Numeri quantici non validi');
  let seed=314159;const random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return(seed+.5)/4294967296;};
  const a=Math.abs(m),extent=4*n*n+12*n;
  const sampleR=distribution(r=>r*r*radial(n,l,r)**2,0,extent);
  const sampleU=distribution(u=>legendre(l,a,u)**2,-1,1);
  const angular=phi=>m===0?1:m>0?Math.cos(a*phi):Math.sin(a*phi);
  const samplePhi=mode==='real'&&m!==0?distribution(p=>angular(p)**2,0,2*Math.PI):u=>u*2*Math.PI;
  const points=[];
  for(let i=0;i<count;i++){const r=sampleR(random()),u=sampleU(random()),phi=samplePhi(random()),s=Math.sqrt(1-u*u);const amp=radial(n,l,r)*legendre(l,a,u);points.push({x:r*s*Math.cos(phi),y:r*s*Math.sin(phi),z:r*u,phase:mode==='real'?(amp*angular(phi)<0?Math.PI:0):m*phi+(amp<0?Math.PI:0)});}
  return {points,radius:sampleR(.995)};
}

// Positive zeros of the radial Laguerre factor, in Bohr radii (Z = 1).
export function radialNodes(n,l) {
  const k=n-l-1;if(k===0)return [];
  const f=r=>laguerre(k,2*l+1,2*r/n),roots=[];
  const limit=4*n*n+12*n,step=limit/8192;
  let left=0,fl=f(left);
  for(let i=1;i<=8192&&roots.length<k;i++){
    const right=i*step,fr=f(right);
    if(fl*fr<0||fr===0){let a=left,b=right,fa=fl;for(let j=0;j<48;j++){const mid=(a+b)/2,fm=f(mid);if(fa*fm<=0)b=mid;else{a=mid;fa=fm;}}roots.push((a+b)/2);}
    left=right;fl=fr;
  }
  return roots;
}

// Interior zeros in cos(theta); endpoints (the z axis) are not surfaces.
export function angularNodes(l,m,mode='real') {
  const a=Math.abs(m),cones=[],planes=[],steps=4096;
  let left=-1+1e-8,fl=legendre(l,a,left);
  for(let i=1;i<=steps;i++){
    const right=-1+1e-8+(2-2e-8)*i/steps,fr=legendre(l,a,right);
    if(fl*fr<0||fr===0){let lo=left,hi=right,fa=fl;for(let j=0;j<45;j++){const mid=(lo+hi)/2,fm=legendre(l,a,mid);if(fa*fm<=0)hi=mid;else{lo=mid;fa=fm;}}cones.push((lo+hi)/2);}
    left=right;fl=fr;
  }
  if(mode==='real'&&a>0)for(let j=0;j<a;j++)planes.push((m>0?Math.PI/2:0)/a+j*Math.PI/a);
  return {cones,planes};
}

// Relative |psi|² on a plane through the nucleus; no radial Jacobian.
export function densitySection(n,l,m,mode,plane,extent,size=241){
  const values=new Float64Array(size*size);let max=0;
  for(let j=0;j<size;j++)for(let i=0;i<size;i++){
    const a=(i/(size-1)*2-1)*extent,b=(1-j/(size-1)*2)*extent;
    const [x,y,z]=plane==='xy'?[a,b,0]:plane==='xz'?[a,0,b]:[0,a,b];
    const r=Math.hypot(x,y,z),u=r?z/r:0,phi=Math.atan2(y,x);
    let angular=legendre(l,Math.abs(m),u);
    if(mode==='real'&&m!==0){let f=m>0?Math.cos(m*phi):Math.sin(Math.abs(m)*phi);if(Math.abs(f)<1e-14)f=0;angular*=f;}
    const value=(radial(n,l,r)*angular)**2;
    values[j*size+i]=value;max=Math.max(max,value);
  }
  return {values,max,size};
}
