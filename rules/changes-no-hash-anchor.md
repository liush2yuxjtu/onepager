---
title: No Hash Anchor in SPA
impact: HIGH
impactDescription: 违反则跳转被 hash 路由劫持（URL 变业务路由）
tags: onepager, changes, hash, routing, hijack
---

## 避开 SPA 路由劫持：跳转不用 hash 锚点

hash 路由应用会监听 hashchange 并把 hash 改写成业务路由。`<a href="#chg-1">` 点击后 hash 立即被路由器改写（如变成 `#/chat`），锚点跳转失效。

**Incorrect（hash 锚点被劫持）：**

```html
<a href="#chg-1">跳转 →</a>
<!-- 点击后 location.hash 被 SPA 改写成 #/chat，跳转失效 -->
```

**Correct（javascript:void(0) + JS 定位）：**

```html
<a href="javascript:void(0)" class="go" data-target="chg-1">跳转 →</a>
```

```javascript
document.querySelectorAll('.go').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    jumpTo(a.dataset.target);   // scrollIntoView + flash
  });
});
```

**Why:** hash 锚点是 SPA 的业务路由通道，改动预览不能占用它；用 JS 直接定位（scrollIntoView + flash），不触碰路由。
