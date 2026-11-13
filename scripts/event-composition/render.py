"""Render each feature from separate layers at the actual event-frame size."""
from pathlib import Path
from functools import lru_cache
import json
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[2]
RECIPES = json.loads(Path(__file__).with_name('plates.json').read_text('utf8'))
LANCZOS = Image.Resampling.LANCZOS

@lru_cache(maxsize=20)
def subject_image(path):
    with Image.open(ROOT / path) as source:
        image = source.convert('RGBA')
    return image.crop(image.getchannel('A').getbbox())

def compose(key, size):
    row = RECIPES[key]
    width, height = size
    with Image.open(ROOT / 'src/assets/loading' / (row['scene'] + '.webp')) as original:
        # A slight optical zoom lets repeated locations retain event-specific framing.
        crop = ImageOps.fit(original.convert('RGB'), size, LANCZOS,
                            bleed=.025 + .08 * row['anchor'], centering=(row['anchor'], .47))
    canvas = crop.convert('RGBA')
    portrait = row['portrait']
    obj = subject_image(row['subject']).copy()
    bounds = (.46 * width, .91 * height) if portrait else (.115 * width, .155 * height)
    ratio = min(bounds[0]/obj.width, bounds[1]/obj.height)
    obj = obj.resize((max(1,round(obj.width*ratio)), max(1,round(obj.height*ratio))), LANCZOS)
    margin = round(width*(.035 if portrait else .023))
    x = width - obj.width - margin
    y = height - obj.height - (0 if portrait else round(height*.04))
    shadow = Image.new('L', size)
    shadow.paste(obj.getchannel('A'), (x-round(height*.009), y+round(height*.009)))
    shade = Image.new('RGBA', size, '#10131b')
    shade.putalpha(shadow.filter(ImageFilter.GaussianBlur(max(1,height*(.018 if portrait else .007)))).point(lambda a:round(.78*a)))
    canvas.alpha_composite(shade)
    canvas.alpha_composite(obj,(x,y))
    return canvas.convert('RGB')

if __name__ == '__main__':
    for key in RECIPES:
        compose(key,(780,440)).save(ROOT/'src/assets/event-features'/(key+'.webp'),quality=87,method=4)
