import type {Tile,Spacing} from './adaptive';
/** Translate whole subtrees toward their parent. Swept rectangle constraints stop a move
 * before any label collision; source coordinates and relationships are never mutated. */
export function compactClusters(input:Tile[],s:Spacing):Tile[]{
 if(input.length<2)return input.map(n=>({...n}));const nodes=input.map(n=>({...n})),map=new Map(nodes.map(n=>[n.id,n])),kids=new Map<string,Tile[]>();for(const n of nodes)if(n.parent){const list=kids.get(n.parent)??[];list.push(n);kids.set(n.parent,list);}
 const order:Tile[]=[],stack=[{node:nodes[0],depth:0}];let depth=0;while(stack.length){const item=stack.pop()!;depth=Math.max(depth,item.depth);order.push(item.node);for(const child of kids.get(item.node.id)??[])stack.push({node:child,depth:item.depth+1});}if(depth>64||nodes.length>2000)return nodes;
 const descendants=new Map<string,Tile[]>();for(const n of [...order].reverse())descendants.set(n.id,[n,...(kids.get(n.id)??[]).flatMap(c=>descendants.get(c.id)!)]);
 const gap=Math.max(6,s.node),axis=(delta:number,lower:number,upper:number):[number,number]=>Math.abs(delta)<1e-9?(lower<0&&upper>0?[-Infinity,Infinity]:[Infinity,-Infinity]):[Math.min(lower/delta,upper/delta),Math.max(lower/delta,upper/delta)];
 for(let pass=0;pass<3;pass++){let moved=false;for(const node of [...order].reverse()){if(!node.parent)continue;const parent=map.get(node.parent)!;const dx=parent.x+parent.width/2-node.x-node.width/2,dy=parent.y-node.y,length=Math.hypot(dx,dy);if(length<1e-8)continue;const ux=-dx/length,uy=-dy/length;const target=Math.min(Math.abs(ux)>1e-9?((parent.width+node.width)/2+gap)/Math.abs(ux):Infinity,Math.abs(uy)>1e-9?((parent.height+node.height)/2+gap)/Math.abs(uy):Infinity);const ratio=Math.max(0,1-target/length);if(ratio<1e-6)continue;const branch=descendants.get(node.id)!,members=new Set(branch.map(n=>n.id));
 const proposals=[{x:dx*ratio,y:dy*ratio}];if(nodes.length<=200){const theta=Math.atan2(-dy,-dx);for(const turn of [-Math.PI/6,Math.PI/6]){const x=Math.cos(theta+turn),y=Math.sin(theta+turn),r=Math.min(Math.abs(x)>1e-9?((parent.width+node.width)/2+gap)/Math.abs(x):Infinity,Math.abs(y)>1e-9?((parent.height+node.height)/2+gap)/Math.abs(y):Infinity);if(r<length)proposals.push({x:dx+x*r,y:dy+y*r});}}
 let best={x:0,y:0},bestLength=length;
 for(const proposal of proposals){const mx=proposal.x,my=proposal.y;let limit=1;
 for(const a of branch){const sx0=a.x+Math.min(0,mx),sx1=a.x+a.width+Math.max(0,mx),sy0=a.y-a.height/2+Math.min(0,my),sy1=a.y+a.height/2+Math.max(0,my);
 for(const b of nodes){if(members.has(b.id)||sx1+gap<=b.x||sx0-gap>=b.x+b.width||sy1+gap<=b.y-b.height/2||sy0-gap>=b.y+b.height/2)continue;
 const x=axis(mx,b.x-a.x-a.width-gap,b.x+b.width-a.x+gap),y=axis(my,b.y-b.height/2-a.y-a.height/2-gap,b.y+b.height/2-a.y+a.height/2+gap),enter=Math.max(x[0],y[0]),exit=Math.min(x[1],y[1]);if(enter<exit&&exit>1e-8&&enter>=-1e-7)limit=Math.min(limit,Math.max(0,enter-1e-6));}}
 const nextLength=Math.hypot(dx-mx*limit,dy-my*limit);if(limit>1e-5&&nextLength<bestLength-.001){best={x:mx*limit,y:my*limit};bestLength=nextLength;}}
 if(bestLength<length-.001){for(const n of branch){n.x+=best.x;n.y+=best.y;}moved=true;}}

 if(!moved)break;}
 return nodes;
}
