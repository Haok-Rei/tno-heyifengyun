# 素材维护与来源

## 已包含

- 完整的 `art/` 原图、`music/` 歌曲，以及 `src/assets/` 中已实装的美术和音效。
- `src/config/` 中的映射与国策/精神分配清单。
- 原有素材来源与署名文件，另外生成 `public/credits.txt` 供实际网站访问。

## 添加或修改素材

### 音乐

把 `.mp3` 文件放在 `music/` 顶层，播放器按文件名自动建立歌单。删除歌曲时同步删除相应文件即可。部署输出中的单文件不得超过 25 MiB，构建会检查。

### 人像

更新 `art/人像/` 原图，以及 `src/config/localPortraits.ts` 和相关映射。沿用原文件名可直接替换图片。检查完整名称、扩展名和大小写。

### 载入图与超事件图

原图位于 `art/载入图/`，游戏使用 `src/assets/loading/` 的 WebP。需要重新生成时，在仓库根目录运行：

```sh
python -m pip install -r scripts/requirements-art.txt
python scripts/build_loading_art.py
```

该脚本同时重新生成载入图映射和 Logo。超事件图片映射位于 `src/config/assets.ts`，按剧情修改对应关系。

### 国策与国家精神

已使用的图标全部在 `src/assets/hoi4/`，不依赖外部素材库即可构建。`src/config/artAssignments.json` 记录图标分配。

如果要运行 `python scripts/assign_strategic_art.py`，先将自己下载的 `Ultimate-HOI4-GFX-master` 放在仓库根目录，使 `Focus & National Spirits Pieces` 路径与脚本一致。原始 Photoshop 模板和未实装组件未放进发布目录，避免每次上传整套设计库；该可选目录已被 Git 忽略。

生成后提交 `src/assets/hoi4/expanded/`、`src/config/artAssignments.json` 和 `src/config/expandedArtwork.ts` 的变化。

## 来源与授权记录

| 内容 | 记录 |
| --- | --- |
| HOI4/TNO 图标组件 | `src/assets/hoi4/CREDITS.txt`；来源 `Globvs/Ultimate-HOI4-GFX` |
| 按钮音效 | `src/assets/sfx/SOURCE.md`、`KENNEY_LICENSE.txt`；Kenney Interface Sounds，CC0 |
| 超事件音效 | `src/assets/superevent/CREDITS.md`；包含 CC0 与要求署名的 CC BY 素材 |
| 人像、原图与音乐 | 原项目提供的文件；没有因整理而改变其授权 |
| 原有占位事件图 | 继续使用项目现有的外部图片链接 |

后续新增第三方素材时，把作者、来源链接、许可证和所作修改一起记入对应来源文件，并更新 `public/credits.txt`。该发布目录没有为全部素材统一声明 MIT 或其他新许可证。
