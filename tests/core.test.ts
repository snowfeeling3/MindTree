import {test} from 'node:test';import assert from 'node:assert/strict';
import {parse,index,layout,canMove,safeName,children,Node} from '../src/core/graph';import {inRepositories,normalizeFolder} from '../src/core/collections';
const n=(id:string,parent?:string,view='v'):Node=>({id,path:id+'.md',title:id,relations:parent?[{view,parent,order:1}]:[],links:[]});
test('strict schema and absent metadata',()=>{assert.equal(parse(undefined,'x'),null);for(const v of [{},{schema:2,id:'x'},{schema:1,id:'x',relations:[{view:'v',parent:'p',order:NaN}]}])assert.throws(()=>parse(v,'x'));assert.equal(parse({schema:1,id:'x'},'folder/a.md')?.title,'a');});
test('duplicate IDs quarantine and cycles are diagnosed',()=>{const g=index([n('a','b'),n('b','a'),n('d'),n('d')]);assert.equal(g.blocked.size,3);assert.equal(layout(g,'a','v',new Set()).length,0);});
test('dangling parent and links remain diagnostics',()=>{const a=n('a','missing');a.links=['lost'];assert.equal(index([a]).issues.length,2);});
test('moving rejects self descendant and unknown destinations',()=>{const g=index([n('a'),n('b','a'),n('c','b')]);assert.equal(canMove(g,'a','c','v'),false);assert.equal(canMove(g,'b','b','v'),false);assert.equal(canMove(g,'b','z','v'),false);assert.equal(canMove(g,'c','a','v'),true);});
test('multi-view hierarchy is independent',()=>{const a=n('a');a.relations=[{view:'other',parent:'b',order:1}];const g=index([a,n('b','a')]);assert.equal(g.blocked.size,0);assert.equal(layout(g,'a','v',new Set()).length,2);assert.equal(layout(g,'a','other',new Set()).length,1);});
test('layout stable order, collapse, and distinct siblings',()=>{const g=index([n('r'),n('b','r'),n('a','r')]);const out=layout(g,'r','v',new Set());assert.deepEqual(out.map(p=>p.node.id),['r','a','b']);assert.notEqual(out[1].y,out[2].y);assert.equal(layout(g,'r','v',new Set(['r'])).length,1);assert.equal(children(g,'v').get('r')?.length,2);});
test('deep chain is iterative',()=>{const nodes=[n('0')];for(let i=1;i<12000;i++)nodes.push(n(String(i),String(i-1)));const g=index(nodes);assert.equal(layout(g,'0','v',new Set()).length,12000);});
test('safe names and repository boundary matching',()=>{assert.equal(safeName('CON'),'Untitled');assert.equal(safeName('a/b'),'a b');assert.equal(inRepositories('Notes/a.md',['Notes']),true);assert.equal(inRepositories('Notes2/a.md',['Notes']),false);assert.equal(inRepositories('any.md',['']),true);assert.equal(normalizeFolder('Notes\\AI/'),'Notes/AI');assert.throws(()=>normalizeFolder('../private'));});

test('cycles in another series do not quarantine the active series',()=>{const a=n('a');a.relations=[{view:'other',parent:'b',order:1}];const b=n('b','a');b.relations.push({view:'other',parent:'a',order:1});assert.equal(index([a,b],'v').blocked.size,0);assert.equal(index([a,b],'other').blocked.size,2);});

import {zoomAt,anchor,fit,transformLayout} from '../src/core/viewport';
test('zoom preserves cursor world coordinate including limits',()=>{const c={x:71,y:-24,zoom:.6};for(const z of [.01,.9,8]){const next=zoomAt(c,z,450,310);assert.ok(Math.abs((450-next.x)/next.zoom-(450-c.x)/c.zoom)<1e-9);assert.ok(Math.abs((310-next.y)/next.zoom-(310-c.y)/c.zoom)<1e-9);}});
test('relayout preserves selected node screen position',()=>{const c={x:55,y:40,zoom:.7},a={x:260,y:600},b={x:-260,y:120};const next=anchor(c,a,b);assert.equal(next.x+b.x*next.zoom,c.x+a.x*c.zoom);assert.equal(next.y+b.y*next.zoom,c.y+a.y*c.zoom);});
test('layout modes retain topology and support both directions',()=>{const g=index([n('r'),n('a','r'),n('b','r'),n('c','a')]);const original=layout(g,'r','v',new Set());const branch=transformLayout(original,'branches');assert.ok(branch.some(p=>p.x<0));assert.ok(branch.some(p=>p.x>0));assert.equal(branch.find(p=>p.node.id==='c')?.parent,'a');assert.notDeepEqual(transformLayout(original,'vertical'),original);const camera=fit(branch,900,600);assert.ok(camera.zoom>0);for(const point of branch)assert.ok(Number.isFinite(camera.x+point.x*camera.zoom));});

import {parseSettings} from '../src/core/collections';
test('settings reject corrupt collections, duplicate series and unsafe folders before migration',()=>{
 assert.equal(parseSettings(null).series.length,0);
 for(const value of [[],{series:null},{series:[null]},{language:'xx'},{series:[{id:'a',name:'A',root:'',repositories:[],collapsed:[],folder:'../private'}]}])assert.throws(()=>parseSettings(value));
 const series={id:'a',name:'A',root:'',repositories:[],collapsed:[],folder:'Notes'};
 assert.equal(parseSettings({series:[series]}).series[0].folder,'Notes');assert.throws(()=>parseSettings({series:[series,series]}));
});
