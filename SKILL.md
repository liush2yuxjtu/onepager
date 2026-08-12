---
name: onepager
description: >-
  用「窄门」哲学（SMALL_INTERFACE）设计 AI 生成的交互式 HTML 产物：结论前置、信息之间建立窄网关、
  每次交互只交换最小必要信息、默认不搬运全量上下文。Use this whenever the user asks for an interactive
  HTML report / dashboard / diagnosis page / explainer / plan page, or asks to slim down / redesign a
  bloated report, or mentions 窄门 / small interface / narrow gateway / 最小必要信息 / 交互式报告 /
  "make it interactive but not overwhelming" — even if they don't name the skill. Also use it for session recaps:
  proactively collect artifacts produced or referenced in the current chat and surface their links/media in the main page.
  Also triggers when the current session just produced a full-context dump (20-row tables, 5 tabs, long findings) and the user
  reacts with "this is not what we want" / "we lost the interactivity" — that reaction is the signal that
  Onepager was needed from the start: keep the interactions (search / sort / focus / check / copy),
  pass only minimal tokens through each gateway, never strip interactivity while slimming content.
compatibility: any environment where an AI agent can write a single self-contained HTML file and optionally run local CLI commands to wire real-window focus links.
---

# Onepager · 窄门单页

好的设计是信息之间的窄门（narrow gateway）：让人类、agent、webapp 通过**最小必要信息**高效协作，而不是搬运全部上下文。交付物是一个 **onepager**——单文件交互式 HTML，结论在前、细节折叠、交互即接口。

## 核心法则

1. **结论前置**：标题下 5 秒内出现一句可行动的结论（TL;DR），证据按需下钻。人不该读完报告才知道结论。
2. **窄网关，不搬运**：每个交互都是一扇窄门——搜索框只返回匹配行、聚焦链接只传一个 pane_id token、勾选清单只回传增量状态。绝不要把全量数据一次性铺开。
3. **交互是接口，不是装饰**：瘦身时可以砍内容，**绝不砍交互**。搜索 / 排序 / 聚焦 / 勾选 / 复制 是窄网关本身，砍掉它们等于砍掉人↔agent 的协作通道。这是最常见的翻车点（把页面瘦成静态文本 = 失败）。
4. **行动闭环**：诊断必须带「行动」，行动可勾选、有进度、可一键复制为 Markdown（人把决策状态反馈回 agent 的窄门）。
5. **诚实可审计**：标注采集命令 / 时间戳 / 来源；没问题就说没问题（"机器散热健康"），瞬时尖峰标注"非持续"。可复现才值得信任。
6. **单文件自包含**：无 CDN、无构建步骤、离线可用、手机可看。交付物不绑架用户环境。
7. **会话产物要主动归集，不等用户点名**：制作 session recap / handoff / 总结页时，先从当前聊天里的工具输出、已发布 artifact、明确出现过的文件路径/URL，以及本次工作使用的证据目录中归集主产物与 sub-artifact。main 页面直接列出每个有效链接；视频/音频/图片等关键媒体要在正文提供可见播放器或预览，不能只藏在折叠区。只归集有当前会话证据的项目，不能把全局 artifact 列表误当成当前会话。
8. **组合产物：main + subs，inline 链接省 token**：交付物需要多个页面时（如主报告 + 子报告 / 多 tab 数据看板 / 报告 + 附录），**不要把所有内容塞进一个超大 HTML**。分开生成：一个 `main.html`（结论前置 + 各 sub 的摘要行 + 链接/iframe）加多个 `sub-*.html`（每个自包含、可独立打开）。main 只放结论 + 窄网关，sub 才放全量证据。原因：单文件 >200KB 时，每次迭代 agent 都要重读/重写整份文件，token 成本爆炸、diff 难读、浏览器渲染卡顿；拆开后 main 始终轻量，只有打开对应 sub 才加载全量。
9. **改动预览 = 冻结窄门条 + 定位闪烁**：交付物要改动时（尤其是超长单 HTML / SPA 原型），在文件顶部注入一条**默认折叠的冻结顶栏**：一行结论（"本次 N 处改动"）+ 每处改动一个可点 tag（`NEW #chg-2`）。tag 即窄门：点 tag → 定位到改动处（闪烁 + 金色边框 + tag 变 active），点"展开 ▾"才显示完整详情（摘要行 + 跳转 → + 勾选 + 复制 MD）。默认折叠 = 不遮挡页面，评审只看增量；展开 = 完整行动闭环。
10. **设计稿 vs WebApp = 漂移基准，不是数 selector**：对比设计稿（意图）与实现（交付）时，**不要数 selector/动作数量**（数量由架构决定，无意义）。要测**语义 Fidelity**——逐域分类 4 态：`full`（意图全落地）/ `partial`（部分落地）/ `gap`（设计有、实现无）/ `overflow`（实现有、设计未规划）。结论用分布 + 意图实现率（如 92% 123/133），并标注"溢出 ≠ 偏离"（工程超越设计）。方法：按域提取两侧动作集 → 求共享/独有 → 逐域判 4 态 → 对抗验证（子代理复核，纠正误判，如 chat 实为 full 非 partial）。
11. **SVG/图片 = 内联默认，子产物必须可见**：交付物里的所有 SVG（hero/品牌图/图标/装饰）一律内联进 HTML——`<svg>` 标签直接写入（可随主题配色、可交互）或 `data:image/svg+xml;utf8,` URI；图片（PNG/JPG 截图）用 base64 data URI 内联进对应的那个 HTML。**绝不允许 `<img src="hero.svg">` 外链文件**：法则 6 的"单文件自包含、离线可用"是承诺，外链文件一搬移、一离线、一换目录就破图。同理，**生成一个独立 .svg/.png 文件 ≠ 交付**——用户看不到"藏在 assets 目录里的下载链接"，子产物必须要么内联进 HTML 直接渲染，要么在交付汇报里逐条列出文件路径 + 打开方式。

