# 实施计划 / Development plan

1. 研究和骨架 / Research and scaffold：核查来源、设计模型、编译与独立 Vault 安装。实际宿主加载需另行验证。
2. 只读核心 / Read-only core：严格 schema parser、重复 ID、反向索引、指定根遍历、环诊断、确定性布局。每个算法单测覆盖空树、深树、断链、多视图及环；使用迭代遍历避免栈溢出。
3. 同步 / Synchronization：事件归并、rename/delete/external edits、缓存延迟与写入失败的适配层测试。
4. 编辑 / Editing：Tab/Enter、安全重名、拖动重挂、冲突预检；注入写失败测试和独立 Vault 集成测试。
5. 交互 / Interaction：选择、双击、缩放、平移、折叠、可访问性与完整双语；人工键盘及 IME 验证。

每阶段报告文件、命令结果与未验证项。没有宿主证据不宣称运行成功。Each gate records evidence and outstanding checks.

本轮不包含 AI、云、网络图、时间轴或商业功能。No out-of-scope features.


## 0.2.0 进度 / Progress

已实现核心算法、模拟适配层测试、多仓库/多系列 UI、SVG 布局与基础编辑同步。Core, mocked adapter tests, repository/series UI and basic editing are implemented.

尚未完成真实宿主验收、增量索引、UI 自动测试、并发多视图冲突和移动端验证。优先完成 docs/verification.md 的真实测试清单，再扩大功能。Host acceptance and performance/UI validation remain open.


## 0.3.0 更新 / Update

0.3.0 folder-series entry and automated owned indexes implemented. 主流程改为整系列组织导图；宿主验收、文件夹改名后索引迁移仍待完成。


## 0.5.0 自适应聚焦 / Adaptive focus

0.5.0 完成分析、可见层级与布局解耦、相机与导航、摘要与缩略图、27 项自动测试及 Chromium 视觉复核。下一步优先真实 Obsidian 验收、极端宽/深/长标题与触控数据集、轮廓压缩和脏子树缓存，不扩展知识数据结构。
