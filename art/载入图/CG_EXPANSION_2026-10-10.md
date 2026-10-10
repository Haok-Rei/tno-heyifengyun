# CG 扩充 · 2026-10-10

本批使用**内置 image_gen**制作18幅新游戏插画：5幅校园风景、13幅路线剧情图。连同既有24幅，当前图库共42幅，其中7幅校园风景在新设备上默认开放。全部保留PNG源图，游戏使用WebP版本。

风格采用细致建筑、真实材质、深色阴影和克制的暖冷光，延续「滨湖晨光」的绘画风格。路线图分别描绘油印、大会、投票、题改、公社、档案、批卷、产业化印刷、礼堂、夜巡与空教室；人物均为虚构、匿名的场景人物。

## 收录与载入

- 新风景图初始开放，不需要开局，也不发送解锁成就。
- 剧情图以 `src/data/artGallery.ts` 的实际国策、事件、路线和结局条件收录；未收录时，美术室隐藏图片并展示条件。
- **每张载入图独立抽取：30%未解锁预览，70%已解锁画作**。类内均匀抽取，尽量避开上一张；全收集后自动回退已解锁池。
- 未解锁预览标注“未收录预览”，不写入收藏。每次只预载本次轮换需要的图像。
- 大会、大选结果、公社试点、教辅研发部、杨玉乐办公桌事件，以及及第帝国和绝望终局，使用本批对应图像；其他原有超事件图保留。

## 新增画作

| 画作 | 路线 | 收录节点 | 文件 |
| --- | --- | --- | --- |
| 雨过校门 | 校园 | 初始开放 | `雨过校门.png` / `src/assets/loading/雨过校门.webp` |
| 图书长廊 | 校园 | 初始开放 | `图书长廊.png` / `src/assets/loading/图书长廊.webp` |
| 操场晚晴 | 校园 | 初始开放 | `操场晚晴.png` / `src/assets/loading/操场晚晴.webp` |
| 梧桐秋径 | 校园 | 初始开放 | `梧桐秋径.png` / `src/assets/loading/梧桐秋径.webp` |
| B3夜读 | 校园 | 初始开放 | `B3夜读.png` / `src/assets/loading/B3夜读.webp` |
| 街垒黎明 | 联合革命 | B3起义 / 联合革委会阶段 | `街垒黎明.png` / `src/assets/loading/街垒黎明.webp` |
| 油印机之夜 | 联合革命 | 地下印刷网络 | `油印机之夜.png` / `src/assets/loading/油印机之夜.webp` |
| 议场初开 | 民主 | 扩大学生代表大会 | `议场初开.png` / `src/assets/loading/议场初开.webp` |
| 第一张选票 | 民主 | 第一次民主普选完成 / 大选结果 | `第一张选票.png` / `src/assets/loading/第一张选票.webp` |
| 课桌上的改革 | 做题改革 | 建立新评价体系 | `课桌上的改革.png` / `src/assets/loading/课桌上的改革.webp` |
| 公社的长桌 | 豪邦 | 地区公社试点网络 | `公社的长桌.png` / `src/assets/loading/公社的长桌.webp` |
| 名单之外 | N.K.P.D. | 大清洗行动 | `名单之外.png` / `src/assets/loading/名单之外.webp` |
| 保温杯与红批 | 杨玉乐 | 进入杨玉乐路线 | `保温杯与红批.png` / `src/assets/loading/保温杯与红批.webp` |
| 密卷流水线 | 及第 | 组建教辅研发部 | `密卷流水线.png` / `src/assets/loading/密卷流水线.webp` |
| 企业学校的黄昏 | 及第 | 企业乌托邦 / 及第帝国 | `企业学校的黄昏.png` / `src/assets/loading/企业学校的黄昏.webp` |
| 银幕仍亮 | 狗熊 | 艺术礼堂争夺战 | `银幕仍亮.png` / `src/assets/loading/银幕仍亮.webp` |
| 熄灯后的脚步 | 吴福军 | 夜巡纠察队 | `熄灯后的脚步.png` / `src/assets/loading/熄灯后的脚步.webp` |
| 最后一间教室 | 绝望 | 进入绝望路线 | `最后一间教室.png` / `src/assets/loading/最后一间教室.webp` |

## 建筑参考与来源

学校官网照片仅供建筑、场地和材质参考，未直接作为新CG发布，原照片未声明开放授权。图书长廊、B3夜读及多数剧情室内场景为校园空间意象的虚构重绘，不作为实景记录。风格参考为项目既有生成插画 `art/载入图/滨湖晨光.png`。

