import React from 'react';
import { GameState } from '../types';
import { X, Eye, EyeOff, Zap, Star, Film } from 'lucide-react';
import { GOUXIONG_CYBER_POSTER_ASSETS } from '../config/assets';

interface CyberDeconstructionProps {
  state: GameState;
  onClose: () => void;
  onInteract: (action: string, payload?: any) => void;
}

const WORKS = [
  { id: 'demon_slayer', name: '鬼灭之刃', desc: '“热血模板的商业神话，情绪结构可拆解。”', cost: 20, poster: GOUXIONG_CYBER_POSTER_ASSETS.demon_slayer },
  { id: 'aot', name: '进击的巨人', desc: '“宏大叙事的恐惧引擎，天然适配狗熊解构法。”', cost: 28, poster: GOUXIONG_CYBER_POSTER_ASSETS.aot },
  { id: 'takagi', name: '擅长捉弄的高木同学', desc: '“轻甜日常与权力试探的伪装文本。”', cost: 24, poster: GOUXIONG_CYBER_POSTER_ASSETS.takagi },
  { id: 'mygo', name: 'MyGO!!!!!', desc: '“关系扭结与情绪噪声的完美样本。”', cost: 36, poster: GOUXIONG_CYBER_POSTER_ASSETS.mygo },
  { id: 'frieren', name: '葬送的芙莉莲', desc: '“时间与记忆叙事，适合慢刀解构。”', cost: 34, poster: GOUXIONG_CYBER_POSTER_ASSETS.frieren },
  { id: 'bochi', name: '孤独摇滚！', desc: '“社恐符号学与舞台人格分裂。”', cost: 26, poster: GOUXIONG_CYBER_POSTER_ASSETS.bochi },
  { id: 'eva', name: '新世纪福音战士', desc: '“先验焦虑与自我投射的无限镜厅。”', cost: 45, poster: GOUXIONG_CYBER_POSTER_ASSETS.eva },
];

type BarragePhase = 'opening' | 'climax' | 'finale';
type FinaleTone = 'god' | 'bad' | 'mixed';

interface LiveBarrageItem {
  id: string;
  user: string;
  text: string;
  lane: number;
  offset: number;
}

interface BarrageScript {
  opening: string[];
  climax: string[];
  finale: {
    god: string[];
    bad: string[];
    mixed: string[];
  };
  hooks: Array<{ min?: number; max?: number; text: string }>;
  ambient: string[];
}

const BARRAGE_USERS = [
  '卷王回寝部',
  '夜班纠察队',
  '礼堂后排17座',
  'B3走廊幽灵',
  '错题本燃烧中',
  '白板注入组',
  '操场快闪队',
  '二刷党代表',
  '理综碎纸机',
  '弹幕观察员',
  '宿舍断网人',
  '摸鱼宣传口',
];