## 触发时机

- 用户要「交互式 HTML / 诊断报告 / dashboard / 计划页 / explainer」
- 用户要 session recap / handoff / 会话总结——默认主动归集当前聊天产生或引用的 sub-artifact
- 用户要瘦身 / 重构一份臃肿的报告（此时默认走"保交互砍内容"路线）
- 用户提到 窄门 / small interface / 最小必要信息
- 刚产出的全量报告被用户否掉（"信息太多" / "失去交互"）——立刻用本法则重做
- 用户要给超长单 HTML / SPA 原型做改动预览（"改了哪" / "怎么预览变更"）——用改动预览模式
- 用户要对比设计稿与实现（"benchmark design vs webapp" / "设计稿和实现差多少" / "selector 对比"）——用漂移基准

## 工作流

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

## herdr 聚焦模式（可选增强）

当用户环境有 pane 管理器（如 herdr，先读 `~/.agent/memory/herdr.md`）时，把 HTML 里的条目连到真实窗口：

1. `herdr pane list` 拿 pane_id + 标题；`herdr pane process-info --pane <id>` 拿 PID，建立 PID→pane 映射
2. 起一个仅 loopback 的聚焦服务（Node 零依赖，见 `scripts/focus-server.cjs`），端点 `GET /focus?pane=<id>` 执行 `herdr agent focus <id>`
3. 页面每行渲染 `[聚焦 →]` 链接指向该服务；悬停显示 pane 标题
4. 验证：`curl` 后 `herdr pane get <id>` 的 `focused` 应为 true
5. 无 pane 管理器或用户未授权时，跳过此模式，标注"—"

## 检查清单（交付前自查）

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

## 规则库（rules/）

每条反模式背后都有带正反例的完整规则，按需读取 `rules/`：

- `rules/_sections.md` — 5 大类索引（ia / interact / compose / changes / trust）
- `rules/ia-verdict-first.md` · `ia-narrow-gateway.md` — 结论前置 / 窄网关不搬运
- `rules/interact-interface.md` · `interact-action-loop.md` — 交互即接口 / 行动闭环
- `rules/compose-main-subs.md` · `rules/compose-inline-assets.md` — main + subs 拆分省 token / SVG·图片内联默认
- `rules/changes-frozen-bar.md` · `changes-badge-in-template.md` · `changes-subview-jump.md` · `changes-flash-locate.md` · `changes-no-hash-anchor.md` — SPA 改动预览 5 条
- `rules/trust-honest-auditable.md` — 诚实可审计

规则格式：frontmatter（title/impact/tags）+ Incorrect/Correct 代码对照 + Why 说明。做对应场景时先读对应规则文件。
