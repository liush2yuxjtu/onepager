---
title: Interaction Is the Interface
impact: CRITICAL
impactDescription: 违反则瘦身变静态文本，用户会回"我们失去了交互能力"
tags: onepager, interact, search, sort, checklist, copy
---

## 交互是接口，不是装饰

瘦身时可以砍内容，**绝不砍交互**。搜索 / 排序 / 聚焦 / 勾选 / 复制 是窄网关本身。

**Incorrect（瘦身成静态文本）：**

```html
<h2>Top 进程</h2>
<p>opencode 38%、trustd 24%、WindowServer 6%…</p>
<!-- 无搜索、无排序、无勾选、无复制 -->
```

**Correct（保留全部窄网关交互）：**

```html
<input class="search"> <table id="ptable" data-sortable>
<th data-k="cpu">CPU%</th>
<label class="check"><input type="checkbox">退出空闲会话</label>
<button id="copybtn">复制行动清单 (Markdown)</button>
```

**Why:** 交互是窄网关本身；砍掉它们 = 砍掉人↔agent 的协作通道。这是最常见的翻车点。
