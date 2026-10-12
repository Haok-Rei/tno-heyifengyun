import archive from '../data/releaseHistory.json';

export interface ReleaseRecord { id: string; version: string | null; title: string; date: string | null; notes: string[] }
export interface ReleaseGroup { id: string; title: string; color: string; summary: string; releases: ReleaseRecord[] }
export const RELEASE_GROUPS: ReleaseGroup[] = archive.groups;
export const CURRENT_VERSION = archive.currentVersion;
export const CURRENT_RELEASE = RELEASE_GROUPS.flatMap(g => g.releases).find(r => r.version === CURRENT_VERSION)!;
export const CURRENT_UPDATE = RELEASE_GROUPS.find(g => g.releases.includes(CURRENT_RELEASE))!;
