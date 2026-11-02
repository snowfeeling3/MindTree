import {MindTreeSettings} from './settings';
import {Plugin,ItemView,WorkspaceLeaf,Notice} from 'obsidian';
import {createRoot,Root} from 'react-dom/client';
import {Shell} from './ui/Shell';
import {Repository} from './adapters/repository';
import {Settings,defaults,parseSettings} from './core/collections';
const TYPE='mindtree-view';
class MindTreeView extends ItemView {
 private root?:Root;
 constructor(leaf:WorkspaceLeaf,private plugin:MindTree){super(leaf);}
 getViewType(){return TYPE;} getDisplayText(){return 'MindTree';} getIcon(){return 'git-fork';}
 async onOpen(){this.root=createRoot(this.contentEl);this.root.render(<Shell app={this.app} repository={this.plugin.repository} settings={this.plugin.settings} save={this.plugin.save} subscribe={this.plugin.subscribe} getSettings={()=>this.plugin.settings} openSettings={()=>this.plugin.openSettings()}/>);}
 async onClose(){this.root?.unmount();}
}
export default class MindTree extends Plugin {
 settings:Settings=defaults();repository!:Repository;private listeners=new Set<()=>void>();private timer:number|undefined;
 subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn);};};
 save=async(settings:Settings)=>{await this.saveData(settings);this.settings=settings;this.listeners.forEach(fn=>fn());};
 async onload(){let saved:unknown;try{saved=await this.loadData();this.settings=parseSettings(saved);}catch(error){new Notice("MindTree settings could not be loaded. Back up data.json before repair / 配置无法加载，请先备份 data.json");throw error;}if((saved as Settings | null)?.presentationVersion!==1){this.settings={...this.settings,presentationVersion:1,series:this.settings.series.map(s=>({...s,radialStyle:'cluster'}))};try{await this.saveData(this.settings);}catch(error){console.error('MindTree settings migration',error);new Notice('Unable to save presentation settings / 无法保存显示设置');}}this.repository=new Repository(this.app,()=>this.settings);
 this.addSettingTab(new MindTreeSettings(this.app,this));
 this.registerView(TYPE,leaf=>new MindTreeView(leaf,this));
 const open=()=>{void this.open().catch(e=>{console.error(e);new Notice('Unable to open MindTree / 无法打开 MindTree');});};
 this.addRibbonIcon('git-fork','MindTree',open);this.addCommand({id:'open',name:'Open MindTree / 打开 MindTree',callback:open});
 const update=()=>{window.clearTimeout(this.timer);this.timer=window.setTimeout(()=>{this.listeners.forEach(fn=>fn());},120);};
 this.registerEvent(this.app.metadataCache.on('changed',update));this.registerEvent(this.app.metadataCache.on('resolved',update));
 this.registerEvent(this.app.vault.on('create',update));this.registerEvent(this.app.vault.on('modify',update));this.registerEvent(this.app.vault.on('rename',update));this.registerEvent(this.app.vault.on('delete',update));
 this.app.workspace.onLayoutReady(update);
 }
 onunload(){window.clearTimeout(this.timer);this.listeners.clear();}
 openSettings(){const setting=(this.app as unknown as {setting:{open:()=>void;openTabById:(id:string)=>void}}).setting;setting.open();setting.openTabById(this.manifest.id);}
 private async open(){const leaf=this.app.workspace.getLeavesOfType(TYPE)[0]??this.app.workspace.getLeaf('tab');await leaf.setViewState({type:TYPE,active:true});await this.app.workspace.revealLeaf(leaf);}
}
