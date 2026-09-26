# GitHub 上传、Cloudflare 部署与日常更新

## 1. 建立独立 GitHub 仓库

将这个文件夹作为长期维护的工作目录。仓库顶层应直接包含 `package.json`、`src/`、`art/`、`music/` 和本说明。

建议用 Git 或 GitHub Desktop 上传：当前资源文件较多，用 Git 推送能完整保留目录结构和以后每次更新的差异。

GitHub 上创建一个空仓库，例如 `hefei-order`。建仓时保持空仓库，以便直接推送本地版本。在本文件夹打开终端，替换下面的用户名：

```sh
git init -b main
git add .
git commit -m "Initial release of Hefei Order"
git remote add origin https://github.com/你的用户名/hefei-order.git
git push -u origin main
```

首次提交可能需要按 Git 的提示设置作者名称和邮箱。GitHub 登录使用 GitHub Desktop 或 Git 的正常认证流程；本项目不需要在文件中保存登录令牌。

`.gitignore` 会排除 `node_modules`、`dist`、环境变量文件和临时文件。`art`、`music`、`src/assets`、锁文件及素材许可证需要提交。

## 2. Cloudflare Workers 连接 GitHub

当前默认 `wrangler.toml` 使用 Workers 静态资源部署，并包含 `previews = {}`，支持日志中的 `npx wrangler preview` 命令。

| 项目 | 填写 |
| --- | --- |
| 根目录 | 留空：package.json 在仓库根目录 |
| 构建命令 | `npm run build` |
| 正式部署命令 | `npx wrangler@4.141.0 deploy` |
| 非生产分支预览命令 | `npx wrangler@4.141.0 preview` |
| 生产分支 | `main` |
| Node 版本 | `22.16.0`，由 `.node-version` 指定 |

将 `wrangler.toml` 的 `name` 改为控制台中现有 Worker 的准确名称。静态资源从 `dist` 上传，无需添加服务端入口或 API 密钥。`preview` 创建测试预览；正式上线请使用 `deploy`。命令中的英文单词不可翻译成中文。

日志出现 “configuration must contain a previews block” 表示部署配置错误，不是游戏编译错误。修正后需提交到 GitHub，再重新部署。

### 如果继续使用 Cloudflare Pages

将 `wrangler.pages.toml` 的内容复制为 `wrangler.toml`，创建或使用 Pages 项目，构建命令 `npm run build`，输出目录 `dist`，根目录留空。Pages 的 Git 集成自动发布，不填写 Workers 的 `deploy` 或 `preview` 命令。

官方参考：[Workers 静态资源](https://developers.cloudflare.com/workers/static-assets/)、[Workers 预览配置](https://developers.cloudflare.com/workers/previews/configuration/)、[Pages 构建配置](https://developers.cloudflare.com/pages/configuration/build-configuration/)。

## 3. 后续更新

直接在此仓库文件夹修改剧情、美术、机制或音乐，再执行：

```sh
npm run check
git add .
git commit -m "Describe this game update"
git push
```

连接 GitHub 后，Cloudflare 会根据推送重新构建和部署。每次更新无需手动上传 `dist`。提交前检查 Git 差异，确认本次变化与预期一致。

修改依赖后使用 `npm install`，同时提交 `package.json` 和 `package-lock.json`。保持 Node 版本一致有助于重现构建。

较大的改动可先推送到测试分支，查看 Cloudflare 预览部署，验证后合入 `main`。预览地址与正式地址使用不同的浏览器存储，预览中看不到正式站存档是正常的。

如果还在原始大文件夹开发，可以在原始目录执行：

```sh
python scripts/export_cloudflare.py --refresh
```

这会刷新未被单独编辑的导出文件，并清理已经从源目录删除的受管理文件；不会清理导出目录里的 Git 历史、依赖或构建目录。如果提示导出目录已有独立编辑，应继续维护该仓库，或使用 `--output github-cloudflare-next` 整理一个新版本进行比较。首次整理依赖本机 npm 缓存；缓存不足时加 `--online` 重新生成锁文件。

## 4. 部署检查与缓存

`npm run build` 自动检查输出文件数量、单文件大小、HTML 资源链接和 Cloudflare 配置文件。以 Pages 免费版的 **20,000 文件、单文件 25 MiB** 限制作为检查标准，参考 [平台限制](https://developers.cloudflare.com/pages/platform/limits/)。

网站入口使用重新验证缓存策略；带内容哈希的 `assets` 文件使用长期缓存，以兼顾更新及时性与加载速度。

游戏的存档保留在同一个域名下的浏览器本地存储中。切换正式域名应提前处理玩家存档迁移；本次整理没有增加云存档功能。

## 5. 常见排查

- **找不到 `package.json`**：检查仓库顶层和 Cloudflare 根目录是否一致。
- **音乐或头像缺失**：检查相应资源是否提交，运行 `npm run check:assets`；Linux 构建区分文件名大小写。
- **构建失败**：查看 Cloudflare 日志中的第一处实际错误，检查 Node 版本和锁文件是否提交。
- **更新后仍显示旧版本**：确认 `main` 的最新提交已经部署成功，再刷新网页。
- **素材生成失败**：按 `docs/ASSET_MAINTENANCE.md` 安装相应可选工具；日常游戏部署只需要 Node/npm。
