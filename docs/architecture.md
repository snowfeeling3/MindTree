# 技术架构 / Architecture

Markdown 是唯一持久内容源。Markdown is the sole persistent content source.

核心层 core：纯 TypeScript 解析、校验、索引、环检测、确定性树布局；不引用 Obsidian 或 React。Core owns pure graph algorithms without host dependencies.

适配层 adapters：VaultRepository 封装 Vault 与 FileManager；MetadataIndex 监听缓存；CommandService 串行提交命令。Adapters translate host events and commands.

界面 ui：React 展示不可变快照；SVG 绘制边与节点；选择、折叠、缩放和平移属于视图状态。UI receives snapshots and emits intentions.

启动等待 workspace.onLayoutReady 与 metadataCache.resolved 后扫描 Markdown，建立 id→path 与 view→parent 索引。监听 changed、deleted、Vault create/rename/delete；批处理失效索引，按 revision 发布快照。Startup builds indexes after metadata resolution; events invalidate snapshots.

写入使用 fileManager.processFrontMatter，保留非 MindTree 字段；不保证 YAML 排版不变。写前重读并校验预期关系，单队列写入，成功后等待缓存确认；超时重新扫描并报告，禁止静默重试覆盖。Writes preserve unrelated fields, validate preconditions, and await cache acknowledgement.

移动文件仅更新 path 索引；稳定 ID 不变。删除产生悬空引用诊断，不级联删除笔记。外部修改为下一快照来源；冲突显示错误并重新加载。Duplicate IDs quarantine affected nodes; dangling relations stay visible as diagnostics.

布局采用自主实现的子树高度累计算法：后序计算高度、前序赋坐标，固定节点尺寸，O(V+E)。不引入第三方导图引擎。Layout uses subtree extents and deterministic sibling order.

快捷键仅在视图聚焦且非输入框、非 IME composition 时生效。Tab/Enter 作为后续命令；拖动预览不写盘，放下后校验环并提交。Keyboard handlers are scoped and composition-aware.

当前实现仅 src/main.tsx 与 ui/Shell.tsx；以上同步和布局均为设计，尚未实现。Current implementation is a view shell only.


## 0.2.0 实现状态 / Implementation status

src/core/graph.ts 实现解析、索引、循环诊断、重挂预检和迭代树布局；collections.ts 定义多个文件夹仓库及系列。adapters/repository.ts 通过 Vault 读取原始 YAML 并串行写入；UI Shell.tsx 提供仓库/系列与 SVG 交互。Actual runtime modules now exist.

事件处理监听 Vault create/modify/rename/delete 和 MetadataCache changed/resolved，120ms 合并后重新读取。当前使用直接 Vault.read 获取新数据，不依赖缓存确认事务，因此覆盖前述计划中的缓存等待方案；没有超时后盲目重写。Events trigger debounced rereads; the implementation reads fresh note data rather than claiming transactional cache acknowledgement.

当前索引为全量扫描，设置是单视图持有；多分屏并行编辑、真正并发外部写竞争、超大宽树与移动端手势尚未完整验收。Current limitations include full scans and incomplete multi-pane/mobile acceptance.


## 0.3.0 更新 / Update

Folder-series mode reads folder hierarchy and projects every folder through an owned Markdown introduction index. Source note bodies and frontmatter remain untouched. 图数据不再要求原笔记注册 ID；路径为当前扫描快照的键，目录是层级权威，旧手动系列仍保留。


## 0.4.0

0.4.0：配置在 src/settings.ts，画布在 ui/Shell.tsx；core/viewport.ts 提供可测试的相机变换、包围盒取景和布局转换。重排前后按选中节点保持屏幕锚点，不再刷新时清空有效画面。Settings and canvas responsibilities are separated; camera is stored per subject.


## 0.5.0 自适应聚焦 / Adaptive focus

0.5.0 新数据流：Graph → hierarchy 反向索引与后代计数 → visible 深度/折叠/摘要 → measureText 实际 Canvas 文本宽度 → radial/tidy 位置 → useTiles 稳定 ID 动画 → screenVisible 裁剪 SVG。相机由 useCamera 管理可取消 requestAnimationFrame，手动输入先取消动画；Navigation 保留独立观察历史，不修改文档关系。

旧 core/graph 算法和 Repository 写入保留；本轮没有修改知识节点 ID、文件格式或持久关系语义。绘制缓存只按当前图、分支、层级、折叠、间距及窗口尺寸失效；选择和相机移动不重排全树。相机设置保存不再触发文件重扫，Vault 事件仍重读学科。


## 0.6.0 全局层级与长短分支 / Global layers and staggered branches

0.6.0：显示深度与观察距离解耦，displayDepth/radialStyle为学科视图配置，不改知识文档。Radial按可见叶权重分扇区，多层长短线交错；统一几何扩张消除标签矩形重叠。全部节点保留真实ID与父子关系，不汇总、不主动隐藏分支；缩放改变时仍使用画布裁剪。完整视图可能缩到很小，用户可拉近阅读。


## 0.6.1 递归子树与紧凑连线 / Recursive subtrees and compact edges

0.6.1：解除局部1层硬上限；visible允许用户显式展开深度边界节点。局部根为当前项目，沿用学科displayDepth/radialStyle，布局类型可选放射或紧凑树。观察历史记录布局。折叠状态依据是否存在可见子项显示，文件数据不变。

Tidy替换为按实际矩形占用紧凑合并兄弟子树，不再按整层最宽节点布列；Radial替换全局扩张为逐节点射线碰撞区间避让，保留未碰撞节点的位置。Both algorithms retain conservative label boxes and pairwise overlap checks, not a proof of optimal total edge length.


## 0.7.0 研究后优化 / Research-led optimization

0.7.0：tidy通过core/flex-layout.ts适配小型non-layered引擎。节点尺寸旋转映射到横向树坐标；实际父子边界保持用户配置间距。根分支按子树实际高度平衡到左右两侧，质量门槛不通过则使用单向候选。超过256深度使用迭代安全布局。源文档/节点ID/层级筛选/导航接口不变，SVG连线端口支持左右两侧。


## 0.8.0 连线路由 / Connector routing

core/routing.ts为独立纯几何路由层：节点位置 → 原曲线/边缘短曲线/共享主干候选 → 长度与标签检查 → Route[]。每个路由片段有稳定ID、parent和逻辑owners；共享段不会改变知识关系。ui/useMotion.ts缓存并插值路由采样，Shell负责视口裁剪与路径高亮。


## 0.9.0 聚拢卡片 / Compact cards

0.9.0：core/cluster.ts对不可变布局快照进行整子树平移，碰撞限制按移动过程连续计算；中小视图比较错落方向。Shell按radialStyle=cluster启用，并保留旧模式；presentationVersion标记一次性偏好迁移。样式只作用于插件视图，笔记Markdown不变化。相机重排副作用显式监听实际viewport尺寸，避免坐标缓存使首次fit停留在默认尺寸。
