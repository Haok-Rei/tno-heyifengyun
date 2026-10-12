import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function validateReleaseHistory(archive, manifest, lock, changelog) {
  const fail = message => { throw new Error('版本档案：'+message); };
  if (!/^\d+\.\d+\.\d+$/.test(archive.currentVersion)) fail('当前版本必须有大版本、次版本和修订号');
  const ids = new Set(), versions = new Set();
  for (const group of archive.groups) {
    if (ids.has(group.id)) fail('大更新编号重复：'+group.id);
    ids.add(group.id);
    if (!group.title || !/^#[\da-f]{6}$/i.test(group.color) || !group.releases?.length) fail('大更新名称、颜色或记录为空：'+group.id);
    for (const release of group.releases) {
      if (!release.title || !release.notes?.length) fail('更新内容为空：'+release.id);
      if (release.version) {
        if (versions.has(release.version)) fail('版本编号重复：'+release.version);
        versions.add(release.version);
        if (release.version.split('.').slice(0,2).join('.') !== group.id) fail('小版本归属不符：'+release.version);
      }
    }
  }
  if (archive.groups[0].releases[0].version !== archive.currentVersion) fail('最新更新没有置于首位');
  if (manifest.version !== archive.currentVersion || lock.version !== archive.currentVersion || lock.packages[''].version !== archive.currentVersion) fail('项目版本与玩家界面不一致');
  if (!changelog.includes('## v'+archive.currentVersion+' —')) fail('更新日志缺少当前版本');
  return versions.size;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const json = file => JSON.parse(readFileSync(file,'utf8'));
  const versions = validateReleaseHistory(json('src/data/releaseHistory.json'),json('package.json'),json('package-lock.json'),readFileSync('CHANGELOG.md','utf8'));
  console.log(`Verified current version and ${versions} numbered release records.`);
}
