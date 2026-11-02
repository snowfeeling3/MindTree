export interface Relation {view:string; parent:string; order:number}
export interface Node {id:string; path:string; title:string; relations:Relation[]; links:string[]}
export interface Graph {root?:string;nodes:Map<string,Node>; issues:string[]; blocked:Set<string>}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function parse(raw:unknown,path:string):Node|null {
 if(raw===undefined)return null;
 if(!object(raw)||raw.schema!==1||typeof raw.id!=='string'||!raw.id.trim())throw Error('Invalid schema / 数据格式无效: '+path);
 const relations:Relation[]=[];const views=new Set<string>();
 if(raw.relations!==undefined&&!Array.isArray(raw.relations))throw Error('Invalid relations: '+path);
 for(const r of raw.relations??[]){if(!object(r)||typeof r.view!=='string'||!r.view.trim()||typeof r.parent!=='string'||!r.parent.trim()||typeof r.order!=='number'||!Number.isFinite(r.order)||views.has(r.view))throw Error('Invalid parent / 父级无效: '+path);views.add(r.view);relations.push({view:r.view,parent:r.parent,order:r.order});}
 if(raw.links!==undefined&&(!Array.isArray(raw.links)||raw.links.some(x=>typeof x!=='string')))throw Error('Invalid links: '+path);
 return {id:raw.id,path,title:path.split('/').pop()!.replace(/\.md$/i,''),relations,links:[...new Set<string>(raw.links as string[]??[])]};
}
export function index(input:Node[],activeView?:string):Graph {
 const nodes=new Map<string,Node>(),issues:string[]=[],blocked=new Set<string>();
 for(const n of input){if(nodes.has(n.id)){blocked.add(n.id);issues.push('Duplicate ID / 重复 ID: '+n.id);}else nodes.set(n.id,n);}
 const views=new Set(input.flatMap(n=>n.relations.map(r=>r.view)));
 for(const view of views){if(activeView&&view!==activeView)continue;const done=new Set<string>();for(const n of nodes.values()){if(done.has(n.id))continue;const route:string[]=[],seen=new Map<string,number>();let id:string|undefined=n.id;
 while(id&&nodes.has(id)&&!done.has(id)){if(seen.has(id)){const cycle=route.slice(seen.get(id));cycle.forEach(x=>blocked.add(x));issues.push('Hierarchy cycle / 层级循环: '+view+' '+cycle.join(' → '));break;}seen.set(id,route.length);route.push(id);const r:Relation|undefined=nodes.get(id)!.relations.find(r=>r.view===view);if(r&&!nodes.has(r.parent))issues.push('Missing parent / 父级缺失: '+nodes.get(id)!.path);id=r?.parent;}route.forEach(x=>done.add(x));}}
 for(const n of nodes.values())for(const id of n.links)if(!nodes.has(id))issues.push('Missing link / 关联缺失: '+n.path+' → '+id);
 return {nodes,issues,blocked};
}
export function children(g:Graph,view:string):Map<string,Node[]> {
 const map=new Map<string,Node[]>();for(const n of g.nodes.values()){if(g.blocked.has(n.id))continue;const r=n.relations.find(r=>r.view===view);if(r&&!g.blocked.has(r.parent)){const list=map.get(r.parent)??[];list.push(n);map.set(r.parent,list);}}
 for(const list of map.values())list.sort((a,b)=>a.relations.find(r=>r.view===view)!.order-b.relations.find(r=>r.view===view)!.order||a.id.localeCompare(b.id));return map;
}
export function canMove(g:Graph,id:string,parent:string,view:string):boolean {
 if(!g.nodes.has(id)||!g.nodes.has(parent)||g.blocked.has(id)||g.blocked.has(parent))return false;
 const seen=new Set<string>();let at:string|undefined=parent;while(at){if(at===id||seen.has(at))return false;seen.add(at);at=g.nodes.get(at)?.relations.find(r=>r.view===view)?.parent;}return true;
}
export interface Positioned {node:Node;x:number;y:number;parent?:string;hasChildren:boolean}
export function layout(g:Graph,root:string,view:string,collapsed:Set<string>):Positioned[]{
 if(!g.nodes.has(root)||g.blocked.has(root))return [];const map=children(g,view),order:{id:string;depth:number;parent?:string}[]=[],stack=[{id:root,depth:0,parent:undefined as string|undefined}],seen=new Set<string>();
 while(stack.length){const item=stack.pop()!;if(seen.has(item.id))continue;seen.add(item.id);order.push(item);if(!collapsed.has(item.id))for(const n of [...(map.get(item.id)??[])].reverse())stack.push({id:n.id,depth:item.depth+1,parent:item.id});}
 const heights=new Map<string,number>();for(const item of [...order].reverse()){const cs=collapsed.has(item.id)?[]:map.get(item.id)??[];heights.set(item.id,Math.max(72,cs.reduce((s,n)=>s+(heights.get(n.id)??72),0)));}
 const tops=new Map<string,number>([[root,0]]);return order.map(item=>{const top=tops.get(item.id)??0;let next=top;if(!collapsed.has(item.id))for(const n of map.get(item.id)??[]){tops.set(n.id,next);next+=heights.get(n.id)??72;}return {node:g.nodes.get(item.id)!,x:item.depth*260,y:top+(heights.get(item.id)??72)/2,parent:item.parent,hasChildren:!!map.get(item.id)?.length};});
}
export function safeName(name:string):string {const clean=name.replace(/[<>:"/\\|?*\x00-\x1f]/g,' ').replace(/[. ]+$/g,'').trim().slice(0,100);return !clean||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(clean)?'Untitled':clean;}
