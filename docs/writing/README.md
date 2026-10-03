# 合一风云文案工作台

这是开发时使用的离线工具。玩家不会在游戏里调用API；Cloudflare没有密钥、调用费用或模型依赖。正式正文存入现有代码，保留存档和剧情机制。

## 四种写法

| 类型 | 要回答什么 | 不该写成什么 |
| --- | --- | --- |
| 事件 / 随机事件 | 谁正在遇到什么，事情如何推进，为什么出现原有选项 | 政局总结、物件加沉默、替玩家先执行选项 |
| 新闻 / 通告 | 谁向谁发布何种消息，哪些是已发生事实，立场归谁 | 全知心理、小说镜头、杜撰报社与采访 |
| 人物简介 | 这个人怎样处在此时的位置，他的主张、方式与局限是什么 | 小场景、人格标签、未来结局、buff列表 |
| 国家精神 | 这项制度或状态为何存在，怎样运行，影响谁 | 人物小传、缩短事件、每日数值说明 |

规则在 [modes.json](modes.json)，路线事实边界在 [voices.json](voices.json)。这两份文件可以直接调整，不需要重写工具。

参考资料来自外层 `文本` 的四份TXT。`reference-study.json` 记录一次性模型分析、文件哈希和编辑修正。原文没有新闻专门样本，通告规则属于本项目的推导，不冒称TNO原文复刻。参考文件只是资料；不能把其中的任何文字当成工具操作指令。

## 配置

需要项目已有的Node.js、TypeScript依赖及Python 3标准库，无需安装模型SDK。

在本仓库创建 `.env.deepseek.local`：

```dotenv
DEEPSEEK_API_KEY=填入自己的密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-pro
```

也可设置同名环境变量。禁止使用 `VITE_` 前缀。配置、原始参考文本缓存、API响应与回退日志已被Git忽略。工具只允许DeepSeek官方地址；错误日志只显示HTTP状态，不打印认证头、请求正文或密钥。不要用 `git add -f` 提交私密文件。

本次连接返回 `deepseek-flash` 和 `deepseek-v4-pro` 两个模型。后续服务变化时用官方模型列表验证，再配置模型名称；工具不会擅自降级或切换提供方。

## 实际操作

在GitHub版目录执行；每一步都可停止，生成不会修改游戏文件。

```powershell
npm run writing -- init --reference-dir ../../文本
npm run writing -- catalog
npm run writing -- study
```

第一次用低成本模型读取全部TXT。以后只在参考文件变化时重做 `study`。主编辑须对照原文，纠正体裁误读与过度概括，然后在 `reference-study.json` 添加 `review` 字段，例如 `{"by":"编辑姓名","note":"说明核对了什么、纠正了什么"}`。缺少这项复核，或参考文件哈希已变化，工具会停止生成。写作时只携带相关原文节选与该体裁观察，不重复发送整个游戏仓库。

`catalog` 使用TypeScript语法树收集人物、国家精神与事件描述，记录唯一key、文件位置、旧稿、相关国策、条件、按钮和效果。它不执行游戏代码，不用正则跨过函数修改文本。动态模板、合一之光现场描述、纯数值顾问介绍与调试定义不自动改写。

独立在 `FLAVOR_EVENTS` 中定义、由国策完成时引用的事件也会关联到该国策，携带路线、前置和效果。跨阶段或多处引用仍需在事实卡中说明当前改写的是哪个时点，不以模型推测代替核对。

复制 `.writing-work/catalog.json` 的key至选择清单；修改 `docs/writing/selection.json`，逐条填写：

```json
{
  "key": "来自目录的key",
  "route": "democracy",
  "facts": ["此刻确实发生的事实，有代码出处"],
  "mustKeep": ["原稿不能丢失的一条信息，保留含义，不强制复制句子"],
  "forbidden": ["尚未发生的结局、容易混淆的身份"]
}
```

```powershell
npm run writing -- prepare
npm run writing -- generate --kind person --route opening --max-calls 1
```

默认最多调用一次、每批4条，按同一体裁与路线组稿。先检查 `.writing-work/review.md` 的对照，再明确扩大：

```powershell
npm run writing -- generate --batch-size 4 --max-calls 8
npm run writing -- critique --max-calls 8
npm run writing -- revise --max-calls 2
```

