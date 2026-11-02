# 系列组织导图 / Series organization map

1. 在 Obsidian 命令面板打开 MindTree。Open MindTree from the command palette.
2. 填写系列名称，例如“计算机科学与技术”，选择现有的“计算机”文件夹，添加系列。Name a series and select its existing subject folder.
3. 点击“生成 / 更新介绍索引”。插件递归为各级文件夹生成一篇介绍笔记，并自动显示整个系列的目录组织。Generate/update indexes to create introductions recursively and map the complete series.
4. 点击选择、双击打开，空格或 +/- 折叠，背景拖动平移、滚轮缩放、适应窗口取景。Click selects, double-click opens, Space folds; background drag pans and wheel zooms.
5. 文件新增、移动后导图会重新读取；点击更新索引，使 Markdown 目录链接同步。Host events refresh the map; run update indexes to refresh Markdown directory links.

例如 / Example:

```text
计算机/
  计算机.md                 # 自动生成的系列入口 / generated series index
  408考研/
    408考研.md              # 分支介绍 / branch introduction
    操作系统.md             # 已有笔记不改写 / existing note unchanged
  安全/
    安全.md
    二进制安全/
      二进制安全.md
      栈溢出漏洞-基础.md
```

文件夹索引拥有 mindtree.indexFolder 元数据；同名已有笔记不覆盖，生成文件使用后缀。只有明确标识为插件索引的文档才会被更新。Existing names are preserved; generated files use a suffix. Only owned indexes are updated.

介绍是中英模板，不是 AI 自动总结；可自由修改。自动目录使用 mindtree:directory:start/end 标记，更新时保留其外所有内容。标记损坏时停止并报错。Introductions are editable bilingual templates; only the managed directory block is replaced.

本模式以实际目录为唯一层级依据，不拖动改写关系、不复制笔记、不移动现有文件。请用 Obsidian 文件列表改变目录组织。The organization map follows the filesystem hierarchy through Vault APIs; edit the folder structure in Obsidian's explorer.

旧版手动系列仍可读取；新建系列统一采用文件夹模式。导图不自动写索引以避免后台产生文件；每次生成会自动完成整系列扫描。Legacy manual series remain readable. Index generation is explicit and covers the entire series automatically.

当前限制：文件夹改名后需检查旧索引的 indexFolder 标记；不会自动删除旧索引。跨文件写入不具备原子事务，失败后可能已创建部分索引，可修复后重试。Folder renames can leave old ownership markers. Multi-file writes can partially succeed; retry after resolving the error. Host interaction acceptance is pending.


## 0.4.0

当前界面改为：左侧菜单按钮与学科快速选择，右侧缩放；下方完整导图。菜单“展示方式”选择向右树、向下树或双向分支，“视图”可适应全部、定位选中笔记、全展与全折。学科、文件夹、语言和介绍移至 Obsidian 设置 → MindTree。Main view is a compact toolbar and full canvas; configuration lives in the plugin settings tab.

每学科保存视口和布局。滚轮以鼠标为锚点，按钮以画布中心缩放；折叠与切换布局保留选中节点的屏幕位置。Per-subject camera persists; zoom and relayout preserve screen anchors.

名称建议：学科（最贴近学习）、主题库（跨领域）、知识库（通用）；本版采用学科。Suggested names: Subject, Topic library, Knowledge library. UI uses Subject.

旧版手动系列仍能显示，本版主视图专注目录组织，不再提供旧版手动新建/重挂工具。Legacy manual series remain readable, while editing controls focus on folder organization.


## 0.5.0 自适应聚焦 / Adaptive focus

默认显示全局 Radial 概览：一级分支和后代数。双击节点或 Enter 进入局部树；Ctrl/Cmd+Enter 进入知识聚焦；单击只选中并高亮祖先路径。Alt+Enter 或菜单打开原始 Markdown。Overview shows first-level branches and descendant counts. Double-click/Enter focuses a subtree, Ctrl/Cmd+Enter enters knowledge focus, Alt+Enter opens the source note.

Esc / 返回按钮恢复上一视角，面包屑跳转祖先，菜单内有视角历史和全局入口。搜索覆盖完整学科，不限当前可见节点。摘要集合用虚线框，可单击展开。缩略图始终显示全局一级结构，可点击进入对应分支。History, breadcrumbs, complete-subject search and global minimap provide navigation.

手动拖动背景和缩放中断自动相机动画；不会被强制居中。菜单间距可调节点、分支、父子和留白，本次打开期间有效。局部显示深度使用 0.90/0.65 的滞回阈值，过密时降级为摘要。Manual input cancels camera animation; zoom tiers use hysteresis. Spacing overrides are session-local.

注意：摘要仅是视图控件，不是知识节点、不写入 Markdown。0.5.0 的目录组织模式仍通过 Obsidian 文件列表调整目录，不新增文件拖动搬移。过大的完整展开或超长标题在小屏幕上可能需要平移；自动取景最低缩放 35%，不会无限缩小。Summaries are presentation-only. Extreme expanded views may require panning. Minimum automatic zoom is 35%.


## 0.5.1 跳转修复 / Note navigation fix

单击选中；双击或 Enter 打开原始笔记。Shift+双击或 Shift+Enter 聚焦分支；Ctrl/Cmd+Enter 知识聚焦。原菜单聚焦命令保留。以上替代 0.5.0 的双击/Enter 聚焦说明。Click selects; double-click/Enter opens the source note. Shift+double-click or Shift+Enter focuses a branch. Ctrl/Cmd+Enter enters knowledge focus. This supersedes the 0.5.0 interaction mapping.


