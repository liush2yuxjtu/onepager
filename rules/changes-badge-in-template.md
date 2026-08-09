---
title: Badge in Render Template
impact: HIGH
impactDescription: 违反则 SPA 渲染后元素被重建，改动标记丢失
tags: onepager, changes, spa, template, badge
---

## 改动徽章标在渲染模板里，不是静态 HTML

SPA 的视图内容由 JS 模板字符串渲染。改动徽章（`id="chg-N"`）必须注入在**渲染模板内**，否则视图切换重建 DOM 后标记丢失。

**Incorrect（标在静态 HTML 上）：**

```html
<!-- 静态位置注入徽章 -->
<button data-nav="experts">专家团 <em id="chg-2">STRUCT</em></button>
<!-- SPA render() 重建 innerHTML 后此标记消失 -->
```

**Correct（标在渲染模板里）：**

```javascript
function expertCard(e) {
  const badge = e.id === 'supply-chief'
    ? `<em id="chg-3" class="chg-badge">新技能</em>` : '';
  return `<article class="card">...${badge}...</article>`;
}
```

**Why:** SPA 每次视图切换都会重建 DOM；只有模板内的标记才能随视图渲染重现，跳转定位才可靠。
