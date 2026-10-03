import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface GuideStep {
  title: string;
  body: string;
  anchor: string;
  section: string;
}

export const GUIDE_STEPS: GuideStep[] = [
  { section: '01 / 指挥台', title: '欢迎来到滨湖校区', body: '你将通过国策、决议、地图行动和法案改变合一的命运。教学期间时间暂停；跟随标记看完每个位置，再处理开场事件。', anchor: '[data-tour="rail"]' },
  { section: '02 / 核心数值', title: '资源决定行动空间', body: '顶栏依次是政治点数、稳定度、学生支持度和卷子储备。政治点数支付决议与地图行动；稳定度和支持度左右危机；卷子储备会随考试消耗。鼠标悬停可查看每日变化。', anchor: '[data-tour="resources"]' },
  { section: '03 / 时间', title: '先观察，再推进', body: '右上角可调速度、暂停或继续。国策按天完成，决议冷却、工作组行动与危机倒计时也随日期推进。遇到事件时先阅读，再继续时间。', anchor: '[data-tour="time"]' },
  { section: '04 / 国家', title: '领袖与派系', body: '国家面板展示当前领袖和意识形态分布。悬停领袖可看特质；悬停右侧各派别可看领导人、处境与介绍。剧情推进会改变这些内容。', anchor: '[data-tour="nation-overview"]' },
  { section: '05 / 国家', title: '国家精神与国策入口', body: '国家精神记录长期增益和负担。下方「当前国策」是国策树入口：选择一项后消耗日期研究，完成时才结算效果及后续事件。', anchor: '[data-tour="nation-focus"]' },
  { section: '06 / 国家', title: '任命内阁顾问', body: '顾问消耗政治点数，提供长期能力或开放路线。点击空缺位置可查看候选人的头像、特质和成本；已任命的顾问可更换。', anchor: '[data-tour="nation-cabinet"]' },
  { section: '07 / 国家', title: '校内法案改变日常', body: '六类法案决定每天的数值变化。点开一类可比较不同等级；切换需要政治点数，请留意稳定、支持和卷子储备的长期代价。', anchor: '[data-tour="nation-laws"]' },
  { section: '08 / 国策树', title: '看懂四种国策状态', body: '亮金框可立即选择；灰框仍缺前置或数值条件；青铜色为正在推进；绿框已完成。悬停查看条件、互斥分支和效果，拖动或滚动探索整棵树。一阶段B3起义只需激进愤怒度大于80，可由抗议、禁书与校园事件积累，不必点完全部国策。', anchor: '[data-tour="focus-tree"]' },
  { section: '09 / 决议与危机', title: '决议处理眼前局势', body: '左侧「决议」打开独立面板，可与国家面板同时存在。危机有倒计时，部分决议可化解危机或准备路线；需要检查花费、条件和冷却。', anchor: '[data-tour="decisions"]' },
  { section: '10 / 局势动态', title: '五种力量的消长', body: '决议面板顶部的五枚图标表示资本渗透、激进愤怒、联盟团结、党内集权与学生理智。内部填充越满，数值越高；悬停可查看准确数值、作用与每日变化。高数值并不总是有利，路线和行动会改变它们；吴公线会替换为戒严局势指标。', anchor: '[data-tour="situation-metrics"]' },
  { section: '11 / 校园地图', title: '点击地区下达行动', body: '地图上的建筑有控制度和各自行动。点击地区打开可拖动的小窗口，观察可用行动、花费与冷却；地图上的控制变化会影响路线推进。', anchor: '[data-tour="map"]' },
  { section: '12 / 地图图层', title: '切换势力、补给和部署', body: '势力显示控制归属，补给显示交通与连通，部署显示各方力量。右侧可切换图层，下方按钮或滚轮可缩放地图。', anchor: '[data-tour="map-layers"]' },
  { section: '13 / 战区工作组', title: '让行动自动重复', body: '先选地区，再给工作组指定该地区已有的行动与间隔。工作组定期重复执行，仍支付原行动代价；资源不足时会等待，路线变化可能中止任务。', anchor: '[data-tour="workgroups"]' },
  { section: '14 / 特色机制', title: '路线会解锁新的玩法', body: '学生代表大会、题改委员、红蛤政治局、戒严指挥等入口随剧情出现在左侧。革委会的代表大会同时展示团结与集权，两项独立变化；十字路口按席位与这两项数值决定路线。小游戏与地区工作相连，未解锁入口不会提前出现。', anchor: '[data-tour="rail"]' },
  { section: '15 / 合一之光', title: '看看这所学校', body: '「合一之光」从开局就能进入。校门、学生、老师与教学楼会随路线和合一值改变；悬停各处可读到当下的校园。国家精神中的合一之光只记录这种变化，不提供数值加成。', anchor: '[data-tour="heyi-light"]' },
  { section: '16 / 当前状况', title: '留意地图左上角', body: '小方框提示可选国策、决议、顾问空缺、法案、工作组和路线机制；危机不足10天、试卷库存偏低或工作组任务暂缓时，也会出现提醒。合一之光是常驻观赏入口，不占用提醒。悬停查看详情，左键直达界面，右键或聚焦后按 Delete 忽略30个游戏日；出现新选项会提前恢复提醒。', anchor: '[data-tour="action-reminders"]' },
  { section: '17 / 准备就绪', title: '现在由你指挥', body: '开场事件与国策选择在等你。遇到陌生机制时，可随时点击左侧「教学」重新走一遍；重看不会重置进度或资源。', anchor: '[data-tour="rail-tutorial"]' },
];

