# 研究 / Research

核查日期 / Checked: 2026-10-30。本工程没有复制参考插件源码。No reference plugin source is incorporated.

| 项目 / Project | 数据、布局 / Data & layout | 快捷键、文件、UI / Interaction | 许可与采用边界 / License boundary |
|---|---|---|---|
| SimpleMindMap | 独立导图与底层 mind-map 引擎；插件内部格式未核实 / standalone map; internal format unverified | 多语言、设置与完整导图产品；插件快捷键内部实现未核实 / multilingual editor, internals unavailable | README 声明插件源码不开放；API 许可标签 AGPL-3.0 不能推翻该声明，不复用。底层引擎需独立核查 / no reuse |
| ObsiMap | README 描述 outline 与 radial；节点可选择关联笔记，非强制一文件 / optional note links | Tab 子级、Enter 同级，菜单、拖动、双击打开笔记 / keyboard and context menu | MIT；允许保留声明后复用，但本工程选择独立实现 / independently implement |
| Canvas MindMap | Obsidian Canvas 卡片/边，定向自动布局；不是每卡片一 Markdown / canvas cards | Tab/Enter、方向键，基于宿主 Canvas UI / host canvas UI | 当前树无 LICENSE，API license=null，不复用 / no explicit grant found |
| Link Mindmap | frontmatter children/parent wiki-links；横向和纵向布局 / note relations | N 新子级、Enter 打开，工具栏、菜单、折叠、预设 / toolbar and presets | 公开文档声明 PolyForm Non-Commercial 1.0.0，只借鉴思路 / design reference only |

上表保留初轮概览；下文 GitHub 源码核查补充并覆盖其中的未核实项。The source audit below supersedes provisional unknowns above.

MindTree 采用单向 parent 稳定 ID 模型，避免 parent/children 双写；代价是 ID 不会自动出现在 Obsidian 原生反链，需要后续明确是否增加派生 wiki-link，不能将两者当双主数据。Stable IDs improve rename handling but do not produce native backlinks automatically.

官方 Sample 的 Plugin 生命周期、registerView、命令注册与卸载清理作为 API 使用模式参考；构建使用 CommonJS，obsidian external，其余运行依赖打包。Official API and sample establish lifecycle and packaging conventions.

## 来源 / Sources

