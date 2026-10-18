/** Etched roof plans; existing region colors, labels and hit targets stay intact. */
export default function MapEngraving({x,y,w,h,stadium=false}:{x:number;y:number;w:number;h:number;stadium?:boolean}) {
 if(w<45||h<35)return null;
 return <g pointerEvents="none" aria-hidden="true" stroke="#c4c6ad" fill="none" opacity=".25" strokeWidth=".55">
  {stadium?<><rect x={x+8} y={y+8} width={w-16} height={h-23} rx={(w-16)/2}/><rect x={x+12} y={y+12} width={w-24} height={h-31} rx={(w-24)/2}/><path d={`M${x+16} ${y+h*.45}h${w-32}M${x+w/2} ${y+12}v${h-31}`}/></>:<>
   <path d={`M${x+3} ${y+12}V${y+3}H${x+w-3}V${y+12}M${x+4} ${y+h-14}h${w-8}`}/>
   {Array.from({length:Math.max(2,Math.floor(w/17))},(_,i)=><path key={i} d={`M${x+9+i*17} ${y+4}v6m0 ${h-27}v5`}/>)}
   <path d={`M${x+4} ${y+15}v${Math.max(0,h-39)}m${w-8} 0V${y+15}`}/>
   <rect x={x+w-19} y={y+5} width="11" height="5" strokeWidth=".4"/>
  </>}
 </g>;
}
