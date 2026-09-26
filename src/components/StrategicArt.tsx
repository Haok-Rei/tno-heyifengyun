import type { FocusNode, NationalSpirit } from '../types';
import { FOCUS_PIECE_OVERRIDES, HOI4_PIECES, SPIRIT_BACKGROUNDS, SPIRIT_BACKGROUND_VARIANTS, SPIRIT_PIECE_OVERRIDES } from '../config/hoi4Artwork';
import artAssignments from '../config/artAssignments.json';
import { EXPANDED_ART_URLS } from '../config/expandedArtwork';

export type ArtKind = 'study' | 'authority' | 'revolt' | 'security' | 'alliance' | 'assembly' | 'industry' | 'media' | 'culture' | 'reform' | 'law' | 'research' | 'economy' | 'command' | 'crisis' | 'campus';

const expandedPiece = (stem: string | undefined): string | undefined => stem && EXPANDED_ART_URLS[stem];
const focusAssignments: Record<string, string> = artAssignments.focus;
const spiritAssignments: Record<string, string> = artAssignments.spirit;
const spiritBackgroundByKind: Record<ArtKind, string> = {
  study: 'Sun', authority: 'Shield', revolt: 'Fire', security: 'Military Police',
  alliance: 'Ring', assembly: 'Circle', industry: 'Bars', media: 'Rows',
  culture: 'Diamonds', reform: 'Upgrade', law: 'Polygon', research: 'Pentagon',
  economy: 'Losange', command: 'Army', crisis: 'Intrigue', campus: 'Rectangle',
};

const PORTRAIT_FOCUS: Record<string, string> = {
  start_2023: new URL('../../art/人像/封安保.png', import.meta.url).href,
  declare_indep: new URL('../../art/人像/王兆凯4.png', import.meta.url).href,
  pan_takeover: new URL('../../art/人像/潘仁越5.png', import.meta.url).href,
  true_left_consolidation: new URL('../../art/人像/王兆凯4.png', import.meta.url).href,
  lu_bohan_start: new URL('../../art/人像/吕波汉.png', import.meta.url).href,
  haobang_start: new URL('../../art/人像/豪邦.png', import.meta.url).href,
  gx_start: new URL('../../art/人像/狗熊2.png', import.meta.url).href,
  yang_yule_start: new URL('../../art/人像/杨玉乐4.png', import.meta.url).href,
  jidi_new_era: new URL('../../art/人像/封安祥.png', import.meta.url).href,
  wu_order_restored: new URL('../../art/人像/吴福军.jpeg', import.meta.url).href,
};

const FOCUS_OVERRIDES: Record<string, ArtKind> = {
  start_2023: 'campus', build_art: 'industry', wu_patrol: 'security',
  fake_five_edu: 'reform', ban_books: 'study', perfect_hengshui: 'study',
  dorm_talks: 'media', contact_pan: 'alliance', read_marx: 'study',
  rally_classes: 'alliance', protest_privilege: 'revolt',
  charge_b3: 'revolt', steel_toad: 'revolt',
  declare_indep: 'authority', democratic_councils: 'assembly',
  establish_vanguard: 'command', student_militia: 'security',
  broad_coalition: 'alliance', convene_assembly: 'assembly',
  authoritarian_exit_negotiation: 'alliance', post_negotiation_events: 'crisis',
  haobang_start: 'alliance', yang_yule_start: 'study',
  jidi_new_era: 'economy', gx_start: 'culture', pan_takeover: 'assembly',
  despair_street_fight: 'command', true_left_consolidation: 'revolt',
  lu_bohan_start: 'security', wu_order_restored: 'security',
  wu_model_school: 'authority', wu_inspection: 'law', wu_power_expansion: 'security',
  wu_martial_law: 'security',
};

