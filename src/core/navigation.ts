import {Tile,bounds} from './adaptive';
import {Camera} from './viewport';
export type Mode='global'|'subtree'|'focus';
export interface Observation {root:string;mode:Mode;camera:Camera;detailed?:boolean;expanded?:string[];layout?:'radial'|'tree'}
export function fitTiles(nodes:Tile[],width:number,height:number,padding=40,minZoom=.35):Camera {const b=bounds(nodes);const zoom=Math.max(minZoom,Math.min(1.25,(width-2*padding)/Math.max(1,b.width),(height-2*padding)/Math.max(1,b.height)));return {zoom,x:width/2-(b.x+b.width/2)*zoom,y:height/2-(b.y+b.height/2)*zoom};}
export function centerTile(node:Tile,width:number,height:number):Camera{return {zoom:1,x:width/2-node.x-node.width/2,y:height/2-node.y};}
/** Fit a local observation around its root, rather than the centre of the whole map.
 * Symmetric extents keep the clicked card centred even for asymmetric branches. */
export function focusTiles(nodes:Tile[],id:string,width:number,height:number,padding=40):Camera {
 const node=nodes.find(n=>n.id===id);if(!node)return fitTiles(nodes,width,height,padding,.001);
 const b=bounds(nodes),cx=node.x+node.width/2,cy=node.y;
 const halfWidth=Math.max(cx-b.x,b.x+b.width-cx,1),halfHeight=Math.max(cy-b.y,b.y+b.height-cy,1);
 const zoom=Math.max(.001,Math.min(1.25,Math.max(1,width-2*padding)/(2*halfWidth),Math.max(1,height-2*padding)/(2*halfHeight)));
 return {zoom,x:width/2-cx*zoom,y:height/2-cy*zoom};
}
export function screenVisible(n:Tile,c:Camera,width:number,height:number,margin=160){return (n.x+n.width)*c.zoom+c.x>=-margin&&n.x*c.zoom+c.x<=width+margin&&(n.y+n.height/2)*c.zoom+c.y>=-margin&&(n.y-n.height/2)*c.zoom+c.y<=height+margin;}
export function pushHistory(history:Observation[],next:Observation):Observation[]{return [...history,next].slice(-40);}
