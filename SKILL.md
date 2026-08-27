---
name: onepager
description: >-
  用「窄门」哲学（SMALL_INTERFACE）创建或重构结论优先、自包含的交互式 HTML onepager。用户明确要求
  interactive HTML、dashboard、diagnosis page、可点击单页原型或离线浏览器工具时使用；用户虽未说 HTML，
  但表达了独立交付意图（无需前端项目、双击 / 本地 / 离线直接打开、standalone / self-contained / single-file），
  并需要搜索、筛选、排序、按需下钻、行动勾选、复制或状态回传时也要使用。
  也用于保留交互地瘦身臃肿报告、归集当前会话产物的 HTML recap / handoff、超长 HTML / SPA 改动预览、
  设计稿与 WebApp 漂移评测，以及密码、API key、token、2FA、验证码或二维码的人机凭据接力页。
  不因 report、summary、plan、explainer、review、dashboard 或 HTML 等单个词触发；普通文字报告、领导汇报、
  Markdown 静态文档、代码审查、现有产品的 React/UI 修改和页面样式调整保持其原格式，除非用户明确要独立交互式 HTML 产物。
  当独立页面需要 visual sub-artifact、数据驱动 UI、生成式组件组合、状态绑定、结构化 patch 或 catalog 约束时也使用；
  先在原生单文件 HTML 与 onepager + json-render 之间路由，简单页面不得仅因 dashboard、图表或 HTML 等词误上 React。
---

# Onepager · 窄门单页

好的设计是信息之间的窄门（narrow gateway）：让人类、agent、webapp 通过**最小必要信息**高效协作，而不是搬运全部上下文。交付物是一个 **onepager**：单文件交互式 HTML，结论在前、细节折叠、交互即接口。

## 先选路由

开工前先用一句话写明选择，例如「走原生 onepager，因为只有静态结论和两个轻交互」。不要向用户追问，也不要同时实现两套。

| 路由 | 选择条件 | 交付 |
|---|---|---|
| 原生 onepager | 简单报告、静态诊断、少量搜索/折叠/复制、数据不会持续生成或结构化编辑 | 一个手写 HTML，内联 CSS/JS，无依赖、无构建 |
| onepager + json-render | visual sub-artifact、数据驱动组件组合、筛选/下钻/状态绑定、repeat/visibility/actions、流式生成、JSON Patch/Merge Patch、catalog 约束或多处复用 | Vite + React 开发，最终只交 `dist/index.html`，JS/CSS 全内联 |
| json-render 自定义 schema | 节点边、自由画布、地图图层、视频轨道、严格坐标等非树形语法 | 自定义 schema + 可信 renderer，最终仍打成一个 `dist/index.html` |

拿不准时走原生。React 的结构收益必须抵得过构建、bundle 和 QA 成本。选 json-render 后先读 `references/json-render-implementation.md`；需要生态选型时再读 `references/json-render-capability-map.md`，不要机械加载全部 reference。后文“主动手写 SVG”只约束原生路径；json-render 路径由 registry 内的可信组件绘制。

## 核心法则