const BARRAGE_SCRIPTS: Record<string, BarrageScript> = {
  demon_slayer: {
    opening: [
      '[狗熊派门卫]：熊哥最爱的番！全体起立！谁不看谁写检讨！',
      '[被迫营业]：好的熊哥，我眼睛睁得比铜铃还大。',
      '[水之呼吸]：水之呼吸壹之型：伯努利流体力学方程！',
      '[雷之呼吸]：雷之呼吸壹之型：法拉第电磁感应定律！',
      '[化学课代表]：请问紫藤花提取物毒杀鬼的化学结构式是什么？',
      '[生物课代表]：鬼的细胞分裂不受海弗里克极限控制，建议抽血化验。',
      '[柱合会议]：这柱合会议的压迫感，怎么跟联合革委会开会一样。',
      '[主公大人]：王兆凯出来挨打，看看人家的主公多温柔！',
      '[无限列车]：这哪是无限列车，这是合肥一中开往高考的灵车。',
      '[善逸的拔刀]：只有在交卷前最后一秒，我才能使出霹雳一闪。',
    ],
    climax: [
      '[炎柱大哥]：大哥没有输！！！',
      '[便当太快了]：为什么好人总是死得那么快？兆凯也是，大哥也是。',
      '[哭瞎了]：卧槽，我一个理科生居然看哭了，理智度-1。',
      '[熊哥擦鼻涕]：我作证，刚才熊哥在第一排哭得像个两百斤的孩子。',
      '[猗窝座]：变成鬼吧，杏寿郎！只要变成保皇派，就不用做题了！',
      '[大哥的微笑]：他履行了他的职责，我也该去把那张卷子做完了。',
      '[猪突猛进]：伊之助是不是就是狗熊的二次元原型啊？都戴个头套发癫。',
      '[华丽的祭典]：宇髓天元这厮要是来一中，肯定因为头发违规被通报批评。',
      '[斑纹觉醒]：熬夜做题熬出来的黑眼圈，算不算斑纹觉醒？',
      '[通透世界]：考试的时候要是能进入通透世界，我还怕个锤子。',
      '[赫刀]：把笔写到发烫，就是赫刀！',
      '[继国缘一]：学神就是继国缘一，我们这群凡人怎么努力都赶不上。',
    ],
    finale: {
      god: [
        '[炎柱遗言]：心を燃やせ。哪怕明天一模也要抬头走。',
        '[锻刀村]：实验楼地下室就是我们的锻刀村，那里印着最锋利的传单。',
        '[大哥没有输]：封神，哭崩了还想二刷。',
        '[紫藤花]：学校绿化带里应该种满紫藤花，防吴福军。',
      ],
      bad: [
        '[玉壶]：把自己装在艺术礼堂里的狗熊，就是这只壶吧。',
        '[上弦之叁]：这反派怎么还讲武德啊，比我们纠察队强多了。',
        '[黑死牟]：因为嫉妒学神而心理扭曲的学霸，太真实了。',
        '[半天狗]：遇到困难就哭，像极了考砸了的我。',
      ],
      mixed: [
        '[祢豆子的箱子]：我也想躲进箱子里，逃避明天的小测验。',
        '[鳞泷左近次]：这师傅的魔鬼训练比高三班主任还狠。',
        '[时透无一郎]：失忆的做题机器，这不就是我吗？',
        '[风柱不死川]：这暴躁老哥跟吕波汉简直是一个模子刻出来的。',
      ],
    },
    hooks: [
      { min: 9, text: '[狗熊派门卫]：热血回路过载，今天礼堂不许降温。' },
      { min: 0, max: 4, text: '[被迫营业]：别拆了，先把呼吸节奏找回来。' },
    ],
    ambient: [
      '[弹幕巡航]：礼堂门口排队人数继续上涨。',
      '[后排偷抄]：有人把炎柱台词抄进英语作文素材本。',
      '[值班纠察]：今晚查寝延后，先把这段看完。',
    ],
  },
  aot: {
    opening: [
      '[B3楼长]：那一天，做题家终于回想起了被模考支配的恐惧。',
      '[物理课代表]：求证：立体机动装置的瓦斯喷发是否符合动量守恒定理？',
      '[五年高考]：封安保就是那个踹门的超大型巨人！',
      '[三年模拟]：吴福军主任是不是就是铠之巨人啊？防暴盾牌挺像的。',
      '[海的那边是]：海的那边是自由吗？不，海的那边是合肥工业大学。',
      '[艾尔迪亚做题蛆]：我们都是尤弥尔的子民（指被分数奴役的耗材）。',
      '[调查兵团编外]：只要把墙外（校外）的敌人都杀光，我们就能不上晚自习了吗？',
      '[无垢巨人]：前面那个吃人的巨人怎么长得那么像教务处主任？',
      '[历史课代表]：马莱帝国的隐喻就是唯分数论的官僚资本体制。',
      '[地下室的秘密]：地下室里没有巨人的秘密，只有周洪斌在印传单。',
      '[墙之王]：封安保用几万份试卷砌成了这堵墙。',
      '[进击的做题家]：一直不断前进，直到做完最后一道压轴题。',
    ],
    climax: [
      '[红蛤先锋队]：塔塔开！一直塔塔开！直到把及第教育密卷全烧光！',
      '[献出心脏]：为联合革委会献出心脏！',
      '[地鸣启动]：地鸣（指几百个纠察队踩着防暴靴冲进B1）。',
      '[阿明老懂哥]：所以艾伦搞地鸣就跟兆凯搞大清洗一样，都是为了保护我们？',
      '[坐标之力]：豪邦的左翼大帐篷是不是就是坐标之力啊？',
      '[战锤巨人]：用硬质化造个艺术礼堂出来吧！',
      '[地表最强矮子]：兵长砍猴砍得比狗熊砍大门还利索。',
      '[自由之翼]：不自由，毋宁死！拆了防跳网！',
      '[团长的冲锋]：孩子们，向着月考，冲锋！然后去死吧！',
      '[法尔科的鸟]：我想变成鸟，飞出这所破学校。',
      '[马莱狙神]：贾碧一枪把我的清华梦打碎了。',
      '[始祖巨人]：王兆凯是不是发动了始祖之力，把我们记忆篡改了？',
    ],
    finale: {
      god: [
        '[韩吉的眼镜]：献出心脏！哪怕明天期末考！',
        '[自由啊]：你把我弄破防了，但我还是承认它伟大。',
        '[尤弥尔的信]：致100年后的合一学生，你们还在内卷吗？',
        '[墙内火种]：封神，痛苦但值。',
      ],
      bad: [
        '[谏山创受害者]：谏山创我日你妈，退钱！！！',
        '[139话PTSD]：看完结局，我觉得狗熊的赛博精神病很正常。',
        '[自由的奴隶]：看了结局我懂了，小丑竟是我自己。',
        '[灭世派]：毁灭吧，赶紧的，把合一扬了。',
      ],
      mixed: [
        '[莱纳的步枪]：莱纳，借你的枪给我，我也不想学物理了。',
        '[萨沙的肉]：食堂大妈抖勺的时候，我就是萨沙。',
        '[让的背影]：让，你这小子最后去考公了吧。',
        '[艾伦的头]：被三笠砍了，就像我的英语作文被老师砍了。',
      ],
    },
    hooks: [
      { min: 10, text: '[地鸣启动]：不是烂尾了吗？' },
      { min: 0, max: 3, text: '[谏山创受害者]：谏山创我日你妈。' },
      { min: 0, max: 2, text: '[自由啊]：谏山创你个老贼，把我的感动还给我！' },
    ],
    ambient: [
      '[弹幕系统]：立场分歧急剧升高。',
      '[前排复盘组]：现在开始按时间线吵架，预计持续三节晚自习。',
      '[校内论坛]：#不是烂尾了吗# 热度爆表。',
    ],
  },
  takagi: {
    opening: [
      '[杀了我助兴]：杀了我给二位助助兴吧。',
      '[柠檬精]：今天礼堂的空气好酸啊。',
      '[五三成精]：为什么我的高中只有五三，没有高木？！',
      '[错题本狂魔]：博弈论分析：西片一直输是因为没有总结易错题型。',
      '[语文课代表]：这就是所谓没有被衡水模式摧残过的青春吗……',
      '[代入感为零]：对不起，封安保规定男女生距离不得小于五十厘米。',
      '[我的青春被狗吃了]：我的青春被及第教育吃了。',
      '[西片太太]：官方发糖，最为致命。',
      '[情人节巧克力]：我只收过三年高考五年模拟的附赠光盘。',
      '[课间十分钟]：这十分钟他们能发生这么多事？我都只够上个厕所。',
    ],
    climax: [
      '[阿伟输了]：西片你这木头！A上去啊！',
      '[这才是生活]：原来人在高中是可以谈笑风生的，我以为只能刷题。',
      '[做题家破防]：前面的，别说了，我已经在哭了。',
      '[被偷走的三年]：合一把我的三年偷走了，谁来赔我一个高木？',
      '[狗粮吃撑了]：今天不用去食堂了，狗粮已经饱了。',
      '[数学课代表]：我算了一下他们脸红的频率，呈指数级增长。',
      '[雨伞下]：相合伞？纠察队看到直接按早恋处理，记大过！',
      '[我酸了]：这就是差距吗？别人在谈恋爱，我在背出师表。',
      '[放学后]：放学后？我们有放学后吗？晚自习上到十点半。',
      '[单车后座]：这单车后座，狗熊这辈子是坐不上了。',
    ],
    finale: {
      god: [
        '[太甜了]：胰岛素！快给我注射胰岛素！',
        '[狗粮番天花板]：这部番应该列为合一禁书，严重动摇军心。',
        '[我的同桌]：我的同桌只会问我第二道大题选C还是D。',
        '[白日梦]：醒醒，你明天还要交800字解构报告。',
      ],
      bad: [
        '[狗熊伪善]：熊哥看这个的时候笑得好恶心啊！跟个痴汉一样！',
        '[纯情男高]：西片太纯情了，换作狗熊估计早就在楼道里作案了。',
        '[狗熊的幻想]：狗熊是不是把达璧当成高木了？别恶心人了。',
        '[看番不如做题]：做题使我快乐，真的（流下两行清泪）。',
      ],
      mixed: [
        '[体育课]：只有体育课能摸鱼，但我们的体育课都被数学老师占了。',
        '[泳装回]：前方高能！（然后被狗熊切了画面：学习时间！）',
        '[自习课]：高木都不用写作业的吗？日本高中生真闲。',
        '[打水时间]：在合一打个水都要排队，哪有时间谈恋爱。',
      ],
    },
    hooks: [
      { min: 8, text: '[柠檬精]：这糖里怎么也有这么多算计。' },
      { min: 0, max: 4, text: '[没救了]：看这个番简直是对做题家的公开处刑。' },
    ],
    ambient: [
      '[礼堂播报]：今日弹幕关键词：错过、逞强、没来得及。',
      '[后排叹气机]：连叹三口气，已无法继续嘴硬。',
      '[草稿纸留言]：如果当时勇敢一点会怎样？',
    ],
  },
  mygo: {
    opening: [
      '[兆凯的铁拳]：母柜子痴闹麻了！！',
      '[红蛤宣传部]：王主席亲自推荐！这是一部深刻的党史教育片！',
      '[为什么要演奏]：为什么要演奏春日影？！',
      '[一辈子做题]：跟我组一辈子乐队（做题）吧！',
      '[B1地下室幽灵]：这乐队的内斗，比我们红蛤和保皇派打得还狠。',
      '[左翼大帐篷]：素世就是豪邦啊！为了维系大帐篷（乐队）卑微到了尘埃里！',
      '[祥子的退党]：祥子退团=狗熊占领艺术礼堂另立中央。',
      '[立希的暴躁]：立希简直就是女版吕波汉，天天发脾气要清洗别人。',
      '[灯的笔记]：灯的歌词本比我的物理错题本还厚。',
      '[猫猫的抹茶]：猫猫就是那些浑水摸鱼的乐子人，给口抹茶就打工。',
    ],
    climax: [
      '[沉重的引力]：合一的重力太大了，每个人都在互相拉扯。',
      '[你是抱着什么]：你是抱着什么觉悟来说这种话的？！',
      '[我什么都愿意做]：只要不考试，素世女士，我什么都愿意做！',
      '[Crychic解散]：就跟最开始的联合革委会一样，注定要分裂。',
      '[迷路子]：我们都是在应试教育里迷路的羔羊。',
      '[扭曲的爱]：这群女人的关系太扭曲了，就像政治局开会一样。',
      '[重女]：全员重女！这窒息感，不亚于三模前的动员大会！',
      '[春日影的背叛]：你背叛了工人阶级（祥子），你该死！',
      '[素世下跪]：看到素世下跪，我仿佛看到了豪邦在求潘仁越回来。',
      '[诗超绊]：哪怕吉他弦断了，也要把这首反抗的歌唱完！',
      '[扭曲学]：合一扭曲学，必修课程之一。',
      '[买够]：王兆凯这品味，绝了，不愧是搞政治的。',
    ],
    finale: {
      god: [
        '[MyGO的含金量]：没有流过血的乐队，算什么先锋队！',
        '[吉他英雄]：在这个乐队里，没有英雄，只有互相救赎的神经病。',
        '[邦邦人]：这部番治好了我的赛博精神病，然后给了我一刀。',
        '[为什么要演奏]：封神，真实得让人不敢多看。',
      ],
      bad: [
        '[客服小姐]：这客服怎么跟吴福军一样官僚主义。',
        '[键盘手跑路]：跑路？在合一，跑路只有翻墙一种方法。',
        '[乐队排练]：与其在这里看番，不如回去背两首古诗。',
        '[雨中的长椅]：那是素世的王座，现在是狗熊的真皮沙发。',
      ],
      mixed: [
        '[海铃的兼职]：为了交学费，海铃是不是去及第教育打工了？',
        '[创作者的痛苦]：写不出歌词的灯，像极了写不出八百字作文的我。',
        '[留学失败]：留学失败回国，像不像保送失败只能回来高考的学长？',
        '[喵梦的算计]：这自媒体博主比狗熊还会搞赛博游击。',
      ],
    },
    hooks: [
      { min: 10, text: '[兆凯的铁拳]：母柜子痴闹麻了！' },
      { min: 8, max: 9, text: '[沉重的引力]：这关系网已经扭到宇宙尽头了。' },
      { min: 0, max: 4, text: '[迷路子]：别吵了，先把心结拉出来再说。' },
    ],
    ambient: [
      '[弹幕系统]：关系张力维持高位。',
      '[统计面板]：“为什么要演奏春日影”出现频率 +300%。',
      '[后排复盘组]：正在自发配对复盘人物动机。',
    ],
  },
  frieren: {
    opening: [
      '[千年精灵]：十年对精灵来说只是一瞬，对我来说是做完一万套卷子！',
      '[无用的魔法]：变出花田的魔法，能加高考附加分吗？不能？那真好。',
      '[勇者辛美尔]：辛美尔如果在一中，肯定是个带头冲锋的浪漫造反派！',
      '[做题的意义]：在永恒的时间面前，我昨晚熬夜背的单词毫无意义。',
      '[虚无主义]：这部番治好了我的考前焦虑，因为一切终将湮灭。',
      '[魔族的话术]：保皇派的承诺就像魔族的话，听听就好，谁信谁死。',
      '[断头台阿乌拉]：阿乌拉，自裁吧！（指让狗熊自己退群）',
      '[魔力压制]：王卷豪平时装作只有600分，一到模考直接700+，魔力压制！',
      '[休塔尔克]：这小子真怂，跟我面对立体几何大题时一模一样。',
      '[宝箱怪]：这哪是宝箱，这是陷阱选项！芙莉莲又中招了！',
    ],
    climax: [
      '[一半是天空]：天空是一半，剩下的都是写满字的黑板。',
      '[腐败的贤老]：封安保就是那个腐朽的魔族长老，该被清除了。',
      '[花海的回忆]：原来没有考试的世界，风景这么美。',
      '[冒险的终点]：高考不是终点，只是我们这群小丑的一段滑稽旅程。',
      '[复制体]：迷宫里的复制体，就像考场上无数个一模一样的做题家。',
      '[水镜的恶魔]：最可怕的敌人是自己，还有永远做不完的错题。',
      '[黄金乡]：马哈特把一切变成黄金，及第教育把一切变成分数。',
      '[回忆的重量]：看到辛美尔的幻影，我没崩住。',
      '[纸花]：我用用完的草稿纸折了一朵花，这也是魔法吧。',
      '[人生的尺度]：在宇宙的尺度下，高考连个屁都不是！',
    ],
    finale: {
      god: [
        '[辛美尔幻影]：封神，温柔刀刀见血。',
        '[找寻灵魂]：奥雷欧尔，那是我失落在题海里的青春灵魂。',
        '[无聊的旅程]：哪怕是这无聊的高三，我也想和你们一起走完。',
        '[芙莉莲的微笑]：为了这个微笑，今晚不刷题了。',
      ],
      bad: [
        '[催眠曲]：太慢热了，我看困了，但睡着了很安心。',
        '[魔族没有感情]：做题机器也没有感情。',
        '[修剪树枝]：比起做理综，我宁愿去给村长家修剪树枝。',
        '[狗熊的寿命]：狗熊这种祸害肯定遗千年，跟精灵一样长命。',
      ],
      mixed: [
        '[精灵的迟钝]：芙莉莲的感情迟钝，跟做题做傻了的我们有拼。',
        '[师傅的教诲]：弗兰梅的教诲：隐藏你的实力，然后扮猪吃老虎。',
        '[魔法使的资格]：一等魔法使考试=合肥一中保送生资格选拔。',
        '[赞因的后悔]：现在不去砸教务处，以后一定会后悔的！',
      ],
    },
    hooks: [
      { min: 8, text: '[无用的魔法]：无用的魔法居然真的有用。' },
      { min: 0, max: 4, text: '[做题的意义]：时间拉长后，题海也显得荒唐。' },
    ],
    ambient: [
      '[弹幕系统]：速度自动降低，进入慢速共鸣模式。',
      '[关键词]：记忆、遗憾、继续前行。',
      '[礼堂监测]：出现大面积静默观看。',
    ],
  },
  bochi: {
    opening: [
      '[卷豪的草稿纸]：卧槽……这粉色头发、成天躲在壁橱里的家伙，不就是我吗？！',
      '[社恐晚期]：只要给我一把吉他，我就能砸烂封安保的头！',
      '[艺术礼堂常客]：熊哥，我们要不要也组个乐队？叫“做题家结束乐队”。',
      '[赛博幽灵波奇]：波奇的内心小剧场，比狗熊的白板推演还丰富。',
      '[社交牛逼症]：喜多同学这种现充，在合一肯定被吕波汉第一个清洗！',
      '[芒果纸箱]：急求一个同款芒果纸箱！我好躲进去躲避班主任的视线！',
      '[吉他英雄]：网上重拳出击，现实唯唯诺诺。这是全合一男生的写照。',
      '[物理崩坏]：波奇融化成一滩烂泥的物理引擎，比我们做错压轴题时的心态还崩。',
      '[被现充包围]：波奇就像误入了自由派聚会的重度做题家，格格不入。',
      '[承认欲求怪兽]：点赞！给我点赞！不给我点赞我就毁灭这个学校！',
    ],
    climax: [
      '[文化祭演出]：合一的文化祭只允许合唱《我和我的祖国》，没有摇滚。',
      '[吉他断弦]：断弦即兴那段帅炸了！卷豪，你也用铅笔表演个即兴算微积分吧！',
      '[纵身一跃]：波奇跳水的姿势，简直和狗熊被踹下讲台时一模一样！',
      '[女仆装]：波奇穿女仆装，那表情简直比杀了她还难受。',
      '[社恐的幻想]：波奇脑补自己被警察抓走，跟我脑补交白卷被处刑的画面一致。',
      '[无法沟通]：人类的悲欢并不相通，波奇只觉得他们吵闹。',
      '[阴暗爬行]：我平时在走廊里也是这么阴暗爬行的，生怕遇到老师。',
      '[如果我也能]：如果我也能像波奇一样勇敢踏出那一步，去特么的高考！',
      '[青春由我定义]：去你的升学率，我的青春我要用摇滚来定义！',
      '[做题蛆破防]：神番！这才是真正的属于失败者的赞歌！',
      '[狗熊的嫉妒]：熊哥你别酸了，波奇好歹有三个现充朋友，你只有一堆NPC。',
    ],
    finale: {
      god: [
        '[去他的吉他]：只要还有人在听，这破木吉他我就要一直弹下去！',
        '[为了忘却]：看波奇发癫，能让我短暂忘却明天还要交三套卷子的痛苦。',
        '[神作认证]：封神，失败者也能拥有舞台。',
        '[虹夏小天使]：如果没有虹夏，波奇现在估计还在垃圾桶里做题。',
      ],
      bad: [
        '[打工地狱]：在及第教育当免费劳动力，比在Livehouse打工惨多了。',
        '[借酒消愁]：没有酒，只能喝学校超市的劣质阿萨姆奶茶消愁。',
        '[乐队排练]：周末还要排练？我们周末在补习班。',
        '[滑稽的同类]：看到波奇这么惨，我突然觉得我这只有做题的人生也还能接受。',
      ],
      mixed: [
        '[星歌店长]：傲娇店长好帅！比吴蒴那种真冰山好多了。',
        '[广井前辈]：酒鬼前辈如果在合一，早被保卫科按在地上摩擦了。',
        '[合照剪刀手]：连剪刀手都比不好的波奇，太让人心疼了。',
        '[转滚轮]：波奇变成史莱姆转圈圈，精神污染极强。',
      ],
    },
    hooks: [
      { min: 8, text: '[壁橱警报]：壁橱崩塌，社恐战术已失效。' },
      { min: 0, max: 4, text: '[社恐晚期]：被分数规训的小波奇出现了。' },
    ],
    ambient: [
      '[弹幕系统]：笑声峰值上升。',
      '[关键词]：尴尬、勇气、同伴。',
      '[后排刷屏]：俺也一样。',
    ],
  },
  eva: {
    opening: [
      '[拒绝上机]：不能逃避！不能逃避！不能逃避（做题）！',
      '[真嗣的懦弱]：真嗣就跟被规训的做题家一样，被逼着上机（考试）。',
      '[豪邦的终极梦想]：人类补完计划，就是建立终极的无差别公社！',
      '[AT力场]：AT力场就是阶级壁垒，是心之壁，必须被革命砸碎！',
      '[司令的墨镜]：吴福军坐在监控室里的坐姿跟碇源堂一模一样！',
      '[凌波丽的微笑]：面对纠察队查寝，只要微笑就可以了。',
      '[明日香的骂声]：八嘎变态无路赛！吴蒴骂狗熊的时候就是这语气！',
      '[使徒来袭]：及第教育的还乡团就像使徒，一波接一波。',
      '[SEELE的石碑]：那几个老头子就像校董会，成天在幕后操纵。',
      '[死海文书]：五三就是合一的死海文书，记载了高考的终极命运。',
    ],
    climax: [
      '[LCL之海]：全都变成橙汁吧！没有成绩排名，没有分数高低，大家融为一体！',
      '[暴走初号机]：这哪是初号机暴走，这是吕波汉开启了狂暴清洗模式！',
      '[阳电子炮]：全校拉闸限电，就为了给雷天使来一发大的！',
      '[朗基努斯之枪]：王兆凯的遗物就是那把刺穿合一的朗基努斯之枪。',
      '[心理咨询室]：这不是看番，这是在艺术礼堂做强制集体心理治疗。',
      '[恭喜你]：恭喜你！恭喜你！恭喜王卷豪完成了合一补完！（集体鼓掌）',
      '[同步率400%]：我做理综的同步率如果能有400%，清华稳了。',
      '[灵魂的容器]：我们不是人，我们只是装载分数的容器罢了。',
      '[二号机被吃]：量产机吃二号机的画面太下饭了，呕……',
      '[卡巴拉生命树]：周洪斌在实验楼黑板上画过这个，原来是EVA同好！',
      '[十字架爆炸]：每一次爆炸都是一个做题家在深夜的崩溃。',
      '[适格者]：只有最能吃苦的卷王，才是合一的适格者。',
    ],
    finale: {
      god: [
        '[残酷天使的行动纲领]：这首歌应该定为新学生代表大会的会歌！',
        '[渚薰]：这才是真爱。兆凯对豪邦说：你值得我去爱。',
        '[真心为你]：剧场版更是重量级，痛但封神。',
        '[神化]：狗熊现在的精神状态，估计以为自己快要神化了。',
      ],
      bad: [
        '[精神污染]：导演你出来，这后两集到底在讲什么鬼东西？！',
        '[这啥玩意]：线稿？草图？制作组没钱了吧！跟我们革委会一样穷。',
        '[狗熊的补完]：把狗熊扔进LCL海里，都净化不了他那肮脏的灵魂。',
        '[大人的吻]：美里姐姐，我也想要大人的吻，然后再去考数学。',
      ],
      mixed: [
        '[冬月副司令]：豪邦是不是就是兆凯身边的冬月？一直在踩刹车。',
        '[使徒的核心]：只要打破了使徒的核心（教务处），战争就结束了。',
        '[N2地雷]：给行政楼扔一颗N2地雷吧，物理超度保皇派。',
        '[夏天的蝉鸣]：永远停留在夏天的第三新东京市，永远考不完的高三。',
      ],
    },
    hooks: [
      { min: 9, text: '[豪邦的终极梦想]：这就是人类补完的正确打开方式吗。' },
      { min: 0, max: 4, text: '[AT力场]：又开始 AT 力场互相隔绝了。' },
    ],
    ambient: [
      '[弹幕系统]：理智值波动增大。',
      '[礼堂监测]：沉默时间占比上升。',
      '[高频词]：逃避、连接、自我。',
    ],
  },
};

