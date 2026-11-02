import {test} from 'node:test';import assert from 'node:assert/strict';import {index,Node} from '../src/core/graph';import {hierarchy,visible,tidy,radial,spacing,measureText,semanticDepth,ancestors,Tile,bounds} from '../src/core/adaptive';import {fitTiles,focusTiles,pushHistory,screenVisible} from '../src/core/navigation';
function fixture(size:number){const list:Node[]=[];for(let i=0;i<size;i++)list.push({id:String(i),path:i+'.md',title:i%9===0?'计算机科学与技术：长标题测试与操作系统原理 '+i:'知识节点 '+i,relations:i?[{view:'v',parent:String(Math.floor((i-1)/5)),order:i}]:[],links:[]});return index(list,'v');}
const measure=(s:string)=>[...s].reduce((n,c)=>n+(c.charCodeAt(0)>255?14:7),0);
function nonoverlap(nodes:Tile[]){for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height/2<=b.y-b.height/2||b.y+b.height/2<=a.y-a.height/2,`overlap ${a.id}/${b.id}`);}}
for(const size of [50,200,1000])test(size+' nodes: overview and every branch fit without collisions or graph mutation',()=>{const g=fixture(size),before=JSON.stringify([...g.nodes.values()]),h=hierarchy(g,'v'),start=performance.now();const global=radial(visible(g,h,'0',1,8,new Set(),new Set(),measure),spacing);nonoverlap(global);assert.equal(global.length,6);assert.equal(h.counts.get('0'),size-1);for(const child of h.kids.get('0')!){const local=tidy(visible(g,h,child.id,2,5,new Set(),new Set(),measure),spacing);nonoverlap(local);const fit=fitTiles(local,1400,1000);const b=bounds(local);assert.ok(b.x*fit.zoom+fit.x>=39.9);assert.ok((b.x+b.width)*fit.zoom+fit.x<=1360.1);assert.ok(b.y*fit.zoom+fit.y>=39.9);assert.ok((b.y+b.height)*fit.zoom+fit.y<=960.1);assert.ok(fit.zoom>=.35);}assert.equal(JSON.stringify([...g.nodes.values()]),before);console.log(JSON.stringify({nodes:size,layoutMs:Math.round((performance.now()-start)*100)/100,overview:global.length}));});
test('siblings aggregate in presentation only; expansion retains original IDs',()=>{const g=fixture(50),h=hierarchy(g,'v');const out=visible(g,h,'0',1,2,new Set(),new Set(),measure);assert.ok(out.some(n=>n.summary==='0'));const expanded=visible(g,h,'0',1,2,new Set(),new Set(['0']),measure);assert.equal(expanded.length,6);assert.ok(expanded.every(n=>g.nodes.has(n.id)));assert.equal(g.nodes.size,50);});
test('measurement wraps without reducing font; hysteresis avoids threshold jitter',()=>{const size=measureText('长'.repeat(70),measure);assert.ok(size.lines.length>1);assert.ok(size.width<=244);assert.ok(size.height>54);assert.equal(semanticDepth(.8,false),false);assert.equal(semanticDepth(.8,true),true);assert.equal(semanticDepth(.64,true),false);});
test('history is bounded and retains camera, semantic tier and expanded groups',()=>{const item={root:'0',mode:'subtree' as const,camera:{x:50,y:60,zoom:.8},detailed:true,expanded:['a']};let history=[] as typeof item[];for(let i=0;i<50;i++)history=pushHistory(history,item) as typeof item[];assert.equal(history.length,40);assert.deepEqual(history.at(-1),item);const g=fixture(50),h=hierarchy(g,'v');assert.deepEqual(ancestors(h,'6'),['0','1','6']);});
test('viewport culling does not alter layout and collapsed nodes remain navigable',()=>{const g=fixture(200),h=hierarchy(g,'v'),nodes=tidy(visible(g,h,'0',3,5,new Set(['1']),new Set(),measure),spacing);assert.ok(nodes.some(n=>n.id==='1'));assert.ok(!nodes.some(n=>n.id==='6'));assert.ok(nodes.filter(n=>screenVisible(n,{x:0,y:0,zoom:1},400,300)).length<nodes.length);});

