# 数据模型 / Data model

每个节点必须是独立 .md；禁止内嵌虚拟内容节点。Each node is a Markdown file.

```yaml
mindtree:
  schema: 1
  id: "550e8400-e29b-41d4-a716-446655440000"
  relations:
    - view: "study"
      parent: "parent-uuid"
      order: 1000
  links:
    - "related-uuid"
```

id 为不可变 UUID；path 不是身份；重复 ID 视为错误且禁止相关写入。IDs survive renames; duplicates block affected writes.

每个 view 中每节点最多一个 parent；缺少关系表示该视图根或不参与，由指定根遍历决定。子节点通过反向索引派生，不双写 children。One parent per view; children are derived.

普通 links 为有向关联，允许环；不参与树布局和树环检测。树边自环或祖先环拒绝提交，外部产生的环隔离并报告，不自动修复。Links may cycle; hierarchy cycles are rejected or quarantined.

多视图允许同一文档在不同 view 有不同父节点；一个视图内节点只出现一次。同 order 按稳定 ID 排序。Multiple views share content and independent parentage.

新建文件使用安全文件名、冲突后缀并以 Vault.create 的结果判断竞争；先创建含完整 frontmatter 的子文档，仅一次写入。重挂只改子文档。失败不假装成功；跨文件操作不宣称事务原子性。Creation is one host API write; reparent changes one file.

未知 schema 只读；缺失 parent 显示悬空诊断；删除不清理其他文件；标题来自 basename。Unknown schemas are read-only; missing references are diagnosed.

折叠、viewport、当前根及语言写入插件设置，不存笔记正文；关系始终在 Markdown。View preferences are separate from document relations.


## 多仓库与系列 / Repositories and series

仓库 Repository = {id, name, folder}，folder 为当前 Vault 的相对文件夹。系列 Series = {id, name, repositories: repositoryId[], root: noteId, collapsed: noteId[]}。这些配置保存在插件 data.json；系列 id 作为 Markdown relations.view 的键。A series combines repository scopes with one independent hierarchy.

来源仓库可以重叠，文件按 Vault 路径扫描一次。移除来源不删除文件；关系指向范围外节点会显示缺失父级。Series scope does not own or delete source notes. Stable IDs are generated with crypto.randomUUID; imported valid nonempty IDs remain readable.


## 0.3.0 更新 / Update

Series.folder selects a subject folder. Index metadata includes mindtree.indexFolder and a generated stable ID; directory links reside inside managed markers. 系列组织模式的关系由目录派生，不在各原笔记中双写 parent；根入口从当前扫描发现，文件改名后可重新定位。
