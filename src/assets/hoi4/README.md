# Ultimate HOI4 GFX 素材摘录

本目录的 47 张 PNG 来自用户放入项目根目录的 `Ultimate-HOI4-GFX-master`。只挑选合一风云实际会用到的透明图层与背景；原库的 PSD 和其他数百张图未打包进入游戏。图层按原文件名保留，便于追溯。

- `pieces/`：国策与国家精神的主题图层。
- `focus-backgrounds/`：国策图标底框原件，保留作后续美术参考；当前国策节点按界面需求直接显示透明图层，不叠加图标内框。
- `spirit-backgrounds/`：国家精神底框。
- `CREDITS.txt`：原库作者与贡献者说明。该文件写明素材经贡献者同意、可免费使用，但没有提供 SPDX 许可证标识；后续公开发布时应保留来源和贡献者信息。

游戏内的具体映射见 `src/config/hoi4Artwork.ts`。UI 仅在浏览器中叠加图层及处理色调，不改动这些原始 PNG。
