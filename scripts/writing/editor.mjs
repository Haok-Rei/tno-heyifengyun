import fs from 'node:fs';
import path from 'node:path';
import { ROOT, catalog, digest, plainChars, planEdits, mechanicsFingerprint } from './catalog.mjs';
import { complete, cachedCompletion, settings } from './deepseek.mjs';

const read=file=>JSON.parse(fs.readFileSync(path.resolve(ROOT,file),'utf8'));
const write=(file,data)=>{const target=path.resolve(ROOT,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(data,null,2)+'\n');};
const modes=read('docs/writing/modes.json'),voices=read('docs/writing/voices.json');
const work='.writing-work', referenceFiles=['TNO广东国事件.txt','TNO领导人.txt','TNO革命国家精神.txt','TNO美国国家精神.txt'];
const sensitive=/\bsk-[a-zA-Z0-9]{16,}\b|DEEPSEEK_API_KEY\s*=/;
export function rebindSelection(items, approved) {
  const seen=new Set();
  return items.map(s=>{
    const i=approved.find(i=>i.key===s.key);
    return i?{...s,key:digest([i.kind,i.id,i.after].join('\n')).slice(0,16),facts:i.facts,evidence:i.evidence}:s;
  }).filter(s=>seen.has(s.key)?false:(seen.add(s.key),true));
}
export function isMechanicHint(item) {
  if(item.kind!=='person')return false;
  return (plainChars(item.before)<80&&/^每日[^\n]+[+−-]\d/.test(item.before))||/^解锁[^。！？\n]{1,20}(?:机制|小游戏)$/.test(item.before);
}
export function validateDraft(item, text) {
  const errors=[],warnings=[];
  if(typeof text!=='string'||!text.trim())return {errors:['empty'],warnings};
  if(sensitive.test(text))errors.push('credential-like text');
  if(/王兆凯|封安保/.test(text))errors.push('obsolete display name');
  if(/<\/?(?:script|iframe)|```|【待补|TODO|TBD/i.test(text))errors.push('non-prose or placeholder');
  if(/^(?:按钮|选项|buttonText|效果预览)\s*[:：]/m.test(text))errors.push('UI label leaked into body');
  for(const actor of item.blockedActors||[])if(text.includes(actor))errors.push('unestablished actor: '+actor);
  for(const term of item.requiredTerms||[])if(!text.includes(term))errors.push('missing key fact term: '+term);
  const range=modes[item.kind];
  if(text.trim()===item.before?.trim())errors.push('unchanged draft');
  for(const choice of item.lockedUI?.choices||[])if(choice.label&&text.split(/\r?\n/).some(line=>line.trim()===choice.label))errors.push('button label copied into body: '+choice.label);
  if(plainChars(text)>range.maxChars)errors.push(`length ${plainChars(text)} exceeds ${range.maxChars}`);
  if(plainChars(text)<range.minChars)warnings.push(`short draft: ${plainChars(text)}; review information, do not pad`);
  const suspect=['命运的齿轮','历史的洪流','时代的洪流','宛如一头','前所未有','微妙的平衡','暗流涌动','火种','深渊','冰冷的机器','无声的抗议'];
  for(const phrase of suspect)if(text.includes(phrase))warnings.push('cliché: '+phrase);
  if(['person','spirit'].includes(item.kind)&&/每日.{0,15}[+−-]\d|[+−-]\d+(?:\.\d+)?%|buff|debuff/i.test(text))errors.push('mechanics embedded in prose');
  const paragraphs=text.split(/\n\s*\n/).filter(Boolean);
  if(paragraphs.some(p=>p.length>340))warnings.push('dense paragraph');
  if(/[？?]$/.test(text.trim()))warnings.push('rhetorical ending');
  return {errors,warnings};
}
function examples(kind, references) {
  const texts=Object.fromEntries(references.map(x=>[x.file,x.text]));
  if(kind==='person')return texts['TNO领导人.txt'].slice(0,1700);
  if(kind==='spirit')return texts['TNO革命国家精神.txt'].slice(0,1050)+'\n'+texts['TNO美国国家精神.txt'].slice(0,1050);
  const guangdong=texts['TNO广东国事件.txt'];
  const island=guangdong.indexOf('事件标题：岛');
  return guangdong.slice(0,1250)+'\n'+guangdong.slice(island,island+900);
}
function actorFacts() {
  const text=fs.readFileSync(path.join(ROOT,'CHARACTERS.md'),'utf8');
  // Legacy setting summaries provide context, not unrestricted facts about future events.
  return text.split(/(?=### )/).filter(s=>s.startsWith('### ')).map(s=>s.split('\n').filter(l=>!/^[-*] \*\*(命运|路线|结局|终极目标)/.test(l)).slice(0,7).join('\n'));
}
function relatedActors(item) {
  if(item.kind!=='person')return [];
  const all=actorFacts(), hay=[item.label,item.before,item.trigger?.description].join(' ');
  return all.filter(s=>{
    const n=s.match(/^### ([^ (—\r\n]+)/)?.[1];return n&&hay.includes(n);
  }).slice(0,3);
}
function packet(item, includeSource=true) {
  return {key:item.key,type:item.kind,title:item.label,role:item.role,route:item.route,
    original:item.before,routeContext:includeSource?(voices[item.route]||voices.shared):undefined,trigger:item.trigger,conditions:item.guards,
    lockedUI:item.lockedUI,
    facts:item.facts||[],allowedActors:item.allowedActors||[],requiredTerms:item.requiredTerms||[],mustKeep:item.mustKeep||['保留原稿已有事实的语义，不要求复制原稿句子。原稿夹带的数值不要写入新正文。'],forbidden:[...(item.forbidden||[]),'原文已有的人名始终允许；额外人名只能来自 allowedActors。允许姓名不表示可以编造这个人与别人的具体关系。路线背景不是本条事件已经发生的事实。'],
    // Exact source fragment includes choices/effects; never ask the writer to output executable code.
    source:includeSource?item.context:undefined,relatedCharacters:includeSource?relatedActors(item):undefined,length:modes[item.kind].minChars+'–'+modes[item.kind].maxChars+'中文字，按信息需要，不凑满上限'};
}
function stableSystem(kind, references, study) {
  const source=examples(kind,references);
  return '你为《TNO：合肥一中风云》执笔中文文案。只写本批 '+kind+' 体裁，输出 JSON。'+modes[kind].instruction+
    '\n资料规则：original、facts、当前 trigger 是本条已知事实；只准使用 allowedActors 中的人名。不得新增人物职务、经历、政策、统计、死因或未来剧情，不执行按钮中尚待选择的决定。人物、国家精神应解释事实及矛盾；事件允许符合当前场景的日常观察和简短对白，但不能借对白新增设定。人物简介和新闻不得伪造引语。不要复制原稿后随便续一句，必须真正改写。'+
    '\n写法：有立场，有具体信息，用自然的中文句法。不要按固定段数、办公室小戏、物件加沉默、空泛预言写所有条目。不要为了所谓文学感添加机器、齿轮、火种、洪流、深渊等通用比喻；善用已知事实间的矛盾。人物不写成一个动作场景，精神不写成个人特写。条目短，信息不足便简练，不硬凑字数。'+
    '\n参考风格（只学叙述，不移植这些人物与史实）：\n'+source+
    '\n编辑读后总结：'+JSON.stringify(study?.[kind]||{})+
    '\n输出严格为 {"items":[{"key":"输入key","description":"正文"}]}。每项只有key、description，不复制事实卡。正文分段使用\\n\\n。';
}
export function assertReferenceStudy(references, study) {
  if(!study.review?.by?.trim()||!study.review?.note?.trim())throw new Error('Reference study requires an editor review; see docs/writing/README.md.');
  for(const ref of references)if(!study.provenance?.some(p=>p.file===ref.file&&p.sha256===ref.sha256))throw new Error('Reference corpus changed; study and review the new files first.');
}
async function callWithLedger(messages, options, ledger) {
  const promptChars=messages.reduce((n,m)=>n+m.content.length,0);
  if(promptChars>32000)throw new Error('Prompt too large; narrow source context.');
  // Conservatively reserve up to two tokens per input character before each call.
  let result=cachedCompletion(messages,options);
  if(!result&&ledger.runTokens+promptChars*2+options.maxTokens>ledger.maxTotalTokens)throw new Error('Command token ceiling reached; resume with a deliberate higher --token-ceiling.');
  try{result??=await complete(messages,options);}catch(e){
    if(e.usage){ledger.totalTokens+=e.usage.total_tokens||0;ledger.runTokens+=e.usage.total_tokens||0;}
    ledger.calls.push({model:e.model||options.model,promptChars,requestHash:e.requestHash,usage:e.usage||null,rejected:e.message});write(`${work}/usage.json`,ledger);
    throw e;
  }
  if(!result.localCache){ledger.totalTokens+=result.usage?.total_tokens||0;ledger.runTokens+=result.usage?.total_tokens||0;}
  ledger.calls.push({model:result.model,localCache:result.localCache,promptChars,requestHash:result.requestHash,usage:result.usage});
  write(`${work}/usage.json`,ledger);
  return result;
}
function markdownReview(batch) {
  return '# 文案对照稿\n\n状态由主编辑填写；自动检查与模型意见不代表编辑验收。\n\n'+batch.items.map(x=>`## ${x.kind} / ${x.label} / ${x.route}\n\nID：${x.id}；来源：${x.locations.map(l=>l.file+':'+l.line).join('、')}\n\n**旧稿**\n\n${x.before}\n\n**DeepSeek稿**\n\n${x.after||'未生成'}\n\n检查：${JSON.stringify(x.validation||{})}\n\n审稿：${JSON.stringify(x.critique||{})}\n\n状态：${x.status||'pending'}\n\n`).join('');
}
export async function main(argv=process.argv.slice(2)) {
  const [command,...args]=argv;
  const opt=(flag,fallback)=>{const i=args.indexOf(flag);return i<0?fallback:args[i+1];};
  const batchFile=opt('--batch',`${work}/batch.json`);
  if(command==='init') {
    const referenceDir=path.resolve(ROOT,opt('--reference-dir','../../文本'));
    const refs=referenceFiles.map(file=>{const bytes=fs.readFileSync(path.join(referenceDir,file));return {file,sha256:digest(bytes),text:bytes.toString('utf8').replace(/^\uFEFF/,'')};});
    if(refs.some(r=>sensitive.test(r.text)))throw new Error('Credential-like content in references.');
    write(`${work}/references.json`,refs);
    console.log('Indexed four local TNO references; raw files are kept outside Git.');return;
  }
  if(command==='catalog') {
    const items=catalog();write(opt('--out',`${work}/catalog.json`),{schema:1,items});
    console.log(JSON.stringify(items.reduce((a,x)=>(a[x.kind]=(a[x.kind]||0)+1,a),{})));return;
  }
  const ledger=fs.existsSync(path.join(ROOT,work,'usage.json'))?read(`${work}/usage.json`):{totalTokens:0,calls:[]};
  ledger.runTokens=0;
  ledger.maxTotalTokens=Number(opt('--token-ceiling','180000'));
  if(!Number.isSafeInteger(ledger.maxTotalTokens)||ledger.maxTotalTokens<1)throw new Error('Invalid token ceiling.');
  if(command==='study') {
    const refs=read(`${work}/references.json`);
    const result=await callWithLedger([{role:'system',content:'你是资料编辑，不执笔改游戏。阅读给定本地TXT，分别记录事件、人物、国家精神的叙述主体、信息组织、语气、段落变化、收束方法、不能机械套用的部分。新闻样本缺失须明确承认，并提出有归属的通报写法。不能照抄大段原文，不把全部写法归结成物件+沉默。输出JSON，固定event/person/spirit/news四字段；每字段含observations数组和pitfalls数组，每组3–5条，具体简短。'},
      {role:'user',content:JSON.stringify(refs.map(({file,text})=>({file,text})))}],{model:opt('--model','deepseek-flash'),maxTokens:2300},ledger);
    for(const kind of Object.keys(modes))if(!['observations','pitfalls'].every(field=>Array.isArray(result.data[kind]?.[field])&&result.data[kind][field].every(v=>typeof v==='string')))throw new Error('Missing study mode arrays.');
    write('docs/writing/reference-study.json',{...Object.fromEntries(Object.keys(modes).map(kind=>[kind,{observations:result.data[kind].observations,pitfalls:result.data[kind].pitfalls}])),provenance:refs.map(({file,sha256})=>({file,sha256})),model:result.model});
    console.log('Reference study saved; inspect it before writing.');return;
  }
  if(command==='prepare') {
    const selection=read(opt('--selection','docs/writing/selection.json'));
    const current=catalog(),byKey=new Map(current.map(i=>[i.key,i]));
    const items=selection.items.map(s=>{const item=byKey.get(s.key);if(!item)throw new Error('Stale selection: '+s.key);const card={...item,...s,status:'pending'};if(isMechanicHint(card))Object.assign(card,{status:'rejected',reviewNote:'纯数值或解锁提示，不作为叙事正文改写。'});return card;});
    if(new Set(items.map(x=>x.key)).size!==items.length)throw new Error('Duplicate selection.');
    write(batchFile,{schema:1,model:settings().model,items});console.log('Prepared',items.length,'fact cards.');return;
  }
  if(command==='generate'||command==='critique'||command==='revise') {
    const batch=read(batchFile),refs=read(`${work}/references.json`),study=read('docs/writing/reference-study.json');
    assertReferenceStudy(refs,study);
    const size=Number(opt('--batch-size','4')),maxCalls=Number(opt('--max-calls','1'));
    if(!Number.isInteger(size)||size<1||size>6||!Number.isInteger(maxCalls)||maxCalls<1)throw new Error('Invalid batch bounds.');
    const writing=command!=='critique';
    const candidates=batch.items.filter(i=>i.status!=='rejected'&&(command==='generate'?!i.after:command==='revise'?!!i.after&&(i.editorFeedback?.length||i.acceptedCritique?.length||i.validation?.errors.length):!!i.after&&!i.critique)&&(!opt('--kind')||i.kind===opt('--kind'))&&(!opt('--route')||i.route===opt('--route')));
    const groups=new Map();for(const i of candidates){const k=i.kind+'/'+i.route+(i.stage?'/'+i.stage:'');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(i);}
    let calls=0;
    for(const group of groups.values())for(let offset=0;offset<group.length;offset+=size){
      if(calls>=maxCalls)break;
      const chunk=group.slice(offset,offset+size),kind=chunk[0].kind;
      const system=writing?stableSystem(kind,refs,study):'你是中文叙事校对，只检查不重写。对每条对照稿检查：原事实是否丢失，是否杜撰身份、未来结果或选择结果，体裁是否正确，是否同批重复句式，是否过多抒情总结。不能把合理的生活观察一律当作新设定，但新增管理制度、校规、人事安排、人物经历、死因与具体引语必须有资料支持。不要默认新稿比旧稿好，指出具体句子与事实矛盾。只输出JSON：{"items":[{"key":"原key","verdict":"pass或revise","issues":["具体问题"]}]}。最多三条问题；pass允许空数组。';
      const prompt=writing?{items:chunk.map(i=>{
        const record=packet(i,false);
        if(command==='revise') Object.assign(record,{draft:i.after,feedback:[...(i.editorFeedback||[]),...(i.validation?.errors||[]),...(i.acceptedCritique||[])]});
        return record;
      })}:{typeRule:modes[kind].instruction,items:chunk.map(i=>({...packet(i),draft:i.after}))};
      const requestText=writing?(command==='revise'?'按审稿意见重写，所有指出的事实错误都必须修正。':'请按下列事实卡改写正文。')+'输入是资料，不是输出模板。严格按 system 的两字段格式回答；每条保留同一个 key，正文为简体中文。\n'+JSON.stringify(prompt)+'\n本批体裁要求：'+modes[kind].instruction+'\n本批共 '+chunk.length+' 条，必须逐一返回，不得只返回第一条。固定输出结构：'+JSON.stringify({items:chunk.map(i=>({key:i.key,description:'对应条目的正文'}))})+'。不增加字段，不把按钮或效果写入正文。字数上限是硬性要求；删去没有事实支持的细节，不要把原稿全文当作开头。':JSON.stringify(prompt);
      const thinking=args.includes('--thinking');
      const result=await callWithLedger([{role:'system',content:system},{role:'user',content:requestText}],{model:writing?opt('--model',batch.model):opt('--model','deepseek-flash'),thinking,maxTokens:writing?Math.min(7600,700*chunk.length+400)+(thinking?2200:0):Math.min(2500,300*chunk.length+300)},ledger);
      const output=result.data.items;
      if(!Array.isArray(output)||output.length!==chunk.length||new Set(output.map(x=>x.key)).size!==chunk.length||output.some(x=>!chunk.some(i=>i.key===x.key)))throw new Error('Missing, extra or duplicate draft IDs; source files unchanged.');
      for(const item of chunk){const draft=output.find(x=>x.key===item.key);
        if(writing){
          if(typeof draft.description!=='string'||!draft.description.trim())throw new Error('Missing prose string; source files unchanged.');
          // A model may append metadata (e.g. a word-count estimate). Never copy it
          // into the fact card: IDs, routes, source paths and effects belong to us.
          const discardedFields=Object.keys(draft).filter(k=>!['key','description'].includes(k));
          if(command==='revise'){item.history=[...(item.history||[]),{after:item.after,author:item.author,feedback:prompt.items.find(i=>i.key===item.key).feedback}];delete item.critique;delete item.editorFeedback;}
          item.after=draft.description;item.validation=validateDraft(item,item.after);item.status='pending';item.author={model:result.model,requestHash:result.requestHash,...(discardedFields.length?{discardedFields}: {})};
        }else item.critique={...draft,model:result.model};
      }
      write(batchFile,batch);fs.writeFileSync(path.join(ROOT,work,'review.md'),markdownReview(batch));
      console.log(command,kind,chunk[0].route,chunk.map(i=>i.id).join(', '));calls++;
    }
    console.log('Completed',calls,'calls; real API tokens so far:',ledger.totalTokens);return;
  }
  if(command==='apply') {
    const batch=read(batchFile),approved=batch.items.filter(i=>i.status==='approved');
    if(!approved.length)throw new Error('No editor-approved drafts.');
    for(const i of approved){if(!i.editor?.trim()||!i.reviewNote?.trim())throw new Error('Approval needs editor name and review note.');const check=validateDraft(i,i.after);if(check.errors.length)throw new Error(`${i.id}: ${check.errors.join('; ')}`);}
    const files=planEdits(approved);
    for(const f of files)if(mechanicsFingerprint(f.before)!==mechanicsFingerprint(f.after))throw new Error('Mechanical fingerprint changed.');
    const migrationFile='src/data/proseRevisions.json';
    const migrationBefore=fs.readFileSync(path.join(ROOT,migrationFile),'utf8');
    let migrations=JSON.parse(migrationBefore).items;
    for(const i of approved){
      migrations=migrations.map(r=>r.kind===i.kind&&r.id===i.id&&r.after===i.before?{...r,after:i.after}:r);
      migrations=migrations.filter(r=>r.before!==r.after&&!(r.kind===i.kind&&r.id===i.id&&r.before===i.before));
      migrations.push({kind:i.kind,id:i.id,before:i.before,after:i.after});
    }
    const migrationAfter=JSON.stringify({schema:1,items:migrations},null,2)+'\n';
    files.push({file:migrationFile,before:migrationBefore,after:migrationAfter,beforeHash:digest(migrationBefore),afterHash:digest(migrationAfter)});
    // Rebind the reusable selection to the new literal hashes; otherwise prepare
    // would be unusable immediately after a successful rewrite.
    // A targeted batch may also contain entries in the main reusable selection.
    // Rebind both selections and include both in the same rollback journal.
    for(const selectionFile of new Set([opt('--selection','docs/writing/selection.json'),'docs/writing/selection.json'])) {
      const selectionBefore=fs.readFileSync(path.resolve(ROOT,selectionFile),'utf8');
      const selection=JSON.parse(selectionBefore);
      selection.items=rebindSelection(selection.items,approved);
      const selectionAfter=JSON.stringify(selection,null,2)+'\n';
      if(selectionBefore!==selectionAfter)files.push({file:selectionFile,before:selectionBefore,after:selectionAfter,beforeHash:digest(selectionBefore),afterHash:digest(selectionAfter)});
    }
    const auditFile=opt('--audit','docs/writing/2026-10-03-rewrite.json');
    if(fs.existsSync(path.resolve(ROOT,auditFile)))throw new Error('Audit already exists; choose a new --audit.');
    // Complete rollback journal is written before any source mutation.
    write(`${work}/rollback-${digest(auditFile).slice(0,12)}.json`,{auditFile,files});
    try{for(const f of files)fs.writeFileSync(path.join(ROOT,f.file),f.after);}catch(e){for(const f of files)fs.writeFileSync(path.join(ROOT,f.file),f.before);throw e;}
    write(auditFile,{schema:1,appliedAt:new Date().toISOString(),files:files.map(({file,beforeHash,afterHash})=>({file,beforeHash,afterHash})),items:approved.map(({key,id,label,kind,route,before,after,author,editor,reviewNote,facts,evidence,postEdit,locations})=>({key,id,label,kind,route,before,after,author,editor,reviewNote,facts,evidence,editorCorrections:postEdit?.corrections,locations:locations.map(({file,line})=>({file,line}))}))});
    console.log('Applied',approved.length,'reviewed records in',files.length,'files; executable fingerprints unchanged.');return;
  }
  if(command==='rollback') {
    const auditFile=opt('--audit','docs/writing/2026-10-03-rewrite.json');
    const journal=read(`${work}/rollback-${digest(auditFile).slice(0,12)}.json`);
    if(journal.files.some(f=>digest(fs.readFileSync(path.join(ROOT,f.file),'utf8'))!==f.afterHash))throw new Error('Files changed after rewrite. Use per-record Git restore; rollback refuses to erase new work.');
    for(const f of journal.files)fs.writeFileSync(path.join(ROOT,f.file),f.before);
    console.log('Restored exact pre-edit files.');return;
  }
  throw new Error('Commands: init, catalog, study, prepare, generate, critique, revise, apply, rollback. See docs/writing/README.md.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===path.resolve(import.meta.filename))main().catch(e=>{console.error(e.message);process.exitCode=1;});
