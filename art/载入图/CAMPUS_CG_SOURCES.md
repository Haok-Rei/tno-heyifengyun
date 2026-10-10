# 校园风景 CG · 2026-10-09

这两幅图使用内置 `image_gen` 生成，属于参考校园建筑后重新绘制的游戏插画。官网照片只用于建筑和地点参考，不作为新增画作直接发布；原照片未声明开放授权，不能据此视为公共领域或 CC 素材。

| 游戏画作 | 建筑参考 | 原始照片 | 网页版本 |
| --- | --- | --- | --- |
| 滨湖晨光 | 合肥一中滨湖校门，学校官网《雏羽，矫翮》 | [来源文章](https://www.hfyz.net/xwgk/xydt/288676.html)，[图片](https://www.hfyz.net/group1/M00/00/9D/wKgEEGMhqFuAamDAAACVnzdoJkg377.jpg) | `src/assets/loading/滨湖晨光.webp` |
| 端馥晚照 | 滨湖校区端馥堂，学校官网毕业生故事 | [来源文章](https://www.hfyz.net/dyyd/dyzx/xwzl/290449.html)，[图片](https://www.hfyz.net/group1/M00/01/56/wKgEEGSXrGSARdizAAs-HpgESaQ288.png) | `src/assets/loading/端馥晚照.webp` |

新增 PNG 源文件保存在本目录。运行 `scripts/build_loading_art.py` 可重新生成 WebP 和载入素材目录，文件名必须与 `src/data/artGallery.ts` 一致。

## 生成提示词：滨湖晨光

Generate one finished landscape loading-screen CG for the narrative strategy game TNO：合肥一中风云. Use the attached real Hefei No.1 High School Binhu campus gate photograph only as architectural/location reference. Reinterpret it as a detailed, mature cinematic oil-and-ink illustration with realistic architecture and rich textured brushwork, like a somber archival painting for a grand-strategy game. Wide 16:9 landscape, no frame, no interface, no captions, no logo. Preserve the distinctive red rectangular pillars, white broad lintel bearing exactly 合肥一中 in restrained gold Chinese characters, administrative building aligned behind the gate, roadside fence and trees. Widen the viewpoint naturally into a convincing campus street landscape with subtle perspective. Early autumn morning, cool slate-blue shadows and warm amber sunlight through trees, slightly hazy quiet air, a few distant anonymous students in pale uniforms walking to school with bags, no recognizable faces. School feels inhabited, dignified, restrained and grounded, not futuristic or anime. Precise masonry, natural foliage, faint road reflections, atmospheric depth. No political symbols, banners, leaders, protests, weapons or flags. Keep topmost 12% and bottommost 20% unobtrusive enough for existing loading overlays. This is a newly illustrated fictional game CG inspired by campus architecture, not a documentary photograph. Output exactly a single image.

## 生成提示词：端馥晚照

Create exactly one premium landscape game CG for TNO：合肥一中风云, 16:9, a mature cinematic oil-and-ink archival illustration, detailed realistic architecture, subtle textured brushwork and atmospheric depth. The attached real photograph is an architectural reference of Hefei No.1 High School Binhu campus Duanfu Hall. Preserve the recognizable broad projecting white concrete roof, long row of tall white rectangular columns, black glazing in deep shade and distinctive red zig-zag exterior staircase behind the columns. Retain convincing two-point perspective and the recognizable corner viewpoint, but expand into a harmonious wide campus landscape. Quiet late-summer dusk after school, desaturated teal-blue sky, amber light glowing in selected glass windows and along the staircase, trees and low planting beds around the plaza, subtle violet twilight, warm stone pavement after a brief rain. A few tiny anonymous uniformed students walk toward the hall carrying sketch folders; emphasize school architecture and environment, faces not discernible. Buildings remain grounded and believable, no science fiction, no anime, no cartoon, no flat vector. No banners, political symbols, flags, recognizable politicians, weapons or protests. Small building signage may read only 端馥堂, no extra readable text. No frame, no UI, no logo, no captions. Keep uppermost 12% and bottommost 20% visually quiet enough for game loading overlays. Match the refined cinematic mood and detailed painterly realism of the autumn campus gate CG from this conversation without reusing its composition. A newly illustrated fictional campus game scene, not a documentary photograph.

## 收藏与载入规则

- 当前版本共 42 幅画作，均列于 `src/data/artGallery.ts`；路线入口、完成国策、具体事件和结局分别作为剧情图的解锁依据。2026-10-10 新增 18 幅，详见 [扩充批次与完整提示词](CG_EXPANSION_2026-10-10.md)。
- 7 幅校园风景初始开放，无须开局；4 幅序章画作在开始游戏后收录；结局差分不会仅因进入其路线而全部开放。
- 解锁记录使用 `heyi_art_unlocks_v1`，跨局保留；旧结局档案及已加载存档的路线历史可补充证明。旧“已阅”标记不等于解锁。
- 通知成批排队，右下角显示 6.5 秒，可关闭。教程中延后显示，不改变游戏时间、国策或事件。
- 每张载入画面独立抽取类别：未解锁预览 30%，已解锁画作 70%。类内均匀抽取，尽量避免相邻重复；未解锁类别为空时回退已解锁。仅加载本次轮换的少量图像。
- 载入展示未解锁画作不写入收藏记录，画面标注“未收录预览”；美术室仍显示剧情收录条件。
