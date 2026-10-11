/** Offline scene/subject assignments. Never rewrites the events or their effects. */
import fs from 'node:fs';
import ts from 'typescript';
import { FLAVOR_EVENTS } from '../src/data/flavorEvents';
import { STORY_EVENTS } from '../src/data/storyEvents';
import { CAMPUS_SITUATIONS } from '../src/engine/campusEvents';
import assignments from '../src/config/artAssignments.json';

type Binding = { scene?: string; news?: string; generated?: string; primary?: string; secondary?: string; portrait?: string; theme?: string; reason?: string };
const rows = Object.values({...STORY_EVENTS,...FLAVOR_EVENTS}).map(e=>({id:e.id,title:e.title,description:e.description,source:'catalog'}));
const known=new Set(rows.map(e=>e.id));
for(const file of ['src/App.tsx','src/components/WuCrackdownConsole.tsx','src/components/YangYuleDesk.tsx','src/engine/assemblyConflict.ts']){
 const fileSource=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
 function scan(node:ts.Node){if(ts.isObjectLiteralExpression(node)){
  const values:Record<string,string>={};for(const prop of node.properties)if(ts.isPropertyAssignment(prop)&&ts.isIdentifier(prop.name)&&(ts.isStringLiteral(prop.initializer)||ts.isNoSubstitutionTemplateLiteral(prop.initializer)))values[prop.name.text]=prop.initializer.text;
  if(values.id&&values.title&&values.description&&!known.has(values.id)){rows.push({id:values.id,title:values.title,description:values.description,source:file});known.add(values.id);}
 }ts.forEachChild(node,scan);}scan(fileSource);
}
for(const family of CAMPUS_SITUATIONS) rows.push({id:'campus_'+family.id,title:family.title,description:family.body,source:'campus family'});
const focusArt = assignments.focus as Record<string,string>;
const linked:Record<string,string>={};
const source=ts.createSourceFile('FocusTree.tsx',fs.readFileSync('src/components/FocusTree.tsx','utf8'),ts.ScriptTarget.Latest,true);
function visit(node:ts.Node){
 if(ts.isObjectLiteralExpression(node)){
  const id=node.properties.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(source)==='id') as ts.PropertyAssignment|undefined;
  const duration=node.properties.some(p=>ts.isPropertyAssignment(p)&&p.name.getText(source)==='days');
  if(duration&&id&&ts.isStringLiteral(id.initializer))for(const match of node.getText(source).matchAll(/(?:FLAVOR_EVENTS|STORY_EVENTS)\.([a-zA-Z0-9_]+)/g))if(focusArt[id.initializer.text])linked[match[1]]=focusArt[id.initializer.text];
 }ts.forEachChild(node,visit);
}visit(source);

