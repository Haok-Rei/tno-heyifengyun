import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, digest } from './catalog.mjs';
import { parseModelJSON } from './json-output.mjs';

export function settings() {
  const file=path.join(ROOT,'.env.deepseek.local');
  const values=fs.existsSync(file)?Object.fromEntries(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'').split(/\r?\n/).filter(l=>l.includes('=')&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)];})):{};
  return {model:process.env.DEEPSEEK_MODEL||values.DEEPSEEK_MODEL||'deepseek-v4-pro',configFile:file};
}
function transport(payload, configFile) {
  return new Promise((resolve,reject)=>{
    const child=spawn(process.env.PYTHON||'python',[path.join(ROOT,'scripts/writing/deepseek_transport.py'),configFile],{stdio:['pipe','pipe','pipe'],windowsHide:true});
    let out='';
    child.stdout.on('data',data=>{out+=data;if(out.length>3000000){child.kill();reject(new Error('Response too large.'));}});
    child.stderr.on('data',()=>{});
    const timeout=setTimeout(()=>{child.kill();reject(new Error('DeepSeek request timed out; source files unchanged.'));},160000);
    child.on('error',()=>{clearTimeout(timeout);reject(new Error('Python transport unavailable.'));});
    child.on('close',()=>{clearTimeout(timeout);try{resolve(JSON.parse(out));}catch{reject(new Error('Invalid API transport response.'));}});
    child.stdin.end(JSON.stringify(payload));
  });
}
/** Hash-based response cache; repeated identical runs incur no new call. */
function requestFor(messages,{model,maxTokens=4096,thinking=false}={}) {
  return {model:model||settings().model,messages,thinking:{type:thinking?'enabled':'disabled'},...(thinking?{reasoning_effort:'low'}:{}),response_format:{type:'json_object'},max_tokens:maxTokens};
}
export function cachedCompletion(messages,options={}) {
  const key=digest(JSON.stringify(requestFor(messages,options)));
  const file=path.join(options.cacheDir||path.join(ROOT,'.writing-cache'),key+'.json');
  return fs.existsSync(file)?{...JSON.parse(fs.readFileSync(file,'utf8')),localCache:true}:null;
}
export async function complete(messages,{model,maxTokens=4096,thinking=false,cacheDir=path.join(ROOT,'.writing-cache')}={}) {
  const config=settings(),request=requestFor(messages,{model,maxTokens,thinking});
  const key=digest(JSON.stringify(request)),file=path.join(cacheDir,key+'.json');
  if(fs.existsSync(file))return {...JSON.parse(fs.readFileSync(file,'utf8')),localCache:true};
  let response=await transport(request,config.configFile);
  // A single retry for transient server throttling only, never auth or account balance.
  if(response.error&&[429,502,503].includes(response.status)) response=await transport(request,config.configFile);
  if(response.error)throw new Error(`DeepSeek ${response.error}${response.status?' HTTP '+response.status:''}. No text applied.`);
  function invalid(message){
    const error=Object.assign(new Error(message),{usage:response.usage,model:response.model,requestHash:key});
    fs.mkdirSync(cacheDir,{recursive:true});
    fs.writeFileSync(path.join(cacheDir,'rejected-'+key+'.json'),JSON.stringify({error:message,usage:response.usage,model:response.model,requestHash:key,generatedAt:new Date().toISOString(),content:response.choices?.[0]?.message?.content||''})+'\n');
    throw error;
  }
  const choice=response.choices?.[0];
  if(choice?.finish_reason!=='stop'||!choice.message?.content)invalid('Empty or truncated completion. Lower batch size; source files unchanged.');
  let parsed;try{parsed=parseModelJSON(choice.message.content);}catch{invalid('Invalid JSON completion; source files unchanged.');}
  const result={...parsed,usage:response.usage,model:response.model,requestHash:key,generatedAt:new Date().toISOString()};
  fs.mkdirSync(cacheDir,{recursive:true});fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');
  return {...result,localCache:false};
}
