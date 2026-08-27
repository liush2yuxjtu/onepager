# onepager + json-render 实现合同

只在路由已选择 json-render 时读取。目标是拿到 json-render 的结构、安全、patch 和复用收益，同时把调用、token 和 QA 控制在最小范围。

## 架构边界

- onepager host 负责页面叙事、挂载点、主题、输入数据和本地 action 回调。
- json-render 负责 schema、catalog、spec、state、actions、validation 和 renderer。
- registry 负责可信 React、DOM、SVG 或 Canvas 实现。registry 可以有 `className` 和实现代码，spec 不可以。
- spec 是受约束的数据，不是源码容器。拒绝任意 HTML、JavaScript、React 源码、`className`、`style`、`runScript`、`executeScript`、`dangerouslySetInnerHTML` 和普通图表任意 SVG path。
- 页面无后端。action 只做本地 state、筛选、复制、下载、聚焦或展开；不为 onepager 新建 API。

## 默认使用 React flat tree

KPI、dashboard、图表组合、诊断、矩阵、时间线内容、摘要、筛选和下钻统一用标准 React schema：

```json
{
  "root": "artifact",
  "state": {
    "range": "7d",
    "showAll": true,
    "evidence": [
      { "id": "e1", "title": "访问到线索流失 87%", "severity": "high" },
      { "id": "e2", "title": "支付成功率稳定", "severity": "normal" }
    ]
  },
  "elements": {
    "artifact": {
      "type": "ArtifactFrame",
      "props": { "title": "增长诊断", "verdict": "先修访问到线索，不动支付" },
      "children": ["filters", "metrics", "trend", "evidence-repeat", "actions"],
      "slots": { "footer": ["source"] }
    },
    "filters": {
      "type": "FilterBar",
      "props": {
        "range": { "$bindState": "/range" },
        "options": ["7d", "14d", "30d"]
      },
      "children": [],
      "watch": {
        "/range": { "action": "announceRange", "params": { "range": { "$state": "/range" } } }
      }
    },
    "metrics": {
      "type": "MetricGrid",
      "props": {},
      "children": ["metric-visits", "metric-conversion"]
    },
    "metric-visits": {
      "type": "Metric",
      "props": { "label": "访问", "value": "57,320", "tone": "neutral" },
      "children": []
    },
    "metric-conversion": {
      "type": "Metric",
      "props": { "label": "转化率", "value": "2.14%", "tone": "positive" },
      "children": []
    },
    "trend": {
      "type": "LineChart",
      "props": {
        "series": [{ "key": "conversion", "label": "转化率", "tone": "accent" }],
        "points": [{ "x": "08/21", "values": { "conversion": 1.82 } }, { "x": "08/27", "values": { "conversion": 2.14 }]
      },
      "children": []
    },
    "evidence-repeat": {
      "type": "Stack",
      "props": { "gap": "sm" },
      "repeat": { "statePath": "/evidence", "key": "id" },
      "visible": { "$or": [{ "$state": "/showAll" }, { "$item": "severity", "eq": "high" }] },
      "children": ["finding-template"]
    },
    "finding-template": {
      "type": "Finding",
      "props": {
        "title": { "$item": "title" },
        "tone": { "$cond": { "$item": "severity", "eq": "high" }, "$then": "critical", "$else": "neutral" }
      },
      "children": []
    },
    "actions": {
      "type": "ActionBar",
      "props": { "label": "只看高风险" },
      "on": {
        "press": { "action": "setState", "params": { "statePath": "/showAll", "value": false } }
      },
      "children": []
    },
    "source": {
      "type": "Callout",
      "props": { "tone": "neutral", "text": "来源：增长诊断 · /absolute/project/path · Pi session: SESSION_ID" },
      "children": []
    }
  }
}
```

示例展示字段位置，不要求每个任务机械使用全部字段。`children` 是默认 slot；named slots 用顶层 `slots`，不要写 `slots.default`。所有引用 key 必须存在。repeat 容器必须有模板 child。

动态 prop 需要 catalog 接受对应表达式。只给确实需要绑定的 prop 一个受限动态值格式，不要把所有 prop 降级为 `z.unknown()`。registry 中的输入组件用 `useBoundProp` 写回 `$bindState` 或 `$bindItem`。

## catalog 设计

优先使用与任务相关的中等粒度组件：

- 叙事与布局：`ArtifactFrame`、`Section`、`Stack`、`Grid`
- 指标与图表：`Metric`、`MetricGrid`、`LineChart`、`BarChart`、`Funnel`、`Legend`
- 证据与结论：`EvidenceTable`、`Finding`、`Callout`
- 交互：`FilterBar`、`ActionBar`

不要暴露 `Div`、`Span`、`Rect`、`Path`、`BlueBox`、`BigText`、`CustomHTML`、`CustomCSS`、`Script` 或 `FullBusinessDashboard`。前一组让模型写实现细节，后一组把整页业务逻辑藏进单组件，两者都会绕开结构化 patch。