for(const size of [50,200,1000])test(size+' complete staggered radial: retains every node and has no overlap',()=>{const g=fixture(size),h=hierarchy(g,'v');const tiles=visible(g,h,'0',Infinity,Infinity,new Set(),new Set(),measure),out=radial(tiles,spacing,true);assert.equal(out.length,size);assert.ok(out.every(n=>!n.summary));nonoverlap(out);for(const n of out)assert.equal(n.parent,g.nodes.get(n.id)?.relations[0]?.parent);const c=fitTiles(out,1400,900,40,.001),b=bounds(out);assert.ok(b.width*c.zoom<=1320.01);assert.ok(b.height*c.zoom<=820.01);});
test('16 primary branches alternate eight short and eight long; descendants extend out',()=>{const list:Node[]=[{id:'r',title:'root',path:'r.md',relations:[],links:[]}];for(let i=0;i<16;i++)list.push({id:'b'+i,title:'branch '+i,path:i+'.md',relations:[{view:'v',parent:'r',order:i}],links:[]});list.push({id:'deep',title:'deep',path:'deep.md',relations:[{view:'v',parent:'b0',order:0}],links:[]});const g=index(list,'v'),h=hierarchy(g,'v'),out=radial(visible(g,h,'r',Infinity,Infinity,new Set(),new Set(),measure),spacing,true),radii=out.filter(n=>n.depth===1).map(n=>Math.round(Math.hypot(n.x+n.width/2,n.y)));assert.equal(new Set(radii).size,2);assert.equal(radii.filter(r=>r===Math.min(...radii)).length,8);const deep=out.find(n=>n.id==='deep')!,parent=out.find(n=>n.id==='b0')!;assert.ok(Math.hypot(deep.x+deep.width/2,deep.y)>Math.hypot(parent.x+parent.width/2,parent.y));});

test('subtree uses relative depth and explicit expansion crosses the depth boundary',()=>{const g=fixture(200),h=hierarchy(g,'v');const base=visible(g,h,'1',1,Infinity,new Set(),new Set(),measure);assert.ok(base.some(n=>n.id==='6'));assert.ok(!base.some(n=>n.id==='31'));const opened=visible(g,h,'1',1,Infinity,new Set(),new Set(['6']),measure);assert.ok(opened.some(n=>n.id==='31'));const deeper=visible(g,h,'6',2,Infinity,new Set(),new Set(),measure);assert.ok(deeper.some(n=>n.id==='31'));assert.ok(deeper.some(n=>n.id==='156'));assert.ok(!deeper.some(n=>n.id==='0'));nonoverlap(radial(deeper,spacing,true));});

test('compact tree uses actual parent width and the configured minimum connector gap',()=>{const g=fixture(200),h=hierarchy(g,'v'),out=tidy(visible(g,h,'0',Infinity,Infinity,new Set(),new Set(),measure),spacing),map=new Map(out.map(n=>[n.id,n]));nonoverlap(out);for(const n of out){if(!n.parent)continue;const parent=map.get(n.parent)!;assert.equal(n.x>=parent.x?n.x-(parent.x+parent.width):parent.x-(n.x+n.width),spacing.level);}const oldGap=64;assert.ok(spacing.level<oldGap);});

test('non-layered adapter handles 12000-depth chain without recursive overflow',()=>{const nodes:Tile[]=[];for(let i=0;i<12000;i++)nodes.push({id:String(i),parent:i?String(i-1):undefined,x:0,y:0,width:96,height:54,depth:i,lines:['n'],count:0});const out=tidy(nodes,spacing);assert.equal(out.length,12000);assert.ok(Number.isFinite(out[11999].x));assert.equal(out[11999].y,0);});