1. **结论前置**：标题下 5 秒内出现一句可行动的结论（TL;DR），证据按需下钻。人不该读完报告才知道结论。
2. **窄网关，不搬运**：每个交互都是一扇窄门——搜索框只返回匹配行、聚焦链接只传一个 pane_id token、勾选清单只回传增量状态。绝不要把全量数据一次性铺开。
3. **交互是接口，不是装饰**：瘦身时可以砍内容，**绝不砍交互**。搜索 / 排序 / 聚焦 / 勾选 / 复制 是窄网关本身，砍掉它们等于砍掉人↔agent 的协作通道。这是最常见的翻车点（把页面瘦成静态文本 = 失败）。
4. **行动闭环**：诊断必须带「行动」，行动可勾选、有进度、可一键复制为 Markdown（人把决策状态反馈回 agent 的窄门）。
5. **诚实可审计**：标注采集命令 / 时间戳 / 来源；没问题就说没问题（"机器散热健康"），瞬时尖峰标注"非持续"。可复现才值得信任。
6. **单文件自包含**：原生路径无构建步骤；json-render 路径允许开发期构建，但最终必须输出一个 `dist/index.html`。两条路径都无 CDN、无外链资源、离线可用、手机可看。
7. **会话产物要主动归集，不等用户点名**：制作 session recap / handoff / 总结页时，先从当前聊天里的工具输出、已发布 artifact、明确出现过的文件路径/URL，以及本次工作使用的证据目录中归集主产物与 sub-artifact。main 页面直接列出每个有效链接；视频/音频/图片等关键媒体要在正文提供可见播放器或预览，不能只藏在折叠区。只归集有当前会话证据的项目，不能把全局 artifact 列表误当成当前会话。
8. **大体量原生产物才拆 main + subs**：默认仍交一个文件。只有用户明确需要多页或原生内容天然超过 200KB 时，才用轻量 `main.html` 加自包含 `sub-*.html`，避免每次重写全部证据。json-render visual sub-artifact 不走这条；它挂进同一个 host，并由 single-file 构建收进 `dist/index.html`。
9. **改动预览 = 冻结窄门条 + 定位闪烁**：交付物要改动时（尤其是超长单 HTML / SPA 原型），在文件顶部注入一条**默认折叠的冻结顶栏**：一行结论（"本次 N 处改动"）+ 每处改动一个可点 tag（`NEW #chg-2`）。tag 即窄门：点 tag → 定位到改动处（闪烁 + 金色边框 + tag 变 active），点"展开 ▾"才显示完整详情（摘要行 + 跳转 → + 勾选 + 复制 MD）。默认折叠 = 不遮挡页面，评审只看增量；展开 = 完整行动闭环。
10. **设计稿 vs WebApp = 漂移基准，不是数 selector**：对比设计稿（意图）与实现（交付）时，**不要数 selector/动作数量**（数量由架构决定，无意义）。要测**语义 Fidelity**——逐域分类 4 态：`full`（意图全落地）/ `partial`（部分落地）/ `gap`（设计有、实现无）/ `overflow`（实现有、设计未规划）。结论用分布 + 意图实现率（如 92% 123/133），并标注"溢出 ≠ 偏离"（工程超越设计）。方法：按域提取两侧动作集 → 求共享/独有 → 逐域判 4 态 → 对抗验证（子代理复核，纠正误判，如 chat 实为 full 非 partial）。
11. **SVG/图片 = 内联默认，子产物必须可见**：交付物里的所有 SVG（hero/品牌图/图标/装饰）一律内联进 HTML——`<svg>` 标签直接写入（可随主题配色、可交互）或 `data:image/svg+xml;utf8,` URI；图片（PNG/JPG 截图）用 base64 data URI 内联进对应的那个 HTML。**绝不允许 `<img src="hero.svg">` 外链文件**：法则 6 的"单文件自包含、离线可用"是承诺，外链文件一搬移、一离线、一换目录就破图。同理，**生成一个独立 .svg/.png 文件 ≠ 交付**——用户看不到"藏在 assets 目录里的下载链接"，子产物必须要么内联进 HTML 直接渲染，要么在交付汇报里逐条列出文件路径 + 打开方式。
12. **可视化实现服从路由**：原生路径用 1-5KB 的内联 SVG 表达一个窄信息，保持 `<g>` 和纯文本 `<text>`，不用 CDN 图表库。json-render 路径只在 spec 中放固定 `series/points/nodes/edges` 数据和有限视觉枚举；registry 的可信 React/DOM/SVG/Canvas 组件负责布局与 path 计算。禁止把任意 SVG path、HTML、CSS、JavaScript 或 React 源码塞进 spec。
13. **HITL = 人机凭据窄门：密码 / 密钥 / 验证码 / 二维码，安全可复制不卡死**：交付物需要人类提供**凭据**才能继续（输密码 / 填 API key / 填 token / 输 2FA 验证码 / 扫二维码登录）时，页面就是人↔agent 的凭据通道，必须给**凭据输入框**、**安全显示**、**扫码/复制出口**。(a) 凭据输入框 = 最小输入窄门：密码用 `type="password"`（👁 明文/星号切换），API key / token / 验证码用单行输入，placeholder 写清格式（如 `sk-...`、6 位数字），Enter 提交、支持粘贴，格式校验失败给即时反馈不吞掉。(b) 二维码 = 内联可见：需要扫码的场景（OTP / 2FA / 设备绑定）把二维码**直接内联**（data URI 或手写 SVG 网格）在 main 正文可见可扫，附过期倒计时 / 刷新，不只藏 `<details>`——否则手机扫不到、单文件自包含被破。(c) 复制/粘贴出口 = 不卡死：secret 一键复制（点选 + clipboard 按钮），复制后提示清剪贴板；输入 / 粘贴 / 扫码任一可用即可继续，不依赖单一方式。(d) 卡住要可见：等待人类输凭据时标注「在等什么 / 从哪拿 / 多久过期」+ 失败重试与过期兜底（重新生成 / 通知 / 离线通道），禁止静默挂起。(e) 安全纪律：secret 默认遮蔽、不落明文 DOM/日志，页面**零远程端点**（校验/复制全在本地 JS），页脚声明「凭据仅本机使用，不上传任何服务器」。
14. **视觉密度与布局纪律 = 呼吸感，不靠堆叠**：交付物再功能完整，布局过密也会被判"乱"——**内容密度是布局层面第一红线**。多张并列卡（凭据门 / 指标卡 / 流程步骤）用**对称网格**（2×2 优先，`repeat(auto-fit,minmax(300px,1fr))` 会出 3+1 错落的不对称空洞，禁用）；结论条 / TL;DR 用**浅色卡片 + 主色左边框**（不要深色渐变巨块压住浅色页面）；每张卡内 8+ 层信息时加 padding、加大行距、统一字号层级（标题 16 / 正文 13 / 辅助 11-12），宁可加高页面也不要贴成一条。窄屏（<760px）网格降单列。**自查法**：截整页图看密度，或量"文本行距 vs 字号"——正文行距应 ≥1.5×、卡间距 ≥14px、左右留白 ≥10%。密度、对称、留白三件套做到位，页面"一眼不慌"。

