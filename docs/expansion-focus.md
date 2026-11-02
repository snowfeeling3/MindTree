# 局部展开与中心定位 / Local expansion and root-centred framing

## 问题 / Cause

旧 toggle 只修改 expanded 集合，positions 仍以学科根计算可见节点、叶权扇区和半径。新增后代会改变全局布局；pending='fit' 随后适配全部位置，既拉远连线又失去点击目标。先前五分支样本不足以覆盖截图中的十六分支场景。

Previously, expansion changed visibility under the global root and then fit all positions. Global sector weights affected local edge lengths. The existing five-branch fixture did not reproduce the sixteen-branch case.

## 修改 / Changes

- `src/ui/Shell.tsx`：打开 + 时保存前一观察，再把 clicked ID 作为 focus/root，使用相对深度重新筛选子树。仅清理这次局部观察的临时展开集合；Markdown、图节点 ID、父子关系均不改动。折叠操作不导航。同一局部根折叠后再展开不添加冗余历史。
- `src/core/navigation.ts`：`focusTiles` 根据当前局部根的卡片中心计算四周对称边界，限制缩放并保留留白。取景目标与普通 fit 分离；在布局计算完成后消费一次，不在动画帧或手动输入后反复取景。
- 层级、放射样式、局部树状切换及自动窗口适配使用局部中心取景。显式适应窗口仍使用完整子树边界。手动拖动/滚轮清除待执行取景并停止相机动画。
- 全局缩略图取消十二个一级分支的上限。Esc 精确恢复观察历史，⌂、面包屑、搜索及原笔记跳转保留。

Expansion follows this flow: click → save observation → select local root → filter descendants using relative depth → measured layout/routing → consume one root-centred camera request → animate stable IDs. Manual input cancels the request and camera motion. No large dependency was added.

## 验证 / Validation

单元测试覆盖非对称子树在横屏、窄屏中的根中心、留白与缩放；584 节点、16 一级分支的三层局部布局证明外围分支不影响其位置，保留原 ID 和关系且卡片不重叠。浏览器测试使用 Chromium 和模拟 Vault，不是原生 Obsidian 宿主验收。

Unit tests check asymmetric bounds, root centring, padding, zoom limits and independence from unrelated global branches. Chromium checks repeated expansion, history, manual interruption, resizing, layout/depth changes and note-opening calls. See `verification.md` and `release/validation-0.9.1/` for recorded results.

局部展示刻意聚焦当前分支；查看其他学科分支使用缩略图或回到全局。选择全部节点仍可能需要缩小或平移；本次不宣称全局放射布局已达到最短连线，也不宣称任意拓扑均无交叉。

Local observations show the selected branch; global context remains available through the minimap, breadcrumbs and home. All-node views may still need zoom/pan. This change does not claim globally optimal radial edge lengths or crossing-free arbitrary graphs.
