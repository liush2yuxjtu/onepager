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

### 数据驱动 React 的完成门槛

任务含筛选、下钻、重复证据和行动状态时，交付前逐项检查源码，而不是只看页面外观：

- spec 顶层有 `state`。
- state 数组通过 `repeat` 和 `$item` 渲染，至少一处 `visible` 由 state/item 控制。
- 组件事件通过 `emit` 对应 spec 顶层 `on`，并执行 built-in 或 catalog action。
- 至少一个受控输入通过 `$bindState` / `$bindItem` 与 registry 的 `useBoundProp` 双向绑定。
- 至少一个 `watch` 对状态变化触发本地 action。
- host 挂载 Action、Visibility、Validation providers，或使用等价的 `JSONUIProvider`。
- 自定义 action 真实执行。`defineRegistry` 返回的 `handlers` 是一个工厂；`handlers(() => undefined, ...)` 会让内部 action 因拿不到 `setState` 而静默跳过。也不能传入 `{ copyActions: () => {} }` 一类空 host handler，它会覆盖真实 action。Provider 必须出现 `handlers={hostHandlers}` 或等价接线。

缺任一项就不能声称完整使用了 json-render。不要把 `EvidenceList.props.items`、`ActionList.props.items` 一类业务数组交给大组件内部 `map/filter`。应把数组放进 spec state，由 `Stack`/`Grid` repeat 一个 `Finding`/`ActionItem` 模板。图表可保留固定 `series/points`，因为图形几何由可信 registry 统一计算。

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

关系图 spec 可以包含受限的 `x/y/source/target/relation/kind`，但不能包含 SVG path、DOM、CSS 或事件源码。custom renderer 从 nodes/edges 计算连线。另建显式可信 registry，例如 `const nodeRegistry = { service: ServiceNode, module: ModuleNode }`，并拒绝 registry 中不存在的 kind；不要只把 `node.kind` 拼进 CSS class 后由一个大 `App` 处理全部类型。普通业务 dashboard 不得自定义 schema。

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
import { validateSpec, formatSpecIssues, type Spec } from "@json-render/core";
import rawSpec from "./spec.json";
import { catalog } from "./catalog";

const catalogResult = catalog.validate(rawSpec);
if (!catalogResult.success) {
  throw new Error(`catalog.validate failed: ${catalogResult.error?.message ?? "unknown"}`);
}
// 当前 React schema 的 parsed data 可能剥掉 state/on/watch。
// catalog.validate 负责判定；运行时继续使用同一个已验证 raw spec。
export const spec = rawSpec as unknown as Spec;
const structureResult = validateSpec(spec);
if (!structureResult.valid) {
  throw new Error(`validateSpec failed: ${formatSpecIssues(structureResult.issues)}`);
}
(globalThis as typeof globalThis & { __ONEPAGER_VALIDATION__?: unknown })
  .__ONEPAGER_VALIDATION__ = { catalog: true, spec: true };
```

`catalog.validate` 检查 catalog/Zod，`validateSpec` 检查引用、visible、repeat 和 state。不能只跑一个。不要把 `catalog.validate(...).data` 直接交给 Renderer：截至当前 React schema，它的 Zod 解析结果会裁掉 schema 未声明但运行时支持的 `state`、`on` 和 `watch`。应在 validate 成功后继续渲染同一个 raw spec。

### host action wiring

独立页优先创建一个外部 store，host handlers 直接读写它：

```tsx
import { createStateStore } from "@json-render/core";

const store = createStateStore(spec.state ?? {});
async function copyMarkdown(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch { /* fall through */ }
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.append(area);
  area.select();
  if (!document.execCommand("copy")) throw new Error("copy failed");
  area.remove();
}

const hostHandlers = {
  announceRange: ({ range }: { range?: string }) =>
    store.set("/announcement", `已切换 ${range ?? "默认周期"}`),
  copyActions: async () => {
    const state = store.getSnapshot();
    await copyMarkdown(state.actions);
  },
};

<JSONUIProvider registry={registry} store={store} handlers={hostHandlers}>
  <Renderer spec={spec} registry={registry} />
</JSONUIProvider>
```

不要把 `defineRegistry` 返回的 handler factory 当成最终 handler map。特别是 `handlers(() => undefined, () => state)` 会生成可调用外壳，但每个 action 内部都会因没有 `setState` 而直接跳过。不要再用同名空 host handler 覆盖 registry action，也不要只在 `defineRegistry` 中写 action 后忘记接到 Provider。每个 catalog action 都要有可观察效果，例如更新 store、复制文本或写入 aria-live 状态；`JSONUIProvider`/`ActionProvider` 必须显式带 `handlers={...}`。若确实要复用 registry action functions，就提供真实 `SetState` 适配器；对 onepager，直接 host handlers 更短也更清楚。

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
# 标准数据驱动 React
node <onepager-skill>/scripts/verify-output.mjs dist/index.html \
  --spec src/spec.json --source src/main.tsx --source src/catalog.ts \
  --source src/registry.tsx --source src/validation.ts \
  --require-react-features

# 自定义节点边图
node <onepager-skill>/scripts/verify-output.mjs dist/index.html \
  --spec src/spec.json --source src/main.tsx --source src/schema.ts \
  --require-custom-graph

open dist/index.html
```

浏览器只做一次有界验收：首屏结论、核心筛选/下钻/动作、键盘操作、focus、窄屏无横向溢出、`prefers-reduced-motion`、axe 无明确 violations。若 `agent-browser` 命令存在，使用命名 session，跑核心交互后执行 `agent-browser --session <id> a11y --json`；本地文件可临时用 `python3 -m http.server --bind 127.0.0.1`，必须用 `trap` 关闭 server 和 session。不要只调用系统 `open` 就声称通过 axe。修复明确失败后只复跑失败项。若 browser automation 确实不可用，执行一次系统浏览器打开和 DOM/静态自检后如实记录，不要现场安装或排查 Playwright、Selenium 等框架。

无障碍细节：普通文本和背景至少 4.5:1，大号文本至少 3:1；`muted`、完成态、图表内标签也不能靠 opacity 降到阈值以下。带 `aria-label` 的 `div` 要加合适 role 或改用语义元素。复用型 `Callout` 不要默认渲染无名称 `<aside>`；用普通 `div`，或为每个 landmark 提供唯一 `aria-label/aria-labelledby`。含 `tabIndex`/`role=button` 节点的交互 SVG 不得把外层标成 `role=img`；保留 `<title>/<desc>`，并提供同等关系表格。

## 进程清理

能直接打开 `file://` 就不要起 dev server。必须起服务时记录 PID，并在同一 shell 使用 `trap`：

```bash
npm run dev -- --host 127.0.0.1 > /tmp/onepager-vite.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT INT TERM
```

验证结束后关闭 browser session、server、preview、monitor 和定时器，检查 PID 已退出。不要留下 watcher 或长连接阻止 `pi -p` 返回。
