export const START='<!-- mindtree:directory:start -->',END='<!-- mindtree:directory:end -->';
export const parentFolder=(p:string)=>p.includes('/')?p.slice(0,p.lastIndexOf('/')):'';
export const within=(p:string,f:string)=>!f||p===f||p.startsWith(f+'/');
export const directoryBlock=(paths:string[])=>START+'\n'+paths.map(p=>'- [['+p.replace(/\.md$/i,'')+']]').join('\n')+'\n'+END;
export function updateDirectory(text:string,block:string):string {if(text.split(START).length!==2||text.split(END).length!==2||text.indexOf(END)<text.indexOf(START))throw Error('Index markers changed / 索引标记改变');return text.slice(0,text.indexOf(START))+block+text.slice(text.indexOf(END)+END.length);}