## 触发时机

先过一道门：**如果拿掉交互，用户仍能同样快地完成任务，就不要触发 Onepager。** 普通文字、Markdown、代码补丁或已有产品页面通常更小、更合适。

触发：

- 用户明确要求交互式 HTML、dashboard、诊断页，或要无需前端项目、可直接打开的独立浏览器工具 / 可点击单页原型，并需要搜索 / 筛选 / 排序 / 勾选 / 复制 / 按需下钻
- 用户要保留交互地瘦身 / 重构臃肿报告，或否定全量报告为「信息太多 / 失去交互」
- 用户明确要 HTML 形式的 session recap / handoff，并需要归集当前聊天产生或引用的 sub-artifact
- 用户要给超长单 HTML / SPA 原型做改动预览（「改了哪 / 怎么预览变更」）
- 用户要对比设计稿与实现（「benchmark design vs webapp / 设计稿和实现差多少」）
- 用户要 HITL 凭据页：密码、API key、token、验证码、二维码或「stuck waiting for human」
- 用户提到窄门 / small interface / narrow gateway / 最小必要信息，并且交互式 HTML 是合适产物

不触发：

- 只因请求中出现 report、summary、plan、explainer、review、HTML 等单个词
- 只需聊天内短答、领导汇报、普通文档、静态计划、短对比或 Markdown 清单
- 代码修改、产品 UI 小改动、页面样式调整；这些应直接修改目标产品，而不是另做评审页
- 用户明确要求「只在聊天输出 / 不要 HTML / 不创建 artifact」

## 工作流

### 0. 选路由并锁定边界

先按上表选择原生、标准 React schema 或自定义 schema。把来源项目绝对路径和当前 Pi session ID 记入交付约束。host 只管页面叙事、挂载、主题、输入数据和 action 回调；json-render 只管 schema、catalog、spec、state、actions、validation 和 renderer；registry 才能含可信实现代码。

### 1. 采集最小必要证据

先跑 1-3 个命令拿到最相关的指标（如诊断类：进程榜 + 负载 + 内存 + 热状态），把**每次采集的原始命令**记录进页面脚注。不要采集 20 个指标再挑 3 个。

### 2. 写一句结论

机器语言写结论：热源是谁、为什么、有没有更严重的问题。例："机器散热健康；热源 = opencode 多会话 71% CPU + 内存打满（压缩器 6.8G）。"

### 3. 列出热源/关键项，每项一扇门

每行 = 名称 + 一个关键指标 + 一个窄操作（聚焦窗口 / 展开详情 / 复制）。例：`38% opencode·会话A ── [聚焦 →]`。

### 4. 保留全部窄网关交互组件

- **搜索框**：输入即过滤（用户按需取行，页面不搬运全量）
- **可排序表头**：点击排序，带 ↑↓ 指示
- **聚焦链接**：指向真实窗口（见下方 herdr 模式）；不可用时标"—"
- **行动清单**：勾选 + 进度条 + 计数 + 复制 Markdown
- **折叠详情** `<details>`：全量证据收窄门，默认关闭

### 5. 证据收窄门

进程表 / 长说明 / 快照对比放 `<details>` 或搜索后按需出现，默认可见内容只留结论 + 窄操作。

### 6. 标注来源与生命周期

页脚必须标：来源项目名 + 绝对路径 + 会话 ID（Pi session 或生成者）；聚焦服务若起在后台，写明停止命令（如 `lsof -tiTCP:8791 -sTCP:LISTEN | xargs kill`）。

### 7. 主动归集当前会话的 sub-artifact

制作 session recap / handoff / 总结型 onepager 时，在写 HTML 前建立最小 artifact manifest；不要等用户追问“视频在哪里”。

