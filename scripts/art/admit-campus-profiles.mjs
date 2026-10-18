import fs from 'node:fs';
import assert from 'node:assert/strict';
const folder='.writing-work/campus-study';
const routes=['opening','uprising','democracy','revolution','reform','haobang','yang','jidi','jidi_riot','wu','gouxiong','despair'];
const oneOf=(value,choices)=>assert(choices.includes(value),`Invalid profile enum ${value}`);
export function validateCampusProfiles(profiles){
 assert.equal(profiles.length,36);assert.equal(new Set(profiles.map(p=>p.id)).size,36);
 for(const route of routes)for(let chapter=0;chapter<3;chapter++){
  const p=profiles.find(p=>p.route===route&&p.chapter===chapter);assert(p,`${route}-${chapter}`);
  assert.equal(p.id,`${route}-${chapter}`);assert.match(p.accent,/^#[0-9a-f]{6}$/i);
  const b=p.body;oneOf(b.floors,[2,3,4]);
  for(const [key,min,max] of [['leftBays',5,9],['rightBays',4,7],['height',260,360],['leftReach',550,640],['rightReach',350,440]])assert(Number.isFinite(b[key])&&b[key]>=min&&b[key]<=max,key);
  oneOf(b.roof,['parapet','gable','sawtooth','cornice','terrace']);oneOf(b.windows,['cross','tall','arch','ribbon','shutter']);oneOf(b.skin,['brick','stone','render','metal']);oneOf(b.entrance,['glass','arch','portico','shutter','boarded']);
  for(const k of ['arcade','balcony','clock'])assert.equal(typeof b[k],'boolean');
  oneOf(p.gate.kind,['school','pavilion','industrial','colonnade','checkpoint','breached','sealed']);oneOf(p.gate.columns,['square','brick','stone','steel']);oneOf(p.gate.canopy,['flat','pitched','beam','none']);assert.equal(typeof p.gate.open,'boolean');
  oneOf(p.guard.kind,['office','arcaded','kiosk','checkpoint','ruined']);oneOf(p.guard.windows,['cross','arch','shutter']);
  oneOf(p.landmark,['reading-arcade','printing-hall','dispatch-dock','screened-checkpoint','public-forum','sealed-wing','performance-stage','original']);assert(p.lightDensity>=0&&p.lightDensity<=.4);assert(p.details.length>=4);
 }
}
if(process.argv[1]?.endsWith('admit-campus-profiles.mjs')){
 const batches=['a','b','c','d'].map(name=>JSON.parse(fs.readFileSync(`${folder}/${name}.json`,'utf8')));
 const profiles=structuredClone(batches.flatMap(b=>b.data.profiles));
 // Explicit editorial corrections: visual structure must not invent a different story.
 for(const p of profiles){
  if(p.body.windows==='boarded'&&p.route==='jidi_riot')p.body.windows='shutter';
  if(p.route==='opening')Object.assign(p.body,{floors:4,height:360,leftReach:640,rightReach:440,arcade:false});
  if(p.route==='uprising'&&p.chapter===0){p.body.windows='cross';p.gate={kind:'school',columns:'brick',canopy:'beam',open:true};p.guard={kind:'office',windows:'cross'};}
  if(p.route==='uprising'&&p.chapter===1)p.gate={kind:'pavilion',columns:'brick',canopy:'beam',open:true};
  if(p.route==='democracy')p.guard={kind:p.chapter===2?'arcaded':'office',windows:p.chapter===2?'arch':'cross'};
  if(p.route==='reform'&&p.chapter===2){p.guard={kind:'arcaded',windows:'cross'};p.gate.open=true;}
  if(p.route==='yang'){p.body.windows=p.chapter===1?'tall':'cross';p.guard={kind:'office',windows:'cross'};p.landmark='original';p.gate={kind:'school',columns:'square',canopy:p.chapter===1?'pitched':'flat',open:true};p.lightDensity=p.chapter===2?.06:.14;}
  if(p.route==='jidi'){p.body.arcade=false;if(p.chapter<2)p.body.windows='ribbon';}
  if(p.route==='jidi_riot')p.gate={kind:'breached',columns:'steel',canopy:'beam',open:true};
 }
 validateCampusProfiles(profiles);
 fs.writeFileSync('src/data/campusArchitecture.json',JSON.stringify(profiles,null,2)+'\n');
 const study=JSON.parse(fs.readFileSync(`${folder}/study.json`,'utf8'));
 const extra=['review','fixtures'].filter(name=>fs.existsSync(`${folder}/${name}.json`)).map(name=>({...JSON.parse(fs.readFileSync(`${folder}/${name}.json`,'utf8')),purpose:name}));
 const calls=[{...study,purpose:'reference-study'},...batches.map((b,i)=>({...b,purpose:'profiles-'+['a','b','c','d'][i]})),...extra].map(({purpose,model,requestHash,usage,prefixHash,generatedAt})=>({purpose,model,requestHash,usage,prefixHash,generatedAt}));
 const hits=calls.reduce((n,c)=>n+(c.usage.prompt_cache_hit_tokens||0),0),prompts=calls.reduce((n,c)=>n+c.usage.prompt_tokens,0);
 const productionPrompts=batches.reduce((n,c)=>n+c.usage.prompt_tokens,0);
 const productionHits=batches.reduce((n,c)=>n+(c.usage.prompt_cache_hit_tokens||0),0);
 fs.writeFileSync('docs/campus-structure-deepseek.json',JSON.stringify({calls,totalPromptTokens:prompts,cacheHitTokens:hits,weightedCacheHitRate:hits/prompts,productionCacheHitRate:productionHits/productionPrompts,editorialCorrections:['Opening retains existing four-storey school mass.','Uprising is an open campus, not ruins.','Reform and democracy keep open reception, not police checkpoints.','Yang uses administrative architecture; low health is not a destroyed/boarded school.','Jidi uses industrial bays, not an open public arcade.','Riot uses broken gates; invalid boarded window alias normalized to shutters.','Fixture draft was not admitted verbatim: crossed rectangles, route mix-ups and window-overlapping props were redrawn in CampusFixtures.','Visual review led to real window recesses, matching arch rings, mouldings, column bases and projected steps.','User identified perspective mismatch: bilinear coordinates replaced with planar homography; arch stones share the exact projected arch centre and contours.'],note:'Seven successful calls. First vision study and sanitized fixture brief are cold prefixes. Production rate refers only to four sequential profile batches; overall rate includes study, screenshot critique and fixtures. Server-side cache, not local whole-response cache. Fixture call carries user references and drawing specifications only; full-source fixture request was blocked before transmission. Format-only recovery of study output is recorded locally.'},null,2)+'\n');
 console.log(`Admitted ${profiles.length} structural profiles; provider prompt cache hit ${(hits/prompts*100).toFixed(1)}%.`);
}
