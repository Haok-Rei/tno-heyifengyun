"""Make clearly labelled dossier silhouettes for advisors without source portraits."""

from pathlib import Path
from html import escape

output = Path('src/assets/portraits')
output.mkdir(parents=True, exist_ok=True)

cards = {
    'jidi-partner': ('李竞凯', '及第资本合伙人', '#a78555'),
    'jidi-investor': ('方田', '小企业投资人', '#a07954'),
    'jidi-manager': ('刘守强', '日立管理学专家', '#7d928d'),
    'jidi-analyst': ('盛为民', '首席数据分析师', '#688a91'),
}

for filename, (name, title, accent) in cards.items():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640">
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#29302e"/><stop offset="1" stop-color="#0b1012"/></linearGradient>
<pattern id="scan" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0h6" stroke="#d4b98a" stroke-opacity=".07"/></pattern></defs>
<rect width="480" height="640" fill="url(#bg)"/><rect width="480" height="640" fill="url(#scan)"/>
<path d="M24 24h432v592H24z" fill="none" stroke="{accent}" stroke-width="4"/>
<path d="M36 36h408v568H36z" fill="none" stroke="#d5c6a1" stroke-opacity=".25"/>
<path d="M88 456c4-99 45-136 98-149 16 17 34 26 54 26s38-9 54-26c53 13 94 50 98 149z" fill="#070c0d" stroke="{accent}" stroke-opacity=".65" stroke-width="3"/>
<ellipse cx="240" cy="202" rx="89" ry="108" fill="#070c0d" stroke="{accent}" stroke-opacity=".65" stroke-width="3"/>
<path d="M60 73h72M348 73h72M60 488h360" stroke="{accent}" stroke-width="3"/>
<text x="240" y="535" text-anchor="middle" fill="#e4d4b5" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="34" font-weight="700">{escape(name)}</text>
<text x="240" y="567" text-anchor="middle" fill="{accent}" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="18">{escape(title)}</text>
<text x="240" y="590" text-anchor="middle" fill="#83918d" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="12" letter-spacing="3">档案照未公开</text>
</svg>'''
    (output / f'{filename}.svg').write_text(svg, encoding='utf-8')
