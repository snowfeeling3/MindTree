import {flextree} from 'd3-flextree';
import type {Tile,Spacing} from './adaptive';
interface Entry {tile:Tile;children:Entry[]}
/** Iterative safety path for very deep trees; no recursive library traversal. */
function deepLayout(input:Tile[],kids:Map<string,Tile[]>,s:Spacing):Tile[]{
 const order:Tile[]=[],stack=[input[0]];while(stack.length){const n=stack.pop()!;order.push(n);stack.push(...[...(kids.get(n.id)??[])].reverse());}
 const heights=new Map<string,number>();for(const n of [...order].reverse()){const children=kids.get(n.id)??[];heights.set(n.id,Math.max(n.height,children.reduce((v,c)=>v+heights.get(c.id)!,0)+Math.max(0,children.length-1)*Math.max(s.node,s.branch)));}
 const starts=new Map([[input[0].id,{x:0,y:0}]]);return order.map(n=>{const start=starts.get(n.id)!;let top=start.y;for(const c of kids.get(n.id)??[]){starts.set(c.id,{x:start.x+n.width+s.level,y:top});top+=heights.get(c.id)!+Math.max(s.node,s.branch);}return {...n,x:start.x,y:start.y+heights.get(n.id)!/2-heights.get(input[0].id)!/2};});
}
export function flexLayout(input:Tile[],s:Spacing):Tile[]{
 if(!input.length)return [];const entries=new Map(input.map(tile=>[tile.id,{tile,children:[]} as Entry])),kids=new Map<string,Tile[]>();
 for(const n of input)if(n.parent&&entries.has(n.parent)){entries.get(n.parent)!.children.push(entries.get(n.id)!);const list=kids.get(n.parent)??[];list.push(n);kids.set(n.parent,list);}
 // Actual traversal depth, not display metadata, determines recursion safety.
 let maxDepth=0;const stack=[{node:entries.get(input[0].id)!,depth:0}];while(stack.length){const {node,depth}=stack.pop()!;maxDepth=Math.max(maxDepth,depth);for(const c of node.children)stack.push({node:c,depth:depth+1});}
 if(maxDepth>256)return deepLayout(input,kids,s);
 const algorithm=flextree<Entry>().nodeSize(node=>[node.data.tile.height+s.node,node.data.tile.width+s.level]).spacing((a,b)=>a.parent===b.parent?0:Math.max(0,s.branch-s.node));
 const root=algorithm.hierarchy(entries.get(input[0].id)!);algorithm(root);
 return root.descendants().map(n=>({...n.data.tile,x:n.y,y:n.x}));
}

/** Root-level two-sided mindmap. Each side remains an ordered non-layered tree.
 * Greedy height balancing bounds the dominant leaf column without changing relations. */
export function balancedLayout(input:Tile[],s:Spacing):Tile[]{
 if(input.length<2)return flexLayout(input,s);const root=input[0],map=new Map(input.map(n=>[n.id,n])),kids=new Map<string,Tile[]>();for(const n of input)if(n.parent){const list=kids.get(n.parent)??[];list.push(n);kids.set(n.parent,list);}
 const branches=kids.get(root.id)??[];if(branches.length<3)return flexLayout(input,s);
 const groups:{ids:Set<string>;height:number}[]=[{ids:new Set([root.id]),height:0},{ids:new Set([root.id]),height:0}];
 for(const branch of branches){const subtree:Tile[]=[],stack=[branch];while(stack.length){const n=stack.pop()!;subtree.push({...n,parent:n.id===branch.id?undefined:n.parent});stack.push(...(kids.get(n.id)??[]));}const laid=subtree.length===1?subtree:flexLayout(subtree,s);let top=Infinity,bottom=-Infinity;for(const n of laid){top=Math.min(top,n.y-n.height/2);bottom=Math.max(bottom,n.y+n.height/2);}const group=groups[0].height<=groups[1].height?groups[0]:groups[1];for(const n of subtree)group.ids.add(n.id);group.height+=bottom-top+s.branch;}
 const right=flexLayout(input.filter(n=>groups[0].ids.has(n.id)),s),left=flexLayout(input.filter(n=>groups[1].ids.has(n.id)),s);
 return [...right,...left.filter(n=>n.id!==root.id).map(n=>({...n,x:root.width-n.x-n.width}))];
}

function quality(nodes:Tile[]){const map=new Map(nodes.map(n=>[n.id,n]));let length=0,top=Infinity,bottom=-Infinity,left=Infinity,right=-Infinity;for(const n of nodes){left=Math.min(left,n.x);right=Math.max(right,n.x+n.width);top=Math.min(top,n.y-n.height/2);bottom=Math.max(bottom,n.y+n.height/2);const parent=n.parent?map.get(n.parent):undefined;if(parent){const gap=n.x>=parent.x?n.x-parent.x-parent.width:parent.x-n.x-n.width;length+=Math.hypot(gap,n.y-parent.y);}}return {length,height:bottom-top,area:(right-left)*(bottom-top)};}
/** Accept two-sided placement only when chord cost improves, height shrinks and area growth is bounded. */
export function adaptiveTreeLayout(input:Tile[],s:Spacing):Tile[]{
 const right=flexLayout(input,s);if(input.filter(n=>n.parent===input[0]?.id).length<3)return right;
 const both=balancedLayout(input,s),a=quality(right),b=quality(both);
 return b.length<a.length&&b.height<a.height&&b.area<=a.area*1.15?both:right;
}
