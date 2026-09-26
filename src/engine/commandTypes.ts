export type CommandRoute = 'opening' | 'revolution' | 'democracy' | 'reform' | 'commune' | 'purge' | 'wu' | 'yang' | 'jidi' | 'gouxiong';
export interface FieldOrder {
  id: number; tileId: string; actionId: string; route: CommandRoute;
  interval: number; nextRunDay: number; repeats: number;
  reformRegion?: string; remaining?: number;
}
export interface FieldTeam { id: string; name: string; order: FieldOrder | null }
export interface CommandReport { id: number; date: number; title: string; text: string; outcome: string; tileId: string }
export interface CommandState { version: 2; nextId: number; lastTick: number; teams: FieldTeam[]; reports: CommandReport[]; completed: number; preparation?: Partial<Record<CommandRoute, number>> }
