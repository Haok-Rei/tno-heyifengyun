import type { FocusNode } from '../types';

/** Keep authored columns aligned; add space only where enlarged crests would touch. */
export function getFocusLayout(nodes:Pick<FocusNode,'id'|'x'|'y'>[]) {
  const columns=[...new Set(nodes.map(node=>node.x))].sort((a,b)=>a-b);
  const constraints=new Map<number,Set<number>>();
  for(const left of nodes)for(const right of nodes) {
    if(left.x<right.x&&Math.abs(left.y-right.y)*1.6<156) {
      const from=constraints.get(right.x)??new Set();from.add(left.x);constraints.set(right.x,from);
    }
  }
  const positions=new Map<number,number>();
  columns.forEach((x,i)=>{
    let position=96+x-(columns[0]??0);
    if(i)position=Math.max(position,positions.get(columns[i-1])!+x-columns[i-1]);
    for(const previous of constraints.get(x)??[])position=Math.max(position,positions.get(previous)!+200);
    positions.set(x,position);
  });
  return {x:(node:Pick<FocusNode,'x'>)=>positions.get(node.x)??96,y:(node:Pick<FocusNode,'y'>)=>Math.round(node.y*1.6)};
}
