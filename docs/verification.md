# 验证记录 / Verification

日期 / Date: 2026-10-30. Version 0.2.0.

- npm run build：TypeScript strict 与 esbuild CommonJS 打包通过 / passed.
- npm test：13 项通过 / 13 passed. Covers schema validation, duplicate IDs, cycles, dangling links, reparent checks, independent views, collapse/order, 12,000-node deep chain, safe filenames, folder boundaries, simulated write failure and queue recovery, collisions, unrelated frontmatter preservation.
- npm run stage：三文件复制到独立 test-vault / plugin files staged into disposable vault.

适配层测试使用模拟 Obsidian，不代表真实 YAML 序列化或 MetadataCache 时序验证。Adapter mocks do not validate real host YAML serialization or event timing.

宿主验证尝试：已检测 Obsidian 1.14.5；通过 URI 打开独立测试文件时宿主提示 Vault not found，尚未注册该 Vault。后续 UI 操作遇到窗口遮挡及用户输入保护，因此没有继续操作当前真实笔记库。Host acceptance is pending: the test folder was not registered, and UI automation encountered foreground/user-input protection.

待人工验证 / Pending host checks:

- 打开独立测试 Vault，启用插件并运行命令 / register vault, enable plugin, open view.
- 创建两仓库和两系列，多选仓库、重启恢复 / repositories, series and persistence.
- Tab/Enter、IME、双击、拖动、折叠、缩放与窄屏 / interaction and responsive layout.
- 文件改名、移动、外部编辑、删除与错误诊断 / host file changes and diagnostics.
- 真实 processFrontMatter 的字段与正文保留、磁盘失败 / host write preservation and failures.

已实现不等于宿主验收完成。Implemented features remain experimental until the checks above pass.


## 0.3.0 更新 / Update

0.3.0: 16 automated tests passed, including managed block preservation, malformed marker rejection, nested folder index generation, collision avoidance, idempotent reruns, scoped organization graph and failure recovery. 构建与测试通过；未向真实 Vault 写入，实际宿主验收仍待完成。


## 0.4.0

0.4.0：新增鼠标锚点缩放（含上下限）、布局变化选中节点锚定、三种布局拓扑，以及 React 静态渲染检查。主视图无侧栏、表单或品牌标题。新增测试不等同于浏览器视觉回归或真实宿主交互测试，菜单横向展开、实际缩放手感、跨学科恢复仍需宿主验收。Tests cover geometry and shell structure; native submenu appearance and real input behavior remain unverified.


## 0.5.0 自适应聚焦 / Adaptive focus

2026-10-30，0.5.0：构建通过，27 项单元/模拟适配层/静态 UI 测试通过。50、200、1000 节点平衡树分别校验一级概览、每个一级分支的尺寸感知布局无重叠、1400×1000 子树边界与留白、数据不变。还有摘要、文字测量换行、滞回、历史、裁剪测试。The fixtures are balanced five-way trees, not every possible graph shape.

真实 Chromium（模拟 Vault）在 1400×900 分别验证 50/200/1000 节点：全部五个一级分支双击聚焦后屏幕矩形不重叠；折叠/展开数量正确；Esc 返回全局；搜索知识笔记40可定位；手动缩放后等待设置保存与刷新，变换不被覆盖。无 pageerror。另检查 390×700 截图，修复窗口变化中心补偿。Evidence: release/validation-0.5.0/browser-report.json and screenshots.

浏览器脚本 npm run test:browser 使用本机捆绑 Playwright 路径与已安装 Chromium，其他电脑需修改脚本运行时路径。浏览器宿主只模拟数据和文件操作，原生菜单/Obsidian 宿主、实际写入及移动端触控未完成验收。

剩余限制：布局是尺寸感知子树包围盒算法，不是严格 Buchheim 最优紧凑树；当前依赖记忆化和裁剪，不是完整增量布局；过宽展开允许平移，间距配置仅本次会话；空间按最长节点尺寸保守分配，尚未压缩不同层级轮廓；没有对任意拓扑断言交叉边全消除。No claim of complete host acceptance or optimal contour packing.

全局相机跨打开保存；局部聚焦只保存在会话视角历史中，避免下次打开全局布局时套用局部相机坐标。Only the global camera persists between openings; local focus observations stay in session history.


## 0.5.1 跳转回归修复

构建及27项自动测试通过。真实Chromium模拟Vault在50/200/1000节点验证单击不打开笔记、双击和Enter各调用一次原笔记路径打开；Shift+双击的分支聚焦、Esc、搜索、折叠展开及缩放稳定性继续通过。Obsidian实际标签页跳转尚未宿主复测。


## 0.6.0 全局层级与长短分支 / Global layers and staggered branches

0.6.0：新增完整50/200/1000节点放射布局的数量、原父子关系、无重叠与整体边界测试；16一级分支测试证明8短8长，深层继续向外；索引改名Introduction.md后仍被识别、作为根并正确提供原笔记路径。共32项自动测试通过。

