---
title: Inline SVG & Images
impact: HIGH
impactDescription: 外链 SVG/图片破坏单文件自包含；独立资产文件不列清单 = 用户看不到子产物
tags: onepager, compose, assets, svg, inline, self-contained
---

## SVG / 图片资产：内联默认，子产物必须可见

交付物里的所有 SVG（hero/品牌图/图标/装饰）一律内联进 HTML；图片用 data URI。禁止外链文件引用，禁止"生成了文件就算交付"。

**Incorrect（外链文件 + 交付只报主 HTML）：**

```
uat-artifacts/
├── pitch-scripts.html   ← <img src="hero.svg"> 引用外部文件
└── assets/hero.svg      ← 用户不知道它存在，看不到图
交付汇报: "已生成 pitch-scripts.html"（子产物未列出）
```

- 页面一搬移/离线/换目录 → 破图（违反"单文件自包含"承诺）
- 用户打开主 HTML 看不到 hero 图，也不知道 assets/ 里有什么

**Correct（SVG 内联 + 交付列全清单）：**

```
uat-artifacts/pitch-scripts.html   ← <svg>...</svg> 直接内联在 body（15KB 自包含）
交付汇报:
- /Users/.../uat-artifacts/pitch-scripts.html （主产物，hero SVG 已内联，无外链资源）
- （如仍有独立资产）assets/hero-source.svg（源文件，页面内联使用）
```

- 单文件离线可开，搬移不破
- 交付汇报逐条列出全部产物文件 + 内联声明 → 用户不会"看不到子产物"

**Why:** 法则 6 承诺"单文件自包含、无 CDN、离线可用"——`<img src="hero.svg">` 让承诺在搬移/离线时破碎。更重要的是协作语义：用户要求的是"看到 SVG 子产物"，外链文件和"生成的独立文件"都只是存在磁盘上，人眼不可见；只有**内联渲染**或**汇报里明确列出路径**才构成交付。
