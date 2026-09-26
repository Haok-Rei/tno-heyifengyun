# 地图15格系统全面整合计划

> 2026-07-18 整理 | 待实施

## 背景
v6.7 已将地图从6个建筑升级为15个连通子地块，但**所有路线专属地图交互**仍使用旧的6建筑级flag系统。需要全面迁移到15格系统。

## 当前状态
- ✅ 15格 SVG 地图渲染（CentralMap.tsx）
- ✅ 基础起义模式交互（6建筑专属行动）
- ✅ 建筑控制度自动聚合（子地块→建筑）
- ❌ GX无政府模式（6建筑flag → 需15格）
- ❌ 吕波汉清洗模式（6建筑flag → 需15格）
- ❌ 豪邦公社模式（6建筑flag → 需15格）
- ❌ 及第企业模式（6建筑flag → 需15格）
- ❌ 杨玉乐叛乱系统（6建筑key → 需15格）
- ❌ 潘仁越民主线（建筑级canStart → 需15格检查）
- ❌ 红蛤政治局UI（建筑级清洗显示 → 需15格聚合）

---

## 待更新清单（按优先级排列）

### 一、类型层（types.ts）
- [ ] `SubTile.zoneLevel` 已有但未使用，需在路线逻辑中启用
- [ ] `SubTile.owner` 已有但未使用，GX模式需改为 `gx_map_owner_tile_<tid>`

### 二、核心渲染层（CentralMap.tsx `rgnColor`）
当前使用 `r.bid`（建筑ID）的地方需改为 `r.tid`（地块ID）：
- [ ] 112行：`gx_map_owner_`+r.bid → `gx_map_owner_tile_`+r.tid
- [ ] 113行：`lu_purge_zone_level_`+r.bid → `lu_purge_zone_level_tile_`+r.tid
- [ ] 114行：`haobang_commune_zone_level_`+r.bid → `haobang_commune_zone_level_tile_`+r.tid
- [ ] 115行：`rebelLocations[r.bid]` → `rebelLocations[r.tid]`

### 三、GX无政府路线（~7处flag设置）
- [ ] `gx_start`：6个 `gx_map_owner_<bid>` → 15个 `gx_map_owner_tile_<tid>`
- [ ] `gx_start`：6个建筑 `studentControl` → 15个 `tile_ctrl_<tid>`
- [ ] `gx_anarchy_map_start`：3个 `gx_anarchy_action_<bid>` → 对应地块
- [ ] `gx_anarchy_festival_ops`：2个 action → 对应地块
- [ ] `gx_anarchy_broadcast_slot`：1个 action → 对应地块
- [ ] `gx_anarchy_shadow_network`：2个 action → 对应地块
- [ ] `gx_anarchy_swarm_mobilization`：2个 action → 对应地块
- [ ] `gx_embarrass_settlement`：6个 owner重置为school → 15个
- [ ] `gx_redeem_settlement`：6个 owner设为gouxiong → 15个
- [ ] App.tsx GX自动战斗：需适配新的 `gx_map_owner_tile_<tid>` 标记

### 四、吕波汉清洗路线（~20处）
**国策解锁flag：**
- [ ] `purge_b3_special_operations` → `lu_purge_action_tile_b3_a1a3/b3_b1b2/b3_tower`
- [ ] `purge_admin_black_archives` → `lu_purge_action_tile_admin_main/admin_gym`
- [ ] `purge_b1b2_screening` → `lu_purge_action_tile_dorm_1_4/dorm_5_7`
- [ ] `purge_lab_forensics` → `lu_purge_action_tile_intl_dept/lib_area`
- [ ] `purge_playground_demonstration` → `lu_purge_action_tile_court_area/canteen/track_field`
- [ ] `purge_auditorium_show_trials` → `lu_purge_action_tile_aud_screen/aud_back/aud_hall`

**收束条件：**
- [ ] `sole_helmsman`：检查6个建筑 `zone_level>=3` → 检查15个地块
- [ ] `purge_consolidation_directive`：`lu_purge_map_actions>=4` → 调整阈值

**红蛤政治局UI：**
- [ ] RedToadPolitburo.tsx 373-385行：显示各建筑清洗进度 → 显示地块级或建筑聚合

### 五、豪邦公社路线（~20处）
- [ ] `commune_pilot_regions`：3个 `haobang_commune_action_<bid>` → 对应地块
- [ ] `commune_federation_charter`：3个 action → 对应地块
- [ ] `commune_pilot_regions`：6建筑 `studentControl+6` → 15个 `tile_ctrl_<tid>+6`
- [ ] `haobang_grand_success`：检查6个建筑 `zone_level>=3` → 检查15个地块

### 六、及第企业路线（~10处）
- [ ] `jidi_new_era`：6建筑 studentControl重置→15个 `tile_ctrl_<tid>` 重置为0
- [ ] 6个 `jidi_interaction_<bid>` → `jidi_interaction_tile_<tid>` 对应15个地块

### 七、潘仁越民主线（~5处）
- [ ] `reclaim_democracy` canStart：检查6建筑→检查15个 `tile_ctrl_<tid>`全部>=100
- [ ] `reset_unity` pollingData生成：6建筑→15地块各有独立polling
- [ ] `first_democratic_election`：适配15格polling数据

### 八、杨玉乐路线（~5处）
- [ ] `rebelLocations` key从建筑ID改为地块ID
- [ ] YangYuleDesk.tsx镇压逻辑适配
- [ ] Tick循环叛乱生成适配

### 九、Tick循环（App.tsx ~30处）
- [ ] GX自动战斗：`gx_map_owner_<bid>` → `gx_map_owner_tile_<tid>`
- [ ] 选举日常：pollingData从建筑→地块
- [ ] 杨玉乐叛乱日常：`Object.keys(newMapLocations)` → `ALL_SUB_TILES`
- [ ] GameOver判定：`redCount/greenCount`阈值已适配建筑聚合，无需改

### 十、地块行动面板（CentralMap.tsx）
- [ ] GX模式：当前显示"需完成国策"，应恢复完整action按钮
- [ ] 清洗模式：添加 `lu_purge_<tile>` 行动按钮
- [ ] 公社模式：添加 `commune_build_<tile>` 行动按钮
- [ ] 及第模式：添加 `jidi_<tile>` 商业交互按钮
- [ ] 选举模式：添加polling/campaign按钮

---

## ⚠️ 发现的关键Bug
1. **吕波汉清洗zone_level从未被设置！** — 读取但从未写入，整个清洗地图机制是空的
2. **豪邦公社zone_level从未被设置！** — 同上，建设度标志无代码写入
3. **SubTile.zoneLevel/owner定义但未使用** — types.ts中定义了但没有任何代码使用
4. **MinigameSiege/Negotiation结果无地图效果** — 两个小游戏的胜负不影响地块控制度
5. **GX无政府自动战斗使用旧6建筑系统** — 完全不懂子地块和邻接
6. **杨玉乐暴动系统与地图隔离** — rebelLocations不影响studentControl
7. **GameOver判定只用6建筑级** — 不用15格聚合
8. **故事事件从不修改地图** — 事件effect中没有地图操作

## 预估工作量
- **简单迁移**（flag名称替换）：~50处，约2小时
- **逻辑适配**（条件检查重写）：~20处，约4小时
- **UI更新**（面板按钮+ Politburo显示）：~10处，约3小时
- **测试验证**：约2小时
- **总计**：约11小时