Chromium模拟Vault验证：二级概览为31节点；选择全部时分别显示50/200/1000个真实节点；双击根索引与普通节点、Enter打开调用通过；Shift聚焦、历史、折叠、搜索与手动缩放回归通过。原生Obsidian宿主仍未复测。Global screenshots are evidence of organization/coverage, not legibility of every label at fit-all zoom.


## 0.6.1 递归子树与紧凑连线 / Recursive subtrees and compact edges

0.6.1：34项自动测试通过。新增相对根深度、深度边界继续展开、紧凑树实际父节点宽度+24间隔与无重叠验证。50/200/1000节点Chromium验证：进入选中子树、在一级显示边界展开第三级、继续进入深层项目、子树内改为二级不跳回全局、深层后代继续显示；紧凑树切换、矩形无重叠，以及原笔记打开/搜索/折叠/历史/手动缩放回归。

视觉复核桌面紧凑树与放射截图。真实Obsidian宿主仍未复测；紧凑算法不宣称最小总线长，对宽大分支整图取景时文字仍会缩小，可进入更深子树或手动放大。


## 0.7.0 研究后优化 / Research-led optimization

0.7.0：先完成论文、作者修正实现及d3-flextree源码/许可研究，再保留0.6.1基线进行15组比较。最终树算法36项测试通过，包含12000深链和镜像测试。Chromium模拟Vault的50/200/1000节点全套递归/展开/打开笔记/搜索/缩放回归通过，并复核双向紧凑树截图。详见 layout-algorithm-study.md 与 release/validation-0.7.0。Obsidian真实宿主仍未复测。

本轮收益只针对树状布局；放射布局仅建立父节点索引，没有宣称连线质量提升。双向树可能更宽，占地不总变小，局部运行时间也不总更快。曲线长度按32段采样，基准7次中位数。


## 0.8.0 连线路由 / Connector routing

0.8.0：构建与47项自动测试通过，50/200/1000节点路由基准已保存。树状1000节点几何总长约减少27%，放射约减少12%；极宽单层树的共享主干收益更大，但这是物理绘制片段总长，不代表逻辑父子路径长度同比降低。被拒绝的绕障试验因交叉增加与延迟过大撤回。详见connector-routing.md。真实Obsidian宿主仍未复测。


## 0.9.0 聚拢卡片 / Compact cards

0.9.0：构建、54项测试通过。新增50/200/1000节点的树和放射收拢检测：无矩形重叠、ID/parent不变、输入不变、父子中心距离合计不增加；单点和深链安全路径通过。50节点放射样本的面积约减少53%，中心距离约减少34%，1000节点全图收益很小，完整数值见compact-clusters.md。

Chromium模拟Vault验证初始居中、全部节点、递归子树、折叠展开、笔记跳转与手动缩放稳定性，复核明亮卡片桌面与窄屏截图。卡片内部计数徽标属于自身内容，碰撞验收测量外层卡片框，不把徽标当作独立知识节点。原生Obsidian及一次性显示偏好迁移仍待宿主复测。


## 0.9.1 局部展开定位 / Local expansion framing

2026-10-31：TypeScript/打包通过，56 项自动测试通过。新增对称取景几何测试覆盖非对称子树、1188×820/390×700/700×390 画布、留白和缩放限制。584 节点、16 一级分支的单元样本验证三层局部结构无重叠、局部坐标不依赖其余全局分支、原图不变。

Chromium（模拟 Vault）以 1188×900 窗口、一级显示、长短交错复现十六分支场景。依次展开 1 → 17（计算理论）→ 97，三次根中心误差均为 0 像素；最长屏幕连线分别约 278、277、256 像素；每次当前根及五个子节点都完整位于留白范围内。此数值是合成样本测量，不是对用户真实 Vault 的测量。

The recorded sixteen-branch browser fixture keeps each clicked node centred through three recursive expansions. Each local observation contains six visible cards, all non-overlapping and within padding. Screen connector lengths above are fixture-specific, not a benchmark of the user's Vault.

浏览器还检查：逐级 Esc 恢复完全相同的相机变换、全局视角恢复、滚轮和背景拖动中断自动相机、窗口变化、局部一级/二级与树状切换保持根中心、原笔记打开调用。原有 50/200/1000 节点的全量显示、递归进入、边界展开、折叠/展开、搜索、双击/Enter、手动缩放稳定性全部保留验证。

Evidence: `release/validation-0.9.1/browser-report.json` and screenshots. Plugin outputs are staged only in `test-vault/.obsidian/plugins/mindtree`; no real note files were touched. 实际 Obsidian 宿主复测仍未完成；原生菜单和实际 Markdown 标签页需要宿主验收。全局放射图的最短线长、任意拓扑无交叉不在本次验证结论之内。
