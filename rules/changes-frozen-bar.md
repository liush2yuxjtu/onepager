---
title: Changes Preview Frozen Bar
impact: HIGH
impactDescription: 违反则改动预览条遮挡页面或默认铺开
tags: onepager, changes, preview, frozen-bar, collapse
---

## 改动预览 = 冻结窄门条，默认折叠

超长单 HTML / SPA 改动预览时，在文件顶部注入一条**默认折叠的冻结顶栏**：一行结论（"本次 N 处改动"）+ 每处改动一个可点 tag（`NEW #chg-2`），点"展开 ▾"才显示完整详情。

**Incorrect（默认展开占半屏）：**

```html
<div class="changes-bar">
  <!-- 3 行摘要 + 工具按钮 + 说明文字全部默认可见，遮挡页面 -->
</div>
```

**Correct（默认单行折叠 <40px）：**

```html
<div class="changes-bar" data-open="0">
  <span>▣ 3 处改动</span>
  <a class="oc-tag" data-target="chg-1">NEW #chg-1</a>
  <a class="oc-tag" data-target="chg-2">STRUCT #chg-2</a>
  <button id="oc-toggle">展开 ▾</button>
</div>
```

**Why:** 默认折叠 = 不遮挡页面，评审只看增量；展开 = 完整行动闭环。tag 即窄门，点击直达改动处。
