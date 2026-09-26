"""Give story focuses and national spirits distinct HOI4 component artwork.

Run from the repository root after adding or changing focus nodes. The original
Ultimate-HOI4-GFX-master files remain untouched. The generated manifest is
used by StrategicArt.tsx; only assigned PNGs are copied into the game bundle.
"""

import hashlib
import json
import re
import shutil
from pathlib import Path


ROOT = Path.cwd()
PIECES = ROOT / 'Ultimate-HOI4-GFX-master' / 'Focus & National Spirits Pieces'
OUTPUT = ROOT / 'src/assets/hoi4/expanded'
MANIFEST = ROOT / 'src/config/artAssignments.json'
URL_CATALOG = ROOT / 'src/config/expandedArtwork.ts'

focus_text = (ROOT / 'src/components/FocusTree.tsx').read_text(encoding='utf-8')
focuses = dict(re.findall(r"\bid:\s*'([^']+)'\s*,\s*title:\s*'([^']+)'", focus_text))
spirits = {}
for path in (ROOT / 'src').rglob('*.ts*'):
    text = path.read_text(encoding='utf-8')
    # A spirit is a named object with an explicit positive/negative/neutral type.
    # Merely scanning id/name pairs also collected map locations and law options.
    pattern = r"\bid:\s*'([^']+)'\s*,\s*name:\s*'([^']+)'(?:(?!\bid:).){0,700}?\btype:\s*'(?:positive|negative|neutral)'"
    for key, name in re.findall(pattern, text, re.DOTALL):
        spirits.setdefault(key, name)

excluded = re.compile(
    r'^(?:Africa|Aircraft|Anchor|Arab|Baltic|Battleship|BeNeLux|Benito|Biplane|Britain|British|Canada|Carrier|'
    r'Cavalry|Charles|Chiang|Coptic|Crete|Cyprus|Czecho|Eagle|Elephant|Finland|George|Hong Kong|Horthy|'
    r'India|Iran|Japan|Julius|King|Lincoln|Man Mexican|Maurice|Mexico|Napoleon|Naval|Officer Middle Eastern|'
    r'Otto|Parachute|Pilot Dog|Qing|Quebec|Samurai|Ship|Shinto|Submarine|Tank|Texas|Torpedo|Trumpet|'
    r'Ukranian|Uncle Sam|USA|Winston|Yugoslav|Zmaj|Adrien|Arc d|Big Ben|Hakenkreuz|Schutzstaffel|'
    r'Wehrmacht|Fascist|Fasces|Hat Nazi|Helmet Germany|Stalin Bust|Soviet Union|Fourth International)',
    re.IGNORECASE,
)
available = {p.stem: p for p in PIECES.glob('*.png') if not excluded.search(p.stem)}