1. **从会话证据归集**：回看当前聊天中工具返回的路径/URL、`artifact_publish` 的返回值、明确提到的交付文件，以及本次运行的输出/证据目录。若可调用 `artifact_list`，它只能辅助解析已知 artifact ID/URL；没有当前会话证据的条目不得混入。
2. **补扫明确目录**：只扫描本次会话已经使用过的输出目录，找 HTML、视频、音频、图片、PDF、trace、JSON/CSV 等交付或证据；不要递归扫描整个 home 或仓库来猜。
3. **去重并校验**：按规范化路径/URL 去重；本地路径须存在，链接须来自真实工具返回，禁止编造 URL。记录标题、类型、用途、路径/URL、是否主产物。
4. **main 里直接可见**：结论后放“会话产物”窄门列表，每项 = 名称 + 一句用途 + 真实链接。主视频/音频使用 `<video controls preload="metadata">` / `<audio controls preload="metadata">` 直接显示；关键图片显示缩略预览。关键媒体不能只放在 `<details>`。
5. **inline link ≠ base64 大文件**：这里的 inline 是“链接/播放器在 main 正文可见”，不是把几十 MB 媒体编码进 HTML。大媒体保留相对文件引用；小图片仍按资产内联规则处理。
6. **保持可携带**：同一交付目录内用相对路径；LAN artifact 使用 `artifact_publish` 返回的真实 URL；目录外本地文件若不复制，就清楚标注绝对路径和仅本机可用。
7. **空清单要诚实**：未发现 sub-artifact 时显示“本次会话未产生独立子产物”，不要静默省略，也不要生成占位链接。

最小 manifest 可留在生成过程内，不必新增永久 JSON 文件；已有 manifest 就复用，YAGNI。

### 8. 组合产物：main + subs 拆分

产物预计超 200KB 或天然多页时：

1. **拆**：把数据看板 / 明细附录 / 逐模块详情各自拆成独立 `sub-*.html`，每个遵守法则 1-6，自包含可独立打开。
2. **main 只留窄门**：`main.html` = 结论前置 + 每个 sub 一行摘要 + `<details>`/链接/`<iframe src="sub-x.html">` 按需加载，绝不内联 sub 内容。
3. **链接用相对路径**：`<a href="sub-x.html">` 或 `<iframe src="sub-x.html">`，离线可开。
4. **验证**：每个 sub 独立打开 OK；main 单独打开 OK；main 体积 < 50KB。

### 9. 超长单 HTML / SPA 的改动预览

交付物是超长单文件（>200KB 或 SPA hash 路由）时，改动预览这样做：

1. **注入冻结窄门条**：文件 `<body>` 后插入固定顶栏，默认折叠成一行：`▣ N 处改动 + [tag#chg-1][tag#chg-2]... + 展开 ▾`。高度 <40px 不遮挡页面。
2. **改动处打锚点**：每处改动在**渲染模板里**（SPA 是 JS 模板字符串，不是静态 HTML）加 `<em id="chg-N" class="chg-badge">徽章</em>` + 徽章文本（NEW/CHANGED/版本号）。改渲染函数 = 视图切换后徽章才出现，符合"元素在子视图里"的真实场景。
3. **跳转 = 切视图 + 轮询 + 定位**：SPA 子视图改动在路由切换后才渲染，**不能只用 `getElementById`**。逻辑：先查元素 → 不存在则按映射（chg-4→experts 视图）点对应导航 → 轮询等待（150ms×30）→ 渲染后 `scrollIntoView` + 闪烁动画 + 金色边框 + tag 变 active。
4. **定位反馈不依赖滚动**：fixed 布局/侧边栏元素本来就在视口内，`scrollIntoView` 无效——用**闪烁 + 持久金色边框**（`.chg-located` 保留到下次跳转）做视觉定位，切换目标时自动清除上一个。
5. **避开 SPA 路由劫持**：hash 路由应用会拦截 `<a href="#chg-1">` 把 hash 改写成业务路由——跳转一律用 `href="javascript:void(0)"` + JS `scrollIntoView`，**不用 hash 锚点**。
6. **行动闭环**：展开详情 = 每处一行摘要（原→新）+ 勾选 + 复制 Markdown 清单回传设计者。

### 10. 设计稿 vs WebApp 漂移基准

对比设计稿与实现时（如用户说"benchmark design vs webapp"）：

1. **意图/交付定位**：设计稿 = 意图（intent），WebApp = 交付（delivery）。问题是"交付 vs 意图差距在哪、多大"，不是"谁的动作多"。
2. **提取两侧动作集**：按域（domain）收集设计稿与实现的交互动作/selector（`data-action` 等稳定标识）。记录每域：设计数、实现数、共享数。
3. **逐域判 4 态 Fidelity**：`full`（共享≈设计，意图全落地）/ `partial`（共享<设计，部分缺失）/ `gap`（设计有实现无）/ `overflow`（实现有设计无）。
4. **对抗验证**：对模糊判定派子代理复核（如 chat 域动作数比设计少但语义等价——对抗纠正 partial→full）。**对抗 verdict 是权威**，统计以它为准。
5. **可视化（onepager 化）**：
   - **漂移 Venne 图**：双圆交集=意图落地、左独=缺口（红）、右独=溢出（绿）
   - **域级双栏条图**：每域设计数 vs 实现数并排，爆点（如进化 29→53）高亮
   - **快照对比放 sub**：设计稿截图 vs 实现截图并排（base64 内联）**只放 sub-snapshots.html**，main 只放结论 + 每域链接——否则 main 膨胀到 MB 级违反法则 8
