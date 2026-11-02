export class TFile {constructor(public path:string){} get basename(){return this.path.split('/').pop()!.replace(/\.md$/,'');}}
export class TFolder {constructor(public path:string){}}
export const normalizePath=(p:string)=>p.replace(/\\/g,'/');
export const parseYaml=(s:string)=>s.startsWith('mindtree: ')?{mindtree:JSON.parse(s.slice(10))}:JSON.parse(s);
export class Menu {} export class Notice {}
