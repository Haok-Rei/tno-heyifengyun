# The New Order: 合肥一中风云 - 开发者指南 (Developer Guide)

这份文档旨在为接手《合一风云》项目（包括使用 Claude Code 或其他 AI 辅助工具在本地进行离线开发）的开发者提供详尽的代码架构、状态管理和扩展指南。

## 1. 项目概述与技术栈

- **游戏类型**：基于 React 的文字策略/国家管理模拟游戏，高度借鉴《钢铁雄心4：TNO》的 UI 与核心机制（国策树、决议、危机、超级事件）。
- **前端框架**：React 18 + Vite
- **语言**：TypeScript (强类型约束，极其依赖 `src/types.ts`)
- **样式**：Tailwind CSS (纯 Utility-first，不使用额外 CSS 文件，复古 CRT 滤镜等效果通过 Tailwind 类名实现)
- **图标**：`lucide-react`

## 2. 核心架构与数据流

本游戏的核心是一个**单向数据流**和**Tick（心跳）驱动**的状态机。

- **全局状态源**：整个游戏的状态**只存在于** `src/App.tsx` 的 `gameState` (类型为 `GameState`) 中。
- **Tick 循环**：游戏通过 `useEffect` 设置的定时器触发“每日结算”（Tick）。每天过去，系统会自动：
  1. 结算资源产出（PP、TPR、稳定度等根据 `modifiers` 进行加减）。
  2. 扣除激活国策（Focus）的剩余天数，归零时触发国策完成奖励。
  3. 扣除危机（Crises）的剩余天数，归零时触发惩罚或 GameOver。
  4. 检查各种标志位（Flags）和条件，自动触发事件（Story Events / Flavor Events）。
- **组件通信**：所有的 UI 组件（如侧边栏、地图、特殊机制面板）都是**无状态（Stateless）或半无状态**的。它们接收 `gameState` 作为 Props 渲染界面，并通过传入的回调函数（如 `setGameState`, `onInteract`, `startFocus` 等）向 `App.tsx` 发送修改指令。

---

## 3. 详细目录与代码结构说明

所有源代码均位于 `/src` 目录下。

### 3.1 根级核心文件
- `src/types.ts`：**项目的心脏**。包含了游戏中所有数据结构的 TypeScript 接口定义。如果要增加新的数值、路线特殊状态（如 `GouxiongState`），必须先在此处修改 `GameState` 接口。
- `src/App.tsx`：**游戏引擎本体**。包含了主循环（Tick）、快捷键监听、音频播放控制、全局状态定义，以及渲染所有组件的根布局。
- `src/main.tsx` & `src/index.css`：标准的 Vite/React 挂载点和 Tailwind 全局样式配置。

### 3.2 `/src/components` (UI 与功能组件)
这里存放了所有的可视组件。大致分为三类：

**A. 核心 UI 框架**
- `TopBar.tsx`：顶部状态栏。显示日期、PP、TPR、稳定度等全局资源。
- `LeftSidebar.tsx`：左侧边栏。展示领导人头像、国家精神（National Spirits）以及**顾问（Advisors）雇佣系统**。
- `RightSidebar.tsx`：右侧边栏。展示**决议（Decisions）**与**危机倒计时（Crises）**。
- `CentralMap.tsx`：中央地图组件。处理合一校园各建筑（B3、艺术礼堂、行政楼等）的控制权争夺逻辑。

**B. 游戏系统面板**
- `FocusTree.tsx`：国策树系统。定义了所有路线的国策节点、前置条件、排他条件以及坐标位置。
- `EventPopup.tsx`：普通事件弹窗（带选项按钮）。
- `SuperEvent.tsx`：超级事件（Super Event）。带有 TNO 标志性的图片、名言、底色描边和音效。
- `Tutorial.tsx`：游戏教程与作战手册面板。
- `StartMenu.tsx` / `LoadingScreen.tsx` / `Settings.tsx` / `GameEndingScreen.tsx`：菜单与流程控制页面。

**C. 路线专属特殊机制**
不同领导人上台后解锁的特殊玩法面板（通常以全屏或半屏浮窗显示）：
- `StudentAssembly.tsx`：【潘仁越/自由派】学生代表大会机制（议会拉票、法案表决）。
- `ReformCommittee.tsx`：【王照凯/真左派】做题体制改革委员会（控制激进愤怒度与改革进度）。
- `RedToadPolitburo.tsx`：【王照凯】钢铁红蛤政治局（派系共识与清洗机制）。
- `CyberDeconstruction.tsx` & `GouxiongGalGame.tsx`：【狗熊/抽象派】赛博解构看番系统与 Galgame 好感度攻略系统。
- `YangYuleDesk.tsx`：【杨玉乐/反动派】特级教师办公桌（评正高级、喝茶养生）。
- `JidiCorporateUI.tsx`：【及第/资本派】及第企业管理（研发、市场份额抢占）。
- **小游戏系列**：`MinigameFrequencyWar.tsx` (频率战), `MinigameSiege.tsx` (阵地攻坚战), `MinigameNegotiation.tsx` (谈判局)。

