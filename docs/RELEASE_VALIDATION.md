# 发布验证 — 2026-11-02

Windows / Node 22 本地验证：57 自动测试与 TypeScript/esbuild 构建通过。Chromium 的模拟宿主回归覆盖 50/200/1000 节点与 584 节点逐级聚焦、搜索、打开笔记、观察历史、缩放中断和布局切换。截图使用模拟 Obsidian API 与合成数据。Obsidian 真实宿主、YAML 序列化/MetadataCache 时序、移动端和实际最低版本兼容仍未验收。Release 是预发布插件，建议先用 Vault 副本。

浏览器差异：系统 Chrome 一次运行在全部节点数量断言失败；使用 Chromium headless shell 完整重跑通过。当前仅记录该 Chromium 验证范围，不声称所有浏览器一致。
