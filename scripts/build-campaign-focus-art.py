"""Rebuild the Dark Crossroads focus crests from bundled high-resolution masters."""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ART = Path(__file__).resolve().parents[1] / 'src/assets/route-art-v2'
SIZE = (400, 352)
SCALE = Image.Resampling.LANCZOS
REAL = 'spirit-realism/'
MOTIF = 'masters/component/'
OBJECT = 'masters/v1/'
PAINTED = 'refresh-20261108/'

# Background, main silhouette and optional supporting prop.
CRESTS = {
    'phase1_jidi_deal': ('corporate', MOTIF+'C_corporate', REAL+'Briefcase'),
    'phase1_faculty_rift': ('school', MOTIF+'C_study', PAINTED+'S_scales'),
    'phase1_yang_studio': ('study', OBJECT+'M_study_desk', None),
    'phase1_october_exam': ('study', REAL+'S_exam', PAINTED+'S_clock'),
    'phase1_red_toad_cell': ('red', OBJECT+'M_red_toad', None),
    'committee_b3_fortification': ('red', OBJECT+'M_campus_fortress', REAL+'Barbed Wire'),
    'committee_student_charter': ('democracy', MOTIF+'C_democracy', None),
    'committee_logistics_grid': ('coalition', MOTIF+'C_haobang', REAL+'S_coin'),
    'committee_counter_infiltration': ('red', MOTIF+'C_security', REAL+'Padlock'),
    'committee_exam_question': ('study', REAL+'S_book', PAINTED+'S_exam'),
    'committee_external_siege': ('coalition', REAL+'Barbed Wire', 'spirit-materials/F_campus'),
    'despair_ration_water': ('despair', MOTIF+'C_study', REAL+'S_clock'),
    'despair_smuggle_zhouchen': ('despair', REAL+'Briefcase', 'spirit-materials/F_welfare'),
    'despair_burn_records': ('despair', OBJECT+'M_torch_quill', REAL+'S_exam'),
    'despair_red_toad_signal': ('red', REAL+'S_toad', PAINTED+'S_radio'),
    'despair_parents_cry': ('despair', OBJECT+'M_collective_hands', PAINTED+'S_radio'),
    'despair_rooftop_broadcast': ('despair', REAL+'S_radio', REAL+'Moon'),
    'despair_reclaim_campus': ('despair', REAL+'F_campus', PAINTED+'S_torch'),
    'wu_guard_academy': ('military', REAL+'S_shield', MOTIF+'C_military'),
    'wu_broadcast_discipline': ('military', PAINTED+'S_radio', PAINTED+'S_projector'),
    'wu_exam_blacklist': ('school', PAINTED+'S_exam', REAL+'Padlock'),
    'wu_jidi_security_contract': ('corporate', REAL+'S_handshake', REAL+'S_coin'),
    'wu_feng_curriculum_cage': ('school', MOTIF+'C_school', REAL+'S_book'),
    'wu_feng_student_cadres': ('school', 'spirit-materials/F_guard', PAINTED+'S_ballot'),
    'wu_feng_silenced_memorial': ('school', 'spirit-materials/F_campus', REAL+'Padlock'),
    'wu_spring_whistleblower': ('democracy', MOTIF+'C_coalition', REAL+'S_exam'),
    'wu_spring_midnight_talk': ('democracy', PAINTED+'S_handshake', REAL+'Moon'),
    'wu_coup_secret_loyalty': ('security', MOTIF+'C_military', PAINTED+'S_coin'),
    'wu_coup_wiretap_office': ('security', PAINTED+'S_projector', REAL+'S_radio'),
}

def layer(source, box, contrast=1.0):
    with Image.open(ART / (source + '.png')) as im:
        rgba = im.convert('RGBA')
    alpha = rgba.getchannel('A')
    bounds = alpha.point(lambda value: 255 if value >= 40 else 0).getbbox()
    assert bounds, source
    rgba = rgba.crop(bounds)
    # The foreground must already be large enough before resampling.
    assert rgba.width >= 280 and rgba.height >= 220, (source, rgba.size)
    rgba = ImageOps.contain(rgba, box, SCALE)
    tones = ImageEnhance.Contrast(rgba.convert('RGB')).enhance(contrast)
    tones.putalpha(rgba.getchannel('A'))
    return tones

def place(canvas, obj, anchor, shadow=True):
    x = round(anchor[0] - obj.width / 2)
    y = round(anchor[1] - obj.height / 2)
    if shadow:
        alpha = Image.new('L', SIZE)
        alpha.paste(obj.getchannel('A'), (x, y + 5))
        dark = Image.new('RGBA', SIZE, (12, 10, 12))
        dark.putalpha(alpha.filter(ImageFilter.GaussianBlur(6)).point(lambda a: round(a * .80)))
        canvas.alpha_composite(dark)
    canvas.alpha_composite(obj, (x, y))

def compose(backing, primary, accent):
    canvas = Image.new('RGBA', SIZE)
    shield = layer(f'masters/backgrounds/{backing}', (365, 304))
    place(canvas, shield, (200, 181), shadow=False)
    obj = layer(primary, (312, 265), contrast=1.08)
    solid = obj.getchannel('A').point(lambda a: 255 if a >= 128 else 0).histogram()[255]
    assert solid > 22_000, (primary, solid)
    place(canvas, obj, (192 if accent else 200, 157))
    if accent:
        detail = layer(accent, (132, 110), contrast=1.07)
        place(canvas, detail, (282, 224))
    return canvas

if __name__ == '__main__':
    for focus, recipe in CRESTS.items():
        compose(*recipe).save(ART / 'icons' / f'heyi_v961_{focus}.png', optimize=True)
    print(f'Rebuilt {len(CRESTS)} focus crests.')