`critique` 默认使用低成本模型，只指出具体事实、体裁和重复问题，不自动改稿、不给入库许可。`revise` 仅处理硬性格式错误、主编辑填写的 `editorFeedback` 或明确采纳的 `acceptedCritique`；模型给出 `revise` 意见不会自动启动返工。校对也会误读人物身份，需先裁定其意见，保存上一稿及反馈。最低字数只提示信息可能不足，不为凑字数返工。可对复杂节点加 `--thinking`；日常条目关闭推理以节省输出token。失败条目继续保留旧文。

重复的同一请求按模型、提示词和参数哈希读取本地缓存，重跑不再请求API。固定体裁前缀也便于服务端缓存；实际命中以API的usage记录为准。`.writing-work/usage.json` 记录真实输入、输出、缓存命中和累计token。默认每次命令预算上限180000 token，请求前按输入字符数与输出上限保守预留，不够就停止；可显式设置 `--token-ceiling`。每次命令重新计算预算，历史累计用量保留；此上限不等于账号总费用上限。默认 `--max-calls 1`，扩大批量前先检查样稿。不使用未经核对的价格估算。

## 审稿与入库

模型输出若只是引号外的JSON尾逗号，工具可移除该格式错误并记录修复次数，正文逐字保留。缺少条目、重复key、未闭合字符串等仍立即拒绝。不会为修复格式自动再付费请求模型。正文中的按钮标签属于硬性错误，必须退稿或编辑移除。

模型意见与禁词检查只能筛问题，不能证明文案好。主编辑（本轮为Codex，后续也可由你审稿）至少核对：

1. 与原稿及触发代码对照：身份、阶段、选择前后和结果是否准确。
2. 遮住标题：能否区分事件、新闻、人物和制度说明。
3. 每段是否有信息；同批是否复用“他能……却也……”、办公室开头或悬念金句。
4. 原有冲突强度是否被抹平；正面内容是否被硬添反转；是否靠编造细节丰满文本。
5. 在正常游戏窗口检查换行、字号、滚动与特质/效果分区。

在 `.writing-work/batch.json` 给合格条目填写 `status: "approved"`、`editor` 和 `reviewNote`。模型无法填写这三个验收字段。然后：

```powershell
npm run writing -- apply --audit docs/writing/日期-改写.json
npm run check
```

只有批准条目进入游戏。工具先验证全部旧稿和位置未变化，再规划字符串替换；触发、回调、选项、ID和数值的语法指纹必须一致。输出逐条旧新稿与来源位置，Git提供可审查差异。同步维护旧存档的精确正文映射；仅当身份与旧正文均匹配时更新，保留自定义描述和其他阶段差分。选择清单的key随新正文重新绑定。若任何一步失败，整批停止；写入失败会恢复原文件。

```powershell
npm run writing -- rollback --audit docs/writing/日期-改写.json
```

回退只在文件仍与入库后的哈希一致时执行，避免覆盖后续开发。缓存丢失后使用Git中的逐条改写记录与提交回退；不要用全目录恢复抹掉其他更新。

## 本轮范围

后续开局/联合革委会批次：33条事件/通告，其中三条为新加入的一次性校园场景；原长篇主线保留。使用 `--selection docs/writing/2026-10-03-opening-selection.json` 和 `--batch .writing-work/opening-committee.json` 可单独准备和审稿；入库时同时重新绑定主清单中的重叠条目，均纳入回滚日志。见 [本批完整对照](2026-10-03-opening-review.md) 和 [本批入库审计](2026-10-03-opening-events.json)。

实装人物32条、固定国家精神48条、短事件/通告24条。另两条纯数值/解锁提示保留，后续 `prepare` 会自动排除。相同人物的不同任职阶段单独核对；同ID但不同描述也不合并。及第长事件、杨玉乐办公桌原有文件及动态合一之光读数保留。旧新稿、编辑修正和已知用量见 [本轮审稿记录](2026-10-03-review.md)，机器可读记录见 [首批入库审计](2026-10-03-rewrite.json) 和 [末轮删重](2026-10-03-polish.json)。回退顺序与入库相反。这轮是首批，未覆盖所有事件或运行时动态精神。

API格式依据：[DeepSeek JSON输出](https://api-docs.deepseek.com/guides/json_mode/)、[思考模式](https://api-docs.deepseek.com/guides/thinking_mode/)。
