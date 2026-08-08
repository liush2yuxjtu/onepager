---
name: onepager
description: >-
  用「窄门」哲学（SMALL_INTERFACE）设计 AI 生成的交互式 HTML 产物：结论前置、信息之间建立窄网关、
  每次交互只交换最小必要信息、默认不搬运全量上下文。Use this whenever the user asks for an interactive
  HTML report / dashboard / diagnosis page / explainer / plan page, or asks to slim down / redesign a
  bloated report, or mentions 窄门 / small interface / narrow gateway / 最小必要信息 / 交互式报告 /
  "make it interactive but not overwhelming" — even if they don't name the skill. Also triggers when the
  current session just produced a full-context dump (20-row tables, 5 tabs, long findings) and the user
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

## 触发时机

- 用户要「交互式 HTML / 诊断报告 / dashboard / 计划页 / explainer」
- 用户要瘦身 / 重构一份臃肿的报告（此时默认走"保交互砍内容"路线）
- 用户提到 窄门 / small interface / 最小必要信息
- 刚产出的全量报告被用户否掉（"信息太多" / "失去交互"）——立刻用本法则重做

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

## 反模式（血泪教训）

- ❌ 把报告"瘦身"成静态文本 → 砍掉了窄网关，用户会回"我们失去了交互能力"
- ❌ 全量表格默认平铺 20 行 × 6 列 → 搬运上下文
- ❌ 为了显得有用夸大结论（"机器快坏了！"）→ 毁信任
- ❌ 交互做装饰不做接口（动画很多，却没法聚焦真实窗口 / 复制结果）
