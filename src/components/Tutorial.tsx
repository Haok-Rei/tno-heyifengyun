import React from 'react';
import { ASSET_URLS } from '../config/assets';

interface TutorialProps {
  onBackToMenu: () => void;
}

export default function Tutorial({ onBackToMenu }: TutorialProps) {
  return (
    <div className="relative h-screen w-screen overflow-auto bg-[#070a12] text-tno-text crt">
      <div className="pointer-events-none absolute inset-0">
        <img
          src={ASSET_URLS.ui_main_background}
          alt="Tutorial Background"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_15%,rgba(255,76,131,0.16),rgba(6,10,18,0.94)_58%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 border border-cyan-300/45 bg-black/55 p-5 backdrop-blur-sm md:mb-8 md:p-7">
          <p className="mb-2 text-xs uppercase tracking-[0.32em] text-cyan-200/85 md:text-sm">
            Operational Briefing
          </p>
          <h1
            className="text-3xl font-black tracking-[0.1em] text-white md:text-5xl"
            style={{ textShadow: '0 0 18px rgba(82,172,255,0.3), 0 0 30px rgba(255,78,126,0.2)' }}
          >
            教程与作战手册
          </h1>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-white/82 md:text-base">
            本页提供一份可直接上手的实操指南。先看指标，再看节奏，最后看路线分歧。只要能稳定处理危机倒计时，你就能把中后期局势拉回可控区间。
          </p>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-[340px_1fr]">
          <div className="space-y-4">
            <div className="border border-cyan-300/45 bg-black/60 p-3">
              <img
                src={ASSET_URLS.ui_thumbnail_1}
                alt="System"
                className="h-44 w-full object-cover md:h-52"
              />
              <p className="mt-2 text-center text-xs uppercase tracking-[0.18em] text-cyan-100/85 md:text-sm">
                系统指标与资源循环
              </p>
            </div>
            <div className="border border-cyan-300/45 bg-black/60 p-3">
              <img
                src={ASSET_URLS.ui_thumbnail_2}
                alt="Factions"
                className="h-44 w-full object-cover md:h-52"
              />
              <p className="mt-2 text-center text-xs uppercase tracking-[0.18em] text-cyan-100/85 md:text-sm">
                派系竞争与政治操作
              </p>
            </div>
            <div className="border border-cyan-300/45 bg-black/60 p-3">
              <img
                src={ASSET_URLS.ui_thumbnail_3}
                alt="Strategy"
                className="h-44 w-full object-cover md:h-52"
              />
              <p className="mt-2 text-center text-xs uppercase tracking-[0.18em] text-cyan-100/85 md:text-sm">
                国策路径与风险窗口
              </p>
            </div>
          </div>

          <div className="border border-cyan-300/45 bg-black/62 p-5 backdrop-blur-sm md:p-7">
            <div className="space-y-6 leading-relaxed">
              <section className="border border-tno-highlight/40 bg-tno-highlight/5 p-5">
                <h2 className="mb-3 text-xl font-bold text-tno-highlight">破晓之前：前五天如何指挥</h2>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-white/85">
                  <li>处理开场事件，从左侧主导航打开「国策」，选择开学典礼。</li>
                  <li>点击 B3、礼堂或操场，可以先手动执行已开放的地区行动。</li>
                  <li>在同一地区下方指定工作组每 2、4 或 7 天重复该行动，每次仍支付地图行动原价。</li>
                  <li>按空格继续时间。工作组按日结算；资源不足时暂缓，战报在地图下方出现。</li>
                </ol>
                <p className="mt-3 text-sm text-white/75">地图的「补给」图层仍能查看总部与邻接地区的连通情况；工作组不会创造新的独立行动，行动效果与地区按钮完全相同。</p>
                <p className="mt-3 text-sm text-white/75">可用工作组数随剧情和做题改革先锋党员数量变化。题改委员会派出的原有工作队会占用相同名额。公社、清洗和狗熊行动仍需先完成原有授权国策。国家与决议可以同时打开。</p>
              </section>
              <section>
                <h2 className="mb-2 text-xl font-bold tracking-[0.08em] text-cyan-200 md:text-2xl">一、核心指标如何理解</h2>
                <p className="text-white/85">
                  PP 决定你能否持续执行决议和关键动作；稳定度是系统容错上限；学生支持度决定事件处理后的反噬强度；TPR 是多数策略的资源底盘。
                  实战里优先级通常是：先保稳定度不崩，再保 TPR 不断，再用 PP 做节奏调度。
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-white/80">
                  <li>PP 低于 0 时操作空间会被严重压缩。</li>
                  <li>TPR 长期见底会触发连锁惩罚，后续很难修复。</li>
                  <li>稳定度和学生理智过低会拉高高风险事件权重。</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-2 text-xl font-bold tracking-[0.08em] text-cyan-200 md:text-2xl">二、派系不只是立场标签</h2>
                <p className="text-white/85">
                  各路线的核心区别在于“如何交换成本”。民主线用效率换稳定，极权线用稳定换后期风险，资本线用收益换社会承压。路线选定后，决议风格要一致，否则会出现指标互相打架。
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-white/80">
                  <li>路线切换窗口通常在重大事件节点前后出现。</li>
                  <li>不要同时追求高集权与高团结，两者天然冲突。</li>
                  <li>先决定结局方向，再倒推国策顺序。</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-2 text-xl font-bold tracking-[0.08em] text-cyan-200 md:text-2xl">三、国策是节奏控制器</h2>
                <p className="text-white/85">
                  国策不只是加成按钮，而是整局推进节拍器。先处理会触发危机倒计时或机制解锁的节点，再处理纯收益节点。遇到资源吃紧时，优先选择低成本且能缓解当前压力的国策。
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-white/80">
                  <li>开局 30 天重点：稳住 PP 和稳定度。</li>
                  <li>中局重点：补足 TPR 并控制危机数量。</li>
                  <li>后期重点：围绕目标结局进行单线冲刺。</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-2 text-xl font-bold tracking-[0.08em] text-cyan-200 md:text-2xl">四、常见失败路径</h2>
                <p className="text-white/85">
                  绝大多数失败都不是一次事件导致，而是三到五次错误决策叠加。常见问题是：只顾短期收益、忽略倒计时危机、在低资源状态下强行扩张。
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-white/80">
                  <li>看到危机天数进入 15 天内，优先处理危机。</li>
                  <li>当 PP 与 TPR 同时走低，应立刻进入保守节奏。</li>
                  <li>每月检查一次资源趋势，避免“慢性崩盘”。</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-2 text-xl font-bold tracking-[0.08em] text-cyan-200 md:text-2xl">五、推荐开局顺序（新手）</h2>
                <p className="text-white/85">
                  第一阶段建议以稳态为主：先保证日常资源净增长，再逐步推进路线核心节点。遇到剧情分支时，优先选能降低后续不确定性的选项。
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-white/80">
                  <li>先把稳定度和 PP 拉到安全区。</li>
                  <li>国策选择以“危机缓解 + 资源补给”为先。</li>
                  <li>确认路线后，集中资源推进关键分支。</li>
                </ol>
              </section>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center md:mt-8">
          <button
            onClick={onBackToMenu}
            className="border border-cyan-200 bg-black/75 px-8 py-3 text-sm font-bold uppercase tracking-[0.22em] text-cyan-100 transition-all duration-300 hover:border-pink-300 hover:bg-pink-500/20 hover:text-white md:text-base"
          >
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
}