function getBarragePhase(progress: number): BarragePhase {
  if (progress < 35) return 'opening';
  if (progress < 85) return 'climax';
  return 'finale';
}

function getFinaleTone(score: number): FinaleTone {
  if (score <= 0) return 'mixed';
  if (score >= 8) return 'god';
  if (score <= 4) return 'bad';
  return 'mixed';
}

function buildBarragePool(workId: string, phase: BarragePhase, tone: FinaleTone, score: number): string[] {
  const script = BARRAGE_SCRIPTS[workId] || BARRAGE_SCRIPTS.demon_slayer;
  const phaseLines = phase === 'finale' ? script.finale[tone] : script[phase];
  const scoreHooks = script.hooks
    .filter((rule) => {
      if (typeof rule.min === 'number' && score < rule.min) return false;
      if (typeof rule.max === 'number' && score > rule.max) return false;
      return true;
    })
    .map((rule) => rule.text);
  return [...scoreHooks, ...phaseLines, ...script.ambient];
}

function parseTaggedBarrage(rawText: string): { user?: string; text: string } {
  const match = rawText.match(/^\[([^\]]+)\][：:]\s*(.+)$/);
  if (!match) {
    return { text: rawText };
  }
  return {
    user: match[1].trim(),
    text: match[2].trim(),
  };
}