- [Official API and developer documentation](https://github.com/obsidianmd/obsidian-api)
- [Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin) — 0BSD
- [SimpleMindMap](https://github.com/wanglin2/obsidian-simplemindmap)
- [ObsiMap](https://github.com/Creative781/obsimap)
- [Canvas MindMap](https://github.com/Quorafind/Obsidian-Canvas-MindMap)
- [Link Mindmap public documentation and license](https://community.obsidian.md/plugins/link-mindmap)

官方 docs 页面本次抓取未成功，已阅读官方 API 仓库 README 和 Sample；完整开发指南仍须补查。Official hosted docs fetch failed; official repository documentation was read instead. Further source-level research is pending.

## 仓库快照 / Repository snapshots

- obsidian-api: `9abd9605ce081383674aae1ed111c456edde0688`
- Obsidian-Canvas-MindMap: `b26802cd164c47b84172fb35b9dd0a0806b1c377`
- obsidian-sample-plugin: `07ceb81d1fb3384af611ebf665a1ec42a7e5926d`
- obsidian-simplemindmap: `42d367c23176bbe08d4cd9e58e4780ea0c096dba`
- obsimap: `35d72ec24fda6ce3d4284fbb2f1eaffd893a9677`


## GitHub 源码核查补充 / GitHub source audit

本轮只读调查，无参考源码进入运行包。Source inspection only; no reference code enters the runtime bundle. 固定提交链接用于复查；默认分支链接只代表调查时版本。Pinned links are reproducible; default branches may change.

### ObsiMap

证据 / Evidence: [types.ts](https://github.com/Creative781/obsimap/blob/35d72ec24fda6ce3d4284fbb2f1eaffd893a9677/src/shared/types.ts), [main.ts](https://github.com/Creative781/obsimap/blob/35d72ec24fda6ce3d4284fbb2f1eaffd893a9677/src/core/main.ts), [MIT license](https://github.com/Creative781/obsimap/blob/35d72ec24fda6ce3d4284fbb2f1eaffd893a9677/LICENSE).

- 数据：MindMapNode 包含 id/text/children、可选 parent/x/y/collapsed/side。getViewData 将整棵树 JSON 序列化进 .mindmap 文件的代码块，setViewData 读回；并非 Markdown 关系索引。Data is an embedded tree snapshot, not a note-derived graph.
- 布局：layoutMindMap 分派 outline/radial；calculateSubtreeHeight 递归累加可见子树高度及间距，calculateOutlineLayout 将父节点居中、子节点向右放置；radial 将一级分支分到左右，再镜像布局。反复求子树高度在深链上可能退化，因此 MindTree 独立使用一次后序缓存与迭代遍历。Layout uses recursive subtree extents; repeated extent computation motivates cached iterative passes in MindTree.
- 快捷键：设置定义 Tab/Enter、Shift+Enter、升降级与折叠；窗口 keydown 监听和视图输入状态配合，onClose 移除监听。MindTree 选择视图作用域和显式 IME 检查，避免全局拦截。Configurable actions exist; MindTree will scope keyboard handling locally.
- 文档操作：createNoteFromNode 通过 Vault.create 创建笔记，再将节点文本变成 wiki-link；openLinkedNote 经 MetadataCache 解析后 openFile。editNode 有关联笔记重命名逻辑。这进一步说明节点可先于文件存在，与本项目不变量不同。Note linking is optional and follows node creation.
- UI：原生 SVG rect/text/path、自建输入覆盖层、模糊搜索 Modal、上下文菜单、拖动 ghost 和落点指示；没有 React 组件体系。借鉴预览反馈，独立实现 React/SVG。UI is imperative SVG plus host modals.

### Canvas MindMap

证据 / Evidence: [canvasMindMap.ts](https://github.com/Quorafind/Obsidian-Canvas-MindMap/blob/b26802cd164c47b84172fb35b9dd0a0806b1c377/src/canvasMindMap.ts), [utils.ts](https://github.com/Quorafind/Obsidian-Canvas-MindMap/blob/b26802cd164c47b84172fb35b9dd0a0806b1c377/src/utils.ts).

- 数据：addNode/addEdge 合并 CanvasData.nodes/edges 后 importData；默认 childNode 的 type 为 text，另有 createChildFileNode 引用已有 TFile。Data lives in Canvas, including text cards.
- 排列：新子节点水平偏移父宽加 200；同级以节点高度和纵向间距重新分布。buildTrees 根据入边确定根，并按 LR/RL/TB/BT 坐标方向筛选子边递归建树；不能将该方向筛选视为完整环诊断。Placement is geometric and direction-filtered, not a validated Markdown hierarchy.
- 快捷键与 UI：monkey-around 修补 CanvasView.onOpen/onKeydown，scope.register 绑定 Tab/Enter 与导航；复用宿主 Canvas 选择、编辑、缩放与卡片组件。MindTree 不采用这些内部补丁，以公开 ItemView/API 建独立界面。Host internals are patched; MindTree avoids this dependency.
- 许可：调查的固定提交目录没有 LICENSE，仓库 API 也没有识别许可证；这只是未找到授权的证据，不能断言作者从未发布过许可。本轮不复用任何源码。No grant was found in the audited snapshot; code is not reused.

### SimpleMindMap

证据 / Evidence: [README at audited commit](https://github.com/wanglin2/obsidian-simplemindmap/blob/42d367c23176bbe08d4cd9e58e4780ea0c096dba/README.md).

README 已明确说明 .smm.md 包含压缩编码导图、图像、元数据及内链；节点链接可指向笔记，导图文件也可切 Markdown 视图。不能因为扩展名是 Markdown 就视为每节点独立文档。The Markdown container stores encoded map data; it does not satisfy one-file-per-node.

工具栏、侧栏、右键菜单、文件搜索、分屏同步和语言跟随属于公开可研究的产品行为；插件确切布局与快捷键实现不作源码结论。README 同时声明插件源码不开放，而仓库有 AGPL 标签；需按具体文件核对授权，不用底层 mind-map 库的许可推定插件可复用。Public behavior can inform design; conflicting licensing signals do not establish reusable plugin source.

### Link Mindmap

正确仓库为 [licfcn/link-mindmap](https://github.com/licfcn/link-mindmap)，此前猜测的 licf/duangi 地址无效。Repository identity was resolved from the official listing.

[公开说明](https://community.obsidian.md/plugins/link-mindmap)记录 children/parent frontmatter、wiki-link、横纵布局、菜单与视图预设；这与节点即文档的目标接近，但双向字段需要处理一致性。本项目仍选单向 parent 为权威字段。Documentation describes note-backed relations; MindTree retains one authoritative relation direction.

[仓库 LICENSE](https://github.com/licfcn/link-mindmap/blob/main/LICENSE)标题标为 PolyForm Non-Commercial 1.0.0，实际文本明列非商业限制与保留声明要求；不能仅凭标题推定它与标准许可证逐字一致。MindTree 不引入该源码，也不将其描述为 MIT 等宽松许可。本轮按用户要求研究其文档和许可，未验证内部布局算法。The actual text is restrictive; source and exact algorithms are not incorporated or claimed verified.

### 对架构的影响 / Architecture consequences

1. 持久化只接受独立 Markdown 文档，不使用压缩树或整图 JSON 作为节点内容源。Persist independent notes only.
2. 使用公开 ItemView、Vault、MetadataCache，不补丁 Canvas 内部类。Use public host APIs.
3. 自主实现迭代式两遍树布局，并测试环、深链、折叠和多视图。Implement and test independent graph algorithms.
4. 文档关系和 UI 快照分离；写成功与缓存确认是不同状态。Separate durable writes from cache acknowledgement.
5. 未来如引入可复用代码，先记录具体文件、提交、许可证与声明；当前无参考插件源码复用。Track file-level provenance before any future reuse.

### 本轮验证 / Validation

核查了上述固定提交的源码及公开许可文本；未运行参考插件，未进行宿主交互或性能测试。Source review is not runtime verification. 本轮仅修改研究文档，不改变最小插件运行行为，因此不重复执行构建；此前构建通过不代表 Obsidian 宿主加载通过。Documentation-only update; host loading remains unverified.


## Link Mindmap 重点参考落地 / Focused reference in 0.2.0

本轮再次核查仓库树 fea47b1f9ba58a84913d37e33033548062bea49d 的 README 与发布 main.js。仓库主要公开构建后的 JS；可观察到 fileManager.processFrontMatter 写关系，但不把混淆变量当作稳定 API 或可直接复用模块。Inspected the published bundle as evidence only.

采纳的交互思想：笔记作为节点、拖动换父级、原笔记打开、折叠与适应窗口。独立新增：Vault 内多个文件夹仓库、多选来源、每系列独立 parent 关系、键盘可用的重挂下拉框。Copied source: none.

UI 技能搜索返回的营销页结构不适合插件，不采用该结构或在线字体；采用宿主字体、主题变量、局部强调色、明确标签与可见焦点。Design uses host typography and tokens instead of the search result's landing-page pattern.


## 0.4.0

深入读取 licfcn/link-mindmap 发布 main.js：layoutMode 分别走 tree/branch/git/graph/force，且垂直布局对 branch 有单独限制；Git 模式含泳道、跳线与时间轴，不能等同于普通双向思维分支。本版自主实现右向树、纵向树、左右分支，保持学科目录语义，不复制非商业许可源码。Source inspection distinguished actual mode dispatch; unrelated timeline and force modes remain outside scope.

交互重构采用原生 Menu、SettingsTab 和紧凑学科选择器。子菜单 setSubmenu 没有被当前公开类型声明覆盖，因此进行了局部能力检测，缺少该能力时点击打开次级菜单。Settings navigation also uses a localized host capability boundary; actual host acceptance is pending.
