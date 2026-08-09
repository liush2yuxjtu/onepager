---
title: Compose Main + Subs
impact: HIGH
impactDescription: 单文件 >200KB 时每次迭代全量重读写，token 成本爆炸
tags: onepager, compose, main, subs, token
---

## 组合产物：main + subs 拆分省 token

交付物需要多个页面时（主报告 + 子报告 / 多 tab 看板 / 报告 + 附录），**不要把所有内容塞进一个超大 HTML**。

**Incorrect（单文件 500KB 全内联）：**

```
deliverable.html (532KB)  ← 所有内容一个文件，每次迭代全量重读写
```

**Correct（main 轻量 + subs 按需）：**

```
main.html (9.7KB)        ← 结论前置 + 每 sub 一行摘要 + 链接
sub-top20.html           ← 自包含，可独立打开
sub-plans.html           ← 自包含
sub-trends.html          ← 自包含
```

**Why:** 单文件 >200KB 时，每次迭代 agent 都要重读/重写整份文件，token 成本爆炸、diff 难读、浏览器渲染卡顿；拆开后 main 始终轻量，只有打开对应 sub 才加载全量。
