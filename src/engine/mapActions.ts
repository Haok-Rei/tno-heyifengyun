import { ALL_SUB_TILES, type GameState } from '../types';
import { getCommandRoute } from '../data/commandRoutes';
import { shiftPoll } from './electionCampaign';
import { recordOpeningFieldwork } from './openingCampaign';

export interface MapAction { id: string; name: string; cost: string; description: string }
const action = (id: string, name: string, cost: string, description: string): MapAction => ({ id, name, cost, description });
const common = [action('boost','增强控制','15 PP','控制度 +12'),action('defend','设置防御工事','30 PP','防御 7 天'),action('rally','动员宣传','10 PP','控制度 +8，支持 +3')];
const byBuilding: Record<string, MapAction[]> = {
  b3: [action('b3_under','地下串联','20 卷子','控制度 +10，支持 +2'),action('b3_fort','死守楼道','50 PP','防御 14 天'),action('b3_leaf','散发传单','25 PP','控制度 +8，愤怒 +5，支持 +4')],
  admin: [action('adm_infil','渗透行政','30 PP','控制度 +5，资本渗透 +10'),action('adm_hack','黑入广播网','80 PP','冒险争取支持')],
  b1b2: [action('speech','发表演讲','20 PP','控制度 +10，支持 +5'),action('b12_awk','唤醒做题家','30 PP','控制度转为支持'),action('b12_dump','倾销教辅','5 稳定','卷子 +300')],
  auditorium: [action('aud_coop','拉拢社团','20 PP','控制度 +10，团结 +5'),action('aud_salon','民主沙龙','40 PP','控制度 +15，团结 +5')],
  lab: [action('lab_occ','占领设施','20 PP','控制度 +10，卷子 +50'),action('lab_print','印制传单','50 卷子','政治点数 +20')],
  playground: [action('pl_sports','组织体育活动','10 PP','控制度 +10，理智 +5'),action('pl_strike','全校总罢操','30 PP / 10 稳定','全图控制度 +5')],
};
const gx = [action('gx_anime','放映番剧渗透','10 PP','控制度 +8'),action('gx_meme','抽象烂梗轰炸','5 理智','控制度 +12'),action('gx_raid','突击夺权','15 PP','控制度 +10'),action('gx_cutwire','断电战术','15 PP','控制度 +15'),action('gx_swarm','蜂群快闪','8 理智','控制度 +18'),action('gx_strike','突袭占线','20 PP','控制度 +20'),action('gx_backdoor','后门注入','12 PP','控制度 +12')];
const wu = [action('wu_patrol','巡逻扫荡','10 PP','校方控制 +12'),action('wu_checkpoint','设卡封锁','20 PP','清除当地细胞'),action('wu_intel','情报收集','15 PP','清除细胞或削弱残党'),action('wu_arrest','定点抓捕','25 PP','残党 -3')];
export function availableMapActions(state: GameState, tileId: string): MapAction[] {
  const tile = ALL_SUB_TILES.find(t => t.id === tileId);
  if (!tile || state.gameEnding) return [];
  const route = getCommandRoute(state).id;
  if (route === 'opening') return tile.buildingId === 'playground' ? [byBuilding.playground[0]] : tile.buildingId === 'auditorium' ? [byBuilding.auditorium[0]] : tile.buildingId === 'b3' ? [byBuilding.b3[0]] : [];
  if (state.flags.gx_anarchy_phase || route === 'gouxiong') return state.flags[`gx_anarchy_action_tile_${tileId}`] ? gx.filter(a => ['gx_anime','gx_meme','gx_raid'].includes(a.id) || state.flags[`gx_anarchy_action_tile_${tileId}_${a.id.slice(3)}`]) : [];
  if (state.flags.lu_purge_map_phase || route === 'purge') return state.flags[`lu_purge_action_tile_${tileId}`] && Number(state.flags[`lu_purge_zone_level_tile_${tileId}`] || 0) < 3 ? [action('lu_purge','执行清洗','20 PP','清洗等级 +1')] : [];
  if (state.flags.haobang_commune_map_phase || route === 'commune') return state.flags[`haobang_commune_action_tile_${tileId}`] && Number(state.flags[`haobang_commune_zone_level_tile_${tileId}`] || 0) < 3 ? [action('cm_build','建设公社','25 PP','建设等级 +1')] : [];
  if (state.flags.wu_crackdown_map_phase || route === 'wu') return wu.filter(a => a.id !== 'wu_arrest' || state.flags.wu_arrest_unlocked);
  if (state.flags.yang_yule_route_started || route === 'yang') return [action('yy_coord','教师驻点协调','20 PP','教师支持 +3，信任 +2，健康 -1')];
  if (state.flags.jidi_new_era_active || route === 'jidi') return [action('jd_optimize','教学产线优化','20 PP','卷子 +80，GDP +1，理智 -2')];
  if (state.flags.polling_stations_unlocked || state.electionState?.isActive) return [action('campaign','区域拉票','25 PP',state.electionState?.isActive?'选战期间定期拉票，逐步改变选情':'选前小规模宣传，逐步改变选情')];
  if (state.flags.map_phase_ended) return [];
  if (state.flags.map_struggle_ended) return [];
  if (!state.flags.rebellion_started) return [];
  return [...common, ...(byBuilding[tile.buildingId] || []).filter(a => a.id !== 'aud_salon' || state.completedFocuses.includes('expand_assembly') || state.completedFocuses.includes('democratic_reforms'))];
}

