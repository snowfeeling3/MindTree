# 先研究，后替换 / Study before replacement

Date: 2026-10-30. Baseline: adaptive.ts SHA256 bb42822dc76f6889c1d15e6ad16b29e81227ccfa0372fbb80a55acbbd999c1af. Runtime code was not modified during research.

## Sources / 学习材料

- [D3 tree official docs](https://d3js.org/d3-hierarchy/tree): layered Reingold–Tilford/Buchheim. Fixed nodeSize does not directly solve arbitrary rectangle sizes.
- [van der Ploeg, Drawing Non-layered Tidy Trees in Linear Time](https://ir.cwi.nl/pub/21856/21856B.pdf): fixed parent-to-child distance with varying dimensions; contour threads and deferred shifts replace repeated full-subtree movement.
- [Author's corrected implementation](https://github.com/cwi-swat/non-layered-tidy-trees): the first contour-pair shift must apply even when negative. A naive clamp at zero can retain avoidable space.
- [d3-flextree source](https://github.com/Klortho/d3-flextree/blob/master/src/flextree.js): variable node size, left/right contour threads, shift/change distribution, root centering. Wrap/layout traversal is recursive, so deep-chain robustness needs separate handling.
- [Parent-centered radial layout](https://arxiv.org/abs/cs/0606007): a reference for placing a subtree relative to its own parent; not evidence that the current root-centered ray algorithm has minimum edge length.

## Diagnosis / 当前问题

Tree: repeated rectangle-pair comparisons and copying whole descendant arrays; zero-clamped sibling offsets; no mirror-symmetry acceptance test. Radial: 180-unit base and accumulated offsets, global origin rays, repeated parent lookup and all-previous collision intervals. A 24-unit horizontal gap alone does not bound Euclidean connector length when a parent spans many child rows.

## Decision gate / 替换门槛

First benchmark a typed adapter around d3-flextree 2.1.2 as a small candidate (WTFPL, with d3-hierarchy BSD-3-Clause). No reference plugin code is reused. Keep candidate behind tests until non-overlap, unchanged IDs/order/relations, actual parent gap, mirrored geometry, and measured area/edge length are checked. No global optimum claim. Do not replace radial with an unvalidated force layout.

Measure 50/200/1000 balanced, wide, comb, uneven and long-label fixtures. Record bounds area, height, total visible connector chord length, median repeated runtime and package byte cost. Include a deep chain: recursive dependencies require a safe fallback. Only then integrate, rerun navigation regressions, and visually inspect the compact-tree screenshot.


## Experiment outcome / 对比后才接入

First trial: replacing the engine alone did not consistently reduce area or edge cost, so that trial was not adopted as the optimization claim. Second trial: balance root branches by measured subtree height, run non-layered layouts on each side, and mirror only the left side. Accept this candidate only if chord cost and height improve and area grows by at most 15% relative to the one-sided candidate. Maintain parent order within each side; do not sort or rewrite source children.

Final runtime integration: d3-flextree 2.1.2 (WTFPL), d3-hierarchy 1.1.9 (BSD-3-Clause), full texts in THIRD-PARTY-NOTICES.md. The package API was inspected before adoption. Shapes deeper than 256 use an iterative extent fallback; a 12,000-depth chain is tested. Source plugin dependencies are untouched.

Metrics below compare the actual 0.6.1 implementation snapshot against the final adapter, using seven repeated timing samples (median). Curves use 32-segment cubic sampling, not exact analytic arc length. Tests additionally check rectangle overlap, IDs/relations and actual boundary gap. These measurements are local evidence, not a performance guarantee. Total minimum edge length is not claimed.

|Shape|Nodes|Height old → new|Sampled curve total old → new|Area old → new|Median ms old → new|
|---|---:|---:|---:|---:|---:|
|balanced|50|2510 → 1310|7654 → 6451|1551180 → 1312620|0.19 → 1.75|
|balanced|200|10382 → 5896|41245 → 35962|8035668 → 7959600|2.39 → 4.35|
|balanced|1000|52366 → 29840|271076 → 244474|50585556 → 51742560|3.87 → 6.17|
|wide|50|3126 → 1590|38500 → 19354|900288 → 763200|0.03 → 0.32|
|wide|200|12726 → 6390|633736 → 317025|3665088 → 3067200|0.37 → 0.91|
|wide|1000|63926 → 31990|15968177 → 7984307|18410688 → 15355200|10.24 → 5.52|
|comb|50|126 → 126|1219 → 1219|503496 → 503496|0.04 → 0.19|
|comb|200|126 → 126|4819 → 4819|1977696 → 1977696|0.48 → 0.61|
|comb|1000|126 → 126|24019 → 24019|9840096 → 9840096|11.66 → 0.74|
|uneven|50|2174 → 1264|6510 → 5330|1460928 → 1509216|0.03 → 1.13|
|uneven|200|9070 → 5399.5|37472 → 31708|8108580 → 8779587|0.23 → 3.24|
|uneven|1000|45758 → 27029|248305 → 217535|52164120 → 57571770|5.99 → 13.84|
|long-labels|50|3665 → 1920|10980 → 9188|2756080 → 2188800|0.03 → 0.94|
|long-labels|200|14385 → 8180.5|57710 → 50373|12543720 → 11289090|0.19 → 2.48|
|long-labels|1000|72917 → 41590.5|380811 → 343686|83125380 → 79687398|3.77 → 9.38|

Radial geometry is deliberately unchanged this round: parent lookup was indexed, but the ray-pushing algorithm remains quadratic and its edge-length quality is not covered by the tree gains. Replacing it needs an independent parent-centered-layout comparison, angular-order/crossing tests and animation review.

Bundle before/after in this development build: 1,108,475 → 1,128,097 bytes, +19,622 bytes uncompressed. No full D3, ELK or React Flow dependency was added. Browser mock tests cover 50/200/1000 nodes, recursive subtree navigation, depth-boundary expansion, compact mode, overlap, opening source notes, search, history and manual zoom. Obsidian native host acceptance remains pending.