import {flexLayout} from '../src/core/flex-layout';
test('variable-size non-layered tree is mirrored when child order is reversed',()=>{const g=fixture(50),h=hierarchy(g,'v'),input=visible(g,h,'0',Infinity,Infinity,new Set(),new Set(),measure),original=JSON.stringify(input),forward=flexLayout(input,spacing),reverse=flexLayout([input[0],...input.slice(1).reverse()],spacing),map=new Map(reverse.map(n=>[n.id,n]));for(const n of forward){const other=map.get(n.id)!;assert.ok(Math.abs(n.y+other.y)<1e-7);assert.equal(n.x,other.x);}assert.equal(JSON.stringify(input),original);nonoverlap(forward);nonoverlap(reverse);});


test('local focus centres the clicked card and fits asymmetric extents with padding',()=>{
 const nodes:Tile[]=[{id:'root',x:-60,y:0,width:120,height:54,depth:0,lines:['root'],count:2},
 {id:'wide',parent:'root',x:160,y:-90,width:240,height:74,depth:1,lines:['wide'],count:0},
 {id:'lower',parent:'root',x:150,y:160,width:96,height:54,depth:1,lines:['lower'],count:0}];
 for(const [width,height] of [[1188,820],[390,700],[700,390]]){
  const c=focusTiles(nodes,'root',width,height),b=bounds(nodes),root=nodes[0];
  assert.ok(Math.abs((root.x+root.width/2)*c.zoom+c.x-width/2)<1e-8);
  assert.ok(Math.abs(root.y*c.zoom+c.y-height/2)<1e-8);
  assert.ok(b.x*c.zoom+c.x>=39.99&&b.y*c.zoom+c.y>=39.99);
  assert.ok((b.x+b.width)*c.zoom+c.x<=width-39.99&&(b.y+b.height)*c.zoom+c.y<=height-39.99);
  assert.ok(c.zoom>=.001&&c.zoom<=1.25);
 }
 assert.deepEqual(focusTiles(nodes,'missing',900,600),fitTiles(nodes,900,600,40,.001));
});

test('584 nodes / 16 subjects: recursive local expansion excludes global sector inflation',()=>{
 const list:Node[]=[];for(let i=0;i<584;i++)list.push({id:String(i),path:i+'.md',title:'知识笔记 '+i,
  relations:i?[{view:'v',parent:i<=16?'0':String(1+Math.floor((i-17)/5)),order:i}]:[],links:[]});
 const g=index(list,'v'),before=JSON.stringify([...g.nodes.values()]),h=hierarchy(g,'v');
 for(const id of ['1','17','97']){
  const data=visible(g,h,id,1,Infinity,new Set(),new Set([id]),measure),local=radial(data,spacing,true);
  assert.equal(local.length,6);assert.equal(local[0].id,id);assert.equal(local[0].depth,0);
  assert.ok(!local.some(n=>n.id==='0'));nonoverlap(local);
  const independent=index(list.filter(n=>data.some(tile=>tile.id===n.id)),'v'),ih=hierarchy(independent,'v');
  assert.deepEqual(radial(visible(independent,ih,id,1,Infinity,new Set(),new Set([id]),measure),spacing,true).map(({x,y})=>({x,y})),local.map(({x,y})=>({x,y})));
  const c=focusTiles(local,id,1188,820),root=local[0];
  assert.ok(Math.abs((root.x+root.width/2)*c.zoom+c.x-594)<1e-7);
  assert.ok(c.zoom>.6,'Five-child local view must retain a readable scale');
  for(const child of local.slice(1))assert.ok(Math.hypot(child.x+child.width/2-root.x-root.width/2,child.y-root.y)<400);
 }
 assert.equal(JSON.stringify([...g.nodes.values()]),before);
});