6. **结论公式**：意图实现率（共享/设计总数）+ Fidelity 分布 + 一句定性（"演进非偏离" / "工程超越设计，需回写设计稿 N 条"）。

### 11. 资产内联与子产物交付

产物含 SVG/图片时（hero、品牌图、截图、图表素材）：

1. **SVG 内联**：hero/图标/装饰一律内联 `<svg>` 标签（可随 CSS 主题配色、可交互）；确需 URI 时用 `data:image/svg+xml;utf8,`（注意 URL 编码 `#`→`%23` 等）。
2. **图片内联**：PNG/JPG ≤100KB 直接 base64 data URI 内联；更大的截图类图片内联进**对应 sub 页面**（法则 8），main 只留链接/iframe——否则 main 膨胀违反法则 8。
3. **交付汇报列全产物清单**：产物含任何图片/SVG 时，最终汇报**必须逐条列出全部产物文件绝对路径**（main + subs + 生成过程中的独立资产文件），并声明内联状态（如"hero SVG 已内联，页面无外链资源"）。只报"主 HTML 路径"、让子产物藏在目录里 = 用户看不到 = 交付失败。
4. **验证无外链**：产物内 `grep -cE '<img[^>]+src="(?!data:)' file` 应为 0；或浏览器打开后 Network 面板无资源请求/无 404。

### 12. 原生路径的数据与界面 SVG

本节只适用于原生 onepager。json-render 路径改读 `references/json-render-implementation.md`，使用受 catalog 约束的 LineChart、BarChart、Funnel 等 registry 组件，不在 spec 里写 SVG path。

在结论、热源行、对比区、流程区遇到有形状的数据，或要讲界面/交互/故事板时，主动手写内联 `<svg>`，别只给表格、数字或文字描述：

- 数据：占比/进度 → 环形或横向条；趋势 → 折线或 sparkline；分布 → 条图/热力格；流程/关系 → 箭头节点图或 swimlane；阈值命中 → 状态色点。
- 界面/流程/故事板 → **画成内联 SVG mock**：窗口框、侧边栏、输入框、气泡消息、按钮、表单控件、状态灯都画出来（参考 `rules/compose-svg-proactive.md` 的 UI mock 例）。这是用户反复要的"visual way"——交付物在讲 UI/UX/流程时，**默认就该有一张内联 SVG，别等用户追问"where is the visual SVG?"**。
- 每个 SVG 保持小（1-5KB），只画一个窄信息（一个指标、一条流程或一张界面 mock），散在对应窄门里，不聚成一张巨型图。
- 手写纪律：`<g>` 包裹徽标/组合元素；`<text>` 内纯文本；不用 `<span>`/`<div>`/`<code>` 进 SVG；坐标手算。犯这条 = 只出外框+标题、内部空白（eval 12 的血泪）。
- 图表库禁令：不为此引任何 CDN（chart.js/d3/echarts）——法则 6 是硬约束，原生 `<svg>` 足够。

### 13. HITL 凭据页面（人机凭据窄门）

交付物需要人类提供凭据才能继续时（输密码 / 填 API key / 填 token / 输验证码 / 扫二维码），按凭据窄门模式做：

1. **结论先讲卡在哪**：TL;DR 说明停在哪一步、缺哪个凭据、从哪能拿到。例："登录卡在第 2 步：需要人工输 6 位短信验证码，页面已备好输入框 + 过期倒计时，输完即继续。"
2. **凭据输入框（窄门核心）**：密码 `type="password"` + 👁 明文/星号切换；API key / token / 验证码单行 `input`，placeholder 写清格式（`sk-...` / 6 位数字 / 形如 `xxxx-xxxx`），Enter 提交、支持粘贴（onpaste）。格式校验失败给即时反馈（toast/红框 + 提示），不吞输入。
3. **二维码内联可见**：需要扫码（OTP / 2FA / 设备绑定）时把二维码直接内联——data URI（`<img src="data:image/...">`）或手写 `<svg>` 网格——放 main 正文可见可扫，附过期倒计时 + 刷新按钮；绝不外链二维码文件、绝不只藏 `<details>`（手机扫不到 = 卡死）。
4. **复制/粘贴出口**：secret 一键复制（点选 + clipboard 按钮），复制后提示清剪贴板（1-2 分钟自动清或提示手动）；输入 / 粘贴 / 扫码任一通道可用即可继续。
5. **状态可见**：每项等待态标注「在等什么 / 从哪拿 / 多久过期」+ 失败重试说明；过期兜底（重新生成 / 通知 / 离线通道），禁止静默挂起。
6. **安全纪律**：secret 默认遮蔽、不落明文 DOM/日志；页面**零远程端点**（校验/复制全在本地 JS）；页脚声明「凭据仅本机使用，不上传任何服务器」。
7. **结果回传窄门**：凭据成功即回显「已就绪」状态，结果可复制 Markdown 回传 agent 继续执行。
8. **画出来**：登录/认证流程用内联 SVG 画（流程箭头图 + 界面 mock，含密码框、验证码框、二维码、状态灯），遵循法则 12 手写纪律。
9. **可审计**：页脚标来源项目 + 事实核对（读了哪些文件/行号），诚实标注「已有」vs「缺」。

