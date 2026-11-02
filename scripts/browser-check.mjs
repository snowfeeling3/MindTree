import {build} from 'esbuild';import {writeFile,mkdir,readFile} from 'node:fs/promises';import {createServer} from 'node:http';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
const require=createRequire(import.meta.url);const {chromium}=require('playwright');await mkdir('.test/screens',{recursive:true});await build({entryPoints:['tests/browser-entry.tsx'],bundle:true,platform:'browser',format:'iife',outfile:'.test/browser.js',alias:{obsidian:fileURLToPath(new URL('../tests/browser-host.ts',import.meta.url))}});
const css=await readFile('styles.css','utf8'),js=await readFile('.test/browser.js','utf8');const html=`<!doctype html><meta charset="utf-8"><style>:root{--background-primary:#252b2e;--background-secondary:#2e3539;--background-modifier-border:#434d53;--background-modifier-hover:#394247;--text-normal:#d6ddd9;--text-muted:#9aaba4;--text-faint:#63766c;--interactive-accent:#90b4a1;--text-error:#e1a39b;--font-interface:Segoe UI,Microsoft YaHei,sans-serif}*{box-sizing:border-box}body{margin:0}#app{height:100vh}button,input,select{font:inherit;color:var(--text-normal);background:var(--background-secondary);border:1px solid var(--background-modifier-border);border-radius:4px}button{cursor:pointer}${css}</style><div id="app"></div><script>${js}</script>`;
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html;charset=utf-8');res.end(html);});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});const page=await browser.newPage({viewport:{width:1400,height:900}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));const report=[];
const checkLocalExpansion=async()=>{
 await page.setViewportSize({width:1188,height:900});
 await page.goto(`http://127.0.0.1:${server.address().port}/?nodes=584&primary=16&depth=1&style=staggered`);
 await page.waitForSelector('[data-node-id="16"]');await page.waitForTimeout(550);
 const transform=()=>page.locator('.mt-paper>g').getAttribute('transform');
 const initial=await transform(),steps=[];
 const checkFocus=async(id,expectedCount=6)=>{
  const view=await page.locator('.mt-paper').evaluate((svg,id)=>{
   const r=svg.getBoundingClientRect(),card=svg.querySelector(`[data-node-id="${id}"]>rect`).getBoundingClientRect();
   const cards=[...svg.querySelectorAll('[data-node-id]>rect:first-of-type')].map(n=>n.getBoundingClientRect());
   for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){
    const a=cards[i],b=cards[j];if(a.right>b.left+.5&&b.right>a.left+.5&&a.bottom>b.top+.5&&b.bottom>a.top+.5)throw Error('Local expansion overlaps cards');
   }
   return {id,centreError:Math.hypot(card.x+card.width/2-r.x-r.width/2,card.y+card.height/2-r.y-r.height/2),
    allInside:cards.every(b=>b.x>=r.x+39&&b.right<=r.right-39&&b.y>=r.y+39&&b.bottom<=r.bottom-39),
    longestScreenConnector:Math.max(0,...[...svg.querySelectorAll('path')].map(p=>p.getTotalLength()*p.getCTM().a)),count:cards.length};
  },id);
  if(view.centreError>2||!view.allInside||view.count!==expectedCount||view.longestScreenConnector>400)throw Error('Local focus geometry failed: '+JSON.stringify(view));
  if(await page.locator('[data-node-id="0"]').count())throw Error('Expansion retained global sectors');
  return view;
 };
 for(const id of ['1','17','97']){
  await page.locator(`[data-node-id="${id}"] .mt-fold`).click();await page.waitForTimeout(400);
  const step=await checkFocus(id);steps.push({...step,camera:await transform()});
  await page.screenshot({path:`.test/screens/584-expand-${id}.png`});
 }
 // Returning restores each prior local observation, including its exact camera.
 for(const previous of [steps[1],steps[0]]){
  await page.locator('.mt-paper').focus();await page.keyboard.press('Escape');await page.waitForTimeout(350);
  await checkFocus(previous.id);if(await transform()!==previous.camera)throw Error('Expansion history lost camera');
 }
 await page.locator('.mt-paper').focus();await page.keyboard.press('Escape');await page.waitForTimeout(350);
 if(await transform()!==initial||!await page.locator('[data-node-id="16"]').count())throw Error('Expansion history lost global observation');
 // Interrupt the automatic camera move with a real wheel gesture.
 await page.locator('[data-node-id="1"] .mt-fold').click();await page.waitForTimeout(40);
 await page.mouse.move(600,450);await page.mouse.wheel(0,-140);await page.waitForTimeout(100);
 const manual=await transform();await page.waitForTimeout(1100);if(await transform()!==manual)throw Error('Expansion fought wheel interruption');
 // A background drag also takes ownership of the camera during expansion.
 await page.getByLabel('全局根节点',{exact:true}).click();await page.waitForTimeout(350);
 await page.locator('[data-node-id="1"] .mt-fold').click();await page.waitForTimeout(40);
 await page.mouse.move(20,180);await page.mouse.down();await page.mouse.move(100,220,{steps:5});await page.mouse.up();await page.waitForTimeout(100);
 const panned=await transform();await page.waitForTimeout(1100);if(await transform()!==panned)throw Error('Expansion fought pan interruption');
 // Keep the selected local root centred when an automatic observation is resized.
 await page.getByLabel('全局根节点',{exact:true}).click();await page.waitForTimeout(350);
 await page.locator('[data-node-id="1"] .mt-fold').click();await page.waitForTimeout(350);
 await page.setViewportSize({width:900,height:700});await page.waitForTimeout(350);await checkFocus('1');
 await page.getByLabel('显示层级',{exact:true}).selectOption('2');await page.waitForTimeout(350);await checkFocus('1',31);
 await page.getByLabel('显示层级',{exact:true}).selectOption('1');await page.waitForTimeout(350);
 await page.getByLabel('子树布局',{exact:true}).selectOption('tree');await page.waitForTimeout(350);await checkFocus('1');
 // Opening the original note remains separate from expanding its branch.
 await page.locator('[data-node-id="1"]').dblclick();if(await page.evaluate(()=>window.opened?.at(-1))!=='1.md')throw Error('Local root note no longer opens');
 report.push({nodes:584,primaryBranches:16,recursiveExpansion:steps,exactHistory:true,wheelInterrupt:true,panInterrupt:true,resizeFocus:true,depthAndLayoutFocus:true,localRootOpen:true});
 await page.setViewportSize({width:1400,height:900});
};
try{await checkLocalExpansion();for(const size of [50,200,1000]){await page.goto(`http://127.0.0.1:${server.address().port}/?nodes=${size}`);await page.waitForSelector('[data-node-id="1"]');await page.waitForTimeout(550);await page.screenshot({path:`.test/screens/${size}-global.png`});const global=await page.locator('[data-node-id]').count();const centered=await page.locator('.mt-paper').evaluate(svg=>{const boxes=[...svg.querySelectorAll('[data-node-id]>rect:first-of-type')].map(n=>n.getBoundingClientRect()),r=svg.getBoundingClientRect();return Math.abs((Math.min(...boxes.map(b=>b.left))+Math.max(...boxes.map(b=>b.right)))/2-(r.left+r.width/2))<3&&Math.abs((Math.min(...boxes.map(b=>b.top))+Math.max(...boxes.map(b=>b.bottom)))/2-(r.top+r.height/2))<3;});if(!centered)throw Error('Initial viewport used stale canvas size');if(!await page.locator('.mt-paper path[data-route-kind]').count())throw Error('Connector layer missing');await page.getByLabel('显示层级',{exact:true}).selectOption('0');await page.waitForTimeout(550);if(await page.locator('[data-node-id]').count()!==size)throw Error('All-node view lost nodes');await page.screenshot({path:`.test/screens/${size}-all.png`});await page.locator('[data-node-id="0"]').dblclick();if(await page.evaluate(()=>window.opened?.at(-1))!=='0.md')throw Error('Root index double click failed');await page.evaluate(()=>window.opened=[]);await page.getByLabel('显示层级',{exact:true}).selectOption('2');await page.waitForTimeout(550);
await page.locator('[data-node-id="1"]').click();if(await page.evaluate(()=>window.opened?.length??0)!==0)throw Error('Single selection opened a note');await page.locator('[data-node-id="1"]').dblclick();await page.waitForTimeout(80);if(await page.evaluate(()=>window.opened?.at(-1))!=='1.md')throw Error('Double click failed to open original note');await page.locator('[data-node-id="1"]').focus();await page.keyboard.press('Enter');if(await page.evaluate(()=>window.opened?.length)!==2)throw Error('Enter failed to open original note');

const checkBoxes=async()=>{const boxes=await page.locator('[data-node-id]>rect:first-of-type').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(a.x+a.w>b.x+.5&&b.x+b.w>a.x+.5&&a.y+a.h>b.y+.5&&b.y+b.h>a.y+.5)throw Error('Browser overlap');}};await checkBoxes();
for(let id=1;id<=5;id++){await page.locator(`[data-node-id="${id}"]`).dblclick({modifiers:['Shift']});await page.waitForTimeout(350);await checkBoxes();await page.locator('.mt-paper').focus();await page.keyboard.press('Escape');await page.waitForTimeout(350);}
await page.locator('[data-node-id="1"]').dblclick({modifiers:['Shift']});await page.waitForTimeout(550);await page.screenshot({path:`.test/screens/${size}-subtree.png`});await page.getByLabel('子树布局',{exact:true}).selectOption('tree');await page.waitForTimeout(400);await checkBoxes();await page.screenshot({path:`.test/screens/${size}-compact-tree.png`});await page.getByLabel('子树布局',{exact:true}).selectOption('radial');await page.waitForTimeout(400);const subtree=await page.locator('[data-node-id]').count();await page.locator('[data-node-id="1"] .mt-fold').click();await page.waitForTimeout(350);if(await page.locator('[data-node-id]').count()!==1)throw Error('Collapse failed');await page.locator('[data-node-id="1"] .mt-fold').click();await page.waitForTimeout(350);if(await page.locator('[data-node-id]').count()!==subtree)throw Error('Expand failed');const transform=()=>page.locator('.mt-paper>g').getAttribute('transform');await page.locator('.mt-paper').focus();await page.keyboard.press('Escape');await page.waitForTimeout(550);if(await page.locator('[data-node-id="0"]').count()!==1)throw Error('History root restore failed');await page.locator('.mt-search').fill('知识笔记 40');await page.locator('.mt-results button').first().click();await page.waitForTimeout(550);if(!await page.locator('[data-node-id="40"]').count())throw Error('Search focus failed');await page.mouse.move(700,500);await page.mouse.wheel(0,120);await page.waitForTimeout(300);const manual=await transform();await page.waitForTimeout(1100);if(await transform()!==manual)throw Error('Viewport fought manual zoom');await page.getByLabel('全局根节点',{exact:true}).click();await page.waitForTimeout(350);await page.getByLabel('显示层级',{exact:true}).selectOption('1');await page.waitForTimeout(350);await page.locator('[data-node-id="1"]').click();await page.getByLabel('进入选中子树',{exact:true}).click();await page.waitForTimeout(350);if(!await page.locator('[data-node-id="6"]').count())throw Error('Subtree relative depth missing child');await page.locator('[data-node-id="6"] .mt-fold').click();await page.waitForTimeout(400);if(!await page.locator('[data-node-id="31"]').count())throw Error('Depth boundary expansion failed');await page.locator('[data-node-id="6"]').dblclick({modifiers:['Shift']});await page.waitForTimeout(350);await page.getByLabel('显示层级',{exact:true}).selectOption('2');await page.waitForTimeout(350);if(!await page.locator('.mt-breadcrumb button').last().textContent().then(t=>t.includes('6')))throw Error('Depth selector exited subtree');if(size>=200&&!await page.locator('[data-node-id="156"]').count())throw Error('Nested subtree missing grandchildren');report.push({initialCentered:true,connectorLayer:true,compactTree:true,recursiveSubtree:true,boundaryExpansion:true,nodes:size,global,subtree,allNodes:true,rootIndexOpen:true,doubleClickOpen:true,enterOpen:true,history:true,allBranchesNonoverlapping:true,collapseExpand:true,search:true,manualStable:true});}await page.setViewportSize({width:390,height:700});await page.waitForTimeout(400);await page.screenshot({path:'.test/screens/mobile.png'});if(errors.length)throw Error(errors.join('\n'));await writeFile('.test/browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));}finally{await browser.close();await new Promise(r=>server.close(r));}
