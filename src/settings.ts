import {App,PluginSettingTab,Setting,TFolder,Notice} from 'obsidian';
import type MindTree from './main';
export class MindTreeSettings extends PluginSettingTab {
 constructor(app:App,private plugin:MindTree){super(app,plugin);}
 display(){const el=this.containerEl;el.empty();const zh=this.plugin.settings.language==='zh',t=(a:string,b:string)=>zh?a:b;
 el.createEl('h2',{text:'MindTree'});el.createEl('p',{text:t('将现有学科文件夹展示为组织导图。介绍索引仅更新自动目录区域，保留手写内容。','Map existing subject folders. Index updates preserve handwritten content outside managed blocks.')});
 new Setting(el).setName(t('语言','Language')).addDropdown(d=>d.addOptions({zh:'简体中文',en:'English'}).setValue(this.plugin.settings.language).onChange(async value=>{try{await this.plugin.save({...this.plugin.settings,language:value as 'zh'|'en'});this.display();}catch(e){new Notice(String(e));}}));
 let name='',folder='';new Setting(el).setName(t('添加学科','Add subject')).setDesc(t('名称与已有文件夹对应，例如计算机科学与技术。','Give an existing subject folder a display name.')).addText(v=>v.setPlaceholder(t('学科名称','Subject name')).onChange(v=>name=v)).addDropdown(d=>{d.addOption('','/');for(const f of this.app.vault.getAllLoadedFiles())if(f instanceof TFolder)d.addOption(f.path,f.path);d.onChange(v=>folder=v);}).addButton(b=>b.setButtonText(t('添加','Add')).onClick(async()=>{try{if(!name.trim())throw Error(t('请输入名称','Name required'));const id=crypto.randomUUID();await this.plugin.save({...this.plugin.settings,active:id,series:[...this.plugin.settings.series,{id,name:name.trim(),folder,repositories:[],root:'',collapsed:[]}]});this.display();}catch(e){new Notice(String(e));}}));
 for(const subject of this.plugin.settings.series)new Setting(el).setName(subject.name).setDesc(subject.folder??t('旧版手动关系','Legacy manual hierarchy')).addButton(b=>b.setButtonText(t('更新索引','Update indexes')).onClick(async()=>{b.setDisabled(true);try{const root=await this.plugin.repository.syncFolder(subject);await this.plugin.save({...this.plugin.settings,series:this.plugin.settings.series.map(s=>s.id===subject.id?{...s,root}:s)});new Notice(t('索引已更新','Indexes updated'));}catch(e){new Notice(String(e));}finally{b.setDisabled(false);}}));
 }
}