# Curated pools keep the automatically assigned piece close to the story theme.
themes = {
    'study': ['Book', 'Book Open', 'Paper', 'Paper Sign', 'Paper Torn', 'Hand Writing', 'Brain', 'Bell', 'Documents', 'Documents Classified', 'Magnifying Glass', 'Idea Icon', 'Chess Pieces', 'Lightbulb Broken', 'Clock', 'Vial'],
    'authority': ['Capitol', 'Capitol2', 'Constitution', 'Big Brother', 'Citizen', 'Citizen2', 'Citizen3', 'Briefcase', 'Briefcase2', 'Officer', 'Keys', 'Wall', 'Pedestal', 'Crown', 'Crown2', 'Power Plant'],
    'revolt': ['Rebellion', 'Fist', 'Fist Colored', 'Fist with Cash', 'Fire', 'Fire2', 'Torch', 'Torch Gold', 'Hammer', 'Star Red', 'Star Red2', 'Star Red3', 'Banner', 'Banner2', 'Banner3', 'Banner4', 'Worker'],
    'security': ['Shield', 'Shield Forward', 'Shield Forward2', 'Shield Forward3', 'Padlock', 'Shackles', 'Handcuffs', 'Handcuffs Broken', 'Spy', 'Spy2', 'Spy3', 'Bunker', 'Bunker Plain', 'Barbed Wire', 'Prepared Defence'],
    'alliance': ['Hands Shaking', 'Hands Shaking2', 'Hands Shaking3', 'Hands Shaking4', 'Hand Out', 'Hand Out2', 'Hand Raised', 'Dove', 'Dove2', 'African Hands', 'Branch', 'Flower', 'Bird Freed'],
    'assembly': ['Ballot', 'Ballot2', 'Parliament', 'Constitution', 'Hand Raised', 'Citizen', 'Citizen2', 'Citizen3', 'Capitol', 'Capitol2', 'Scales', 'Scales Golden'],
    'industry': ['Factories', 'Factories2', 'Factories3', 'Factories4', 'Factories5', 'Crane', 'Wrench', 'Wrenches Crossed', 'Cog', 'Cog Wheel', 'Cement Mixer', 'Building', 'Bulldozer', 'Steel'],
    'media': ['Megaphone', 'Megaphone2', 'Megaphone3', 'Megaphone Twins', 'Walkie Talkie', 'Envelope', 'Documents', 'Documents Classified', 'Banner', 'Banner2', 'Paper Sign', 'Computer'],
    'culture': ['Brush', 'Book', 'Magician', 'Woman Dancing', 'Cards', 'Dice', 'Rose', 'Rose2', 'Flower', 'Flower Petals', 'Champagne', 'Cherry Blossom', 'Bear', 'Bear2'],
    'reform': ['Circular Arrows', 'Circular Arrows2', 'Arrow', 'Arrow2', 'Arrow3', 'Arrow4', 'Arrow5', 'Brain', 'Idea Icon', 'Lightbulb Broken', 'Blueprints', 'Wrench'],
    'law': ['Scales', 'Scales Golden', 'Constitution', 'Guillotine', 'Padlock', 'Shackles', 'Handcuffs', 'Denied', 'Paper Sign', 'Crown Broken'],
    'research': ['Computer', 'Brain', 'Nuclear Atom', 'Nuclear Atom 2', 'Lightbulb Broken', 'Blueprints', 'Blurprints2', 'Vial', 'Vial Shared', 'Electricity', 'Cog Wheel'],
    'economy': ['Cash', 'Cash2', 'Cash3', 'Cash Fan', 'Cash Flow Positive', 'Cash Flow Positive2', 'Cash Flow Negative', 'Coins', 'Coins2', 'Coins3', 'Coins4', 'Coins5', 'Coins6', 'Bank Broken', 'Shop', 'Vault', 'Bills', 'Gold'],
    'command': ['Soldier', 'Soldier2', 'Soldier3', 'Soldier4', 'Soldier5', 'Soldier Pointing', 'Soldier Saluting', 'Soldiers Charging', 'Soldiers in Rows', 'Officer', 'Map with Arrow', 'Map with Knife', 'Walkie Talkie'],
    'crisis': ['Clock', 'Clock2', 'Skull', 'Skull2', 'Skulls', 'Coffin', 'Grim Reaper', 'Cloud Dark', 'Smoke', 'Cracks Overlay', 'House Ruined', 'Bank Broken', 'Bowl Cracked', 'Star Broken'],
    'campus': ['Building', 'House', 'Bell', 'Book Open', 'Paper', 'Earth', 'Earth2', 'Clock', 'Lantern', 'Plant', 'Sun', 'Moon', 'Star'],
}

# When a route needs more than one theme's initial pool, borrow from adjacent
# subjects before considering the full source library.
related_themes = {
    'study': ['research', 'reform', 'campus', 'law'],
    'authority': ['law', 'security', 'command', 'assembly'],
    'revolt': ['command', 'crisis', 'media', 'authority'],
    'security': ['command', 'law', 'authority', 'crisis'],
    'alliance': ['assembly', 'media', 'reform', 'campus'],
    'assembly': ['alliance', 'law', 'authority', 'media'],
    'industry': ['research', 'economy', 'campus', 'command'],
    'media': ['culture', 'alliance', 'assembly', 'study'],
    'culture': ['media', 'campus', 'study', 'reform'],
    'reform': ['study', 'research', 'assembly', 'campus'],
    'law': ['authority', 'security', 'assembly', 'study'],
    'research': ['study', 'industry', 'reform', 'economy'],
    'economy': ['industry', 'research', 'authority', 'campus'],
    'command': ['security', 'revolt', 'authority', 'industry'],
    'crisis': ['revolt', 'security', 'command', 'economy'],
    'campus': ['study', 'culture', 'assembly', 'reform'],
}

