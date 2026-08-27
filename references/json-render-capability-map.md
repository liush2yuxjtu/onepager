# json-render 能力地图与路由

只在已选择 onepager + json-render 后读取本文件。先用内置 React `StateStore` 和标准 flat tree；只有需求明确跨出这条边界时才引入下面的包。

## core

| 能力 | 何时使用 | 何时不用 | 适合最终 self-contained HTML |
|---|---|---|---|
| `defineSchema` | 自定义 spec 语法，尤其节点边、自由画布、地图图层、视频轨道、严格坐标 | KPI、图表组合、筛选、诊断等普通树形 UI，直接用 React schema | 是，编译后无运行时外链 |
| `defineCatalog` | 约束可生成组件、action 和 prop；所有 json-render 路径都要用 | 原生 onepager | 是 |
| `catalog.prompt()` | 需要让模型按 catalog 生成或修订 spec | spec 由代码静态维护，或本次不调用模型 | 是；它是生成期能力，不必进入最终 bundle |
| `catalog.validate()` | 每个生成或编辑后的 spec 都执行，检查 catalog/Zod 约束 | 不可省略；它与 `validateSpec` 检查不同层次 | 是 |
| `validateSpec()` | 检查 root、children/slots 引用、visible、repeat 和 state 结构 | 不可用 `catalog.validate` 替代 | 是 |
| `autoFixSpec()` | 先应用无损修复；重试耗尽后才允许有损剪枝 | 不要把它当作默认“通过器”，更不要静默删内容 | 是 |
| `SpecStream` / `createSpecStreamCompiler` | UI 要随模型输出逐步出现 | 一次性静态 spec、简单本地页面 | 是，但静态页不要为它增加复杂度 |
| `buildUserPrompt()` | 新生成、带当前 spec 的局部修订、附带运行时 state | 没有模型生成环节 | 是；通常只在生成期运行 |
| JSON Patch / `diffToPatches` | 单字段和精确路径编辑 | 大区块整体替换 | 是 |
| Merge Patch / `deepMergeSpec` | 增删结构区块、对象级合并 | 单字段编辑；数组会整体替换，需谨慎 | 是 |
| unified diff | 文本密集的小改动 | 结构化节点编辑 | 是 |
| 动态 props | `$state`、`$bindState`、`$bindItem`、`$item`、`$index`、`$cond`、`$template`、`$computed` 驱动数据 UI | 静态文案可直接放普通值；不要把业务代码塞进 `$computed` | 是 |
| 内置 `StateStore` | onepager 默认状态源，状态量小且只在页面内使用 | 已有应用必须共享外部 store 时 | 是，首选 |

`catalog.validate` 和 `validateSpec` 必须都通过。前者验证 catalog 与 prop schema，后者验证 spec 图结构和运行时语义。

## React renderer

| 能力 | 何时使用 | 何时不用 | 适合最终 self-contained HTML |
|---|---|---|---|
| React `schema` | KPI、dashboard、图表组合、诊断、矩阵、时间线内容、摘要、筛选和下钻 | 节点边、地图、轨道等非树形 DSL | 是，配 Vite single-file |
| `defineRegistry` | 把 catalog 名称映射到可信 React/DOM/SVG/Canvas 实现 | 不得让 spec 直接提供实现 | 是 |
| `Renderer` | 渲染已验证 spec | 原生 HTML 路径 | 是 |
| `StateProvider` | 页面内状态或外部 `StateStore` | 完全静态内容 | 是 |
| `VisibilityProvider` | `visible` 根据 state/item 控制显示和列表过滤 | 不要在 registry 里重复写同一可声明条件 | 是 |
| `ActionProvider` | built-in actions 和受控 host 回调 | 无动作的静态图 | 是 |
| `ValidationProvider` | 表单检查、跨字段校验、`validateForm` | 没有输入字段 | 是 |
| `useBoundProp` | registry 中实现 `$bindState` / `$bindItem` 的双向输入 | spec 不可直接调用 hook | 是 |
| `repeat` | 根据 state 数组复用模板，配 `$item` / `$index` | 只有两三项且结构完全不同 | 是 |
| `watch` | state 变化后触发本地 action，且不应在首次渲染触发 | 纯派生显示优先动态 prop；不要拿 watcher 做网络轮询 | 是 |
| built-in actions | `setState`、`pushState`、`removeState`、`validateForm` | 不要重复注册同名自定义 action | 是 |
| named slots | 组件确有 header/footer/actions 等语义槽位；默认槽仍用 `children` | 不要使用 `slots.default`，也不要为了布局增加无意义槽位 | 是 |

## UI 与开发工具