type Rect = { left: number; top: number; width: number; height: number };

export default function GuidedTutorial({ step, onStep, onFinish }: { step: number; onStep: (step: number) => void; onFinish: () => void }) {
  const [target, setTarget] = useState<Rect | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const current = GUIDE_STEPS[step];

  useLayoutEffect(() => {
    setTarget(null);
    const measure = () => {
      const element = document.querySelector<HTMLElement>(current.anchor);
      if (!element) return;
      if (element.closest('.nation-panel')) element.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      const r = element.getBoundingClientRect();
      const left = Math.max(0, r.left - 5);
      const top = Math.max(0, r.top - 5);
      setTarget({ left, top, width: Math.min(window.innerWidth - left, r.width + 10), height: Math.min(window.innerHeight - top, r.height + 10) });
    };
    const frame = window.requestAnimationFrame(measure);
    const retry = window.setTimeout(measure, 80);
    window.addEventListener('resize', measure);
    return () => { window.cancelAnimationFrame(frame); window.clearTimeout(retry); window.removeEventListener('resize', measure); };
  }, [current.anchor, step]);

  useEffect(() => {
    nextRef.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault(); nextRef.current?.focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
      } else if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault();
        if (step === GUIDE_STEPS.length - 1) onFinish(); else onStep(step + 1);
      } else if (event.key === 'ArrowLeft' && step > 0) {
        event.preventDefault(); onStep(step - 1);
      }
    };
    window.addEventListener('keydown', key, true);
    return () => window.removeEventListener('keydown', key, true);
  }, [step, onStep, onFinish]);

  const panelWidth = Math.min(370, window.innerWidth - 24);
  const placeRight = target && target.left + target.width + panelWidth + 28 < window.innerWidth;
  const panelLeft = target ? (placeRight ? target.left + target.width + 18 : Math.max(12, target.left - panelWidth - 18)) : Math.max(12, (window.innerWidth - panelWidth) / 2);
  const panelTop = target ? Math.min(Math.max(56, target.top), Math.max(56, window.innerHeight - 270)) : Math.max(56, (window.innerHeight - 240) / 2);

  return <div className="guided-tour" role="dialog" aria-modal="true" aria-label={`游戏教学：${current.title}`}>
    {target ? <>
      <div className="guided-tour__shade" style={{ left: 0, top: 0, right: 0, height: target.top }} />
      <div className="guided-tour__shade" style={{ left: 0, top: target.top, width: target.left, height: target.height }} />
      <div className="guided-tour__shade" style={{ left: target.left + target.width, right: 0, top: target.top, height: target.height }} />
      <div className="guided-tour__shade" style={{ left: 0, top: target.top + target.height, right: 0, bottom: 0 }} />
      <div className="guided-tour__target" style={target} />
    </> : <div className="guided-tour__shade" style={{ inset: 0 }} />}
    <div className="guided-tour__card" style={{ left: panelLeft, top: panelTop, width: panelWidth }}>
      <div className="guided-tour__eyebrow">作战教令 <span>{current.section}</span></div>
      <h2>{current.title}</h2>
      <p>{current.body}</p>
      <div className="guided-tour__footer">
        <span>{String(step + 1).padStart(2, '0')} / {GUIDE_STEPS.length}</span>
        <div>
          <button type="button" onClick={onFinish}>跳过教学</button>
          {step > 0 && <button type="button" onClick={() => onStep(step - 1)}>上一步</button>}
          <button ref={nextRef} type="button" className="guided-tour__primary" onClick={() => step === GUIDE_STEPS.length - 1 ? onFinish() : onStep(step + 1)}>{step === GUIDE_STEPS.length - 1 ? '完成教学' : '下一步'}</button>
        </div>
      </div>
    </div>
  </div>;
}
