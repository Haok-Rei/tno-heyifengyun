type Kind = 'assembly' | 'reform' | 'capital' | 'council';

/** Small engraved header plate; decorative and excluded from input/hit testing. */
export default function MechanicCrest({kind}:{kind:Kind}) {
  return <svg className={'mechanic-crest mechanic-crest--'+kind} viewBox="0 0 72 72" aria-hidden="true" focusable="false">
    <path d="M18 5H54L67 18V54L54 67H18L5 54V18Z" fill="#0a1114" stroke="currentColor" strokeWidth=".8"/>
    <path d="M20 9H52L63 20V52L52 63H20L9 52V20Z" fill="none" stroke="currentColor" opacity=".35" strokeWidth=".6"/>
    <path d="M14 52Q6 36 17 19M58 52Q66 36 55 19M14 43l-4-4m4-3-3-5m5-3-2-5m44 20 4-4m-4-3 3-5m-5-3 2-5" stroke="currentColor" strokeWidth=".8" fill="none"/>
    <g stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinejoin="round">
      {kind==='assembly'?<><path d="M19 43a17 17 0 0 1 34 0M23 43a13 13 0 0 1 26 0M27 43a9 9 0 0 1 18 0M31 48h10v6H31Z"/>{Array.from({length:11},(_,i)=>{const a=Math.PI*i/10;return <path key={i} d={`M${36+17*Math.cos(a)} ${43-17*Math.sin(a)}l${Math.cos(a)*4} ${-Math.sin(a)*4}`}/>})}</>:null}
      {kind==='reform'?<><path d="M20 24l16-4 16 4v26l-16-4-16 4ZM36 20v26M24 29l8-2m-8 7 8-2m-8 7 8-2m8-8 8 2m-8 3 8 2m-8 3 8 2M18 54h36"/><path d="M30 14h12m-6-3v6"/></>:null}
      {kind==='capital'?<><path d="M20 51V23h32v28M25 27h5v5h-5Zm17 0h5v5h-5ZM25 37h5v5h-5Zm17 0h5v5h-5ZM33 43h6v8M17 54h38M29 16h14v7H29Z"/><path d="M36 12v4m-4 3h8"/></>:null}
      {kind==='council'?<><path d="M19 42h34l-4 8H23ZM36 15l3 9 10 1-8 6 2 10-7-5-7 5 2-10-8-6 10-1Z"/><path d="M24 54h24m-19 3h14"/></>:null}
    </g>
    <path d="M26 60h20" stroke="currentColor" strokeWidth=".5"/>
  </svg>;
}
