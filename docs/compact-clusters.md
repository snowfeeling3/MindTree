# 聚拢错落与卡片 / Compact clusters and knowledge cards

Date: 2026-10-30. Version 0.9.0.

## Layout / 布局

先由原放射或紧凑树产生合法布局，再按后序向父节点收拢整块子树。使用连续扫掠矩形约束，移动遇到其他节点前停止，子树内部位置随整体平移，知识关系、ID和文档内容不变。中小视图（不超过200节点）还比较直向与正负30度错落位置，只接受降低父子中心距离的移动。最多三轮；超过2000可见节点或64层深度使用原布局，避免无界计算。This is deterministic local compaction, not global optimal packing.

该模式默认启用，已有安装第一次更新时迁移显示偏好；旧的同心放射和长短交错仍可选择。原数据不迁移。展示全部1000节点已较密，收拢收益可能很小；不宣称任意数据都可缩小一半。

## Visual direction / 视觉方向

明亮冷色画布、白色内容卡片、深蓝根卡片；一级分支使用蓝/青绿/赭/紫/莓色/灰蓝实色卡片，后代沿用分支描边与计数徽标。使用宿主字体、清晰边框、轻阴影和实色对比，不增加品牌介绍或常驻侧栏。白色标题相对六个分支底色的计算对比度分别约5.85、4.81、5.08、5.58、5.06、4.90。

## Measured fixtures / 测试样本

Parent-child distance here means sum of center-to-center distances, not painted route length. Area is the node bounding box, with no viewport scaling included.

|Nodes|Mode|Area before → after|Center distance before → after|
|---:|---|---:|---:|
|50|radial|2410599.3 → 1140822.9|13088.6 → 8581.6|
|50|tree|1290008.0 → 1208498.6|10335.7 → 10007.1|
|200|radial|5671286.4 → 5148849.6|67360.2 → 59638.4|
|200|tree|7622590.0 → 7179673.8|51884.5 → 50263.5|
|1000|radial|18190842.3 → 18189054.8|616090.4 → 614495.7|
|1000|tree|49092400.0 → 46306992.4|327243.6 → 321337.1|

54 automatic tests passed, including contraction non-overlap, ID/parent preservation, unchanged input, non-increasing center-distance sum and deep-layout safety. Chromium mock-vault acceptance passes for 50/200/1000 nodes, including initial camera centering at real dimensions, recursive subtrees, all-node display, source-note opening, depth-boundary expansion and manual zoom stability. Desktop and narrow screenshots were reviewed. Initial camera fitting now responds to measured viewport dimensions even if layout coordinates stay cached.

Native Obsidian acceptance is still pending. No guarantee of crossing-free edges after compaction is made. Large all-node overviews can have tiny labels; users can zoom or enter subtrees. The loop is bounded, but worst-case pairwise collision work remains significant. The simulated browser does not test settings migration inside Obsidian.