每个 prop 只接受一种稳定业务格式。可选值用 nullable；视觉使用有限枚举和语义 `tone`，不要让 spec 传颜色、CSS 或 class。图表固定为：

```ts
const tone = z.enum(["neutral", "positive", "warning", "critical", "accent"]);
const series = z.array(z.object({ key: z.string(), label: z.string(), tone }));
const points = z.array(z.object({
  x: z.string(),
  values: z.record(z.string(), z.number()),
}));
```

registry 根据 `series/points` 计算 scale、坐标和 SVG `d`。spec 不能提供 `d`、path 字符串或 SVG markup。

如果项目已有 shadcn，可从 `@json-render/shadcn/catalog` 和 `@json-render/shadcn` 只挑需要的标准组件，再补上述语义组件。不要 spread 全 catalog，也不要为了一个 Button 引入 Tailwind/shadcn。

## 何时写自定义 schema

只有数据语法本质上不是树时才用 `defineSchema`：

- 节点边关系图：`nodes[]`、`edges[]`
- 自由画布：对象和严格坐标
- 地图：layer、feature、viewport
- 视频：track、clip、frame

关系图 spec 可以包含受限的 `x/y/source/target/relation/nodeKind`，但不能包含 SVG path、DOM、CSS 或事件源码。custom renderer 从 nodes/edges 计算连线，registry 只允许 catalog 声明的 node kind。普通业务 dashboard 不得自定义 schema。

## 流式生成顺序

SpecStream 每行是一条 RFC 6902 JSON Patch。按可见价值排序：

1. 建 `root` 和根容器。
2. 建首屏结论、KPI，以及它们引用的 state。
3. 建图表和证据。
4. 建次要筛选、下钻、行动和 footer。

不要先给 parent 写一个尚不存在的 child 引用。可将 child 与 parent 引用放进同一个原子批次，或先创建 child 再挂引用。每批 patch 后运行结构检查；最终再跑完整双验证。

## 编辑协议

- 单字段改动用 JSON Patch，例如 `replace /elements/verdict/props/text`。
- 新增或替换结构区块用 RFC 7396 Merge Patch。
- 文本密集、行级审阅才用 unified diff。
- 默认 patch-only。只有用户要求重构整个结构，或当前 spec 已不可修复，才全量重生成。
- `autoFixSpec({ lossy: false })` 可立即处理无损字段归位。有损剪枝先重试生成，最后一次才允许。

`buildUserPrompt` 带 `currentSpec` 和所需 `editModes`，不要把全会话、全数据和所有生态文档重复塞进 prompt。

## 双验证

把 spec 放在独立 JSON 文件最容易审计和 patch，例如 `src/spec.json`。在挂载前执行：

```ts
import { validateSpec, formatSpecIssues } from "@json-render/core";
import rawSpec from "./spec.json";
import { catalog } from "./catalog";

const catalogResult = catalog.validate(rawSpec);
if (!catalogResult.success || !catalogResult.data) {
  throw new Error(`catalog.validate failed: ${catalogResult.error?.message ?? "unknown"}`);
}
const structureResult = validateSpec(catalogResult.data);
if (!structureResult.valid) {
  throw new Error(`validateSpec failed: ${formatSpecIssues(structureResult.issues)}`);
}
export const spec = catalogResult.data;
(globalThis as typeof globalThis & { __ONEPAGER_VALIDATION__?: unknown })
  .__ONEPAGER_VALIDATION__ = { catalog: true, spec: true };
```

`catalog.validate` 检查 catalog/Zod，`validateSpec` 检查引用、visible、repeat 和 state。不能只跑一个。

## single-file 构建

优先复用项目已经安装的官方包。新建最小 Vite 工程时只需要 `@json-render/core`、`@json-render/react`、React、Zod、Vite、React plugin 和 `vite-plugin-singlefile`。不要引入图表库。

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    target: "es2022",
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
  },
});
```

构建命令保持一个入口：

```json
{
  "scripts": {
    "build": "tsc --noEmit && vite build"
  }
}
```

构建后运行：

```bash
node <onepager-skill>/scripts/verify-output.mjs dist/index.html --spec src/spec.json
open dist/index.html
```

浏览器只做一次有界验收：首屏结论、核心筛选/下钻/动作、键盘操作、focus、窄屏无横向溢出、`prefers-reduced-motion`、axe 无明确 violations。修复明确失败后只复跑失败项。

## 进程清理

能直接打开 `file://` 就不要起 dev server。必须起服务时记录 PID，并在同一 shell 使用 `trap`：

```bash
npm run dev -- --host 127.0.0.1 > /tmp/onepager-vite.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT INT TERM
```

验证结束后关闭 browser session、server、preview、monitor 和定时器，检查 PID 已退出。不要留下 watcher 或长连接阻止 `pi -p` 返回。
