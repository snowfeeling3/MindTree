import {Graph,Node,children} from '../src/core/graph';
export interface Spacing {node:number;branch:number;level:number;padding:number}
export const spacing:Spacing={node:10,branch:18,level:24,padding:40};
export interface Tile {id:string;node?:Node;parent?:string;x:number;y:number;width:number;height:number;lines:string[];count:number;summary?:string;depth:number}
export interface Hierarchy {kids:Map<string,Node[]>;parent:Map<string,string>;counts:Map<string,number>}
export function hierarchy(g:Graph,view:string):Hierarchy {const kids=children(g,view),parent=new Map<string,string>(),counts=new Map<string,number>();for(const [id,list] of kids)for(const n of list)parent.set(n.id,id);const order:string[]=[],seen=new Set<string>();for(const id of g.nodes.keys()){if(seen.has(id))continue;const stack=[id];while(stack.length){const at=stack.pop()!;if(seen.has(at))continue;seen.add(at);order.push(at);for(const n of kids.get(at)??[])stack.push(n.id);}}// count via child-first work queue, independent of input order
 const pending=new Map<string,number>(),queue:string[]=[];for(const id of g.nodes.keys()){pending.set(id,kids.get(id)?.length??0);if(!pending.get(id))queue.push(id);counts.set(id,0);}for(let i=0;i<queue.length;i++){const id=queue[i],p=parent.get(id);if(p){counts.set(p,(counts.get(p)??0)+1+(counts.get(id)??0));pending.set(p,(pending.get(p)??1)-1);if(!pending.get(p))queue.push(p);}}return {kids,parent,counts};}
export function ancestors(h:Hierarchy,id:string):string[]{const route:string[]=[],seen=new Set<string>();let at:string|undefined=id;while(at&&!seen.has(at)){seen.add(at);route.unshift(at);at=h.parent.get(at);}return route;}
export type Measure=(s:string)=>number;
export function measureText(text:string,measure:Measure):{width:number;height:number;lines:string[]}{const lines:string[]=[];let line='';for(const char of text){if(line&&measure(line+char)>220){lines.push(line);line=char;}else line+=char;}if(line||!lines.length)lines.push(line);return {width:Math.max(96,Math.min(244,Math.max(...lines.map(measure))+24)),height:Math.max(54,lines.length*20+34),lines};}
export function visible(g:Graph,h:Hierarchy,root:string,depth:number,limit:number,collapsed:Set<string>,expanded:Set<string>,measure:Measure):Tile[]{if(!g.nodes.has(root)||g.blocked.has(root))return [];const out:Tile[]=[],stack=[{id:root,depth:0,parent:undefined as string|undefined}],seen=new Set<string>();while(stack.length){const item=stack.pop()!;if(seen.has(item.id))continue;seen.add(item.id);const node=g.nodes.get(item.id)!;out.push({...item,node,x:0,y:0,...measureText(node.title,measure),count:h.counts.get(item.id)??0});if(collapsed.has(item.id)||(item.depth>=depth&&!expanded.has(item.id)))continue;const kids=h.kids.get(item.id)??[],take=expanded.has(item.id)?kids.length:limit;const shown=kids.slice(0,take);if(kids.length>take)out.push({id:'@summary:'+item.id,parent:item.id,summary:item.id,x:0,y:0,width:170,height:54,lines:[String(kids.length-take)],count:kids.length-take,depth:item.depth+1});for(const child of [...shown].reverse())stack.push({id:child.id,parent:item.id,depth:item.depth+1});}return out;}
/** Compact variable-width tree: pack each sibling subtree against actual occupied rectangles,
 * not a whole-depth column or accumulated empty subtree rectangles. */
export function tidy(input:Tile[],s:Spacing):Tile[]{
 if(!input.length)return [];const kids=new Map<string,Tile[]>();for(const n of input)if(n.parent){const list=kids.get(n.parent)??[];list.push(n);kids.set(n.parent,list);}
 const order:Tile[]=[],stack=[input[0]];while(stack.length){const n=stack.pop()!;order.push(n);stack.push(...(kids.get(n.id)??[]));}
 const packed=new Map<string,Tile[]>();for(const parent of [...order].reverse()){const list=kids.get(parent.id)??[];const placed:Tile[]=[],childRoots:number[]=[];
 for(const child of list){const subtree=packed.get(child.id)!;const dx=parent.width+s.level;let dy=0;
 for(const a of placed)for(const b of subtree){if(a.x+a.width<=b.x+dx||b.x+dx+b.width<=a.x)continue;const gap=a.parent===b.parent?s.node:Math.max(s.node,s.branch);dy=Math.max(dy,a.y+a.height/2+gap-(b.y-b.height/2));}
 childRoots.push(dy);placed.push(...subtree.map(n=>({...n,x:n.x+dx,y:n.y+dy})));packed.delete(child.id);}
 const center=childRoots.length?(childRoots[0]+childRoots[childRoots.length-1])/2:0;
 packed.set(parent.id,[{...parent,x:0,y:0},...placed.map(n=>({...n,y:n.y-center}))]);}
 return packed.get(input[0].id)!;
}
/** Angular sectors follow visible leaf weights; alternating radii give short/long primary branches.
 * Only colliding labels advance along their ray; no global dilation. */
