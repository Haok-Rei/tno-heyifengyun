/** Stable per-window phases survive hover renders; no game clock or random state. */
export function windowLighting(index:number){
  let seed=Math.imul(index+17,0x45d9f3b);seed=Math.imul(seed^(seed>>>16),0x45d9f3b);seed=(seed^(seed>>>16))>>>0;
  const duration=24+seed%21;
  return {duration,delay:-(seed%10007)/10007*duration};
}
