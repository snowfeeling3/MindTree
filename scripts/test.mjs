import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
await mkdir('.test',{recursive:true});
await build({entryPoints:['tests/core.test.ts','tests/repository.test.ts','tests/folder.test.ts','tests/ui.test.tsx','tests/adaptive.test.ts','tests/routing.test.ts','tests/cluster.test.ts'],bundle:true,platform:'node',format:'esm',external:['react','react-dom/server','react/jsx-runtime'],outdir:'.test',outExtension:{'.js':'.mjs'},alias:{obsidian:new URL('../tests/obsidian-mock.ts',import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, '$1')}});
const result=spawnSync(process.execPath,['--test','.test/core.test.mjs','.test/repository.test.mjs','.test/folder.test.mjs','.test/ui.test.mjs','.test/adaptive.test.mjs','.test/routing.test.mjs','.test/cluster.test.mjs'],{stdio:'inherit'});process.exitCode=result.status??1;
