import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';

export const ROOT = path.resolve(import.meta.dirname, '../..');
export const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const sources = ['src/App.tsx','src/components/FocusTree.tsx','src/components/RightSidebar.tsx','src/components/LeftSidebar.tsx','src/data/storyEvents.ts','src/data/flavorEvents.ts','src/data/characterProfiles.ts','src/engine/campusEvents.ts'];
const string = n => n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : undefined;
const name = n => n.name && (ts.isIdentifier(n.name) || ts.isStringLiteral(n.name)) ? n.name.text : undefined;
const fields = n => Object.fromEntries(n.properties.filter(ts.isPropertyAssignment).map(p => [name(p), p.initializer]));
const routeNames = {PHASE1_NODES:'opening',TREE_A_NODES:'revolution',TREE_A_TRUE_LEFT_NODES:'reform',TREE_A_PAN_NODES:'democracy',TREE_A_PAN_DESPAIR_NODES:'democracy',TREE_A_HAOBANG_NODES:'commune',TREE_A_LU_BOHAN_NODES:'purge',TREE_B_NODES:'yang',JIDI_TREE_NODES:'jidi',GOUXIONG_TREE_NODES:'gouxiong',TREE_WU_NODES:'wu',TREE_WU_P2_FENG_NODES:'wu',TREE_WU_P2_SPRING_NODES:'wu',TREE_WU_P2_COUP_NODES:'wu'};
function choiceSummaries(n) {
  if(!n||!ts.isArrayLiteralExpression(n))return undefined;
  return n.elements.map(e=>{
    if(ts.isArrayLiteralExpression(e))return {label:string(e.elements[0])};
    if(!ts.isObjectLiteralExpression(e))return {unresolved:true};
    const f=fields(e);return {label:string(f.text)||string(f.label),effects:string(f.effectsText)||string(f.description)};
  });
}
function routeOf(id, ancestors) {
  const symbol=ancestors.map(a=>ts.isVariableDeclaration(a)?a.name.getText():null).filter(Boolean).at(-1);
  if (routeNames[symbol]) return routeNames[symbol];
  for(const [pattern,route] of [[/^(jidi|jd)_/,'jidi'],[/^(gx|gouxiong|cyber)_/,'gouxiong'],[/^wu_/,'wu'],[/^(yang|yy)_/,'yang'],[/^(haobang|hb)_/,'commune'],[/^(lu|nkpd)_/,'purge'],[/^(democratic|democracy|election)_/,'democracy'],[/^phase1_/,'opening'],[/^(true_left|reform)_/,'reform']]) if(pattern.test(id)) return route;
  return 'shared';
}
export function catalog(root=ROOT) {
  const groups=new Map();
  const advisorSource=ts.createSourceFile('advisors.ts',fs.readFileSync(path.join(root,'src/data/advisors.ts'),'utf8'),ts.ScriptTarget.Latest,true);
  const advisors=new Map();
  function collectAdvisors(n){if(ts.isObjectLiteralExpression(n)){const f=fields(n);if(f.modifiers&&string(f.id))advisors.set(string(f.id),{name:string(f.name),role:string(f.title),modifiers:f.modifiers.getText(advisorSource)});}ts.forEachChild(n,collectAdvisors);}
  collectAdvisors(advisorSource);
  for (const file of sources) {
    const source=fs.readFileSync(path.join(root,file),'utf8');
    const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
    function visit(node, ancestors=[]) {
      if (ts.isObjectLiteralExpression(node)) {
        const f=fields(node), property=f.description || f.body, before=string(property);
        const propertyParent=ts.isPropertyAssignment(node.parent)?name(node.parent):'';
        const identifier=string(f.id) || (file.endsWith('characterProfiles.ts')?propertyParent:'');
        const advisor=file.endsWith('characterProfiles.ts')?advisors.get(identifier):null;
        const label=advisor?.name||string(f.name)||string(f.title)||identifier;
        let kind='';
        if (property && before && !ancestors.some(a=>ts.isVariableDeclaration(a)&&a.name.getText().startsWith('DEBUG'))) {
          if (file.endsWith('characterProfiles.ts')&&identifier) kind='person';
          else if (f.name&&f.title&&(f.ideology||f.modifiers||propertyParent==='leader')) kind='person';
          else if (identifier&&f.name&&f.type) kind='spirit';
          else if (identifier&&f.title&&(f.isStoryEvent||f.buttonText||f.choices||f.options)) kind=/通报|公报|通告|通知|扩编令|告示|公开表态/.test(label)?'news':'event';
        }
        if (kind && identifier !== 'heyi_light' && label !== '空缺') {
          const parentObjects=ancestors.filter(ts.isObjectLiteralExpression).map(fields).filter(p=>p.days&&p.id);
          const focus=parentObjects.at(-1);
          const route=routeOf(identifier||string(f.portrait)||'',ancestors);
          const identity=identifier||[label,string(f.title),string(f.portrait)].join('/');
          const key=[kind,identity,before].join('\n');
          const locator={file,start:property.getStart(ast),end:property.getEnd(),before,line:ast.getLineAndCharacterOfPosition(property.getStart(ast)).line+1};
          const existing=groups.get(key);
          if (existing) { existing.locations.push(locator); if (existing.route==='shared'&&route!=='shared') existing.route=route; }
          else groups.set(key,{key:digest(key).slice(0,16),id:identity,label,kind,route,before,role:advisor?.role||string(f.title),portrait:string(f.portrait),effects:advisor?.modifiers||f.effects?.getText(ast),lockedUI:{button:string(f.buttonText),effects:f.effectsText?.getText(ast),choices:choiceSummaries(f.choices||f.options)},guards:ancestors.filter(ts.isIfStatement).map(a=>{const child=ancestors[ancestors.indexOf(a)+1]||node;const expression=a.expression.getText(ast).slice(0,300);return a.elseStatement===child?'!('+expression+')':expression;}),trigger:focus?{id:string(focus.id),title:string(focus.title),description:string(focus.description),requires:focus.requires?.getText(ast),effects:focus.effectsText?.getText(ast)}:null,context:node.getText(ast).slice(0,8500),locations:[locator]});
        }
      }
      ts.forEachChild(node,child=>visit(child,[...ancestors,node]));
    }
    visit(ast);
  }
  return [...groups.values()];
}
export function plainChars(text) { return text.replace(/\s/g,'').length; }