export function radial(input:Tile[],s:Spacing,staggered=false):Tile[]{
 if(input.length<2)return input.map(n=>({...n,x:-n.width/2,y:0}));
 const root=input[0],kids=new Map<string,Tile[]>();for(const n of input)if(n.parent){const list=kids.get(n.parent)??[];list.push(n);kids.set(n.parent,list);}
 const order:Tile[]=[],stack=[root];while(stack.length){const n=stack.pop()!;order.push(n);stack.push(...(kids.get(n.id)??[]));}
 const weight=new Map<string,number>();for(const n of [...order].reverse())weight.set(n.id,Math.max(1,(kids.get(n.id)??[]).reduce((sum,c)=>sum+weight.get(c.id)!,0)));
 const primary=kids.get(root.id)??[],ringCount=Math.max(2,staggered?Math.ceil(primary.length/2):primary.length),diameter=Math.max(Math.hypot(root.width,root.height),...primary.map(n=>Math.hypot(n.width,n.height)));
 const unit=Math.max(180,s.level+156,(diameter+s.node)/(2*Math.sin(Math.PI/ringCount)));
 const sectors=new Map<string,{start:number;end:number;offset:number}>([[root.id,{start:-Math.PI/2,end:Math.PI*1.5,offset:0}]]),radii=new Map<string,number>(),out:Tile[]=[];
 const interval=(direction:number,center:number,half:number):[number,number]=>Math.abs(direction)<1e-9?(Math.abs(center)<half?[-Infinity,Infinity]:[Infinity,-Infinity]):[Math.min((center-half)/direction,(center+half)/direction),Math.max((center-half)/direction,(center+half)/direction)];
 // Breadth-first placement: retain the primary skeleton, move only a colliding label outward.
 const walk=[root];for(let at=0;at<walk.length;at++){const n=walk[at],sector=sectors.get(n.id)!,angle=(sector.start+sector.end)/2,ux=Math.cos(angle),uy=Math.sin(angle);let radius=n.depth===0?0:(n.depth+sector.offset)*unit;
 if(n.parent){const parent=input.find(p=>p.id===n.parent)!;radius=Math.max(radius,(radii.get(n.parent)??0)+(Math.hypot(parent.width,parent.height)+Math.hypot(n.width,n.height))/2+s.level);}
 const occupied:[number,number][]=[];for(const previous of out){const x=interval(ux,previous.x+previous.width/2,(previous.width+n.width)/2+s.node),y=interval(uy,previous.y,(previous.height+n.height)/2+s.node);const lo=Math.max(x[0],y[0]),hi=Math.min(x[1],y[1]);if(lo<=hi)occupied.push([lo,hi]);}
 occupied.sort((a,b)=>a[0]-b[0]);for(const [lo,hi] of occupied){if(radius<lo)break;if(radius<=hi)radius=hi+.01;}
 radii.set(n.id,radius);out.push({...n,x:ux*radius-n.width/2,y:uy*radius});const list=kids.get(n.id)??[],sum=list.reduce((v,c)=>v+weight.get(c.id)!,0);let cursor=sector.start;list.forEach((c,i)=>{const span=(sector.end-sector.start)*weight.get(c.id)!/sum;sectors.set(c.id,{start:cursor,end:cursor+span,offset:sector.offset+(staggered&&i%2?.8:0)});cursor+=span;});walk.push(...list);
 }
 return out;
}
export function bounds(nodes:Tile[]){let x=Infinity,y=Infinity,right=-Infinity,bottom=-Infinity;for(const n of nodes){x=Math.min(x,n.x);y=Math.min(y,n.y-n.height/2);right=Math.max(right,n.x+n.width);bottom=Math.max(bottom,n.y+n.height/2);}return nodes.length?{x,y,width:right-x,height:bottom-y}:{x:0,y:0,width:1,height:1};}
export function semanticDepth(zoom:number,detailed:boolean):boolean{return detailed?zoom>=.65:zoom>.9;}
