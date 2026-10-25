/** Engraved projector badge; all strokes stay readable at the menu's small size. */
export default function PromoVideoButton({onClick}:{onClick:()=>void}) {
  return <button type="button" className="start-pv-trigger" aria-label="观看PV：向合一奔去" title="观看PV《向合一奔去》" onClick={onClick} aria-haspopup="dialog">
    <svg viewBox="0 0 80 64" aria-hidden="true" focusable="false">
      <defs><linearGradient id="pv-badge-metal" x2=".4" y2="1"><stop stopColor="#ead5a2"/><stop offset=".46" stopColor="#9b8352"/><stop offset="1" stopColor="#4e4937"/></linearGradient></defs>
      <path d="M13 51Q4 34 15 18m52 33q9-17-2-33M12 44l-5-5m6-4-5-5m7-4-4-5m57 23 5-5m-6-4 5-5m-7-4 4-5" fill="none" stroke="#baa66d" strokeWidth="1.6"/>
      <path d="M20 19h36v30H20Z M56 25l13-6v31l-13-7Z M27 53h24l7 6H20Z" fill="#151e1f" stroke="url(#pv-badge-metal)" strokeWidth="2"/>
      <circle cx="28" cy="16" r="11" fill="#1d2727" stroke="url(#pv-badge-metal)" strokeWidth="2"/><circle cx="49" cy="15" r="10" fill="#1d2727" stroke="url(#pv-badge-metal)" strokeWidth="2"/>
      {[20,28,36].map((x,i)=><circle key={x} cx={x} cy={i===1?9:18} r="2" fill="#a39771"/>)}
      <path d="M45 10h7m-10 6h5m5 3h5M24 27h28v17H24Z" stroke="#9ba691" fill="none" strokeWidth="1.2"/>
      <path className="pv-badge-play" d="M34 30l11 6-11 6Z" fill="#abd4d0"/>
      <path d="M15 55l9 6h33l9-6" fill="none" stroke="#82754c"/>
    </svg>
    <span><small>向合一奔去</small><strong>观看PV</strong></span><i aria-hidden="true">V2</i>
  </button>;
}
