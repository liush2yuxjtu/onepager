---
title: Locate by Flash, Not Scroll
impact: HIGH
impactDescription: 违反则 fixed 布局下定位无效果，跳转"看起来失败"
tags: onepager, changes, locate, flash, outline
---

## 定位反馈不依赖滚动：闪烁 + 持久边框

fixed 布局 / 侧边栏元素本来就在视口内，`scrollIntoView` 无滚动效果。定位要用**闪烁动画 + 持久金色边框**（`.chg-located` 保留到下次跳转），切换目标时自动清除上一个。

**Incorrect（只 scrollIntoView）：**

```javascript
el.scrollIntoView({ behavior: 'smooth' });
// fixed 侧边栏元素：无滚动发生，用户感知"点击没反应"
```

**Correct（闪烁 + 持久边框 + 清除上一个）：**

```css
@keyframes chgFlash { 0%,100%{box-shadow:0 0 0 0 transparent} 50%{box-shadow:0 0 0 8px rgba(245,158,11,.5)} }
.chg-located { outline: 2px solid #f59e0b; animation: chgFlash .8s ease 2; }
```

```javascript
function flash(el) {
  document.querySelectorAll('.chg-located').forEach(e => e.classList.remove('chg-located'));
  el.classList.add('chg-located');
  try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
}
```

**Why:** 定位反馈必须让用户明确看到"改在这"；闪烁 + 持久边框不依赖滚动，fixed 元素也明显，切换目标时清除上一个保持唯一性。