### 3.3 `/src/data` (静态数据与配置)
所有的剧情文案都在这里，与 UI 逻辑分离。
- `storyEvents.ts`：主线剧情事件集合（Story Events）。通常带有 `isStoryEvent: true` 标记。
- `flavorEvents.ts`：随机事件、风味事件、机制结算事件的集合。
- `redToadBills.ts`：钢铁红蛤路线的特定法案数据。

### 3.4 `/src/config` (资源配置)
- `assets.tsx`：管理游戏中所有图片（头像、事件图、超级事件背景）和音频流的 URL 映射常量。

---

## 4. 后续开发与功能扩展指南 (供本地 Claude Code 参考)

在使用大模型（AI）协助开发时，请遵循以下流程以避免破坏现有状态。

### 4.1 如何添加一个新事件 (Event)
1. 打开 `src/types.ts`，确保 `GameEvent` 接口满足你的需求。
2. 打开 `src/data/storyEvents.ts` 或 `flavorEvents.ts`，在字典中新增你的事件对象：
   ```typescript
   export const STORY_EVENTS: Record<string, GameEvent> = {
     // ...
     my_new_event: {
       id: 'my_new_event',
       title: '事件标题',
       description: '事件描述文本...',
       buttonText: '按钮文本',
       isStoryEvent: true,
       effect: (state) => {
         // 可选：点击按钮后的状态修改回调
         return {
           stats: { ...state.stats, pp: state.stats.pp + 10 },
           flags: { ...state.flags, my_event_fired: true }
         };
       }
     }
   }
   ```
3. 在 `App.tsx` 的 Tick 循环或某个操作中，调用 `queueEvent(STORY_EVENTS.my_new_event)` 来触发它。

### 4.2 如何添加一个新国策 (Focus)
1. 打开 `src/components/FocusTree.tsx`。
2. 找到对应路线的数组（如 `TREE_A_WANG_NODES`）。
3. 添加一个新的 `FocusNode` 对象。必须提供全局唯一的 `id`，以及绝对定位坐标 `x` 和 `y`。
   ```typescript
   {
     id: 'my_new_focus',
     title: '国策标题',
     description: '描述...',
     days: 14, // 研究天数
     x: 500, y: 300, // 注意避开其他国策节点
     requires: ['previous_focus_id'], // 前置国策
     isHidden: (s) => !s.completedFocuses.includes('previous_focus_id'), // 隐藏条件
     onComplete: (s) => {
       // 完成后返回局部状态覆盖
       return {
         stats: { ...s.stats, stab: s.stats.stab + 5 }
       };
     }
   }
   ```

### 4.3 如何新增一条剧情路线或机制
1. **定义类型**：在 `src/types.ts` 的 `GameState` 中新增该路线专属的 State 属性（例如 `newRouteState?: NewRouteState`）。
2. **状态初始化**：在 `App.tsx` 的 `INITIAL_GAME_STATE` 和状态深拷贝逻辑中（Tick 循环开头）处理你的新状态，避免引用类型（指针）污染。
3. **创建组件**：在 `src/components` 新建你的机制 UI 文件（如 `NewMechanicUI.tsx`）。
4. **挂载 UI**：在 `App.tsx` 的渲染层中，根据条件判断挂载你的新组件（通常是一个占据绝大部分屏幕绝对定位的面板，类似于 `StudentAssembly` 的呈现方式）。
5. **交互逻辑**：从 UI 组件向上传递事件，在 `App.tsx` 中编写 `handleNewMechanicAction` 之类的函数来统一更新 `GameState`。

## 5. 常见注意事项与排错 (Troubleshooting)

1. **不可变数据 (Immutability)**：在 `App.tsx` 中修改 `GameState` 时，**绝对禁止直接修改原对象**。所有的数组和嵌套对象（如 `flags`, `stats`, `mapLocations`）必须使用展开运算符 (`...`) 或深拷贝（`JSON.parse(JSON.stringify(...))`）生成新对象后再返回给 `setGameState`。这在处理路线特有状态（如 `gouxiongState`）时尤为重要，很多 Bug 都源于引用污染。
2. **类型安全 (Type Safety)**：新增对象或属性如果没有在 `types.ts` 中声明，TypeScript 编译会报错（导致 Vite 页面崩溃）。务必先改类型。
3. **Super Event 阻塞**：超级事件（SuperEvent）在游戏中优先级极高。如果在代码中给 `activeSuperEvent` 赋了值，游戏会自动暂停且不显示常规事件。直到玩家点击确定关闭超事。
4. **事件队列**：`activeStoryEvents` 是一个数组。因为一天可能同时触发多个事件，必须把它们 push 到队列中。UI 会依次弹出队列首部的事件，玩家确认一个后，再弹出下一个。不要直接覆盖 `activeEvent` 否则会吞事件。

---
*Generated by Claude Code / AI Studio Build Environment*
