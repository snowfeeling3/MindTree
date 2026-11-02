export interface Repository {id:string;name:string;folder:string}
export interface Series {id:string;name:string;repositories:string[];root:string;collapsed:string[];folder?:string;routing?:'smart'|'curves';displayDepth?:number;radialStyle?:'circle'|'staggered'|'cluster';layout?:'tree'|'vertical'|'branches';camera?:{x:number;y:number;zoom:number}}
export interface Settings {presentationVersion?:number;language:'zh'|'en';repositories:Repository[];series:Series[];active:string}
export const defaults=():Settings=>({language:'zh',repositories:[],series:[],active:''});
export function normalizeFolder(path:string):string {const parts=path.replace(/\\/g,'/').split('/').filter(Boolean);if(parts.some(p=>p==='.'||p==='..'||p.startsWith('.')))throw Error('Invalid folder / 文件夹无效');return parts.join('/');}
export function inRepositories(path:string,folders:string[]):boolean{return folders.some(folder=>folder===''||path.startsWith(folder+'/'));}

// Reject corrupt settings before migration; never overwrite the original data on failed load.
export function parseSettings(value: unknown): Settings {
 if(value==null)return defaults();
 if(typeof value!=='object'||Array.isArray(value))throw Error('Invalid MindTree settings / 配置损坏');
 const s={...defaults(),...value} as Settings;
 if(!['zh','en'].includes(s.language)||!Array.isArray(s.series)||!Array.isArray(s.repositories)||typeof s.active!=='string')throw Error('Invalid MindTree settings / 配置损坏');
 const ids=new Set<string>();
 for(const item of s.series){
  if(!item||typeof item.id!=='string'||!item.id||ids.has(item.id)||typeof item.name!=='string'||typeof item.root!=='string'||!Array.isArray(item.repositories)||!item.repositories.every(x=>typeof x==='string')||!Array.isArray(item.collapsed)||!item.collapsed.every(x=>typeof x==='string'))throw Error('Invalid MindTree series / 学科配置损坏');
  if(item.folder!==undefined){if(typeof item.folder!=='string')throw Error('Invalid folder');normalizeFolder(item.folder);}
  ids.add(item.id);
 }
 for(const repo of s.repositories)if(!repo||typeof repo.id!=='string'||typeof repo.name!=='string'||typeof repo.folder!=='string')throw Error('Invalid MindTree repository');
 return s;
}
