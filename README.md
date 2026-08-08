# onepager

用「窄门」哲学（SMALL_INTERFACE）设计 AI 生成的交互式 HTML 产物：**结论前置、细节折叠、交互即接口、单文件自包含**。

Onepager 是一个 agent skill——当 agent 需要交付「交互式 HTML 报告 / dashboard / 诊断页 / explainer / 计划页」时，用它来保证产出不是一堆铺开的静态文本，而是一扇扇窄门：人只交换最小必要信息，即可与 agent 高效协作。

## 核心法则

1. **结论前置**：标题下 5 秒内出现一句可行动的结论（TL;DR），证据按需下钻
2. **窄网关，不搬运**：每个交互只交换最小必要信息（搜索只返回匹配行、聚焦只传一个 pane_id、勾选只回传增量状态）
3. **交互是接口，不是装饰**：瘦身可以砍内容，**绝不砍交互**（搜索/排序/聚焦/勾选/复制）
4. **行动闭环**：诊断必须带可勾选、有进度、可一键复制为 Markdown 的行动清单
5. **诚实可审计**：标注采集命令 / 时间戳 / 来源；没问题就说没问题
6. **单文件自包含**：无 CDN、无构建步骤、离线可用、手机可看

## 触发时机

- 用户要「交互式 HTML / 诊断报告 / dashboard / 计划页 / explainer」
- 用户要瘦身 / 重构一份臃肿的报告
- 用户提到 窄门 / small interface / 最小必要信息
- 刚产出的全量报告被用户否掉（"信息太多" / "失去交互"）

## 目录结构

```
onepager/
├── SKILL.md                 # 主 skill 定义：法则 + 工作流 + 检查清单 + 反模式
├── evals/
│   └── evals.json           # 评测用例（Mac 发热诊断 / 臃肿验收报告瘦身）
└── scripts/
    └── focus-server.cjs     # 可选：loopback 聚焦服务，把 HTML 条目连到真实窗口
```

## 安装

```bash
# Claude Code / agent 环境：放到 skills 目录
cp -r onepager ~/.claude/skills/
# 或 ~/.agents/skills/ 等其他 skills 根目录
```

## 评测

配套评测工作流见 [skill-creator](https://github.com/vercel-labs/skill-creator) 生态（`generate_review.py` 生成 eval viewer，反例教材在 workspace `anti-patterns/`）。

## 反模式（血泪教训）

- ❌ 把报告"瘦身"成静态文本 → 砍掉了窄网关，用户会回"我们失去了交互能力"
- ❌ 全量表格默认平铺 20 行 × 6 列 → 搬运上下文
- ❌ 为了显得有用夸大结论（"机器快坏了！"）→ 毁信任
- ❌ 交互做装饰不做接口（动画很多，却没法聚焦真实窗口 / 复制结果）
