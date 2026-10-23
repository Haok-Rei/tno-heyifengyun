// Local Vite review entry; not imported by the campaign or production entry.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FocusArt } from '../components/StrategicArt';
import { ROUTE_FOCUS_ART, ROUTE_BACKDROP_ART } from '../config/routeIconArtwork';
import '../components/strategicArt.css';

function Review() {
  const [route, setRoute] = useState('all');
  const all = Object.entries(ROUTE_FOCUS_ART).filter(([, a]) => a.important);
  const selected = all.filter(([, a]) => route === 'all' || a.route === route);
  return <main style={{maxWidth:1200,margin:'auto',padding:24}}>
    <h1 style={{color:'#dfc58d',fontSize:24}}>合一风云 · 重要国策美术</h1>
    <p style={{color:'#9eb7bc'}}>33 张开始、转折与结算图标 · 使用游戏实际图标组件与卡片尺寸</p>
    <nav style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:24}}>
      <button onClick={()=>setRoute('all')}>全部（33）</button>
      {Object.entries(ROUTE_BACKDROP_ART).map(([id,a])=><button key={id} onClick={()=>setRoute(id)} aria-pressed={route===id}>{a.label.replace(/底座$/,'')}</button>)}
    </nav>
    <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, 184px)',gap:16}}>
      {selected.map(([id,a])=><article key={id} style={{padding:9,border:'1px solid #43545a',background:'#202d31'}}>
        <div className="focus-art-node focus-art-node--available" style={{position:'relative'}} aria-label={a.label}>
          <FocusArt node={{id,title:a.label}}/>
          <div className="focus-art-node__title">{a.label}</div>
        </div>
        <p style={{fontSize:11,color:'#9baeb4',overflowWrap:'anywhere',marginBottom:0}}>{id}</p>
      </article>)}
    </section>
  </main>;
}
document.body.style.cssText='margin:0;background:#101b21;color:#d9ddd6;font-family:"Microsoft YaHei",sans-serif';
const style=document.createElement('style');style.textContent='*{box-sizing:border-box}button{cursor:pointer;color:#cdd7d5;background:#26373e;border:1px solid #5b6e6c;padding:7px 10px}button[aria-pressed=true]{border-color:#e4c47f;color:#f1d89f}';document.head.append(style);
createRoot(document.getElementById('root')!).render(<Review/>);
