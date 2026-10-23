"""Export approved ending CG originals. No compositional edits or colour shifts."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageOps

root=Path(__file__).resolve().parents[2]
source=root/'art/结局CG-2026-10-23'
output=root/'src/assets/endings'
output.mkdir(parents=True,exist_ok=True)
receipts=[]
for original in sorted(source.glob('*.png')):
    image=ImageOps.exif_transpose(Image.open(original)).convert('RGB')
    image.thumbnail((1920,1080),Image.Resampling.LANCZOS)
    target=output/(original.stem+'.webp')
    image.save(target,'WEBP',quality=91,method=6)
    receipts.append({'id':original.stem,'source':original.relative_to(root).as_posix(),'sha256':hashlib.sha256(original.read_bytes()).hexdigest(),'output':target.relative_to(root).as_posix(),'width':image.width,'height':image.height,'bytes':target.stat().st_size})
(source/'exports.json').write_text(json.dumps(receipts,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(receipts)} ending scenes exported, {sum(item["bytes"] for item in receipts):,} bytes.')