extra_patterns = {
    'study': r'Book|Paper|Brain|Bell|Documents|Hand Writing|Question|Idea|Lightbulb|Clock|Vial|Magnifying|Puzzle|Pen',
    'authority': r'Crown|Citizen|Capitol|Palace|Flag|Officer|Gauntlet|Puppeter|Politician|Pedestal|Hat Military|Man Trenchcoat|Power Plant|Keys',
    'revolt': r'Fist|Fire|Torch|Rebellion|Star Red|Banner|Worker|Labor|Guillotine|Hand Fist|Hammer|Crack|Riot|Chains',
    'security': r'Soldier|Helmet|Shield|Rifle|Gun|Spy|Padlock|Bunker|Barbed|Shackle|Handcuff|Infiltrat|Patrol|Defence|Reinforcement|Knife',
    'alliance': r'Hand|Dove|Bird|Branch|Flower|Marriage|Citizen|Unity|Parliament|Ballot|Scales',
    'assembly': r'Parliament|Ballot|Citizen|Scales|Constitution|Hand Raised|Capitol|Pedestal|Politician|Council',
    'industry': r'Factor|Crane|Cog|Wrench|Building|Bulldozer|Steel|Cement|Power|Railroad|Truck|Train|Mine|Laborer',
    'media': r'Megaphone|Walkie|Envelope|Documents|Banner|Paper|Computer|Radio|Flag|Hand Raised',
    'culture': r'Brush|Magician|Woman|Cards|Dice|Rose|Flower|Champagne|Cherry|Bear|Bird|Plant|Book|Sun|Moon',
    'reform': r'Arrow|Brain|Idea|Lightbulb|Blueprint|Wrench|Book|Paper|Scales|Circle|Handshake|Hand',
    'law': r'Scales|Constitution|Guillotine|Padlock|Shackle|Handcuff|Denied|Paper|Crown|Citizen|Court',
    'research': r'Computer|Brain|Nuclear|Lightbulb|Blueprint|Vial|Electric|Cog|Radar|Atom|Question|Idea',
    'economy': r'Cash|Coin|Bank|Shop|Vault|Bill|Gold|Silver|Briefcase|Factory|Labor|Trade|Oil',
    'command': r'Soldier|Officer|Map|Walkie|Rifle|Helmet|Gun|Banner|Cannon|Knife|Defence|Reinforcement',
    'crisis': r'Clock|Skull|Coffin|Grim|Cloud|Smoke|Crack|Ruin|Broken|Defeated|Blood|Fire|Denied',
    'campus': r'Building|House|Bell|Book|Paper|Earth|Clock|Lantern|Plant|Sun|Moon|Star|Teacher|Citizen',
}

rules = [
    ('security', r'清洗|镇压|逮捕|戒严|护校|巡查|肃反|purge|crackdown|security|patrol|guard'),
    ('revolt', r'起义|革命|暴动|抗议|反抗|风暴|火种|revol|uprising|protest|strike'),
    ('alliance', r'谈判|和解|同盟|联合|团结|共识|合流|拉拢|接触|negoti|coalition|alliance|unite|compromise'),
    ('assembly', r'大会|议会|代表|民主|选举|投票|assembly|council|election|parliament|vote'),
    ('research', r'科研|实验|技术|研发|创新|科学|research|lab|rnd|tech'),
    ('economy', r'商|市场|资本|金融|经费|债|盈利|corporate|market|money|capital|bank|jidi'),
    ('industry', r'工厂|生产|扩建|建设|基建|印刷|后勤|供给|factory|workshop|supply|build'),
    ('media', r'广播|宣传|媒体|舆论|海报|电台|情报|radio|poster|media|propaganda'),
    ('culture', r'动漫|赛博|艺术|文化|天国|剧|gal|cyber|culture|anime|film|gouxiong|gx_'),
    ('reform', r'改革|教改|素质|课程|高考|教学|教育|reform|education'),
    ('law', r'校规|法案|制度|纪律|审判|法治|规章|law|rule|verdict'),
    ('study', r'论文|书|试卷|做题|考试|学术|职称|研读|原典|study|exam|paper|teacher|yang_'),
    ('command', r'指挥|作战|战斗|冲突|先锋|进攻|反攻|军事|command|battle|militia|army'),
    ('crisis', r'危机|分裂|崩溃|绝望|清算|最后|crisis|despair|collapse|ruin'),
    ('authority', r'政权|校长|行政|组织|中央|领导|统治|committee|leader|authority|wu_'),
]


def theme(key: str, label: str) -> str:
    text = key + ' ' + label
    for name, pattern in rules:
        if re.search(pattern, text, re.IGNORECASE):
            return name
    return 'campus'


priority = {
    'start_2023': 'Building', 'build_art': 'Cog', 'fake_five_edu': 'Documents',
    'ban_books': 'Book', 'declare_indep': 'Banner', 'charge_b3': 'Fist Colored',
    'steel_toad': 'Bear', 'democratic_councils': 'Parliament', 'read_marx': 'Karl Marx',
    'student_militia': 'Rifle', 'authoritarian_exit_negotiation': 'Handcuffs Broken',
    'perfect_hengshui': 'Paper', 'wu_patrol': 'Spy', 'wu_martial_law': 'Padlock',
    'jidi_new_era': 'Cash Fan', 'gx_start': 'Brush', 'yang_yule_start': 'Book Open',
    'wu_model_school': 'Book', 'wu_rule_by_law': 'Constitution',
    'wu_coup_december': 'Soldiers Charging', 'wu_iron_curtain': 'Barbed Wire',
    'wu_arm_guard': 'Soldier', 'wu_millennium_plan': 'Palace Chinese',
}

