---
title: Verdict First
impact: CRITICAL
impactDescription: 违反则结论埋深处，用户必须读完报告才知道结果
tags: onepager, ia, verdict, tldr
---

## 结论前置

标题下 5 秒内出现一句可行动的结论（TL;DR），证据按需下钻。人不该读完报告才知道结论。

**Incorrect（结论埋在深处）：**

```html
<div class="report">
  <section>采集命令清单…</section>
  <section>进程榜 20 行表格…</section>
  <section>内存分析…</section>
  <!-- 结论在第 4 屏才出现 -->
  <section class="verdict">热源 = opencode 74.8% CPU</section>
</div>
```

**Correct（首屏即结论）：**

```html
<div class="verdict">热源 = opencode 74.8% CPU + 内存打满（压缩器 6.8G）。</div>
<section class="details"><details>证据按需下钻…</details></section>
```

**Why:** 用户没耐心读完全文才得到结论；结论前置让 5 秒内可决策，其余证据是窄门后按需展开的细节。
