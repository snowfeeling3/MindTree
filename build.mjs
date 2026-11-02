import {build} from 'esbuild';
await build({entryPoints:['src/main.tsx'],bundle:true,external:['obsidian'],format:'cjs',platform:'browser',outfile:'main.js'});
