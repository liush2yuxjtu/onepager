---
title: Action Loop Closure
impact: HIGH
impactDescription: 违反则诊断无法转化为行动决策
tags: onepager, interact, action, checklist, markdown
---

## 行动闭环

诊断必须带「行动」，行动可勾选、有进度、可一键复制为 Markdown（人把决策状态反馈回 agent 的窄门）。

**Incorrect（只诊断无行动）：**

```html
<div class="verdict">机器过热，热源是 opencode 74.8% CPU</div>
<!-- 没有可勾选行动、没有复制出口 -->
```

**Correct（可勾选 + 进度 + 复制）：**

```html
<label class="check"><input type="checkbox">退出空闲 opencode 会话
  <small>CPU 预计腰斩</small></label>
<div class="progbar"><i style="width:20%"></i></div>
<button id="copybtn">复制行动清单（Markdown）</button>
```

**Why:** 人把决策状态（勾选结果）通过窄门回传给 agent，协作闭环；否则报告看完即弃。
