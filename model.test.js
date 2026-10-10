import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cloud, configuration, ELEMENTS, LETTERS, radial} from './model.js';
test('118 elementi: conservazione elettroni, capienza e celle distinte',()=>{
  assert.equal(ELEMENTS.length,118);const cells=new Set();
  for(const e of ELEMENTS){assert.equal(Object.values(e.config).reduce((a,b)=>a+b,0),e.z);for(const [key,value] of Object.entries(e.config))assert.ok(value>=0&&value<=2*(2*LETTERS.indexOf(key[1])+1));cells.add(`${e.row},${e.col}`);}
  assert.equal(cells.size,118);assert.equal(configuration(24)['3d'],5);assert.equal(configuration(46)['5s'],0);assert.equal(configuration(92)['5f'],3);
});
test('1s: r medio = 1.5 a0; 2s: nodo radiale a 2 a0',()=>{
  const {points}=cloud(1,0,0,'complex',30000);const mean=points.reduce((s,p)=>s+Math.hypot(p.x,p.y,p.z),0)/points.length;
  assert.ok(Math.abs(mean-1.5)<.03);assert.equal(radial(2,0,2),0);
});
test('p reali: orientamento x/y, stati complessi ±m con densità uguale',()=>{
  const variance=points=>points.reduce((s,p)=>[s[0]+p.x*p.x,s[1]+p.y*p.y,s[2]+p.z*p.z],[0,0,0]);
  const x=variance(cloud(2,1,1,'real').points),y=variance(cloud(2,1,-1,'real').points);
  assert.ok(x[0]>2.5*x[1]);assert.ok(y[1]>2.5*y[0]);
  const plus=cloud(3,2,1),minus=cloud(3,2,-1);for(let i=0;i<100;i++){assert.equal(plus.points[i].x,minus.points[i].x);assert.equal(plus.points[i].z,minus.points[i].z);}
});
test('Tutti i 140 stati: campioni finiti, anche g/h/i',()=>{
  let states=0;for(let n=1;n<=7;n++)for(let l=0;l<n;l++)for(let m=-l;m<=l;m++){states++;for(const mode of ['real','complex']){const data=cloud(n,l,m,mode,32);assert.ok(data.radius>0);assert.ok(data.points.every(p=>Object.values(p).every(Number.isFinite)));}}
  assert.equal(states,140);assert.throws(()=>cloud(2,2,0),RangeError);
});