/** Validate the entire batch before touching a source file. */
export function planEdits(items, root=ROOT) {
  const files=new Map();
  for (const item of items) {
    if (item.status!=='approved'||typeof item.after!=='string'||!item.after.trim()) throw new Error('Only approved, nonempty drafts can be applied.');
    for (const location of item.locations) {
      const target=path.resolve(root,location.file);
      if (!target.startsWith(path.resolve(root)+path.sep)||!sources.includes(location.file)) throw new Error('Source path is outside the text allowlist.');
      if (!files.has(target)) files.set(target,{before:fs.readFileSync(target,'utf8'),edits:[]});
      const record=files.get(target),literal=record.before.slice(location.start,location.end);
      const parsed=ts.createSourceFile('literal.ts',`const text=${literal};`,ts.ScriptTarget.Latest,true);
      const value=parsed.statements[0]?.declarationList?.declarations[0]?.initializer;
      if (string(value)!==location.before) throw new Error(`Stale source: ${location.file}:${location.line}. Rebuild the catalog.`);
      record.edits.push({...location,replacement:JSON.stringify(item.after),key:item.key});
    }
  }
  const result=[];
  for (const [file,record] of files) {
    const edits=record.edits.sort((a,b)=>b.start-a.start);
    for(let i=1;i<edits.length;i++) if(edits[i-1].start<edits[i].end) throw new Error('Overlapping edits.');
    let after=record.before;
    for (const edit of edits) after=after.slice(0,edit.start)+edit.replacement+after.slice(edit.end);
    result.push({file:path.relative(root,file).replaceAll(path.sep,'/'),before:record.before,after,beforeHash:digest(record.before),afterHash:digest(after),edits});
  }
  return result;
}
/** Ignores only prose literal tokens; everything executable must remain identical. */
export function mechanicsFingerprint(source) {
  const ast=ts.createSourceFile('source.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const edits=[];
  function visit(n) {
    if(ts.isPropertyAssignment(n)&&['description','body'].includes(name(n))&&string(n.initializer)!==undefined) edits.push({start:n.initializer.getStart(ast),end:n.initializer.getEnd()});
    ts.forEachChild(n,visit);
  }
  visit(ast);
  let normalized=source;
  for(const e of edits.sort((a,b)=>b.start-a.start)) normalized=normalized.slice(0,e.start)+'"<TEXT>"'+normalized.slice(e.end);
  return digest(normalized);
}
