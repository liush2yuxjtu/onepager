---
title: Visual Density and Layout Discipline
impact: HIGH
impactDescription: 违反则交付物视觉过密、不对称或深色块突兀，用户判"乱"，窄门体验被布局毁掉
tags: onepager, compose, density, layout, grid, whitespace, spacing, responsive
---

## 视觉密度与布局纪律：对称网格 · 轻量结论条 · 留白呼吸

功能再完整的 onepager，布局一挤一乱，用户第一眼就放弃。**内容密度是布局层面第一红线**：密度 = 前景像素 / 页面总面积。教训实测：HITL 凭据页（4 张门卡 + 流程图 + 回传区）未约束布局时密度 0.186，是其它产物页（0.045–0.058）的 **4 倍**，用户直接回 "eval html is messy"。密度、对称、留白三件套做到位，页面"一眼不慌"。

**Incorrect（3+1 错落、深色巨块、卡片塞爆、无响应式）：**

```html
<!-- auto-fit 在 3 卡/4 卡时错落成 3+1，右下空一大块 -->
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px">
  <div class="gate">密码…（8 层信息 padding:14px）</div>
  <div class="gate">API Key…</div>
  <div class="gate">短信验证码…</div>
  <div class="gate">2FA 扫码…（含二维码，更高）</div>
</div>
<!-- 结论条：深蓝渐变巨块，压住浅色页面 -->
<div style="background:linear-gradient(135deg,#1e2a5a,#2d3e8f);color:#fff;padding:14px">
  卡住的原因不是"没凭据"…
</div>
<!-- 卡片内 8+ 层信息，行距紧，字号 11.5/12/12.5 混用 -->
```

**Correct（对称网格、轻量结论条、留白、响应式）：**

```html
<style>
  .gates{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
  @media (max-width:760px){.gates{grid-template-columns:1fr}}
  .gate{background:#fff;border:1px solid #e4e6ef;border-radius:14px;padding:16px 16px 18px}
  .verdict{background:#eef1fb;border:1px solid #c6cdf2;border-left:4px solid #4f6bf0;
           border-radius:12px;padding:14px 18px}
  .gate p{font-size:13px;line-height:1.6}   /* 正文行距 ≥1.5× */
  .meta{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px}
</style>
<!-- 结论条：浅色卡片 + 主色左边框，不压页面 -->
<div class="verdict"><b>卡住的原因不是"没凭据"…</b></div>
<!-- 4 张凭据门：2×2 对称，无右下空洞；卡片留白，信息分层 -->
```

**Why:** 布局是窄门体验的地基——用户先扫一眼布局"慌不慌"，再决定要不要进任何一扇门。3+1 不对称（`auto-fit` 的错落）产生视觉空洞；深色渐变结论条在浅色页里抢走全部注意力；卡片 8+ 层信息贴在一起、字号层级混乱，人找不到重点。密度可量化自查：整页截图量前景占比，正文行距 ≥1.5× 字号、卡间距 ≥14px、左右留白 ≥10%。对称网格（2×2）让眼睛有稳定轨道，轻量结论条让结论第一时间可读，留白让每层信息有呼吸——这才是"窄门"该有的第一印象。窄屏降单列是移动可读的底线（对应法则 6 手机可看）。