// Each candidate set depicts one concrete subject. Variety stays within that subject.
const concepts:Array<[string,RegExp,string[]]>=[
 ['letter',/信封|来信|回信|字条|信：|致.*的信|联名|感谢信|密函|letter|petition|envelope/,['Envelope','Paper','Hand Writing','Documents']],
 ['paper',/试卷|考卷|错题|草稿|刷题|题海|密卷|exams|exam_room|rnd_product/,['Paper','Paper Torn','Book','Documents','Hand Writing']],
 ['book',/课外书|图书|阅览|书刊|禁书|读本|讲义|语法|阅读|books|grammar|recitation/,['Book Open','Book','Paper Sign','Paper Torn']],
 ['time',/时间|计时|作息|午休|晨读|早读|课间|倒计时|百日|倒数|countdown|standing|schedule/,['Clock','Clock2','Bell','Moon']],
 ['money',/经费|财务|资金|献金|账本|回扣|津贴|采购|学费|借贷|金钱|报价|利润|财报|营收|GDP|fund|profit|loan|finance|capital/,['Bills','Coins','Cash Fan','Cash Flow Positive','Cash Flow Negative','Vault','Cash3','Coins4']],
 ['industry',/生产|流水线|工厂|研发部|印刷|油印|印钞|采购|扩建|基建|施工|水泥|设备|build_art|supply/,['Factories2','Factories3','Cog Wheel','Wrench','Crane','Bulldozer','Box Open']],
 ['meeting',/会议|委员会|议会|议席|代表|法案|表决|投票|选票|民主|大选|assembly|bill|election|council/,['Parliament','Ballot','Ballot2','Constitution','Scales','Politicians Fighting','Capitol2']],
 ['negotiation',/协商|谈判|妥协|和解|契约|谅解|并席|接触|联合|共护|联盟|交涉|negotiat|compromise|unity|coalition/,['Hands Shaking','Hands Shaking2','Hands Shaking3','Hands Shaking4','Marriage','Hands Flat']],
 ['security',/巡逻|巡查|执勤|值班|护校|警戒|保安|戒严|防线|纪律|督导|巡夜|夜巡|patrol|guard|defen/,['Officer','Soldier Pointing','Soldier Saluting','Shield','Prepared Defence','Walkie Talkie','Hat Military']],
 ['surveillance',/监控|摄像头|监考|举报|告密|情报|密报|检举|跟踪|查收|清单|camera|informer|informant/,['Spy','Spy2','Spy3','Magnifying Glass','Big Brother','Documents Classified']],
 ['repression',/清洗|逮捕|落网|禁闭|手铐|囚徒|审判|公审|审查|镇压|铁腕|处分|封存|恐怖|purge|trial|arrest|suppress/,['Handcuffs','Shackles','Padlock','Chains Crossed','Boot Crushing Hand','Guillotine','Birdcage']],
 ['revolution',/起义|革命|街垒|暴乱|抗议|反攻|反扑|怒火|反抗|反击|串联|红旗|红星|红蛤|赤旗|upris|rebell|riot|rally/,['Rebellion','Fist','Fist Colored','Star Red','Star Red2','Star Red3','Banner3','Hand Raised']],
 ['media',/广播|录音|录证|宣传|舆论|传单|海报|电台|报纸|发言|演说|声音|media|broadcast|leaflet|poster/,['Megaphone','Megaphone2','Megaphone3','Megaphone Twins','Banner','Paper Sign']],
 ['computer',/算法|程序|数据|数字|电脑|硅基|代码|网络|AI|赛博|像素|白板|聊天|手机|data|cyber|hacking/,['Computer','Electricity','Cog','Blueprints','Lightbulb Broken']],
 ['art',/素描|画室|美术|颜料|艺术|油彩|绘画|涂鸦|画笔|sketch|art_room/,['Brush','Rose','Flower','Idea Icon']],
 ['music',/乐队|吉他|演出|春日影|歌声|音乐|节目|文化祭|mygo|bochi|concert/,['Woman Dancing','Rose2','Flower Petals','Megaphone Twins','Cherry Blossom']],
 ['cinema',/银幕|放映|番剧|动画|礼堂|电影|二次元|galgame|anime|aot|eva|frieren|takagi|demon_slayer/,['Magician','Bear','Bear2','Bear3','Star White','Moon']],
 ['health',/医务|体检|复查|中药|大补|健康|伤口|绷带|病房|药片|头晕|脑雾|病|衰老|昏迷|失忆|health|infirmary/,['Vial','Vial Shared','Brain','Lantern','Cloud Dark']],
 ['teacher',/教师|老师|教案|教研|名师|工作室|评审|评定|答辩|论文|署名|备课|职称|teach|title|authorship/,['Hand Writing','Documents','Paper Sign','Book Open','Pedestal','Citizen']],
 ['awards',/证书|成绩|榜单|排名|大捷|胜利|庆功|荣誉|奖|称号|评定成功|success|victory/,['Pedestal','Crown','Star','Hand Thumbs Up','Champagne']],
 ['failure',/失败|落选|惨败|未达成|退回|滞销|否决|崩溃|破裂|失利|全盘|fail|defeat/,['Denied','Star Broken','Crown Broken','Champagne Shattered','Paper Torn','Arrow Broken']],
 ['campus',/教学楼|教室|校门|校园|走廊|行政楼|操场|大楼|校长室|campus|building/,['Building','House','Wall','Palace Chinese','Blueprints']],
 ['night',/熄灯|午夜|子夜|深夜|夜话|寝室|宿舍|天台|凌晨|黄昏|night|dorm|rooftop/,['Moon','Lantern','House','Cloud Dark']],
 ['weather',/暴雪|结冰|冰雪|下雨|暴雨|雨中|寒冬|春天|春日|雪|winter|snow|spring/,['Cloud Dark','Sun','Branch','Plant','Cherry Blossom']],
 ['freedom',/自由|解放|放下|辞职|退休|告别|离开|回归|赎罪|温情|和睦|rebirth|redeem|retire/,['Bird Freed','Dove','Dove2','Handcuffs Broken','Flower']],
 ['sport',/体育|跑操|跑道|运动|哨声|sports|morning_run/,['Citizen2','Citizen3','Bell','Hand Raised']],
 ['food',/食堂|饭盒|供餐|菜单|蒸蛋|吃饭|餐|canteen|food/,['Bowl Cracked','Shop','Cash2','Box Open2']],
 ['power',/权力|主导|接管|独裁|权威|大权|统治|夺权|巅峰|接任|领袖|极左|野心|ambition|takeover|authority/,['Crown2','Crown3','Crown4','Gauntlet','Gauntlet Upward','Puppeter']],
 ['philosophy',/哲学|马克思|齐泽克|异化|虚无|灵魂|理智|荒谬|幻象|梦想|意义|幻境|marx|sanity/,['Karl Marx','Brain','Idea Icon','Magician','Cloud Dark']],
];
const specific:Record<string,Binding>={
 school_starts:{news:'schoolOpening'},enter_treeA:{news:'committeeFounded'},enter_treeC:{news:'entertainmentInauguration'},gx_start_event:{news:'entertainmentInauguration'},bill_passed:{news:'assemblyVote'},broadcast_seized:{news:'broadcastSeized'},jidi_profit_event:{news:'commercialCampus'},
 phase1_returned_petition:{scene:'退回的联名信'},phase1_recess_dispute:{scene:'课间的争执'},yang_desk_snow_day:{scene:'雪中的来函'},secret_compromise:{scene:'灯下的协议'},start_democratic_election_event:{scene:'六十日之约'},election_outcome_event:{scene:'第一张选票'},haobang_commune_pilot_event:{scene:'公社的长桌'},jidi_rnd_department_event:{scene:'密卷流水线'},
 phase1_dorm_talks:{generated:'dorm-whispers'},gx_redeem_ending_event:{generated:'school-infirmary'},gx_dabi_rooftop_invite_story_event:{generated:'rooftop-midnight'},
 strike_b3_success:{scene:'B3革命'},march_on_admin:{scene:'街垒黎明'},yang_yule_desk_unlocked:{scene:'保温杯与红批'},yang_yule_success_event:{scene:'特级'},yang_yule_fail_event:{scene:'特级0'},jidi_hidden_riot_event:{scene:'价格牌下的风暴'},pan_democratic_victory_event:{scene:'春回滨湖'},gx_ruin_ending_event:{scene:'校园涂鸦1'},jidi_new_era_event:{scene:'及第之梦'},jidi_corporate_utopia_event:{scene:'企业学校的黄昏'},
 negotiate_orthodox:{portrait:'leader_wang_zhaokai',secondary:'Hands Shaking'},negotiate_bear:{portrait:'leader_gouxiong',secondary:'Hands Shaking2'},negotiate_pan:{portrait:'leader_pan_renyue',secondary:'Hands Shaking3'},negotiate_testTaker:{portrait:'advisor_wang_juanhao_vanguard',secondary:'Hands Shaking4'},negotiate_jidiTutoring:{portrait:'advisor_jidi_ceo',secondary:'Cash Fan'},
 pan_victory_event:{portrait:'leader_pan_renyue',secondary:'Ballot'},wang_victory_event:{portrait:'leader_wang_zhaokai',secondary:'Envelope'},bear_victory_event:{portrait:'leader_gouxiong',secondary:'Envelope'},juanhao_victory_event:{portrait:'advisor_wang_juanhao_vanguard',secondary:'Envelope'},
 hire_zhou_chen_event:{portrait:'advisor_zhou_chen',secondary:'Book Open'},hire_you_guanglei_event:{portrait:'advisor_you_guanglei',secondary:'Hands Shaking'},
 phase1_contact_pan:{portrait:'leader_pan_renyue',secondary:'Paper Sign'},phase1_wu_patrol:{portrait:'advisor_wu_fujun',secondary:'Spy'},phase1_start_2023:{portrait:'leader_feng_anbao',secondary:'Bell'},pan_takeover_event:{portrait:'leader_pan_renyue',secondary:'Crown2'},true_left_consolidation_event:{portrait:'leader_wang_zhaokai',secondary:'Star Red with Sickle'},orthodox_dominance_event:{portrait:'leader_wang_zhaokai',secondary:'Crown3'},jidi_feng_anbao_event:{portrait:'leader_feng_anbao',secondary:'Shield'},
 reform_blank_event_1:{portrait:'leader_lu_bohan',secondary:'Clock'},reform_blank_event_2:{portrait:'leader_hao_bang',secondary:'Clock'},reform_blank_event_3:{portrait:'leader_wang_zhaokai',secondary:'Clock'},haobang_start_4d_event:{portrait:'leader_hao_bang',secondary:'Crown Broken'},wu_wzk_arrest_event:{portrait:'leader_wang_zhaokai',secondary:'Handcuffs'},wu_zhouchen_suspension_event:{portrait:'advisor_zhou_chen',secondary:'Denied'},
 yang_desk_thermos_mystery:{primary:'Vial',secondary:'Magnifying Glass'},yang_desk_alumni_donation:{primary:'Computer',secondary:'Hand Out'},mock_exam:{primary:'Paper',secondary:'Clock'},late_mock_exam:{primary:'Paper',secondary:'Bell'},yang_yule_late_mock_exam:{portrait:'leader_yang_yule',secondary:'Paper'},enter_treeA_pan_despair:{scene:'最后一间教室'},
 teachers_rnd_product_1:{portrait:'advisor_zhou_chen',secondary:'Hand Writing'},teachers_rnd_product_2:{portrait:'leader_yang_yule',secondary:'Book'},
 jidi_story_committee_5d:{portrait:'advisor_wang_juanhao_vanguard',secondary:'Paper'},jidi_story_kpi_5d:{portrait:'advisor_wang_juanhao_vanguard',secondary:'Pedestal'},jidi_story_kpi_25d:{portrait:'advisor_wang_juanhao_vanguard',secondary:'Clock2'},jidi_story_kpi_35d:{portrait:'advisor_wang_juanhao_vanguard',secondary:'Paper Torn'},jidi_story_monopoly_5d:{portrait:'advisor_wang_juanhao_vanguard',secondary:'Arrow Broken'},jidi_story_monopoly_15d:{portrait:'advisor_wang_juanhao_vanguard',secondary:'Brain'},jidi_story_monopoly_25d:{portrait:'advisor_wang_juanhao_vanguard',secondary:'Cloud Dark'},
};
const available=new Set(fs.readdirSync('src/assets/hoi4/expanded').map(name=>name.replace(/\.png$/,'')));
const bindings:Record<string,Binding>={};
const used=new Map<string,number>();
function signature(b:Binding){return b.scene??b.news??b.generated??[b.portrait??b.primary,b.secondary].join(' / ');}
for(const row of rows.sort((a:any,b:any)=>a.id.localeCompare(b.id))){
 const scored=concepts.map(([label,test,pieces])=>({label,pieces,score:(test.test(row.title)?12:0)+(test.test(row.id)?6:0)+(test.test(row.description.slice(0,300))?2:0)+(test.test(row.description)?1:0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 const first=scored[0]??{label:'campus',pieces:['Building','Documents'],score:0};
 const second=scored.find(x=>x.label!==first.label)??{label:'paper',pieces:['Documents','Paper'],score:0};
 let chosen:Binding;
 if(specific[row.id])chosen={...specific[row.id],reason:'按具体剧情指定场景或人物'};
 else{
  const primary=linked[row.id]&&available.has(linked[row.id])?[linked[row.id],...first.pieces.filter(p=>p!==linked[row.id])]:first.pieces;
  const pairs=primary.flatMap((p,i)=>second.pieces.filter(s=>s!==p).map((s,j)=>({primary:p,secondary:s,rank:i*.12+j*.03+(used.get(p+' / '+s)??0)*10})));
  pairs.sort((a,b)=>a.rank-b.rank);
  chosen={primary:pairs[0].primary,secondary:pairs[0].secondary,theme:first.label,reason:(linked[row.id]?'关联国策美术；':'')+first.label+' / '+second.label};
 }
 chosen.theme??=first.label;
 for(const name of [chosen.primary,chosen.secondary])if(name&&!available.has(name))throw new Error('missing icon '+name);
 used.set(signature(chosen),(used.get(signature(chosen))??0)+1);
 bindings[row.id]=chosen;
}
fs.writeFileSync('src/config/eventArtBindings.json',JSON.stringify(bindings,null,2)+'\n');
const groups=new Map<string,string[]>();for(const [id,b] of Object.entries(bindings)){const key=signature(b);groups.set(key,[...(groups.get(key)??[]),id]);}
const report={count:rows.length,distinctVisuals:groups.size,singleUse: [...groups.values()].filter(ids=>ids.length===1).reduce((n,ids)=>n+ids.length,0),focusLinked:Object.keys(linked).length,portraitCount:Object.values(bindings).filter(b=>b.portrait).length,repeated:[...groups].filter(([,ids])=>ids.length>1),events:rows.map((r:any)=>({id:r.id,title:r.title,source:r.source,...bindings[r.id]}))};
fs.mkdirSync('art/事件配图',{recursive:true});fs.writeFileSync('art/事件配图/assignments-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,events:undefined,repeated:report.repeated.slice(0,12)},null,2));