const RULES: Array<[RegExp, ArtKind]> = [
  [/清洗|镇压|逮捕|戒严|护校|巡查|肃反|purge|crackdown|security|patrol|guard/, 'security'],
  [/起义|革命|暴动|抗议|反抗|风暴|火种|revol|uprising|protest|strike/, 'revolt'],
  [/谈判|和解|同盟|联合|团结|共识|合流|拉拢|接触|negoti|coalition|alliance|unite|compromise/, 'alliance'],
  [/大会|议会|代表|民主|选举|投票|assembly|council|election|parliament|vote/, 'assembly'],
  [/科研|实验|技术|研发|创新|科学|research|lab|rnd|tech/, 'research'],
  [/商|市场|资本|金融|GDP|经费|债|盈利|corporate|market|money|capital|bank/, 'economy'],
  [/工厂|生产|扩建|建设|基建|印刷|后勤|供给|factory|workshop|supply|build/, 'industry'],
  [/广播|宣传|媒体|舆论|海报|电台|情报|radio|poster|media|propaganda/, 'media'],
  [/动漫|赛博|艺术|文化|天国|剧|gal|cyber|culture|anime|film/, 'culture'],
  [/改革|教改|素质|课程|高考|教学|教育|reform|education/, 'reform'],
  [/校规|法案|制度|纪律|审判|法治|规章|law|rule|verdict/, 'law'],
  [/论|书|试卷|做题|考试|学术|职称|研读|原典|study|exam|paper|teacher/, 'study'],
  [/指挥|作战|战斗|冲突|先锋|进攻|反攻|军事|command|battle|militia|army/, 'command'],
  [/危机|分裂|崩溃|绝望|清算|最后|crisis|despair|collapse|ruin/, 'crisis'],
  [/政权|校长|行政|组织|中央|领导|统治|committee|leader|authority/, 'authority'],
];

export function getStrategicArtKind(id: string, title: string): ArtKind {
  if (FOCUS_OVERRIDES[id]) return FOCUS_OVERRIDES[id];
  const text = `${id} ${title}`;
  return RULES.find(([pattern]) => pattern.test(text))?.[1] ?? 'campus';
}

export function FocusArt({ node, compact = false }: { node: Pick<FocusNode, 'id' | 'title'>; compact?: boolean }) {
  const kind = getStrategicArtKind(node.id, node.title);
  const portrait = PORTRAIT_FOCUS[node.id];
  const piece = expandedPiece(focusAssignments[node.id]) ?? HOI4_PIECES[FOCUS_PIECE_OVERRIDES[node.id] ?? kind];
  return <span className={`strategic-art strategic-art--${kind} ${compact ? 'strategic-art--compact' : ''} ${portrait ? 'strategic-art--portrait' : ''}`} data-art-kind={kind} aria-hidden="true">
    {portrait ? <img className="strategic-art__portrait" src={portrait} alt="" loading="lazy" /> : <img className="strategic-art__piece" src={piece} alt="" draggable={false} />}
  </span>;
}

export function SpiritArt({ spirit }: { spirit: Pick<NationalSpirit, 'id' | 'name' | 'type' | 'icon'> }) {
  const kind = spirit.icon && spirit.icon in ART_KIND_LABELS ? spirit.icon as ArtKind : getStrategicArtKind(spirit.id, spirit.name);
  const piece = expandedPiece(spiritAssignments[spirit.id]) ?? HOI4_PIECES[SPIRIT_PIECE_OVERRIDES[spirit.id] ?? kind];
  const background = SPIRIT_BACKGROUND_VARIANTS[spiritBackgroundByKind[kind]] ?? SPIRIT_BACKGROUNDS[spirit.type];
  return <span className={`strategic-art strategic-art--spirit strategic-art--${kind} strategic-art--${spirit.type}`} data-art-kind={kind} aria-hidden="true">
    <img className="strategic-art__background" src={background} alt="" draggable={false} />
    <img className="strategic-art__piece" src={piece} alt="" draggable={false} />
  </span>;
}

export const ART_KIND_LABELS: Record<ArtKind, string> = {
  study: '学术', authority: '政务', revolt: '革命', security: '戒备',
  alliance: '联合', assembly: '议会', industry: '生产', media: '宣传',
  culture: '文化', reform: '教改', law: '法令', research: '科研',
  economy: '财政', command: '指挥', crisis: '危机', campus: '校园',
};
