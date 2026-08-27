# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Information Architecture (ia)

**Impact:** CRITICAL
**Description:** 结论前置与窄网关是 onepager 的根基。违反此组规则 = 交付物退化成"信息搬运"，用户会回"我们失去了交互能力"。

## 2. Interaction (interact)

**Impact:** CRITICAL
**Description:** 交互是接口不是装饰。搜索/排序/聚焦/勾选/复制是窄网关本身，砍掉 = 砍掉人↔agent 协作通道。

## 3. Composition (compose)

**Impact:** HIGH
**Description:** main + subs 组合与超长单文件的处理。token 成本与可维护性取决于是否拆分正确。布局密度（对称网格 / 轻量结论条 / 留白）是视觉层第一红线，过密即判"乱"。

## 4. Changes Preview (changes)

**Impact:** HIGH
**Description:** 超长单 HTML / SPA 原型的改动预览。SPA hash 路由劫持、子视图渲染时序、fixed 布局定位是本组最常见的坑。

## 5. Trust & Provenance (trust)

**Impact:** MEDIUM
**Description:** 诚实可审计。标注采集命令/时间戳/来源，不夸大结论，可复现才值得信任。
