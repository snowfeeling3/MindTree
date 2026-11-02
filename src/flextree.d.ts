declare module 'd3-flextree' {
 export interface FlexNode<D> {data:D;x:number;y:number;parent:FlexNode<D>|null;children?:FlexNode<D>[];descendants():FlexNode<D>[]}
 export interface FlexLayout<D> { (node:FlexNode<D>):FlexNode<D>;nodeSize(fn:(node:FlexNode<D>)=>[number,number]):FlexLayout<D>;spacing(fn:(a:FlexNode<D>,b:FlexNode<D>)=>number):FlexLayout<D>;hierarchy(data:D):FlexNode<D> }
 export function flextree<D>():FlexLayout<D>;
}
