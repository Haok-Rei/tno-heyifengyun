/** Preserve the whole shared multimodal prefix; per-batch instructions go last. */
export function campusMessages(common,task,study){
 return [...structuredClone(common),...(study?[{role:'assistant',content:JSON.stringify(study)}]:[]),{role:'user',content:task}];
}
