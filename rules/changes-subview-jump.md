---
title: Subview Jump: Switch View + Poll
impact: HIGH
impactDescription: 违反则子视图改动定位失败（元素未渲染）
tags: onepager, changes, subview, poll, routing
---

## 子视图跳转：切视图 + 轮询等待渲染

SPA 子视图的改动元素在路由切换后才渲染。跳转**不能只用 `getElementById`**——元素尚不存在时先切视图，再轮询等待渲染，然后定位。

**Incorrect（只 getElementById）：**

```javascript
function jump(id) {
  const el = document.getElementById(id);   // null：子视图未渲染
  el.classList.add('located');               // TypeError
}
```

**Correct（视图映射 + 轮询）：**

```javascript
const VIEW_FOR = { chg_4: 'experts', chg_5: 'projects' };
function jumpTo(id) {
  const el = document.getElementById(id);
  if (el) { flash(el); return; }
  const view = VIEW_FOR[id.replace(/-/g, '_')];
  if (view) {
    document.querySelector(`[data-nav="${view}"]`).click();
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (document.getElementById(id)) { clearInterval(t); flash(document.getElementById(id)); }
      else if (tries >= 30) { clearInterval(t); }
    }, 150);
  }
}
```

**Why:** 子视图改动是"元素在渲染后才存在"的真实场景；切视图 + 轮询（150ms × 30 = 最长 4.5s）保证渲染完成后自动定位。