function tileControl(s: GameState, tid: string) { return (s.flags['tile_ctrl_'+tid] as number|undefined) ?? ALL_SUB_TILES.find(t=>t.id===tid)?.studentControl ?? 50; }
export function executeMapAction(prev: GameState, tid: string, aid: string, source: 'manual' | 'workgroup' = 'manual'): { state: GameState; executed: boolean } {
  if (!availableMapActions(prev, tid).some(a => a.id === aid)) return { state: prev, executed: false };
  const today = prev.date.toISOString().split('T')[0];
  if (prev.flags[`map_action_${aid}_${tid}_last_date`] === today) return { state: prev, executed: false };
  const ns = { ...prev, stats: { ...prev.stats }, flags: { ...prev.flags }, mapLocations: { ...prev.mapLocations },
    wuState: prev.wuState ? { ...prev.wuState } : undefined,
    gouxiongState: prev.gouxiongState ? { ...prev.gouxiongState } : undefined,
    yangYuleState: prev.yangYuleState ? { ...prev.yangYuleState } : undefined,
    jidiCorporateState: prev.jidiCorporateState ? { ...prev.jidiCorporateState } : undefined };
  const ctrl = tileControl(prev,tid); const tile = ALL_SUB_TILES.find(t=>t.id===tid)!; let nc=ctrl; let ok=true;
  const isPoll = !!prev.flags.polling_stations_unlocked; const isEl = !!prev.electionState?.isActive;
      switch(aid){
        case'boost':if(ns.stats.pp>=15){ns.stats.pp-=15;nc=Math.min(100,ctrl+12);}else ok=false;break;
        case'defend':if(ns.stats.pp>=30){ns.stats.pp-=30;ns.flags['tile_def_'+tid]=7;}else ok=false;break;
        case'rally':if(ns.stats.pp>=10){ns.stats.pp-=10;nc=Math.min(100,ctrl+8);ns.stats.ss=Math.min(100,ns.stats.ss+3);}else ok=false;break;
        case'speech':if(ns.stats.pp>=20){ns.stats.pp-=20;nc=Math.min(100,ctrl+10);ns.stats.ss=Math.min(100,ns.stats.ss+5);}else ok=false;break;
        // B3专有
        case'b3_under':if(ns.stats.tpr>=20){ns.stats.tpr-=20;nc=Math.min(100,ctrl+10);ns.stats.ss=Math.min(100,ns.stats.ss+2);}else ok=false;break;
        case'b3_fort':if(ns.stats.pp>=50){ns.stats.pp-=50;ns.flags['tile_def_'+tid]=14;}else ok=false;break;
        case'b3_leaf':if(ns.stats.pp>=25){ns.stats.pp-=25;nc=Math.min(100,ctrl+8); ns.stats.radicalAnger=Math.min(100,ns.stats.radicalAnger+5); ns.stats.ss=Math.min(100,ns.stats.ss+4);}else ok=false;break;
        // 行政楼
        case'adm_infil':if(ns.stats.pp>=30){ns.stats.pp-=30;nc=Math.min(100,ctrl+5);ns.stats.capitalPenetration=Math.min(100,ns.stats.capitalPenetration+10);}else ok=false;break;
        case'adm_hack':if(ns.stats.pp>=80){ns.stats.pp-=80;if(Math.random()*100<ns.stats.ss)ns.stats.ss=Math.min(100,ns.stats.ss+20);else ns.stats.stab=Math.max(0,ns.stats.stab-15);}else ok=false;break;
        // B1/B2生活区
        case'b12_awk':if(ns.stats.pp>=30){ns.stats.pp-=30;const cv=ctrl*.2;nc=Math.max(0,ctrl-10);ns.stats.ss=Math.min(100,ns.stats.ss+cv);}else ok=false;break;
        case'b12_dump':if(ns.stats.stab>=5){ns.stats.tpr+=300;ns.stats.stab-=5;}else ok=false;break;
        // 礼堂
        case'aud_coop':if(ns.stats.pp>=20){ns.stats.pp-=20;nc=Math.min(100,ctrl+10);ns.stats.allianceUnity=Math.min(100,ns.stats.allianceUnity+5);}else ok=false;break;
        case'aud_salon':if(ns.stats.pp>=40&&(prev.completedFocuses.includes('expand_assembly')||prev.completedFocuses.includes('democratic_reforms'))){ns.stats.pp-=40;nc=Math.min(100,ctrl+15);ns.stats.allianceUnity=Math.min(100,ns.stats.allianceUnity+5);}else ok=false;break;
        // 实验/技术
        case'lab_occ':if(ns.stats.pp>=20){ns.stats.pp-=20;nc=Math.min(100,ctrl+10);ns.stats.tpr+=50;}else ok=false;break;
        case'lab_print':if(ns.stats.tpr>=50){ns.stats.tpr-=50;ns.stats.pp+=20;}else ok=false;break;
        // 操场
        case'pl_sports':if(ns.stats.pp>=10){ns.stats.pp-=10;nc=Math.min(100,ctrl+10);ns.stats.studentSanity=Math.min(100,ns.stats.studentSanity+5);}else ok=false;break;
        case'pl_strike':if(ns.stats.pp>=30&&ns.stats.stab>=10){ns.stats.pp-=30;ns.stats.stab-=10;ALL_SUB_TILES.forEach(t=>{const cur=(ns.flags['tile_ctrl_'+t.id]as number|undefined)??t.studentControl;ns.flags['tile_ctrl_'+t.id]=Math.min(100,cur+5);});}else ok=false;break;
        // 吕波汉清洗行动
        case'lu_purge':if(ns.stats.pp>=20){ns.stats.pp-=20;const zk=`lu_purge_zone_level_tile_${tid}`;const lv=Number(ns.flags[zk]||0);if(lv<3)ns.flags[zk]=lv+1;ns.flags.lu_purge_map_actions=(ns.flags.lu_purge_map_actions||0)+1;nc=Math.min(100,ctrl+5);}else ok=false;break;
        // v8.5 吴福军戒严行动（校方视角：控制度下降=校方控制加强）
        case'wu_patrol':if(ns.stats.pp>=10){ns.stats.pp-=10;nc=Math.max(0,ctrl-12);if(ns.wuState)ns.wuState={...ns.wuState,guerrillaStrength:Math.max(0,ns.wuState.guerrillaStrength-1),studentAnger:Math.min(100,ns.wuState.studentAnger+1),crackdownActions:ns.wuState.crackdownActions+1};}else ok=false;break;
        case'wu_checkpoint':if(ns.stats.pp>=20){ns.stats.pp-=20;delete ns.flags['wu_cell_'+tid];ns.flags['tile_def_'+tid]=Math.min(14,((ns.flags['tile_def_'+tid]as number|undefined)||0)+5);if(ns.wuState)ns.wuState={...ns.wuState,studentAnger:Math.min(100,ns.wuState.studentAnger+2),crackdownActions:ns.wuState.crackdownActions+1};}else ok=false;break;
        case'wu_intel':if(ns.stats.pp>=15){ns.stats.pp-=15;if(ns.flags['wu_cell_'+tid]!==undefined)delete ns.flags['wu_cell_'+tid];else if(ns.wuState)ns.wuState={...ns.wuState,guerrillaStrength:Math.max(0,ns.wuState.guerrillaStrength-1)};}else ok=false;break;
        case'wu_arrest':if(ns.stats.pp>=25&&prev.flags.wu_arrest_unlocked){ns.stats.pp-=25;delete ns.flags['wu_cell_'+tid];nc=Math.max(0,ctrl-8);if(ns.wuState)ns.wuState={...ns.wuState,guerrillaStrength:Math.max(0,ns.wuState.guerrillaStrength-3),studentAnger:Math.min(100,ns.wuState.studentAnger+3),crackdownActions:ns.wuState.crackdownActions+1};}else ok=false;break;
        // 豪邦公社建设
        case'cm_build':if(ns.stats.pp>=25){ns.stats.pp-=25;const zk=`haobang_commune_zone_level_tile_${tid}`;const lv=Number(ns.flags[zk]||0);if(lv<3)ns.flags[zk]=lv+1;ns.flags.haobang_commune_map_actions=(ns.flags.haobang_commune_map_actions||0)+1;nc=Math.min(100,ctrl+8);ns.stats.ss=Math.min(100,ns.stats.ss+2);}else ok=false;break;
        // GX无政府行动（主题化）
        case'gx_anime':if(ns.stats.pp>=10){ns.stats.pp-=10;nc=Math.min(100,ctrl+8);if(ns.gouxiongState)ns.gouxiongState={...ns.gouxiongState,sanity:Math.min(ns.gouxiongState.maxSanity,ns.gouxiongState.sanity+3)};ns.stats.ss=Math.min(100,ns.stats.ss+2);}else ok=false;break;
        case'gx_meme':if((ns.gouxiongState?.sanity||0)>=5){if(ns.gouxiongState)ns.gouxiongState={...ns.gouxiongState,sanity:ns.gouxiongState.sanity-5};nc=Math.min(100,ctrl+12);if(Math.random()<0.4){const oKey=`gx_map_owner_tile_${tid}`;if(String(ns.flags[oKey]||'school')!=='gouxiong'){ns.flags[oKey]='gouxiong';nc=Math.max(60,nc);}}}else ok=false;break;
        case'gx_raid':if(ns.stats.pp>=15){ns.stats.pp-=15;nc=Math.min(100,ctrl+10);if(Math.random()<0.3){const oKey=`gx_map_owner_tile_${tid}`;if(String(ns.flags[oKey]||'school')!=='gouxiong'){ns.flags[oKey]='gouxiong';nc=Math.max(60,nc);}}}else ok=false;break;
        case'gx_cutwire':if(ns.stats.pp>=15){ns.stats.pp-=15;nc=Math.min(100,ctrl+15);if(Math.random()<0.5){const oKey=`gx_map_owner_tile_${tid}`;if(String(ns.flags[oKey]||'school')!=='gouxiong'){ns.flags[oKey]='gouxiong';nc=Math.max(65,nc);}}ALL_SUB_TILES.filter(t=>t.buildingId===tile.buildingId&&t.id!==tid).forEach(t2=>{const c2=(ns.flags['tile_ctrl_'+t2.id]as number|undefined)??t2.studentControl;ns.flags['tile_ctrl_'+t2.id]=Math.max(0,c2-5);});}else ok=false;break;
        case'gx_swarm':if((ns.gouxiongState?.sanity||0)>=8){if(ns.gouxiongState)ns.gouxiongState={...ns.gouxiongState,sanity:ns.gouxiongState.sanity-8};nc=Math.min(100,ctrl+18);tile.adjacentTo.filter(aid=>String(ns.flags[`gx_map_owner_tile_${aid}`]||'school')!=='gouxiong').forEach(aid=>{const ac=(ns.flags['tile_ctrl_'+aid]as number|undefined)??ALL_SUB_TILES.find(t=>t.id===aid)?.studentControl??50;ns.flags['tile_ctrl_'+aid]=Math.max(0,ac-8);});}else ok=false;break;
        case'gx_strike':if(ns.stats.pp>=20){ns.stats.pp-=20;nc=Math.min(100,ctrl+20);if(Math.random()<0.6){const oKey=`gx_map_owner_tile_${tid}`;if(String(ns.flags[oKey]||'school')!=='gouxiong'){ns.flags[oKey]='gouxiong';nc=Math.max(70,nc);}}}else ok=false;break;
        case'gx_backdoor':if(ns.stats.pp>=12){ns.stats.pp-=12;nc=Math.min(100,ctrl+12);if(Math.random()<0.4){const oKey=`gx_map_owner_tile_${tid}`;if(String(ns.flags[oKey]||'school')!=='gouxiong'){ns.flags[oKey]='gouxiong';nc=Math.max(62,nc);}}tile.adjacentTo.filter(aid=>String(ns.flags[`gx_map_owner_tile_${aid}`]||'school')==='gouxiong').forEach(aid=>{const ac=(ns.flags['tile_ctrl_'+aid]as number|undefined)??ALL_SUB_TILES.find(t=>t.id===aid)?.studentControl??50;ns.flags['tile_ctrl_'+aid]=Math.min(100,ac+5);});}else ok=false;break;
        // 民调/选举行动
        case'campaign':if(ns.stats.pp>=25&&(isPoll||isEl)){ns.stats.pp-=25;const bid=tile.buildingId;const loc=ns.mapLocations[bid];if(loc&&loc.pollingData){const cand=ns.electionState?.playerCandidate||'pan';ns.mapLocations[bid]={...loc,pollingData:shiftPoll(loc.pollingData,cand,isEl?12:4)};}nc=Math.min(100,ctrl+(isEl?3:1));}else ok=false;break;
        case 'yy_coord': if (ns.stats.pp >= 20 && ns.yangYuleState) { ns.stats.pp -= 20; ns.yangYuleState.teacherSupport = Math.min(100, ns.yangYuleState.teacherSupport + 3); ns.yangYuleState.fengFavor = Math.min(100, ns.yangYuleState.fengFavor + 2); ns.yangYuleState.health = Math.max(0, ns.yangYuleState.health - 1); ns.yangYuleState.studioAchievements = (ns.yangYuleState.studioAchievements || 0) + 1; } else ok=false; break;
        case 'jd_optimize': if (ns.stats.pp >= 20 && ns.jidiCorporateState) { ns.stats.pp -= 20; ns.stats.tpr += 80; ns.stats.studentSanity = Math.max(0, ns.stats.studentSanity - 2); ns.jidiCorporateState.gdp += 1; } else ok=false; break;
        default:ok=false;
      }
  if (!ok) return { state: prev, executed: false };
  if (nc !== ctrl) ns.flags['tile_ctrl_'+tid] = Math.max(0,Math.min(100,Math.round(nc)));
  ns.flags[`map_action_${aid}_${tid}_last_date`] = today;
  ns.flags['map_action_'+aid+'_last_date'] = today;
  if (['aud_coop','aud_salon','pl_sports','gx_anime'].includes(aid)) {
    const prior = prev.campaignStats ?? { days: 0, papersUsed: 0, papersPrinted: 0, clubEvents: 0, learningScoreTotal: 0 };
    ns.campaignStats = { ...prior, clubEvents: prior.clubEvents + 1 };
  }
  for (const bid of ['b3','admin','b1b2','auditorium','lab','playground']) {
    const tiles = ALL_SUB_TILES.filter(t=>t.buildingId===bid);
    ns.mapLocations[bid] = { ...ns.mapLocations[bid], studentControl: Math.round(tiles.reduce((sum,t)=>sum+tileControl(ns,t.id),0)/tiles.length) };
  }
  return { state: recordOpeningFieldwork(prev, ns, tid, aid, source), executed: true };
}