function makeLiveBarrageItem(workId: string, phase: BarragePhase, tone: FinaleTone, score: number, suffix: string): LiveBarrageItem {
  const pool = buildBarragePool(workId, phase, tone, score);
  const rawText = pool[Math.floor(Math.random() * pool.length)] || '弹幕系统在线。';
  const parsed = parseTaggedBarrage(rawText);
  const user = parsed.user || BARRAGE_USERS[Math.floor(Math.random() * BARRAGE_USERS.length)] || '匿名观众';
  const text = parsed.text;
  return {
    id: `${workId}_${Date.now()}_${suffix}`,
    user,
    text,
    lane: Math.floor(Math.random() * 4),
    offset: Math.floor(Math.random() * 45),
  };
}

export default function CyberDeconstruction({ state, onClose, onInteract }: CyberDeconstructionProps) {
  const cdState = state.cyberDeconstruction || { level: 1, progress: 0, currentWork: 'demon_slayer', stage: 1, ratings: {}, reviewedWorks: [] };
  const gxState = state.gouxiongState || {
    sanity: 50,
    maxSanity: 100,
    affinities: { dabi: 0, maodun: 0, lante: 0, wushuo: 0 },
    unlockedCharacters: ['dabi'],
    chats: {},
  };
  const currentWorkData = WORKS.find(w => w.id === cdState.currentWork) || WORKS[0];
  const currentRating = cdState.ratings?.[currentWorkData.id] || 0;
  const currentProgress = cdState.workProgress?.[currentWorkData.id] ?? cdState.progress ?? 0;
  const ratingUnlocked = !!state.flags?.gx_cyber_rating_online;
  const barragePhase = getBarragePhase(currentProgress);
  const finaleTone = getFinaleTone(currentRating);
  const phaseLabel = barragePhase === 'opening'
    ? '开场弹幕'
    : barragePhase === 'climax'
      ? '高潮弹幕'
      : finaleTone === 'god'
        ? '封神弹幕'
        : finaleTone === 'bad'
          ? '烂尾弹幕'
          : '收束弹幕';
  const [isBarrageVisible, setIsBarrageVisible] = React.useState(true);
  const [liveBarrage, setLiveBarrage] = React.useState<LiveBarrageItem[]>([]);
  const sanityPercent = Math.max(0, Math.min(100, (gxState.sanity / gxState.maxSanity) * 100));
  const sanityRatio = sanityPercent / 100;
  const arcRadius = 96;
  const arcLength = Math.PI * arcRadius;
  const arcOffset = arcLength * (1 - sanityRatio);
  const needleDeg = -180 + sanityRatio * 180;

  React.useEffect(() => {
    if (!isBarrageVisible) {
      setLiveBarrage([]);
      return;
    }
    const seed = Array.from({ length: 5 }).map((_, idx) =>
      makeLiveBarrageItem(currentWorkData.id, barragePhase, finaleTone, currentRating, `init_${idx}`)
    );
    setLiveBarrage(seed);
  }, [currentWorkData.id, barragePhase, finaleTone, currentRating, isBarrageVisible]);

  React.useEffect(() => {
    if (!isBarrageVisible) {
      return;
    }
    const timer = setInterval(() => {
      setLiveBarrage((prevList) => {
        const next = [
          ...prevList,
          makeLiveBarrageItem(currentWorkData.id, barragePhase, finaleTone, currentRating, `tick_${prevList.length}`),
        ];
        return next.slice(-9);
      });
    }, 1300);

    return () => clearInterval(timer);
  }, [currentWorkData.id, barragePhase, finaleTone, currentRating, isBarrageVisible]);

  const handleDeconstruct = () => {
    if (state.stats.pp >= currentWorkData.cost) {
      onInteract('cyber_deconstruct', { workId: currentWorkData.id, cost: currentWorkData.cost });
    }
  };

  const handleRate = (score: number) => {
    onInteract('cyber_rate', { workId: currentWorkData.id, score });
  };

  const handleNextWork = () => {
    onInteract('cyber_next_work');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border-2 border-[#ec4899] w-full max-w-7xl flex flex-col shadow-[0_0_30px_rgba(236,72,153,0.3)] animate-fade-in relative overflow-hidden">

        {/* Header */}
        <div className="p-4 border-b border-[#ec4899] bg-[#ec4899]/10 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-[#ec4899]" />
            <h2 className="text-[#ec4899] font-bold text-xl tracking-widest font-serif">赛博解构系统</h2>
          </div>
          <button onClick={onClose} className="text-[#ec4899] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 grid grid-cols-1 xl:grid-cols-[1.05fr_1.25fr_0.75fr] gap-4 md:gap-6 relative z-10">
          <div className="space-y-4 md:space-y-5">
            <div className="text-sm text-[#c084fc] italic">“先打分，再解构。先解构，再回血。” —— 狗熊</div>

            <div className="border border-[#7c3aed] bg-black/40 p-4 rounded-xl">
              <div className="text-xs text-[#a78bfa] mb-2">狗熊理智度（180度扇形深度计）</div>
              <div className="w-56 h-32 mx-auto relative">
                <svg viewBox="0 0 224 120" className="w-full h-full">
                  <path
                    d="M16 112 A96 96 0 0 1 208 112"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 112 A96 96 0 0 1 208 112"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${arcLength} ${arcLength}`}
                    strokeDashoffset={arcOffset}
                    style={{ transition: 'stroke-dashoffset 420ms ease' }}
                  />
                </svg>
                <div className="absolute left-1/2 bottom-2 w-[92px] h-[2px] -translate-x-1/2 bg-zinc-700"></div>
                <div
                  className="absolute left-1/2 bottom-2 w-[70px] h-[2px] origin-left bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.65)]"
                  style={{ transform: `rotate(${needleDeg}deg)` }}
                ></div>
                <div className="absolute left-1/2 bottom-2 -translate-x-1/2 text-center">
                  <div className="inline-flex items-center justify-center min-w-[64px] px-2 py-1 rounded-md bg-black/75 border border-[#22c55e]/50 shadow-[0_0_10px_rgba(34,197,94,0.35)]">
                    <span className="text-2xl font-bold text-[#22c55e] drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">{Math.round(sanityPercent)}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">SANITY</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-tno-text/60">当前解构等级: <span className="text-[#ec4899] font-bold">Lv.{cdState.level}</span></div>

            <div className="border border-[#c084fc] bg-black/50 p-4 rounded-xl">
              <div className="text-xs text-[#c084fc] mb-2">当前目标番剧</div>
              <h3 className="text-2xl font-bold text-[#ec4899] mb-1">{currentWorkData.name}</h3>
              <p className="text-sm text-tno-text/80 italic">{currentWorkData.desc}</p>
              <div className="mt-3 text-xs text-zinc-300">解构成本: <span className="text-[#ec4899] font-bold">{currentWorkData.cost} PP</span></div>
              <div className="mt-1 text-xs text-zinc-300">当前评分: <span className="text-yellow-400 font-bold">{currentRating || '未评分'}</span></div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#c084fc]">
                <span>解构进度</span>
                <span>{currentProgress}%</span>
              </div>
              <div className="w-full h-2 bg-black border border-[#c084fc] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ec4899] transition-all duration-500"
                  style={{ width: `${currentProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleDeconstruct}
                disabled={state.stats.pp < currentWorkData.cost || (ratingUnlocked && !currentRating)}
                className={`p-3 border flex flex-col items-center justify-center gap-2 transition-all rounded-xl ${
                  state.stats.pp >= currentWorkData.cost && (ratingUnlocked ? !!currentRating : true)
                    ? 'border-[#ec4899] text-[#ec4899] hover:bg-[#ec4899] hover:text-black'
                    : 'border-zinc-700 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Zap className="w-6 h-6" />
                <span className="font-bold text-xs">解构并恢复理智</span>
                <span className="text-[10px] opacity-80">消耗 {currentWorkData.cost}PP{ratingUnlocked ? '，需要先评分' : ''}</span>
              </button>

              <button
                onClick={handleNextWork}
                disabled={currentProgress < 100}
                className={`p-3 border flex flex-col items-center justify-center gap-2 transition-all rounded-xl ${
                  currentProgress >= 100
                    ? 'border-[#c084fc] text-[#c084fc] hover:bg-[#c084fc] hover:text-black'
                    : 'border-zinc-700 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Eye className="w-6 h-6" />
                <span className="font-bold text-xs">切换下一部番</span>
                <span className="text-[10px] opacity-80">100%后可切换</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-[#ec4899]/45 min-h-[360px] md:min-h-[520px] shadow-[inset_0_0_80px_rgba(0,0,0,0.35)]">
              <img src={currentWorkData.poster} alt={currentWorkData.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_45%),radial-gradient(circle_at_80%_75%,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_50%)]"></div>
              <div className="absolute inset-0 bg-black/38"></div>
              <div className="absolute left-0 right-0 top-0 px-4 pt-4 z-30 flex items-center justify-between gap-3">
                <div className="border border-white/35 bg-black/45 px-2.5 py-1.5 text-xs text-white/95 backdrop-blur-sm">
                  <span className="opacity-70 mr-2">弹幕阶段</span>
                  <span className="font-semibold text-[#f9a8d4]">{phaseLabel}</span>
                </div>
                <button
                  onClick={() => setIsBarrageVisible((v) => !v)}
                  className="inline-flex items-center gap-1.5 border border-white/35 bg-black/45 px-2.5 py-1.5 text-xs text-white/95 hover:bg-black/60 transition-colors"
                >
                  {isBarrageVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isBarrageVisible ? '关闭弹幕' : '开启弹幕'}</span>
                </button>
              </div>

              {isBarrageVisible && (
                <div className="absolute left-0 right-0 top-12 px-4 pt-2 pointer-events-none space-y-2 z-20">
                  {liveBarrage.map((line, index) => (
                    <span
                      key={line.id}
                      className="block w-fit max-w-[88%] rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] leading-none text-white/95 backdrop-blur-sm shadow-[0_0_16px_rgba(0,0,0,0.25)]"
                      style={{ marginLeft: `${line.offset}%`, opacity: Math.max(0.45, 0.95 - index * 0.07), transform: `translateY(${line.lane * 2}px)` }}
                    >
                      <span className="mr-1 text-[#f9a8d4]">@{line.user}:</span>
                      {line.text}
                    </span>
                  ))}
                </div>
              )}

              {!isBarrageVisible && (
                <div className="absolute inset-0 p-5 md:p-7 flex flex-col justify-between z-20">
                <div>
                  <div className="inline-flex items-center gap-2 px-2 py-1 border border-white/40 bg-black/30 text-[10px] tracking-wider text-white/90">
                    <Film className="w-3.5 h-3.5" />
                    SELECTED TITLE
                  </div>
                  <h3 className="mt-4 text-3xl md:text-5xl font-black tracking-wide text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.65)]">{currentWorkData.name}</h3>
                  <p className="mt-3 max-w-xl text-sm md:text-base text-white/90 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                    {currentWorkData.desc}
                  </p>
                </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-white/95">
                  <div className="border border-white/35 bg-black/30 p-2.5">
                    <div className="opacity-70">当前评分</div>
                    <div className="font-bold text-lg">{currentRating || '--'}</div>
                  </div>
                  <div className="border border-white/35 bg-black/30 p-2.5">
                    <div className="opacity-70">解构进度</div>
                    <div className="font-bold text-lg">{currentProgress}%</div>
                  </div>
                </div>
              </div>
              )}
            </div>

            <div className="border border-[#f59e0b]/40 bg-black/40 p-4 rounded-xl">
              <div className="text-xs text-[#f59e0b] mb-2">番剧评价打分环节（1-10）</div>
              {!ratingUnlocked && (
                <div className="text-xs text-zinc-400 border border-zinc-700 rounded-lg px-3 py-2">
                  当前尚未建立评分协议，先完成相关国策后再进行打分。
                </div>
              )}
              {ratingUnlocked && (
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleRate(score)}
                      className={`px-2 py-2 text-xs rounded-lg border transition ${currentRating === score ? 'border-yellow-400 bg-yellow-400/15 text-yellow-300' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}
                    >
                      <Star className="w-3 h-3 inline mr-1" />
                      {score}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="border border-[#3f3f46] bg-zinc-950/70 p-3 rounded-xl h-full min-h-[320px]">
              <div className="text-xs text-zinc-400 mb-2">已上线番剧列表</div>
              <div className="flex flex-col gap-2 text-xs max-h-[62vh] overflow-y-auto pr-1">
                {WORKS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => onInteract('cyber_select_work', { workId: w.id })}
                    className={`px-2.5 py-2.5 rounded border text-left transition ${cdState.currentWork === w.id ? 'border-pink-500 text-pink-300 bg-pink-500/10 shadow-[0_0_12px_rgba(236,72,153,0.25)]' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={w.poster} alt={w.name} className="w-10 h-14 object-cover rounded border border-zinc-700" />
                      <div>
                        <div className="font-semibold">{w.name}</div>
                        <div className="mt-0.5 text-[10px] opacity-70">评分: {cdState.ratings?.[w.id] || '-'}</div>
                        <div className="text-[10px] opacity-70">进度: {cdState.workProgress?.[w.id] || 0}%</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
