import fs from 'node:fs';
import path from 'node:path';
import {complete} from '../writing/deepseek.mjs';
const root=process.cwd(),mode=process.argv[2];
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const env=read('src/components/CampusEnvironment.tsx');
const primitives=read('src/components/campusPrimitives.tsx');
const routesSource=read('src/components/CampusRouteDiorama.tsx');
const style=`你是《TNO：合肥一中风云》的资深策略游戏美术。必须基于现有画面精修，不重做游戏。美术基准：TNO/HOI4，煤黑#070d10、石墨#182126、冷青#71c7cc、象牙白#c9cec2，暗红#823b37、旧铜#bda47a、绿灰、少量灰紫。硬边金属仪表，细线刻、雕版、黑色留白，标题宋体/衬线，正文可读黑体，数值等宽。禁止糖果配色、粗黑卡通、SaaS圆角卡片、大块蓝色平涂、满屏噪点/光晕、正面建筑。保持所有按钮状态、布局尺寸、pointer事件、z-index、滚动、存档、剧情与玩法不变。你的代码将由开发者逐项审阅，不能执行命令、加载网络或修改其他文件。输出JSON。`;
const geometry=`现有SVG1200x700；教学楼角点720,75/435，两侧80,137/377与1160,127/386；画面地平线y260，街景物体消失点-1200和2300。必须复用geometry/inset/at/path避免伪透视。你输出的函数直接放在同一模块所以可调用所有现有绘图辅助函数。严禁导入或新增依赖，严禁修改事件和状态。`;
let task,context,maxTokens=10000;
if(mode==='chrome'){
 task=`生成JSON {"css":"完整CSS","rationale":["..."]}。CSS将最后导入。用策略游戏硬边金属多层边缘、压印标题、暗色磨砂、分级信息、精准可读高对比提升整体质感。限制选择器仅这些已有class：.resource-topbar,.campaign-rail,.rail-mark,.nation-panel,.nation-module,.nation-module-heading,.nation-focus-card,.nation-leader-name,.nation-leader-portrait,.nation-ideology-heading,.nation-faction-row,.map-toolbar,.map-layers,.command-ledger,.command-summary,.command-links,.region-window,.heyi-light-v2__header,.heyi-light-v2__value,.heyi-light-v2__readout,.heyi-light-v2__trend,.heyi-light-v2__instrument,.heyi-light-v2__scale,.heyi-light-v2__tooltip。新增小游戏scope .strategy-minigame，内可选button/h2/h3/section、[role=progressbar]，已有.reform-panel .reform-progress .assembly-semicircle。不更改布局display/position/width/height/overflow/z-index/pointer-events；不使用全局button/svg/div样式，不写transform。用background/border/shadow/text排版质感，可合理增强标题letter-spacing。不为pseudo设置遮挡。保留disabled明显。至少200行精心定制CSS，包含focus-visible与reduced-motion，性能不使用blur/backdrop-filter。`;
 context=['src/command.css','src/components/nationIdeology.css','src/components/heyiLight.css','src/components/assemblyPolitics.css'].map(f=>({file:f,text:read(f)}));
}else if(mode==='architecture'){
 task=`生成JSON {"code":"export function CampusArchitecturalEngraving({route,chapter}:{route:HeyiRoute;chapter:0|1|2}){...}","css":"仅新增动画class的CSS","rationale":["..."]}。在原教学楼SchoolCampus之后叠加精致建筑细部。不重复画已有窗框/边缘，不盖大色块。教学楼左面应使用Face [{80,137},{720,75},{720,435},{80,377}] 右面[{720,75},{1160,127},{1160,386},{720,435}]，须先用at投影。增加空调外机格栅/排水管接头/屋顶护栏/避雷针/有纵深的入口台阶和玻璃门/窗内讲台黑板与灯管/走廊楼梯细节。窗格原布局左9右6 每层v=.055+row*.242,h=.165,u=(col+.18)/n,w=.62/n。细节必须clip在窗内且路径ID使用useId?不能用hook则统一前缀engraving-room-{side}-{row}-{col}同场景只一个。入口可以在楼体最底层两扇窗口做出门厅但必须屏蔽原窗口区域，不跨地板错位。路线上：jidi是整齐的题海教室与计时屏，democracy是讨论会议/社团，yang是文件与批阅台灯，wu是巡查室，riot是可辨认的逃生与灭火，despair是空教室/破窗，revolution为讨论和印刷，gouxiong舞台/乐器。人物仅远景剪影，窗内生活细节每路线不同；所有装饰pointerEvents=none并加aria-hidden，不影响已有教学楼hotspot。屋顶及玻璃仅透明线稿，不给整楼加填色。至少120行有价值的代码。`;
 context=[{file:'campusPrimitives.tsx',text:primitives},{file:'SchoolCampus',text:read('src/components/HeyiLight.tsx').split('function SchoolCampus')[1].split('function Scene')[0]}];
}else if(mode==='routes-a'||mode==='routes-b'){
 const a=mode==='routes-a';const routes=a?'opening/uprising/democracy/revolution/yang/jidi':'haobang/reform/wu/gouxiong/despair/jidi_riot';
 task=`生成JSON {"code":"function RouteStreetScene${a?'A':'B'}({route,stage,chapter}:{route:HeyiRoute;stage?:UprisingStage;chapter:0|1|2}){switch(route){...default:return null;}}","css":"仅新增动画class CSS","rationale":["..."]}。替换旧RouteStreetScene，你负责${routes}六条路线。必须每条3个具体场景阶段chapter0/1/2，共18种。站位主要左前景x85..330,y535..610、右前景x950..1185,y535..615，严禁遮挡中间大门/教学楼。用原有Box/Plate/Table/Canopy/Bench/Bicycle/SmallFigure/Chair/Van/Flag/Kiosk/Speaker/Barrier/Fire等及新增局部helper。要求大幅精修：每条路线主要道具2-3组同样精细，每阶段不只是旗子文字不同，要改变人物组织、物件状态和使用方式。可定义helper避免复制。不要整个整齐格子排列。注意透视和遮挡深度，先画远景再近景。绘制细线纸张、铰链、线缆、手推车、报刊、废弃设备等合理细节，不叠旧画面。
 故事：opening晨间早餐蒸汽/自行车→家长等候/布告→考试晚归；uprising冲B3街垒课桌/送水救护→革委会油印机/班级联络→代表大会议案/值班制度，stage选择优先chapter；democracy选举前海报辩论→真实投票箱封条/排队/监票→胜利后开放社团阅读/议事桌，不能成功阶段仍画投票排队；revolution学习互助/工人学生讨论→联合劳动/教辅公共印刷→修缮与公共书架；yang办公桌文件流转与健康倒计时，早期职称办公→维稳与批阅→医药与空椅（不能断言人物死亡）；jidi商业教辅试销→批量题册配送/广告屏→门禁和深夜加班教材流水线；haobang多派谈判→联合机构协议审阅→礼仪秩序与集中式文书流；reform实验社团/开架课本→共同研发→自主成果展；wu登记检查→封闭通道和巡逻→分支结局尽量不暗示所有人死亡；gouxiong社团摊位/梗报→戏台/乐器与弹幕牌→荒诞的行政演出；despair撤走海报→空置站台积纸→封存窗门/旧桌与无人路面；jidi_riot从倾倒配送车/破成绩屏→消防水带/灭火救人→余烬和救护登记，不只大火。三阶段必须从共通骨架分叉，非简单改标签。动画class使用diorama-前缀，CSS保持克制且尊重prefers-reduced-motion。避免大量文字，只保留极少招牌。至少200行有效代码，可输出16000tokens以内。`;
 context=[{file:'campusPrimitives.tsx',text:primitives},{file:'Existing route drawings',text:a?routesSource.slice(routesSource.indexOf('function RouteStreetSceneA'),routesSource.indexOf('function RouteStreetSceneB')):routesSource.slice(routesSource.indexOf('function RouteStreetSceneB'))}];maxTokens=16000;
}else throw Error('mode chrome|architecture|routes-a|routes-b required');
const dir=path.join(root,'.writing-work/art-2026-10-18');fs.mkdirSync(dir,{recursive:true});
const messages=[{role:'system',content:style+'\n'+geometry},{role:'user',content:task+'\n已有源码（只作为美术上下文）:\n'+JSON.stringify(context)}];
fs.writeFileSync(path.join(dir,mode+'-brief.json'),JSON.stringify({model:'deepseek-flash',messages},null,2));
const result=await complete(messages,{model:'deepseek-flash',thinking:false,maxTokens});
fs.writeFileSync(path.join(dir,mode+'.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({mode,model:result.model,usage:result.usage,requestHash:result.requestHash,localCache:result.localCache,codeLength:result.data?.code?.length,cssLength:result.data?.css?.length}));
