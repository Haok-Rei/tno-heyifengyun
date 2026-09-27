import type { GameState } from '../types';

export const CAMPUS_FLAGS = {
  school: { label: '合肥一中 · 校方体制', src: new URL('../assets/flags/school.svg', import.meta.url).href },
  coalition: { label: '联合革命委员会', src: new URL('../../art/国旗/联合革命合一旗.png', import.meta.url).href },
  red: { label: '钢铁红蛤 · 革命合一', src: new URL('../../art/国旗/钢铁红蛤合一旗.png', import.meta.url).href },
  democracy: { label: '民主合一', src: new URL('../../art/国旗/民主合一旗.jpg', import.meta.url).href },
  chendong: { label: '陈栋 · 民主复兴', src: new URL('../../art/国旗/民主陈栋合一旗.png', import.meta.url).href },
  culture: { label: '狗熊 · 社团合一', src: new URL('../../art/国旗/狗熊合一旗.png', import.meta.url).href },
  military: { label: '吴福军 · 秩序合一', src: new URL('../../art/国旗/吴福军合一旗.png', import.meta.url).href },
  study: { label: '杨玉乐 · 教学改革', src: new URL('../assets/flags/study.svg', import.meta.url).href },
  corporate: { label: '及第教育 · 企业合一', src: new URL('../assets/flags/corporate.svg', import.meta.url).href },
  security: { label: '吕波汉 · 保卫合一', src: new URL('../assets/flags/security.svg', import.meta.url).href },
} as const;

/** Leader overrides keep flags accurate after elections and a takeover inside the same tree. */
export function getCampusFlagKey(state: Pick<GameState, 'currentFocusTree' | 'leader'>): keyof typeof CAMPUS_FLAGS {
  const portrait = state.leader.portrait;
  if (state.leader.name === '封安宝' || portrait === 'feng_anbao') return 'school';
  if (state.leader.name === '陈栋' || portrait === 'chen_dong') return 'chendong';
  if (state.leader.name === '狗熊' || portrait === 'gouxiong') return 'culture';
  if (state.leader.name === '封安祥' || portrait === 'feng_anxiang') return 'corporate';
  if (state.leader.name === '吕波汉' || portrait === 'lu_bohan') return 'security';
  if (state.leader.name === '吴福军' || portrait === 'wu_fujun') return 'military';
  if (state.leader.name === '杨玉乐' || portrait === 'yang_yule') return 'study';
  if (state.currentFocusTree === 'treeA_true_left' || state.currentFocusTree === 'treeA_haobang') return 'red';
  if (state.currentFocusTree === 'treeA_pan' || state.currentFocusTree === 'treeA_pan_despair') return 'democracy';
  if (state.currentFocusTree === 'treeA') return 'coalition';
  if (state.currentFocusTree === 'treeB') return 'study';
  if (state.currentFocusTree === 'jidi_tree') return 'corporate';
  if (state.currentFocusTree === 'gouxiong_tree') return 'culture';
  if (state.currentFocusTree === 'treeA_lu_bohan') return 'security';
  if (state.currentFocusTree.startsWith('wu_tree')) return 'military';
  return 'school';
}
