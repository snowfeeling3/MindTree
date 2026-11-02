# Connector routing / 连线路由优化

Date: 2026-10-30. Version 0.8.0. Layout positions and note relationships are unchanged in this experiment: comparison isolates routing on the same nodes.

## Accepted design / 保留方案

- Tree siblings can share one stem and segmented trunk. Each physical trunk interval is painted once. Owners track the logical child edges so ancestor-path highlighting follows only relevant trunk intervals. Candidate must save at least 5% geometric length and not hit other labels.
- Independent edges compare the old midpoint cubic with a short, gently curved quadratic between rectangle-boundary ports. Accept only shorter candidates with no additional sampled third-label intersections. Original curves remain available in the menu.
- Label candidates use a spatial hash, avoiding full-scene scanning for ordinary short edges. Camera changes only cull routes; cached route geometry is interpolated by stable route ID. Obstacle queries do not execute on animation frames.

## Metrics / 比较口径

Each individual curve is sampled at 16 or 32 intervals; straight shared segments are exact. Length sums SVG path geometry, not anti-aliased pixel coverage or union area. Longest is the longest painted route piece; a logical relationship can traverse multiple shared pieces, so it is not an end-to-end path shortening claim. Crossings count proper intersections of sampled segments; shared endpoints/collinear strokes are excluded. Third-label hits exclude the route's source and destination nodes. Timings are seven-run medians from this machine.

|Shape|Nodes|Geometry length old → new|Longest route piece old → new|Third-label hits old → new|Median routing ms|
|---|---:|---:|---:|---:|---:|
|tree|50|6707.8 → 4874.0|529.5 → 348.0|0 → 0|0.91|
|tree|200|37488.0 → 27892.6|1710.5 → 1652.9|0 → 0|1.70|
|tree|1000|255011.6 → 185454.0|8553.8 → 8491.2|0 → 0|5.94|
|wide|50|20203.7 → 3750.0|799.0 → 74.0|0 → 0|0.21|
|wide|200|331161.6 → 15580.0|3298.2 → 74.0|0 → 0|0.82|
|wide|1000|8340717.3 → 78660.0|16668.0 → 74.0|0 → 0|9.08|
|radial|50|13535.9 → 8616.8|455.2 → 397.5|13 → 11|1.26|
|radial|200|69835.8 → 51341.8|694.4 → 646.0|210 → 177|3.79|
|radial|1000|677269.8 → 593292.4|1618.9 → 1528.8|4785 → 4448|54.73|

Tree/wide fixtures at 50 and 200 nodes had zero proper crossings before and after. The 200-node radial fixture decreased from 151 to 25 sampled proper crossings; 1000-node crossing counts were not exhaustively measured. Geometric reductions are not guarantees for arbitrary vaults.

## Rejected experiment / 已撤回实验

A bounded corner visibility-graph detour prototype lowered label hits but increased 50-node radial crossings from 0 to 4 and reached about 548ms for 1000 radial nodes in the recorded run. Its code is not in the runtime bundle. Raw trial metrics are retained for comparison. No assertion was weakened to accept the failing candidate.

## Verification and limits / 验证与边界

47 automatic tests cover geometric reductions, unchanged node geometry/relationships, label hits, shared-trunk ownership, crossing checks up to 200 nodes and rectangle boundary behavior. Existing browser regressions cover 50/200/1000 nodes, recursive subtrees, boundary expansion, source-note opening, camera history and manual zoom. The rendered connector layer and screenshots are checked in Chromium with a mocked vault.

Native Obsidian acceptance remains pending. Dense radial scenes still have some label occlusions. No claim of shortest paths, globally crossing-free routing or stable topology under every animation is made. On a 1000-node radial full view, route generation is roughly 55ms in this run, so it is cached outside the animation loop. Tree routing increases the number of SVG pieces while reducing duplicate long strokes.
