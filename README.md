# 合一风云 / The Hefei Order

这是可直接作为 **GitHub 仓库根目录** 使用的完整开发版本，默认面向 **Cloudflare Workers 静态资源** 部署，并提供 Pages 备用配置。剧情、地图、国策、工作组、小游戏、图片、音乐和音效均保留。

## 首次上传和上线

按 [部署与更新说明](DEPLOY.md) 操作。Cloudflare 设置摘要：

| 设置 | 值 |
| --- | --- |
| 服务 | Cloudflare Workers，连接 GitHub |
| 生产分支 | `main` |
| 项目根目录 | 留空：本文件夹的内容就是仓库根目录 |
| 构建命令 | `npm run build` |
| 静态资源目录 | `dist`，已写入 Wrangler 配置 |
| 正式部署命令 | `npx wrangler@4.141.0 deploy` |
| 非生产分支预览命令 | `npx wrangler@4.141.0 preview` |
| Node.js | `22.16.0`，已写入 `.node-version` |
| API 密钥 / 数据库 | 不需要 |

构建设置依据 [Cloudflare 官方配置文档](https://developers.cloudflare.com/workers/static-assets/)。

控制台 Worker 名称必须与 `wrangler.toml` 中的 `name` 一致。若使用 Pages，请按部署说明切换到 `wrangler.pages.toml` 配置。

## 本地开发

安装 Node.js 22 或更新的受支持版本，在本文件夹打开终端：

```sh
npm ci
npm run dev
```

打开终端显示的本地地址。修改文件后自动刷新。

```sh
npm run check
npm run preview
```

`check` 检查素材路径及大小写、TypeScript、回归测试和生产构建。`preview` 查看上一步生成的静态网站。

## 文案开发

[DeepSeek文案工作台](docs/writing/README.md)提供事件、新闻、人物、国家精神的分体裁写作、路线事实卡、编辑复核、安全入库和回退。API只用于本地开发，玩家端无需配置。

## 目录

| 路径 | 内容 / 更新位置 |
| --- | --- |
| `src/` | 游戏源码，含已实装的国策、精神、音效、载入图等资源 |
| `art/` | 原始人像、载入图及美术素材，供后期编辑与生成 |
| `music/` | 播放器歌单：顶层 `.mp3` 文件会自动收录 |
| `public/` | Cloudflare 缓存规则、网站素材鸣谢 |
| `scripts/` | 素材生成脚本、部署检查脚本 |
| `tests/` | 游戏机制与素材回归测试 |
| `docs/` | 游戏设计说明与原始剧情文档 |
| `CHARACTERS.md` / `DEVELOPER_GUIDE.md` | 人物设定和开发参考 |
| `CHANGELOG.md` | 游戏更新日志 |
| `release-manifest.json` | 整理时的文件清单与校验值；不是游戏运行配置 |

素材生成说明见 [素材维护说明](docs/ASSET_MAINTENANCE.md)。已实装素材随源码提供，部署不需要运行 Python，也不需要下载完整 Ultimate-HOI4-GFX 库。

存档与设置保存在玩家浏览器的本地存储中。更新同一个网站地址可继续读取；更换域名或浏览器不会自动搬迁存档。部分原有事件占位图仍使用外部图片服务。

源码与第三方素材的授权分别处理；来源见 [素材维护说明](docs/ASSET_MAINTENANCE.md) 和游戏开始菜单的「素材鸣谢」。