## onepager + json-render 合同

选择 json-render 后执行这些硬边界：

1. 使用真实 `defineCatalog`、spec、`defineRegistry` 和 `Renderer`。默认采用 React flat tree：`root/elements/props/children/slots/state/repeat/visible/on/watch`。
2. 标准 React schema 处理 KPI、dashboard、图表组合、诊断、矩阵、时间线内容、摘要、筛选和下钻。只有节点边、自由画布、地图图层、视频轨道、严格坐标等非树形语法才写 `defineSchema`。
3. 组件保持中等粒度并与任务相关。优先 `ArtifactFrame`、`Section`、`Stack`、`Grid`、`Metric`、`MetricGrid`、`LineChart`、`BarChart`、`Funnel`、`EvidenceTable`、`Finding`、`Callout`、`Legend`、`FilterBar`、`ActionBar`。拒绝 `Div`、`Span`、`Rect`、`Path`、`BlueBox`、`BigText`、`CustomHTML`、`CustomCSS`、`Script`、`FullBusinessDashboard`。
4. Catalog 每个 prop 只用一种稳定格式，少用 union；可选值用 nullable；视觉只给有限枚举和语义 `tone`；图表接收固定 `series/points`。spec 禁止任意 HTML、JavaScript、React 源码、`className`、`style`、`runScript`、`executeScript` 和任意 SVG path。
5. 按任务实际使用 state、repeat、visibility、actions、watchers、validation 和 `useBoundProp`，不靠 catalog 名字假装采用 json-render。host action 回调只能做本地状态、复制、下载等无后端动作。
6. SpecStream 先建立 root 和根容器，再首屏结论/KPI及其 state，再图表证据，最后次要交互。每一步引用的 element key 必须已经存在或在同一原子 patch 中建立。
7. 编辑单字段用 JSON Patch，结构区块用 Merge Patch，文本密集内容才用 diff。默认不全量重生成 spec。
8. 开发期可用 Vite + React。最终通过 `vite-plugin-singlefile` 产出一个 `dist/index.html`，不得加载外链资源。

完整实现、流式顺序、编辑协议和验证代码见 `references/json-render-implementation.md`。生态能力的使用边界和 single-file 适配性见 `references/json-render-capability-map.md`。

## 最小验证与停止条件

只跑一轮有界 QA。修复明确失败后最多复跑对应检查一次，不做无收益的截图审美循环或额外模型评审。

- 原生路径：打开 HTML，走核心交互，检查窄屏无横向溢出、键盘 focus、`prefers-reduced-motion` 和一次 axe；确认单文件与无外链。
- json-render 路径：先 build/typecheck；运行 `catalog.validate(spec)` 与 `validateSpec(spec)`；再执行 `node <skill-dir>/scripts/verify-output.mjs dist/index.html --spec <spec.json>`；打开 `dist/index.html`，验证核心筛选/下钻/状态动作、窄屏溢出和一次 axe。
- 两条路径都在页脚清楚标注来源项目名、绝对路径和当前 Pi session ID；生成后用系统默认浏览器打开。
- 全部通过就结束。关闭 dev server、preview、browser session、monitor、定时器和临时进程；对后台 PID 使用 `trap` 清理，确认子进程退出，不能让 `pi -p` 因长连接挂住。

## herdr 聚焦模式（可选增强）

当用户环境有 pane 管理器（如 herdr，先读 `~/.agent/memory/herdr.md`）时，把 HTML 里的条目连到真实窗口：

1. `herdr pane list` 拿 pane_id + 标题；`herdr pane process-info --pane <id>` 拿 PID，建立 PID→pane 映射
2. 起一个仅 loopback 的聚焦服务（Node 零依赖，见 `scripts/focus-server.cjs`），端点 `GET /focus?pane=<id>` 执行 `herdr agent focus <id>`
3. 页面每行渲染 `[聚焦 →]` 链接指向该服务；悬停显示 pane 标题
4. 验证：`curl` 后 `herdr pane get <id>` 的 `focused` 应为 true
5. 无 pane 管理器或用户未授权时，跳过此模式，标注"—"

## 检查清单（交付前自查）

