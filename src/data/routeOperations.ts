import type { CommandRoute } from '../engine/commandTypes';
import type { LawSystemState } from './laws';

/** One route objective joins existing focuses, field actions, laws and decisions. */
export interface RouteOperation {
  focus: string;
  focusName: string;
  decision: string;
  decisionName: string;
  law: keyof LawSystemState;
  lawLevels: string[];
  lawName: string;
  actions: string[];
  result: string;
  preparationUse: string;
}

export const ROUTE_OPERATIONS: Record<CommandRoute, RouteOperation> = {
  opening: { focus: 'dorm_talks', focusName: '寝室里的熄灯夜话', decision: 'print_flyers', decisionName: '地下印刷红蛤传单', law: 'clubs', lawLevels: ['clubs_open', 'student_clubs'], lawName: '开放社团', actions: ['b3_under', 'aud_coop'], result: '学生支持', preparationUse: '传单网络' },
  revolution: { focus: 'underground_print', focusName: '地下印刷网络', decision: 'print_flyers', decisionName: '地下印刷红蛤传单', law: 'discipline', lawLevels: ['partial_autonomy', 'full_autonomy'], lawName: '学生自治', actions: ['b3_leaf', 'lab_print', 'rally', 'adm_hack'], result: '学生支持', preparationUse: '宣传与广播行动' },
  democracy: { focus: 'expand_assembly', focusName: '扩大学生代表大会', decision: 'campus_elections', decisionName: '校园民主选举', law: 'personnel', lawLevels: ['student_assembly_hr'], lawName: '学生评议会', actions: ['campaign', 'aud_salon'], result: '联盟团结', preparationUse: '选区组织' },
  reform: { focus: 'reform_focus_1', focusName: '下乡工作队', decision: 'reform_recruit', decisionName: '招募先锋党员', law: 'assessment', lawLevels: ['monthly_review', 'project_assessment'], lawName: '多元评价', actions: ['reform_mission'], result: '改革进度', preparationUse: '基层题改' },
  commune: { focus: 'commune_pilot_regions', focusName: '地区公社试点网络', decision: 'haobang_floor_coordination', decisionName: '楼层协调', law: 'clubs', lawLevels: ['clubs_open', 'student_clubs'], lawName: '开放社团', actions: ['cm_build'], result: '联盟团结', preparationUse: '公社楼层协调' },
  purge: { focus: 'great_purge_map_phase', focusName: '大清洗行动', decision: 'purge_revisionists', decisionName: '清洗修正主义者', law: 'discipline', lawLevels: ['strict', 'hengshui', 'panopticon'], lawName: '高压纪律', actions: ['lu_purge'], result: '党内集权', preparationUse: '地区整编' },
  wu: { focus: 'wu_night_patrol', focusName: '夜巡纠察队', decision: 'wu_raise_martial', decisionName: '提升戒严等级', law: 'discipline', lawLevels: ['strict', 'hengshui', 'panopticon'], lawName: '高压纪律', actions: ['wu_patrol', 'wu_intel', 'wu_checkpoint', 'wu_arrest'], result: '残党实力', preparationUse: '镇压情报' },
  yang: { focus: 'suppress_ghosts', focusName: '看不见的幽灵', decision: 'raid_dorm', decisionName: '突击查寝', law: 'personnel', lawLevels: ['teacher_council'], lawName: '教师代表制', actions: ['yy_coord'], result: '教师支持', preparationUse: '教师联络' },
  jidi: { focus: 'jidi_rnd_department', focusName: '组建教辅研发部', decision: 'jidi_sell_tpr_for_pp', decisionName: '出售多余教辅', law: 'assessment', lawLevels: ['daily_testing', 'weekly_testing'], lawName: '密集测评', actions: ['jd_optimize'], result: '企业 GDP', preparationUse: '教辅产销' },
  gouxiong: { focus: 'gx_cyber_archive_war', focusName: '艺术礼堂争夺战', decision: 'lower_sanity', decisionName: '推行二次元解构', law: 'clubs', lawLevels: ['clubs_open', 'student_clubs'], lawName: '开放社团', actions: ['gx_anime', 'gx_meme', 'gx_backdoor'], result: '狗熊理智', preparationUse: '礼堂动员' },
};