| 能力 | 何时使用 | 何时不用 | 适合最终 self-contained HTML |
|---|---|---|---|
| `@json-render/shadcn` | 项目已有 Tailwind/shadcn，且需要标准表单、Dialog、Accordion 等；只挑任务所需组件 | 极小 onepager、没有 Tailwind、只需少量自定义语义组件 | 可行，但 bundle 更大；默认不用 |
| `@json-render/directives` | 需要 `$format`、`$math`、`$concat`、`$count`、`$truncate`、`$pluralize`、`$join`、`$t` | 普通值或一个 `Intl` 格式化即可；不要无故扩展 DSL | 是，按需选取 |
| named slots | 中等粒度组件需要固定语义区域 | 叶节点和简单 Stack | 是 |
| `@json-render/devtools` | 开发期查 spec、state、actions、stream、catalog 或 DOM 到 spec key | 最终生产 bundle；最小 onepager 一般不需要 | 否，最终关闭或由 production 构建裁掉 |
| `@json-render/codegen` | 明确要把 spec 导出为 Next/Remix/其他源码，或静态分析组件/state/action 使用 | 只交 onepager；不要为了运行时渲染做 codegen | 不是运行时需求，默认不进 bundle |

## 输出 renderer

| 包 | 何时使用 | 何时不用 | 适合最终 self-contained HTML |
|---|---|---|---|
| `@json-render/image` | 明确要从 spec 产出 SVG/PNG、OG 图或社交卡片 | 交互式 onepager 主体 | 输出可转 data URI 嵌入；不是默认 host renderer |
| `@json-render/react-pdf` | 明确交付 PDF、发票、分页报告 | 浏览器交互页 | 否，产物是 PDF；可作为独立下载但违背单文件默认 |
| `@json-render/react-email` | 明确交付 HTML/纯文本邮件 | 普通网页 onepager | 邮件 HTML 可单文件，但不是交互式 host |
| `@json-render/react-three-fiber` | 明确需要 3D scene、mesh、light、camera | KPI/普通图表；不要用 3D 装饰数据 | 技术上可 bundle，但体积大，模型/HDR 外链也会破自包含；默认不用 |
| `@json-render/remotion` | 明确生成视频 timeline/composition | 普通时间线内容或网页动效 | 否，目标是视频；预览也会显著增重 |
| `@json-render/next` | 多路由、SSR、metadata、loader、部署型应用 | 无后端、离线、单文件 onepager | 否 |
| `@json-render/mcp` | 明确交付 MCP App，在 Claude/ChatGPT/Cursor/VS Code iframe 中运行 | 本地离线 onepager | iframe HTML 可单文件，但完整流程需要 MCP server，不符合默认无后端 |
| `@json-render/yaml` | 人工更常编辑 YAML，或流式 `yaml-spec` / `yaml-edit` / `yaml-patch` 更合适 | 普通 JSON spec 已足够 | 是，但只在确有可读性或 wire-format收益时引入 |

不要因为生态里有 renderer 就同时加载或安装。onepager 的默认输出仍是浏览器 HTML。

## 状态 adapter

| 状态源 | 何时使用 | 何时不用 | 适合最终 self-contained HTML |
|---|---|---|---|
| 内置 `createStateStore` | 独立 onepager，状态只在页面内 | 无 | 是，默认选择 |
| `@json-render/zustand` | 已有 Zustand v5 vanilla store，或必须共享该 store slice | 独立 onepager | 是，但没有现成 Zustand 就不引入 |
| `@json-render/redux` | 已有 Redux/RTK store，需要受 reducer/devtools 管理 | 独立 onepager | 是，但 bundle 和样板更多 |
| `@json-render/jotai` | 已有 writable atom 和 Jotai provider | 独立 onepager | 是，但不为本页新建依赖 |
| `@json-render/xstate` | 已有 `@xstate/store` v3 atom，状态机由宿主维护 | 仅需要几个筛选值；复杂流程也先判断自定义 action 是否足够 | 是，但默认不用 |

外部 adapter 只替换 `StateStore` 后端，不改变 spec 语法。不要让同一页面同时存在 React local state、json-render store 和另一个全局 store 三套真源。

## 快速决策

1. 拿掉 json-render 后仍能用几十行 HTML/JS稳定完成，走原生。
2. 需要 catalog 约束、重复生成、state/repeat/visible/on/watch 或结构化 patch，走 React schema。
3. 数据语法本质是 graph/canvas/map/timeline/coordinates，走自定义 schema。
4. 输出不是浏览器 onepager 时，才选择 image、PDF、email、Remotion、Next 或 MCP。
5. 最终单文件要求不变。任何外部包都必须被构建内联，运行时不得请求 CDN、字体、图片、模型或 API。
