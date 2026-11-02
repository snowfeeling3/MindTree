# Adaptive organization maps / 自适应组织导图

现状：React/SVG、固定节点尺寸、一次全树排布、相机副作用混杂。Current renderer uses React/SVG and fixed geometry.

修改顺序：core/adaptive.ts（层级筛选/计数/测量/摘要/布局）→ core/navigation.ts（相机与导航模型）→ ui/useMotion.ts（可中断动画）→ Shell.tsx（交互）→ 规模和浏览器验收。Data flow: immutable Graph → derived hierarchy → visible presentation → measured positions → interpolated frame → clipped SVG. Repository, Markdown and IDs remain authoritative and unchanged.

不引入大型依赖。D3 tidy tree 的 separation/nodeSize 可参考，但变宽文本、摘要和语义层级仍需单独实现；ELK 对当前单父树过重；React Flow subflows 是分组组件而非布局引擎。本轮使用独立的尺寸感知子树包围盒算法，不将它宣称为 Buchheim 最小宽度实现。

全局仅根与一级分支及后代数，一级过多时显示可展开摘要；局部树按实际文本尺寸分配高度和层宽。摘要只存在展示层，不写文档，不伪造知识节点 ID。完整分支不能在可读字号下全部适配时保留摘要，用户逐层聚焦；绝不通过无限缩小字体展示完整 1000 节点。

导航保存焦点、模式、折叠和相机快照；手动输入中断动画，不触发强制 fit。节点动画按稳定 ID 插值，布局只在图或层级/间距变化时重算，相机移动仅裁剪。所有几何测试与浏览器验证证据在 verification.md 记录。


0.9.1 的展开数据流与中心取景规则见 [局部展开 / Local expansion](expansion-focus.md)。该规则替代 toggle 后全局 fit 的旧处理。
