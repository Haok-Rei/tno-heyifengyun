import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {complete} from '../writing/deepseek.mjs';
import {campusMessages} from './campus-context.mjs';
const root=process.cwd(),out=path.join(root,'.writing-work/campus-study');fs.mkdirSync(out,{recursive:true});
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const system=`你是合一风云的场景原画总监。用简体中文分析。用户否决上一版：相同方盒子教学楼和大门只变道具，窗内小人/图案杂乱莫名，闪光覆盖旧窗框，完全不及参考图。必须按用户三张参考图片，黑底留白、0.6至1.2像素细线、明确两点透视、可辨识的真实建筑构件、少量暗绿/铜/灰红，成片主体差异。三张图同视角，却由建筑用途与外形、窗型、门廊、台阶、屋檐、砖石、拱窗、立柱、店面等形成巨大差分。不是多放旗子、桌子、符号，不是把所有窗填满。教学楼的窗内原则上空黑，仅玻璃、窗框与少量稳定柔灯，不画人物课桌屏幕。不能把合一校门改成欧洲城镇；从参考学习画法、体积和差分尺度，仍是中国高中。玩法、八类观察热区、合肥一中四字、地图区域内视窗、人物动画和存档保持。
输出严格JSON。绘图将由统一透视渲染器执行，你负责明确不同路线建筑组合、真实构件和参数。参数必须彼此构成可辨识建筑，不给小色块起宏大名称。不要执行代码，不访问网络，不输出凭据。`;
const contract=`世界坐标1200x700；共享地平线y=260、地面两消失点x=-1200和2300。主楼最近角(720,435)、屋檐顶(720,75)，两翼到左x80和右x1160；大门位于前景x350..820,y260..520；门卫在x84..341,y328..500；前景人物y570..600；道路y565..700。不得改变观察回调。渲染器支持以下真实建筑构件，结构方案必须跨类别变化：
profile字段 {id,route,chapter,concept,body:{floors:2|3|4,leftBays:5..9,rightBays:4..7,height:260..360,leftReach:550..640,rightReach:350..440,roof:'parapet'|'gable'|'sawtooth'|'cornice'|'terrace',windows:'cross'|'tall'|'arch'|'ribbon'|'shutter',skin:'brick'|'stone'|'render'|'metal',arcade:boolean,balcony:boolean,entrance:'glass'|'arch'|'portico'|'shutter'|'boarded',clock:boolean},gate:{kind:'school'|'pavilion'|'industrial'|'colonnade'|'checkpoint'|'breached'|'sealed',columns:'square'|'brick'|'stone'|'steel',canopy:'flat'|'pitched'|'beam'|'none',open:boolean},guard:{kind:'office'|'arcaded'|'kiosk'|'checkpoint'|'ruined',windows:'cross'|'arch'|'shutter'},accent:'#hex',lightDensity:0..0.4,landmark:'reading-arcade'|'printing-hall'|'dispatch-dock'|'screened-checkpoint'|'public-forum'|'sealed-wing'|'performance-stage'|'original',details:[至少4条能在画面上直接认出的构件说明]}。
每条路线3阶段：0初期、1中期、2后期。可沿同一构造发展，不能一秒变异国建筑；阶段1/2至少两个结构构件真的变化，例如窗封板+门禁钢结构、开放底层回廊+读书廊、卸货口+连片遮雨棚、受损屋面+破门缺口。
路线含义：opening普通学校的日常与紧张；uprising B3街垒→革委会→代表大会；democracy征集意见→正式选举→社团自由；revolution夺权后自治建设；reform做题改革的互助学习与教辅公共化；haobang多派协商与联合机构；yang教师行政职称评审与健康下降；jidi资本教辅工厂/数据考核/封闭升学；jidi_riot结构损毁、救援、余烬（不要只有火）；wu纪律与封控；gouxiong舞台文化与荒诞行政；despair封存弃置。必须像参考图那样无需读牌子就辨出变化。`;
const commonFile=path.join(out,'common.json');
const mode=process.argv[2]||'study';
if(mode!=='fixtures'&&!fs.existsSync(commonFile)){
 const refs=['corner-01.png','corner-02.png','corner-03.png'];
 const content=[{type:'text',text:'以下三张是用户要求达到的差分幅度与细线绘制参考，请实际看图，不只根据文本猜测。'}];
 for(const name of refs)content.push({type:'image_url',image_url:{url:'data:image/png;base64,'+fs.readFileSync(path.join(root,'art/campus-reference',name)).toString('base64')}});
 content.push({type:'text',text:contract+'\n现有共享透视方法：\n'+read('src/components/campusPrimitives.tsx').slice(0,6000)});
 fs.writeFileSync(commonFile,JSON.stringify([{role:'system',content:system},{role:'user',content}],null,2));
}
const common=mode==='fixtures'?[]:JSON.parse(fs.readFileSync(commonFile,'utf8'));
let prompt,maxTokens,study;
if(mode==='fixtures'){
 prompt=[{type:'text',text:`主楼、窗洞进深、双层窗框、拱石、出挑窗台、檐口和门柱已经重画。现在请你亲自编写精细SVG线稿代码，补上真实、可辨认的路线专属外部建筑构件。生成JSON {code:"完整TSX模块",rationale:[...] }。导出CampusFixtures({faces,profile}:{faces:{left:Face;right:Face};profile:CampusStructureProfile})。只可import {at,inset,path,geometry,FaceLines,Plate,type Face,type Point} from './campusPrimitives'，import type {CampusStructureProfile} from './CampusStructures'。只能绘制装饰g pointerEvents=none aria-hidden=true，不能改变游戏行为。用at()投影所有墙面细部，地平线共享；每个实物要有多个真实构件，不能简单几何符号代表。严禁画窗内人物、书桌、灯条图标，不能覆盖已有窗；上层窗区在每层12%至73%高度，窗间空隙约每跨模数30%；上部檐口区v<.04，墙角u<.03，底部勒脚v>.947，可在这些区域画真实固定构件。
重点：普通学校：屋顶有纵深的通风箱与避雷针，墙角管道卡箍；民主/改革：开放阅读回廊的近景柱础栏板、内退的公共书架但只在右侧底层回廊v>.79，不碰窗；资本：屋顶排气机组和外侧检修梯有梯级/护笼/侧支架，不是随意折线，底部卸货台有支架与护栏；封控：底层窄窗外真实防护格栅和门旁摄像机有镜头/安装支架；行政：檐下小型圆钟、雨水立管、入口照明灯罩；革委会：屋顶修复脚手架、墙角扩音喇叭有锥口/支架（只在中期，不能全楼废墟）；暴动/绝望：从屋檐缺口露出的椽条、侧墙破损阶梯/断裂扶手，不是在窗上多画裂纹；文化路线：独立舞台檐下的帷幕悬挂轨/侧帷褶线，不画抽象紫色方块。
不需要每条都做满，只做6至8种真正精致的构件，按route和chapter合理使用，不以牌子/旗子/颜色替代结构。金属边线.65、外轮廓.9、接缝.45px，微小暗色填充；多留黑。不要画正面房屋和悬空楼梯。组件须少于240行。
只给你公开的绘图接口约定，不传输项目源码：Face是四个{x,y}点从左上开始顺时针。at(face,u,v)返回归一化位置投影点；inset(face,u,v,width,height)返回子面；path(points,closed?)返回SVG路径。主楼两面以角点(720,435)接合，高度260..360，左翼宽550..640、右翼宽350..440，地平线260、左右消失点-1200/2300。必须在传入faces上用at定位，不另画整楼。profile只用route/chapter/body.floors/body.arcade/body.windows。route包括opening/uprising/democracy/revolution/reform/haobang/yang/jidi/jidi_riot/wu/gouxiong/despair，chapter为0/1/2。不要调用geometry或读取其他属性，单个构件不要占满整面，不增加事件和状态。`}];maxTokens=6500;
}else if(mode==='review'){
 study=JSON.parse(fs.readFileSync(path.join(out,'study.json'),'utf8')).data;
 prompt=[{type:'text',text:'用户正在批评当前稿细节程度还不如原版。下面三张是刚绘制的民主、资本、动荡校园实机图。对照之前三张参考：请逐项指出目前的简陋处，尤其窗洞进深/窗套/拱石/灰缝/檐口/立柱/门卫室门高/校门柱高/台阶投影，必须提出能用SVG线条真实绘制的修正，不许建议在窗内塞小人图标，不许泛泛赞扬。输出JSON {criticalProblems:[{part,visibleProblem,geometryFix}],detailPass:[{part,pathsToDraw,strokeHierarchy}],keep:[...]}。控制1400汉字。'}];
 for(const name of ['democracy','jidi','riot'])prompt.push({type:'image_url',image_url:{url:'data:image/png;base64,'+fs.readFileSync(`docs/previews/2026-10-18-${name}.png`).toString('base64')}});
 maxTokens=3000;
}else if(mode==='study'){
 prompt='请先对照三张图逐张说出结构区别及线稿特色，再批评现有固定大楼加窗内小人的方案。给出四组中国高中校园建筑的明确绘制方向：开放自治、资本工厂、封控肃反、动荡废墟。输出JSON {referenceAnalysis:[三条逐图具体观察],previousErrors:[...],directions:[{family,silhouette,facade,gate,ground}],drawingRules:[...]}。控制在1400汉字，不生成代码。';maxTokens=2800;
}else{
 const sets={a:['opening','uprising','democracy'],b:['revolution','reform','haobang'],c:['yang','jidi','jidi_riot'],d:['wu','gouxiong','despair']};
 if(!sets[mode])throw Error('study|a|b|c|d|review|fixtures');
 study=JSON.parse(fs.readFileSync(path.join(out,'study.json'),'utf8')).data;
 prompt=`现在绘制规划 ${sets[mode].join('、')}，每条0/1/2阶段，严格9个profile。输出JSON {profiles:[9个完整字段profile],review:[每条路线怎样从轮廓/门面/入口一眼辨认]}。三阶段需有真正不同的结构，不以文字或换色计数；每组至少3个body字段变化、1个gate字段变化。id使用route-chapter。把参考图砖墙/拱门/雨棚/门廊差异转换为符合中国校园的实物。所有枚举遵循给定contract，概念和details中文。不要窗内人物和抽象图案。`;maxTokens=7200;
}
// Code generation sends a drawing brief and user references only, never repository source.
const fixtureReferences=['corner-01.png','corner-02.png','corner-03.png'];
const fixtureCommon=mode==='fixtures'?[{role:'system',content:'你是TNO黑底细线稿场景画师。请根据用户提供的参考绘制真实细密的建筑构件，保持两点透视和黑色留白。严格JSON输出。'},{role:'user',content:[{type:'text',text:'用户提供的细线、真实构件和差分幅度参考。'},...fixtureReferences.map(name=>({type:'image_url',image_url:{url:'data:image/png;base64,'+fs.readFileSync(path.join(root,'art/campus-reference',name)).toString('base64')}}))]}]:null;
const messages=mode==='fixtures'?campusMessages(fixtureCommon,prompt):campusMessages(common,prompt,study);
const actualPrefixHash=createHash('sha256').update(JSON.stringify(mode==='fixtures'?fixtureCommon:common)).digest('hex');
const result=await complete(messages,{model:'deepseek-flash',thinking:false,maxTokens});
fs.writeFileSync(path.join(out,mode+'.json'),JSON.stringify({...result,prefixHash:actualPrefixHash},null,2));
console.log(JSON.stringify({mode,prefixHash:actualPrefixHash,model:result.model,localCache:result.localCache,usage:result.usage,profiles:result.data?.profiles?.length}));