- [ ] 已用一句话明确选择原生、标准 React schema 或自定义 schema；简单页面没有误用 json-render
- [ ] json-render 路径有真实 catalog/spec/registry，且 `catalog.validate` 与 `validateSpec` 通过
- [ ] json-render spec 无任意代码、`className`、`style`、脚本执行入口或任意 SVG path
- [ ] 最终交付为单文件；json-render 路径是 `dist/index.html` 且 JS/CSS 已内联
- [ ] 标题下 5 秒内看得到结论
- [ ] 每个关键项都有且只有一个窄操作
- [ ] 搜索 / 排序 / 勾选 / 复制 交互全部在（瘦身 ≠ 砍交互）
- [ ] 全量证据在 `<details>` 里，默认不可见
- [ ] 无 CDN、无外链、离线可开
- [ ] 页脚有来源项目 + 绝对路径 + 会话 ID
- [ ] 后台服务有停止命令
- [ ] 移动端宽度不破版（viewport meta + 窄屏可读）
- [ ] session recap / handoff：已从当前聊天与明确证据目录归集 sub-artifact，去重并验证存在
- [ ] main 正文直接列出全部会话产物链接；主视频/音频/关键图片可见，不只藏在 `<details>`
- [ ] 多页产物：已拆 main + subs，main < 50KB 且不内联 sub 内容
- [ ] 改动预览（超长单文件/SPA）：冻结窄门条默认折叠 <40px；跳转支持子视图（切视图+轮询）；定位用闪烁+持久边框非 hash 锚点
- [ ] 设计稿对比：按域提取两侧动作 → 4 态 Fidelity（full/partial/gap/overflow）→ 对抗验证 → Venne + 双栏条图；快照 base64 只放 sub
- [ ] SVG/图片全部内联（无 `<img src="*.svg">` / `*.png` 外链）；交付汇报已列出全部产物文件路径 + 内联声明
- [ ] 有形状的数据（占比/趋势/流程/对比）已主动手写内联 SVG 呈现，不只表格/文本
- [ ] 讲界面/交互/流程/故事板时已画内联 SVG mock（窗口/侧边栏/表单/气泡可见），不是只有文字描述或外链截图
- [ ] 手写 SVG 规范：无 `<span>`/`<div>`、`<text>` 内无嵌套 HTML（否则只出外框+空白）
- [ ] HITL 凭据页面：密码 `type="password"` 可切明文、API key/验证码输入框 placeholder 写格式、Enter 提交 + 粘贴可用
- [ ] 二维码（如需）内联可见（data URI / 手写 SVG），带过期倒计时/刷新，不只藏 `<details>`
- [ ] HITL 等待态标注「在等什么 / 从哪拿 / 多久过期」+ 失败重试/过期兜底，无静默挂起
- [ ] 凭据安全：默认遮蔽、不落明文日志、页面零远程端点、复制后提示清剪贴板、页脚声明仅本机使用
- [ ] HITL 凭据成功/失败状态可复制 Markdown 回传 agent
- [ ] 布局密度：多张并列卡用对称网格（2×2 优先），无 3+1 错落空洞；结论条浅色卡片 + 主色左边框，无深色渐变巨块；卡内信息留白、字号层级统一；正文行距 ≥1.5×、卡间距 ≥14px、左右留白 ≥10%；窄屏（<760px）网格降单列

## 反模式（血泪教训）

