import test from 'node:test';
import assert from 'node:assert/strict';
import type { GameState, FocusNode, Decision } from '../src/types';
import { getActionReminders, isReminderDismissed, campaignDay } from '../src/engine/actionReminders';
import { getAvailableAdvisors, getAdvisorCost } from '../src/data/advisors';
import { DEFAULT_LAW_SYSTEM } from '../src/data/laws';
import { assignRecurringAction } from '../src/engine/commandSystem';

function fixture():GameState { return {
  date:new Date(2023,8,1),currentFocusTree:'phase1',flags:{},completedFocuses:[],nationalSpirits:[],
  stats:{pp:300,tpr:100,stab:50,ss:50,studentSanity:50},advisors:[null,null,null],leader:{name:'封安宝'},
  lawSystem:{...DEFAULT_LAW_SYSTEM},decisionCooldowns:{},mapLocations:{},
} as unknown as GameState; }
const focus=(id:string,extra:Partial<FocusNode>={}):FocusNode=>({id,title:id,description:'',days:7,x:0,y:0,...extra});
const decision=(id:string,extra:Partial<Decision>={}):Decision=>({id,title:id,description:'',costPP:20,cooldownDays:5,effect:()=>({}),...extra});

test('reminders exclude hidden, mutually exclusive, unaffordable and cooling actions',()=>{
  const s=fixture();s.completedFocuses=['completed'];s.decisionCooldowns.cool=1;
  const reminders=getActionReminders(s,[focus('ready'),focus('locked',{requires:['missing']}),focus('completed'),focus('hidden',{isHidden:()=>true}),focus('blocked',{mutuallyExclusive:['completed']}),focus('condition',{canStart:()=>false})],
    [decision('ready'),decision('cool'),decision('hidden',{isVisible:()=>false}),decision('cost',{costPP:301}),decision('condition',{canAfford:()=>false}),decision('debug_unlock')],[]);
  assert.deepEqual(reminders.find(r=>r.id==='focus')?.keys,['ready']);
  assert.deepEqual(reminders.find(r=>r.id==='decision')?.keys,['ready']);
  assert.ok(!getActionReminders({...s,activeFocus:{id:'ready',daysLeft:3,totalDays:7}},[],[],[]).some(r=>r.id==='focus'));
  assert.deepEqual(getActionReminders({...s,stats:{...s.stats,pp:-1}},[],[],[]),[]);
});

test('advisor reminders honor unlocks, occupied slots and discounted real costs',()=>{
  const s=fixture();assert.ok(!getAvailableAdvisors(s).some(a=>a.id==='jidi_ceo'));
  const a=getAvailableAdvisors(s)[0];s.stats.pp=getAdvisorCost(s,a)-1;
  assert.ok(!getActionReminders(s,[],[],[]).find(r=>r.id==='advisor')?.keys.includes(a.id));
  s.leader.name='杨玉乐';s.flags.yang_yule_cheap_advisors=true;
  assert.ok(getActionReminders(s,[],[],[]).find(r=>r.id==='advisor')?.keys.includes(a.id));
  s.advisors=[a,a,a];assert.ok(!getActionReminders(s,[],[],[]).some(r=>r.id==='advisor'));
});

test('law, team and mechanic reminders track actual capacity and current entry state',()=>{
  let s=fixture();assert.ok(getActionReminders(s,[],[],[]).some(r=>r.id==='law'));
  s.stats.pp=149;assert.ok(!getActionReminders(s,[],[],[]).some(r=>r.id==='law'));
  s=assignRecurringAction(s,'track_field','pl_sports',2);s=assignRecurringAction(s,'aud_hall','aud_coop',2);
  assert.ok(!getActionReminders(s,[],[],[]).some(r=>r.id==='team'));
  const r=getActionReminders(fixture(),[],[],[{id:'heyi-light',label:'合一之光',active:false},{id:'assembly',label:'大会',active:false},{id:'yang',label:'办公桌',active:true}]).find(r=>r.id==='mechanic')!;
  assert.equal(r.target,'assembly');assert.ok(!r.keys.includes('yang'));
});

test('right-click dismissal expires after seven game days and resurfaces on new options or route changes',()=>{
  const s=fixture(),r=getActionReminders(s,[focus('a')],[],[]).find(r=>r.id==='focus')!;
  const ignored={keys:r.keys,until:campaignDay(s.date)+7,route:s.currentFocusTree};
  assert.equal(isReminderDismissed(r,ignored,s),true);
  assert.equal(isReminderDismissed({...r,keys:['a','b']},ignored,s),false);
  assert.equal(isReminderDismissed(r,ignored,{...s,currentFocusTree:'treeA'}),false);
  assert.equal(isReminderDismissed(r,ignored,{...s,date:new Date(2023,8,8)}),false);
});