spirit_priority = {
    'exam_pressure': 'Paper Torn', 'b3_fortress': 'Bunker',
    'new_reform_cloud': 'Cloud Dark', 'wu_patrol_spirit': 'Spy2',
    'red_campus': 'Star Red with Sickle', 'vanguard_party': 'Star Red3',
    'armed_militia': 'Rifle', 'democratic_councils_spirit': 'Ballot',
    'teacher_support': 'Book Open', 'assembly_dynamics': 'Parliament',
    'jidi_corporate_rule': 'Cash Fan', 'jidi_corporate_utopia_spirit': 'Cash Flow Positive',
    'jidi_minor_spirit_1': 'Shop', 'jidi_minor_spirit_2': 'Briefcase2',
    'jidi_minor_spirit_3': 'Cash Flow Negative', 'jidi_minor_spirit_4': 'Coins5',
    'jidi_riot_spirit': 'Labor Dispute', 'eternal_ruin_spirit': 'Computer',
    'path_of_democracy': 'Scales', 'desperate_defense': 'Prepared Defence',
    'red_terror_nkpd': 'Handcuffs', 'two_chariots_distrust': 'Hands Shaking4',
    'haobang_assembly_charter': 'Constitution', 'haobang_legacy_guard': 'Shield',
    'haobang_grand_reform': 'Circular Arrows', 'wu_martial_law_spirit': 'Padlock',
    'wu_rule_of_law_spirit': 'Scales Golden', 'wu_expansion_spirit': 'Big Brother',
    'wu_armed_guard_spirit': 'Shield Forward', 'wu_iron_curtain_spirit': 'Barbed Wire',
    'yang_yule_regime': 'Book', 'cyber_hedonism_rule': 'Rose2',
    'awakened_binhu': 'Sun', 'silenced_vanguard': 'Chains Crossed',
}


def stable_pick(key: str, options: list[str]) -> str:
    digest = hashlib.sha256(key.encode('utf-8')).digest()
    return options[int.from_bytes(digest[:8], 'big') % len(options)]


used: set[str] = set()
recent_focus: list[str] = []


def assign(key: str, label: str, preferred: dict[str, str]) -> str:
    requested = preferred.get(key)
    if requested in available:
        selected = requested
    else:
        subject = theme(key, label)
        candidates = [stem for stem in themes[subject] if stem in available and stem not in used]
        if not candidates:
            candidates = [stem for adjacent in related_themes[subject]
                          for stem in themes[adjacent] if stem in available and stem not in used]
        if not candidates:
            pattern = extra_patterns[subject]
            candidates = [stem for stem in sorted(available) if stem not in used and re.search(pattern, stem, re.IGNORECASE)]
        if not candidates:
            # A relevant repeated component is preferable to an unrelated unique one.
            reusable = list(dict.fromkeys(stem for group in [subject, *related_themes[subject]]
                                           for stem in themes[group] if stem in available))
            candidates = [stem for stem in reusable if stem not in recent_focus[-18:]] or reusable
        if not candidates:
            raise RuntimeError('Not enough artwork pieces for the current focus and spirit catalog')
        selected = stable_pick(key, candidates)
    used.add(selected)
    if preferred is priority:
        recent_focus.append(selected)
    return selected


manifest = {
    'spirit': {key: assign(key, label, spirit_priority) for key, label in spirits.items()},
    'focus': {key: assign(key, label, priority) for key, label in focuses.items()},
}
OUTPUT.mkdir(parents=True, exist_ok=True)
for stale in OUTPUT.glob('*.png'):
    if stale.stem not in used:
        stale.unlink()
for stem in used:
    shutil.copyfile(available[stem], OUTPUT / f'{stem}.png')
MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
URL_CATALOG.write_text('\n'.join([
    '/** Generated by scripts/assign_strategic_art.py; Vite can bundle these literal URLs. */',
    'export const EXPANDED_ART_URLS: Record<string, string> = {',
    *(f"  {json.dumps(stem)}: new URL({json.dumps('../assets/hoi4/expanded/' + stem + '.png')}, import.meta.url).href,"
      for stem in sorted(used)),
    '};',
    '',
]), encoding='utf-8')
print(f"{len(focuses)} unique focuses, {len(spirits)} unique spirit candidates, {len(used)} distinct images")