- ❌ 把报告"瘦身"成静态文本 → 砍掉了窄网关，用户会回"我们失去了交互能力"
- ❌ 全量表格默认平铺 20 行 × 6 列 → 搬运上下文
- ❌ 为了显得有用夸大结论（"机器快坏了！"）→ 毁信任
- ❌ 交互做装饰不做接口（动画很多，却没法聚焦真实窗口 / 复制结果）
- ❌ 改动预览条默认展开占半屏 → 遮挡页面；应默认折叠成一行 tag
- ❌ SPA 改动跳转用 `<a href="#chg-1">` → 被 hash 路由劫持（URL 变 `#/chat`），跳转失效；用 `javascript:void(0)` + JS 定位
- ❌ 子视图改动只 `getElementById` → 视图未渲染找不到元素；要"切视图 + 轮询等待"
- ❌ 改动定位依赖 `scrollIntoView` → fixed 布局下无效果；用闪烁 + 持久边框
- ❌ 改动标在静态 HTML 上 → SPA 渲染后元素被重建，标记丢失；要标在渲染模板里
- ❌ 对比设计稿/实现时数 selector 数量 → 数量由架构决定无意义；要测语义 Fidelity（4 态漂移）
- ❌ 快照 base64 内联进 main → main 膨胀到 MB 级；快照只放 sub-snapshots，main 留结论 + 链接
- ❌ 不做对抗验证直接下结论 → 模糊域误判（如 chat 语义等价被标 partial）；对抗 verdict 是权威
- ❌ 生成 `<img src="hero.svg">` 外链文件 → 单文件自包含被破坏（搬移/离线即破图）；应内联 `<svg>` 或 data URI
- ❌ session recap 只总结文字，不回看聊天里已经生成的视频/报告/trace → 用户还要追问“产物在哪里”；先归集 artifact manifest，再生成 main
- ❌ 主视频只放在“证据入口”折叠链接里 → 关键交付不可见；在正文直接放播放器 + 下载链接
- ❌ 为了“主动收集”把 `artifact_list` 全部条目或整个仓库扫描结果塞进页面 → 混入其他会话；只接受当前聊天或明确证据目录能证明归属的条目
- ❌ 交付汇报只给"主 HTML 路径"，SVG/图片子产物藏在 assets 目录不列清单 → 用户看不到子产物；必须逐条列出全部产物文件 + 内联声明
- ❌ 有占比/趋势/流程的数据只堆 HTML 表格或数字文本 → 一图看形状是更窄的门；主动手写内联 SVG（环形/条/折线/流程箭头/sparkline）
- ❌ 原生路径为画图引 chart.js / d3 / echarts CDN → 违背单文件自包含；手写 1-5KB SVG 即可
- ❌ json-render 路径仍手写业务 SVG path 到 spec，或把整块 dashboard 藏进一个 React 组件 → 绕过 catalog、patch 与 validation；spec 只放受 schema 约束的数据，registry 才画图
- ❌ 手写 SVG 用 `<span>` 包徽标、`<text>` 嵌 `<code>` → foreign HTML 不渲染，只出外框+标题+空白；用 `<g>` + 纯文本 `<text>`（eval 12 血泪）
- ❌ 讲界面/流程只给文字描述、HTML 片段或外链截图 → 用户反复追问 "where is the visual SVG?"；把 UI mock 画成内联 SVG（窗口/侧边栏/表单/气泡/状态灯可见）
- ❌ 输密码用 `type="text"` 明文、secret 落明文 DOM/日志 → 用 `type="password"` + 👁 明文/星号切换，遮蔽且不落日志
- ❌ 二维码外链 `<img src="qrcode.png">` 或藏 `<details>` → 单文件自包含被破、手机扫不到即卡死；data URI / 手写 SVG 内联 + main 正文可见
- ❌ 凭据输入框不写格式 placeholder、校验吞错 → 人类不知填啥（key 格式?几位?）、填错静默失败；placeholder 写格式 + toast/红框即时反馈
- ❌ 等待人类输凭据时静默挂起无过期 → 标注「在等什么 / 从哪拿 / 多久过期」+ 失败重试与过期兜底
- ❌ 复制 secret 不提示清剪贴板 / 页面调远程端点收集凭据 → 凭据泄露面扩大；复制后提示清剪贴板 + 页面零远程端点 + 页脚声明仅本机使用
- ❌ 布局过密（卡片 8+ 层信息贴死、字号 11.5-16 乱混、间距 <10px）→ 用户判"乱"，窄门体验被布局毁掉；按法则 14 加留白、统层级
- ❌ 多卡用 `repeat(auto-fit,minmax(300px,1fr))` → 4 卡错落成 3+1、右下空洞；用对称网格 2×2（窄屏降单列）
- ❌ 结论条 / TL;DR 用深色渐变巨块 → 在浅色页里抢走全部注意力；用浅色卡片 + 主色左边框

## 规则库（rules/）

每条反模式背后都有带正反例的完整规则，按需读取 `rules/`：

- `rules/_sections.md` — 5 大类索引（ia / interact / compose / changes / trust）
- `rules/ia-verdict-first.md` · `ia-narrow-gateway.md` — 结论前置 / 窄网关不搬运
- `rules/interact-interface.md` · `interact-action-loop.md` — 交互即接口 / 行动闭环
- `rules/compose-main-subs.md` · `rules/compose-inline-assets.md` · `rules/compose-svg-proactive.md` · `rules/compose-density-layout.md` — main + subs 拆分省 token / SVG·图片内联默认 / 主动 SVG 数据可视化 / 视觉密度与布局纪律（对称网格 · 轻量结论条 · 留白）
- `rules/changes-frozen-bar.md` · `changes-badge-in-template.md` · `changes-subview-jump.md` · `changes-flash-locate.md` · `changes-no-hash-anchor.md` — SPA 改动预览 5 条
- `rules/trust-honest-auditable.md` — 诚实可审计
- `rules/interact-hitl-input.md` — HITL 人机凭据窄门（密码/密钥/验证码输入 + 内联二维码 + 安全复制）

规则格式：frontmatter（title/impact/tags）+ Incorrect/Correct 代码对照 + Why 说明。做对应场景时先读对应规则文件。`rules/compose-svg-proactive.md` 仅用于原生路径；json-render 路径以 `references/json-render-implementation.md` 为准。