## 0.6.0 全局层级与长短分支 / Global layers and staggered branches

全局统筹显示默认二级，可切一级、二级、三级、自定义深度（1–50）和全部节点。选择“全部”会清除折叠，显示全部真实节点，不生成摘要替代。切换层级时自动适配，然后可用滚轮与 +/- 任意拉近拉远；不再限制全局最低35%，全局最低0.1%。这是观察距离缩放，不改文字原始字号。节点多时全景文字变小，需要拉近阅读。Overview defaults to depth two; choose a custom depth or all nodes, then freely inspect by zooming and panning.

同心放射与长短交错可切换；长短交错在每层交替增加线长，后代继续向外延伸，并按可见子树分配扇区。节点显示纯数字的后代数量（不含自身），摘要不再使用+N。节点自身数量为零时显示0。The staggered mode varies branch lengths recursively. Counts are exact descendant totals, excluding self.

文件夹索引不强制同名，识别依据是 frontmatter 中的 mindtree.indexFolder；保留标记时可将自动索引改名为介绍.md、README.md等。不会自动将任意同名文件当成索引或覆盖它。双击文件夹节点打开其对应索引原文。Folder indexes are identified by metadata, not basename; double-click opens the associated Markdown file.

全部节点布局目前有O(N²)的标签碰撞约束检查，1000节点已验证，不宣称支持无限规模。Full-view geometry uses pairwise label separation; 1000 nodes have been tested.


## 0.6.1 递归子树与紧凑连线 / Recursive subtrees and compact edges

选中任意项目，点击工具栏 ↳“进入选中子树”，或 Shift+双击 / Shift+Enter，即以该项目为新根继续查看。右键也有进入此子树。普通双击/Enter仍打开笔记。子树默认沿用全局放射及当前层级选择，不再限制为一层；可在“子树布局”切换紧凑树状。进入更深的项目仍按相同规则展开。

节点 + 表示其子项当前没有显示，点击即展开下一层，允许突破默认显示深度；− 表示正在显示子项，点击折叠。修改一级/二级/全部不会强制跳回全局。Esc 和面包屑返回上层，历史也记录布局类型。

0.6.1 shortens default parent-child gaps to 24 canvas units and sibling gaps to 10. Node width follows measured text with a 96-unit minimum. Compact tree packs sibling subtree contours; radial placement advances only colliding labels, without inflating the entire map. Spacing remains adjustable from the menu. There is no claim of globally optimal minimum edge length.


## 0.7.0 研究后优化 / Research-led optimization

紧凑树状现在会在有益时分到根的左右两侧，减少纵向拉长与连线长度；不满足质量门槛时保留单向。小型树不保证比之前更快，极宽树仍可通过聚焦和缩放阅读。算法研究与逐项比较见 layout-algorithm-study.md。


## 0.8.0 连线路由 / Connector routing

菜单 → 连线方式可选择“智能短线与共干”（默认）或“独立曲线（原样式）”。智能路由在有益时共享树状主干，并用节点边缘的短曲线连接；祖先路径高亮仍保留。布局、笔记和进入子树的方法不变。Menu → Connectors switches between smart routing and original individual curves.

密集全局放射图仍可能有线穿过其他节点；局部聚焦能减少这类情况。本版不保证所有任意笔记库的边都没有交叉。


## 0.9.0 聚拢卡片 / Compact cards

默认展示改为“聚拢错落”：分支尽量靠近父节点，节点使用明显的卡片边框、背景与按学科分支区分的颜色。顶部放射样式仍可切回长短交错或同心放射。紧凑树状也会进行局部收拢。数据和笔记文件不改动。

第一次安装本更新时会将已有学科的显示样式切到聚拢错落；这是一次性显示配置迁移，之后可自行选择旧样式。子树进入、双击打开、全局层级和搜索用法不变。The first upgrade migrates presentation preferences once, not note data.


## 0.9.1 点到哪里看哪里 / Expand where you look

本节替代 0.6.1 的加号展开行为。点击节点 **+**：以它为当前子树的根，将卡片放在画布中心，再按当前一级/二级等深度显示它的后代。继续点击下级的 +，局部根和面包屑逐级前进。外围分支不会参与当前布局计算，不再因全局结构变宽而把局部连线拉长。− 仍折叠，不离开当前视角。

**+** enters a local observation rooted at the clicked node, centres its card, and applies the current relative depth. Further expansion repeats the same rule. **−** collapses without navigating away. This replaces the 0.6.1 in-place expansion rule.

Esc / ← 返回前一观察位置，恢复缩放、平移、根节点及布局；⌂ 返回学科全景。全局缩略图始终展示全部一级分支，可点击切换；面包屑可直接跳回祖先。在子树中更改深度、放射样式或树状布局，仍以当前根为中心。工具栏 ⤢ 是手动“适应窗口”，按整张当前子树的包围盒取景，因此不要求根节点居中。

Esc / ← restores the preceding observation and its camera; ⌂ opens the subject overview. Breadcrumbs and the full first-level minimap retain global context. Local depth/layout changes keep the root centred. The explicit ⤢ command instead fits the current subtree's bounding box.

手动拖动背景或滚轮缩放会立即中断自动移动，之后不会再次抢回定位。单击选中、双击/Enter 打开原始 Markdown 的操作保持不变。Manual pan/zoom cancels automatic camera motion. Click selects; double-click/Enter opens the original Markdown.
