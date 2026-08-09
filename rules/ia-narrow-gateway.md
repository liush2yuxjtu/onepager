---
title: Narrow Gateway, Never Dump
impact: CRITICAL
impactDescription: 违反则全量搬运上下文，页面"看不动"
tags: onepager, ia, narrow-gateway, minimal
---

## 窄网关，不搬运

每个交互都是一扇窄门——搜索框只返回匹配行、聚焦链接只传一个 pane_id token、勾选清单只回传增量状态。绝不要把全量数据一次性铺开。

**Incorrect（全量表格默认平铺 20 行 × 6 列）：**

```html
<table>
  <tbody>
    <!-- 20 行 × 6 列全部渲染，无搜索无折叠 -->
  </tbody>
</table>
```

**Correct（搜索框 + 折叠细节）：**

```html
<input class="search" placeholder="搜索进程名…">
<table>
  <tbody><!-- 匹配行随输入过滤 --></tbody>
</table>
<details><summary>完整证据</summary>…</details>
```

**Why:** 页面不搬运全量；用户按需取行，每次交互只交换最小必要信息。
