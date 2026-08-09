---
title: Honest & Auditable
impact: MEDIUM
impactDescription: 违反则夸大结论毁信任，无法复现
tags: onepager, trust, honest, provenance, reproducible
---

## 诚实可审计

标注采集命令 / 时间戳 / 来源；没问题就说没问题（"机器散热健康"），瞬时尖峰标注"非持续"。页脚必须标：来源项目名 + 绝对路径 + 会话 ID。

**Incorrect（夸大结论 + 无来源）：**

```html
<div class="verdict">⚠️ 机器即将故障，立即处理！</div>
<!-- 无采集命令、无时间戳、无来源标注 -->
```

**Correct（诚实 + 可复现）：**

```html
<div class="verdict">机器散热健康；热源 = opencode 74.8% CPU（多会话）</div>
<footer>采集：ps -A -o %cpu,rss,comm | sort -nr | head · 2026-08-09 · 来源：/Users/.../mac-heat-diagnosis.html</footer>
```

**Why:** 可复现才值得信任；瞬时尖峰标注"非持续"防止误判；来源标注让评审者能追到原始证据。