- `gate.jpg`：[滨湖校门](https://www.hfyz.net/xwgk/xydt/288676.html)，原图 `http://www.hfyz.net/group1/M00/00/9D/wKgEEGMhqFuAamDAAACVnzdoJkg377.jpg`
- `track.png`：[滨湖操场与端馥堂](https://www.hfyz.net/xwgk/xydt/291369.html)，参考照片 `http://www.hfyz.net/group1/M00/01/C0/wKgEEGWJLv2AUp0hAAWW4GqsyTE485.png`；仅参考建筑及场地，不发布拼图
- `graduation-3.png`：[B2教学楼与校园小亭](https://www.hfyz.net/dyyd/dyzx/xwzl/290449.html)，原图 `http://www.hfyz.net/group1/M00/01/56/wKgEEGSXrGeAB8xfAAw_tIrkC3o213.png`
- `opening-3.png`：[校园食堂](https://www.hfyz.net/xwgk/xydt/288676.html)，原图 `http://www.hfyz.net/group1/M00/00/9D/wKgEEGMhqIOAOK9bAAuISh_Ze4Y194.png`

## 完整生成提示词

### 雨过校门

参考图：[滨湖校门](https://www.hfyz.net/xwgk/xydt/288676.html)，原图 `http://www.hfyz.net/group1/M00/00/9D/wKgEEGMhqFuAamDAAACVnzdoJkg377.jpg`；「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG named 雨过校门 for the mature narrative strategy game TNO：合肥一中风云. Architectural reference: the supplied Hefei No.1 High School Binhu campus gate photograph. Style reference: supplied 滨湖晨光 illustration, but make this a clearly new composition rather than a recolor. Cinematic archival oil painting with finely drawn realistic structures, tactile brush texture, deep darks, restrained saturated accents, not photorealistic, not anime, not flat vector. Wide three-quarter street-corner view of the familiar red rectangular gate and pale stone lintel with exactly 合肥一中 in gold, administrative building visible through the opening. After rain at blue hour: wet tarmac, cool indigo shadow, slender amber reflections from the guardhouse, a few anonymous students with umbrellas seen small from behind, roadside plane trees and leaves, receding sidewalk. Believable architectural perspective, atmospheric depth, carefully detailed fence and masonry. Neutral everyday campus scenery, no propaganda, politicians, banners, flags, violence or weapons. No captions, UI, frames or logos; keep top 12% and lower 20% visually quiet for existing overlays. Output a single landscape painting.
```

### 图书长廊

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 图书长廊. A quietly luminous school library corridor after a light spring shower, polished worn terrazzo, pale cream columns, long oak bookcases and reading tables receding diagonally, arched garden windows on one side, rain droplets and fresh trees outside. A few anonymous students browsing shelves or reading quietly, one librarian returning books on a wheeled cart. Realistic school materials and visible book spines without legible text, reflected green and amber light. A fictional interior inspired by the Binhu campus, not a claimed documentary copy. Intimate, calm, spacious, no political symbolism.
```

### 操场晚晴

参考图：[滨湖操场与端馥堂](https://www.hfyz.net/xwgk/xydt/291369.html)，参考照片 `http://www.hfyz.net/group1/M00/01/C0/wKgEEGWJLv2AUp0hAAWW4GqsyTE485.png`；仅参考建筑及场地，不发布拼图；「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 操场晚晴. Use only the RIGHT photograph of the supplied two-panel campus athletics reference for architectural and spatial identity; do NOT output a collage. A panoramic low three-quarter view along the Binhu campus red athletics track after afternoon rain at sunset, green field, distant pale teaching buildings, city skyline far beyond, several tiny joggers and a few students carrying sports equipment, no marching formation. Golden sky opening after blue rain clouds, puddles along the inside track reflect light, precise lane markings recede in perspective. Everyday school scenery, no banners or slogans.
```

### 梧桐秋径

参考图：[B2教学楼与校园小亭](https://www.hfyz.net/dyyd/dyzx/xwzl/290449.html)，原图 `http://www.hfyz.net/group1/M00/01/56/wKgEEGSXrGeAB8xfAAw_tIrkC3o213.png`；「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 梧桐秋径. The supplied actual campus photograph is an architecture reference for a small dark-wood Chinese garden pavilion in front of a pale cream multi-storey school building. Paint a new wide-angle three-quarter scene on a crisp late-autumn afternoon, a winding footpath receding under plane trees, fallen ochre leaves, richly detailed pavilion eaves and stone benches, low shrubs, warm light cutting through branches and deep cool shadows. Two small anonymous students carrying books walk toward the pavilion. Quiet everyday campus scenery, no slogans or flags.
```

### B3夜读

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: B3夜读. A night view across a school courtyard toward a detailed red-brick and pale-concrete teaching block labelled only B3 in a small architectural plaque. Strong diagonal perspective, lit classroom windows reveal tiny seated student silhouettes and blackboards, uneven warm yellow lights, a few dark classrooms, bicycles under trees, a lone teacher crossing the foreground with papers. Midnight blue sky and faint violet haze, warm windows against cool building edges. Dense realistic architectural detail, not a flat facade. Everyday study, no political symbols.
```

### 街垒黎明

参考图：[滨湖校门](https://www.hfyz.net/xwgk/xydt/288676.html)，原图 `http://www.hfyz.net/group1/M00/00/9D/wKgEEGMhqFuAamDAAACVnzdoJkg377.jpg`；「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 街垒黎明. Route scene: the first morning after students occupy B3 and form the Joint Revolutionary Committee. The familiar red Binhu campus gate seen diagonally, improvised low barricades of movable desks and noticeboards along a side path, exhausted anonymous students sharing thermos tea, one student repairing a hand-painted red cloth banner with no readable words, another opening the gate for classmates. Pale dawn rays and deep burgundy cloth, red ink papers, a school still waking behind them. A tense hopeful aftermath, not armed warfare, no weapons or graphic injuries. School architecture grounded in supplied gate photograph. Mature story scene, no propaganda poster composition.
```

### 油印机之夜

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 油印机之夜. Route scene: an underground student printing group in a cramped school laboratory storage room at 2am. Close wide three-quarter view of a heavy old hand-operated mimeograph and ink-stained wooden table, fresh sheets hanging on cords, stacked stencil folders, chipped green desk lamp. Three anonymous tired students seen obliquely work together, one turns the machine handle, one aligns paper, one listens at the door. Deep black hallway beyond, restrained crimson ink, brass lamp glow, dark cyan night. Detailed believable mechanisms and hands, readable texture rather than legible essay text. Quiet suspense, no weapons.
```

### 议场初开

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 议场初开. Route scene: the first expanded student representative assembly held in a converted school auditorium. View from near the back of a semicircular room, rows of modest wooden school desks form a broad horseshoe rather than a parliament palace, anonymous delegates exchange documents and raise their hands, a lone small speaker stands beside a worn chalkboard, daylight enters high side windows. Blue-gray walls, warm honey wooden desks, desaturated red seat backs. Distinct faces small, dignified realism, human scale and believable detailed perspective. No leader portrait, real party insignia, propaganda banner or readable giant slogans.
```

### 第一张选票

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 第一张选票. Route scene: the first student election in the school. Intimate wide scene in a bright classroom serving as a polling station, late-morning sunlight, anonymous student in ordinary school uniform seen from behind dropping a folded ballot into a simple transparent sealed box on a wooden table, student volunteers checking a paper roster, several classmates queue quietly in the corridor beyond. Foreground ballot box and hands sharply detailed, hopeful soft jade, amber and cream palette. Noticeboard uses non-readable small marks, no real political party insignia or flags. A credible school civic moment, not a propaganda celebration.
```

### 课桌上的改革

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 课桌上的改革. Route scene: the study-reform working group trying a genuinely different lesson in a Hefei school classroom. Four school desks pushed together into a worktable, teachers and students collaboratively rearrange sample test sheets, handmade learning aids, laboratory equipment and books. One old towering stack of repetitive exams sits aside, a student demonstrates a small experiment to classmates while a teacher listens. Strong oblique view, dense tactile paper and chalk dust, late afternoon slanting amber light against deep jade classroom shadows. Quiet social reform through actual daily work, no political banners, no readable essays, no giant idealistic mural.
```

### 公社的长桌

参考图：[校园食堂](https://www.hfyz.net/xwgk/xydt/288676.html)，原图 `http://www.hfyz.net/group1/M00/00/9D/wKgEEGMhqIOAOK9bAAuISh_Ze4Y194.png`；「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 公社的长桌. Route scene: Haobang's pilot campus communes negotiate their daily arrangements. The provided campus canteen photograph is architectural reference only. A long everyday school canteen table at dusk, anonymous students from different dormitories and a teacher representative discuss a hand-drawn campus plan, bowls and trays still at the table edge, folded proposal sheets, a small red cloth pinned unobtrusively to a column. Composition runs along the table to large windows looking onto school grounds, warm pendant lamps, restrained dark red and aged green, believable human interaction and detailed hands. Collegial but argumentative, no leader worship or marching crowd.
```

### 名单之外

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 名单之外. Route scene: the N.K.P.D. office's tightening administrative control, conveyed through a quiet still-life and architecture. A deserted dim school records office at night, two black metal filing cabinets, desk covered in carefully sorted student registers and index cards, heavy rotary phone, an empty chair half-pulled away and a single sealed maroon folder centered under a harsh desk lamp. Behind frosted glass, a blurred silhouette carries another file down the corridor. Oblique perspective, dark graphite, cold green lamp light and small muted red seal accents. Handwritten registers implied with illegible marks, no identifiable personal data. Uneasy procedural power, no weapons, bodies or graphic violence.
```

### 保温杯与红批

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 保温杯与红批. Route scene: Yang Yule's office desk late at night, a cramped staff room with no person in frame. Foreground chipped dark wooden desk, tall insulated steel tea flask with its lid open, red marking pen resting on an exam with dense illegible handwritten corrections, small analog clock, worn chalk box, a carefully folded teacher's coat on the chair. Behind are mountains of test bundles and a school window reflecting the lamp. Detailed intimate tabletop composition with depth, warm red-brown lamp pool and cool rain-streaked midnight outside. Exhaustion and professional obsession, not comic caricature, no large text.
```

### 密卷流水线

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 密卷流水线. Route scene: the Jidi company builds its own exam research and production department inside the school. A long newly equipped print workshop beneath a former classroom's high windows, offset printing rollers, exam sheets moving through inspection tables, numbered paper bundles, employees and students checking proofs under strip lights, glassed-in office at the rear. Dramatic receding perspective and intricate real machinery, clinical teal and steel blue with small orange safety labels. Papers carry small illegible marks only. The school as a production system: efficient, fascinating and uncomfortable, not generic cyberpunk or a battlefield.
```

### 企业学校的黄昏

参考图：[滨湖校门](https://www.hfyz.net/xwgk/xydt/288676.html)，原图 `http://www.hfyz.net/group1/M00/00/9D/wKgEEGMhqFuAamDAAACVnzdoJkg377.jpg`；「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 企业学校的黄昏. Route scene: Jidi's completed corporate school at twilight, the familiar red Binhu gate reinterpreted as a controlled corporate entrance. Strong wide three-quarter view with rows of identical classroom windows behind, a small digital score panel rendered as abstract light segments, a polished security booth and turnstiles. Several weary students leave in single file, a parent waits outside holding a folded coat. Distant corporate glass office reflects the last amber sun while school grounds fall into cold cyan darkness. Rich realistic masonry, metal and reflections, subdued melancholy and rigid order. No readable brands or slogans, no violence or flames.
```

### 银幕仍亮

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 银幕仍亮. Route scene: Gouxiong's cyber-archive project inside the arts auditorium after hours. Oblique wide view across empty worn red theater seats toward a projection screen showing abstract colored pixel fragments and old campus photographs as indistinct geometric images. In the back booth, two anonymous student archivists work at aged computers and tangled cables, a projector beam crosses dust, one forgotten stage prop and a guitar lie near the curtains. A vibrant but controlled violet, dusty red, electric cyan and warm projection glow palette. Painterly realism, intricate theater architecture, no recognizable copyrighted characters or giant slogans.
```

### 熄灯后的脚步

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 熄灯后的脚步. Route scene: Wu Fujun's night-patrol policy in a school after lights out. A very long dark teaching-building corridor viewed diagonally, barred window shadows, worn green lower walls, locked classroom doors and wall clocks. Two anonymous staff patrol silhouettes at middle distance carry small flashlights and a clipboard, one flashlight beam picks out abandoned school shoes and an exercise book near a doorway. Farther away a single dormitory window stays lit. Deep indigo and graphite with narrow amber beams, exact architectural depth, quiet tense atmosphere. No weapons, no assault, no graphic content.
```

### 最后一间教室

参考图：「滨湖晨光」（风格参考）。

```text
Create one finished 16:9 loading-screen CG for TNO：合肥一中风云, a mature Chinese campus narrative strategy game. Use the supplied 滨湖晨光 image only as a painting-style reference: cinematic archival oil painting, finely drawn realistic structures, subtle tactile brush texture, deep darks, restrained saturated accents, complex natural lighting, atmospheric depth. A genuinely new composition, not a recolor. Believable perspective and anatomy. No flat vector, cartoon, anime, collage, UI, frame, watermarks or poster captions. All people fictional anonymous students/teachers; no recognizable portrait. Keep the top 12% and lower 20% sufficiently quiet for game overlays. Single continuous landscape scene. Scene title: 最后一间教室. Route scene: the despair branch, the last classroom still open in a nearly empty campus. View from the back corner of a dusty realistic classroom, rows of worn desks partly stacked, torn loose timetable papers on a cork board, an unlit ceiling lamp, one anonymous student sits small at the far window looking toward an empty school courtyard. A tiny pot plant on the window ledge, chalk eraser and uncollected exam papers. Muted ash gray, cold green and a narrow fading peach sunset. Deep perspective and intricate tactile surfaces, profound loneliness without melodrama. No self-harm, corpses or graphic violence. No text overlays.
```
