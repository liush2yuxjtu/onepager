---
title: Proactive SVG Data & UI Visualization
impact: HIGH
impactDescription: 有形状的数据/界面不画 SVG = 丢窄门（用户追问 "where is the visual SVG?"）；引 CDN 图表库或手写 SVG 犯 foreign-HTML 错 = 破自包含或只出外框+空白
tags: onepager, compose, svg, viz, charts, ui-mock, inline, self-contained
---

## 数据与界面有形状就主动画内联 SVG

只要内容有形状——数据（占比/分布/趋势/流程/层级/对比/状态机）**或界面**（UI mock/交互流程/故事板/快照/侧边栏/表单/气泡/按钮）——就**主动手写内联 `<svg>`** 画出来，而不是只堆 HTML 表格、贴数字文本，或只给一句"界面长这样"的文字描述。原生 `<svg>` 手写 1-5KB 就够，禁止引 CDN 图表库。手写时遵守 SVG 是 XML 的纪律。**别等用户追问"where is the visual SVG?"**——交付物在讲 UI/UX/流程/数据时，默认就该有一张内联 SVG。

**Incorrect（只给表格/数字，或引 CDN 图表库）：**

```
热源榜
<table>
  <tr><td>opencode</td><td>71%</td></tr>
  <tr><td>chrome</td><td>14%</td></tr>
</table>
```

```
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>  ← 违背单文件自包含
```

- 表格要逐格读，人抓不到形状；图表一眼看出"第一根条是别人的两倍"
- CDN 一断网整页图表消失，违反法则 6

**Correct（主动手写小 SVG，每个 SVG 只画一个窄信息）：**

```
<svg viewBox="0 0 300 22" role="img" aria-label="CPU 占用横向条">
  <rect x="0" y="6" width="200" height="10" rx="5" fill="#313244"/>
  <rect x="0" y="6" width="142" height="10" rx="5" fill="#89b4fa"/>
</svg> opencode 71%
```

- 1-5KB 内联，随 CSS 主题配色，可加 hover/点击，离线自包含
- 结论旁一行小图 = 更窄的门，证据表格仍可留在 `<details>`

**界面也同理——UI/流程/故事板要画成 SVG mock，不只是一句话或一张外链截图：**

**Incorrect（讲界面只给文字描述或外链截图）：**

```
界面：左侧是聊天面板（输入框 + 气泡消息），右侧 7:3 是画布，
顶部是项目管理……（十行文字，用户脑补界面长什么样）
或
<img src="snapshot.png">  ← 外链，搬移即破图
```

**Correct（把界面画成内联 SVG mock）：**

```
<svg viewBox="0 0 640 360" role="img" aria-label="webapp 布局 mock">
  <rect x="0" y="0" width="190" height="360" fill="#1e1e2e"/>        <!-- 左侧栏 -->
  <rect x="8" y="12" width="174" height="28" rx="14" fill="#313244"/> <!-- 搜索框 -->
  <rect x="0" y="190" width="640" height="6" fill="#89b4fa"/>         <!-- 中间分隔线 -->
  <g> <!-- 右侧 7:3 画布区 -->
    <rect x="200" y="40" width="300" height="200" rx="8" fill="#313244"/>
    <circle cx="230" cy="90" r="18" fill="#a6e3a1"/>                   <!-- 画布上的节点 -->
  </g>
</svg>
```

- 一眼看到布局，胜过十行文字；离线自包含，不靠外链截图

**手写 SVG 的纪律（违反 = eval 12 血泪："只渲染出最外层外框和标题，下面一大片空白"）：**

SVG 是 XML 命名空间，HTML 元素不会在里面渲染。

**Incorrect：**

```
<svg viewBox="0 0 400 200">
  <span class="badge">NEW</span>          ← <span> 不渲染
  <text x="20" y="30"><code>api</code></text>  ← <code> 不渲染
</svg>
```

**Correct：**

```
<svg viewBox="0 0 400 200">
  <g class="badge" transform="translate(20,20)">…</g>   ← 组合元素用 <g>
  <text x="20" y="30">api</text>                       ← <text> 只放纯文本
</svg>
```

**Why:** onepager 的窄门哲学要求"最小必要信息高效交换"，一图看形状是比逐格读表更窄的门。手写内联 SVG 同时守住法则 6（自包含）——既不引 CDN，也不外链文件。SVG 正确性坑源自它是 XML 不是 HTML：把 HTML 元素塞进去不会报错，只会静默不渲染，最终交付物看起来"半成品"。画图前先想"这个形状值不值得画"——每个指标一条 sparkline、每个流程一张节点图，胜过一张塞满 20 个指标的巨型图。
