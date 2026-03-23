# Valkyrie Full Feature Roadmap: Current State to Playable MVP

## Context

Valkyrie aims to be the "RPG Maker" for tactical RPGs (Final Fantasy Tactics, Tactics Ogre, Triangle Strategy) — a full in-browser editor AND game runtime.

**Current state:** Phases 0 and 1 are complete. The foundation includes authentication (sign-up/sign-in with async bcrypt, cookie sessions), user profiles with avatar upload, full project CRUD with collaborator management, ProjectSettings (grid/battle/progression config), project deletion with cascade, access control middleware (owner vs collaborator roles), a dashboard with project card grid, and conditional sidebar navigation. Phase 1 delivered the core game data layer: StatDefinition (with CategoryType enum), Element (with color/icon), ElementInteraction (N×N multiplier matrix), plus full CRUD editors for DamageType, Profession (with weapon/armor type permissions), WeaponType, ArmorType, AbilityType, and EquipmentType. All editors feature drag-and-drop reordering (@dnd-kit), Zod + react-hook-form validation, Dialog-based create/edit, AlertDialog delete confirmation, and Sonner toast notifications. The smart save pattern and Editor UI Design Standards are established.

This roadmap takes us from current state to a playable MVP across 9 phases.

### Key Architectural Decisions
- **Route structure**: Projects live at `/projects/:projectId/...` (separate from `/dashboard`). This gives projects their own layout with dedicated sidebar and breadcrumbs, independent of the dashboard layout.
- **Stat system**: Hybrid — fixed core stats (HP, MP, MOV) + user-defined custom stats per project
- **Map rendering**: HTML5 Canvas from the start (needed for runtime anyway)
- **Formulas**: Stored as string expressions, evaluated with a sandboxed parser (never `eval()`)

---

## Phase 0: Project Management (Foundation) — COMPLETE

**Everything depends on this.** No game feature works without project context.

**Schema:**
- `description` (String?) on Project
- `@@index([ownerId])` on Project
- `onDelete: Cascade` on all relations (project->user, all 6 game types, collaborator, profile, projectSettings)
- `@@unique([projectId, userId])` + `@@index([userId])` on Collaborator
- `ProjectSettings` model (1:1 with Project): grid defaults (`defaultGridSizeX`, `defaultGridSizeY`, `defaultTileSize`), battle config (`turnSystem` enum, `maxUnitsPerBattle`), progression (`maxLevel`, `statGrowthModel` enum)
- Enums: `TurnSystem` (Initiative/RoundRobin/PhaseBased), `StatGrowthModel` (ClassBased/Individual/Hybrid)

**Routes (at `/projects/...`, not `/dashboard/projects/...`):**
- `dashboard._index.tsx` — project card grid with responsive layout and empty state CTA
- `projects.new.tsx` — 3-step creation wizard (details, template, confirm)
- `projects.$projectId.tsx` — project layout with access validation, sidebar, breadcrumbs
- `projects.$projectId._index.tsx` — project overview with quick actions, stats, team
- `projects.$projectId.settings.tsx` — project info editing, collaborator management, game settings (grid/battle/progression), danger zone with project deletion
- `projects.$projectId.maps.tsx` — maps placeholder (UI only, mock data)

**API (`app/api/project.ts`):**
- `getProjectById`, `getProjectsByUserId`, `createProject` (transaction: project + default settings), `updateProject`, `deleteProject`
- `hasProjectAccess` (single query), `isProjectOwner`, `isProjectCollaborator`
- `addCollaborator`, `removeCollaborator`, `getProjectCollaborators`, `searchUsers`

**API (`app/api/projectSettings.ts`):**
- `getProjectSettings`, `createDefaultProjectSettings`, `updateProjectSettings` (upsert pattern)

**Server utilities (`app/lib/project-access.server.ts`):**
- `requireProjectAccess`, `requireProjectOwnership`, `checkProjectAccess`

**Components:**
- `project-selector.tsx` — URL-based project switcher with owner/collaborator badges
- `app-sidebar.tsx` — conditional sidebar: "Platform" group (Dashboard) + "Game Design" group when inside a project (Maps enabled, Characters/Abilities/Equipment disabled with "Soon" badge)
- `nav-main.tsx` — Remix `<Link>` components, supports `disabled` and `badge` props for coming-soon items

**Code quality (from code review):**
- `signUp` omits password hash from return (`omit: { password: true }`)
- Async bcrypt with 12 salt rounds
- Sonner toast notifications for all success/error states
- `<Link>` components for SPA navigation (no `<a href>`)
- Error boundaries with semantic theme colors
- Avatar file cleanup on clear/replace
- Tailwind CSS v4 consolidated (theme.css as single source of truth)

**Deferred to later phases:**
- `thumbnail` (String?) on Project — nice-to-have for project cards

---

## Phase 1: Stats, Elements & Core Type Editors — COMPLETE

**The atoms of the RPG system.** Stats and elements are referenced by everything. This phase also delivered full CRUD editors for all existing game type models (DamageType, Profession, WeaponType, ArmorType, AbilityType, EquipmentType) and established the Editor UI Design Standards used by all future phases.

**Schema:**
- `StatDefinition`: id, name, abbreviation, description, category (`CategoryType` enum: Core/Offensive/Defensive/Speed/Luck/Custom), minValue, maxValue, defaultValue, isPercentage, projectId, displayOrder. `@@unique([projectId, abbreviation])`
- `Element`: id, name, description, color (hex), iconKey, projectId, displayOrder
- `ElementInteraction`: id, sourceElementId, targetElementId, multiplier (Float, default 1.0), projectId. `@@unique([projectId, sourceElementId, targetElementId])`. Cascade delete from both source/target Element
- `DamageType`: expanded with `BaseDamageType` enum (Physical/Magical/Chemical/Environmental), optional `elementId` (SetNull on delete)
- `WeaponType`: expanded with optional `damageTypeId` (SetNull on delete)
- `Profession`: expanded with `displayOrder`, relations to `ProfessionWeaponType` and `ProfessionArmorType`
- `ProfessionWeaponType`: junction table — professionId + weaponTypeId + projectId. `@@unique([professionId, weaponTypeId])`. Cascade delete from both sides
- `ProfessionArmorType`: junction table — professionId + armorTypeId + projectId. `@@unique([professionId, armorTypeId])`. Cascade delete from both sides
- `ArmorType`, `AbilityType`, `EquipmentType`: expanded with `displayOrder`
- Project model updated with relations to all new entities

**Routes (8 new editor routes):**
- `projects.$projectId.stats.tsx` — stat definition CRUD with sortable table
- `projects.$projectId.elements.tsx` — element CRUD with card grid + per-element interaction dialog
- `projects.$projectId.damage-types.tsx` — damage type CRUD with element association
- `projects.$projectId.professions.tsx` — profession CRUD with weapon/armor type checkboxes
- `projects.$projectId.weapon-types.tsx` — weapon type CRUD
- `projects.$projectId.armor-types.tsx` — armor type CRUD
- `projects.$projectId.ability-types.tsx` — ability type CRUD
- `projects.$projectId.equipment-types.tsx` — equipment type CRUD

**API (8 new service files in `app/api/`):**
- `statDefinition.ts` — `getStatsByProjectId`, `createStat`, `updateStat`, `deleteStat`, `reorderStats`
- `element.ts` — `getElementsByProjectId`, `createElement`, `updateElement`, `deleteElement`, `reorderElements`
- `elementInteraction.ts` — `getInteractionsByProjectId`, `upsertInteraction`, `bulkUpsertInteractions` (transactional batch), `deleteInteraction`
- `damageType.ts` — CRUD + `reorderDamageTypes` (includes element relation)
- `profession.ts` — CRUD + `reorderProfessions` (transactional with junction table cascade delete/recreate)
- `weaponType.ts`, `armorType.ts`, `abilityType.ts`, `equipmentType.ts` — standard CRUD + reorder

**Components:**
- `app/components/stats/` — `stat-form-dialog.tsx` (Zod validation with cross-field refinements: maxValue > minValue, defaultValue in range), `stat-table.tsx` (dnd-kit sortable rows, `CATEGORY_COLORS` color-coded badges, GripVertical drag handles)
- `app/components/elements/` — `element-form-dialog.tsx` (hex color picker, `ELEMENT_ICONS` map with 19 Lucide icons, live preview), `element-grid.tsx` (dnd-kit rect sorting strategy), `element-card.tsx` (sortable card with icon/color/description/interaction count), `interaction-dialog.tsx` (smart save pattern with unsaved changes badge, color-tinted multiplier inputs: red < 1.0, green > 1.0, bulk upsert on save)
- `app/components/core-rules/` — `damage-type-form-dialog.tsx` (BaseDamageType enum + element dropdown), `profession-form-dialog.tsx` (weapon/armor type checkbox lists), `named-type-form-dialog.tsx` (reusable for simple name-only entities), matching `*-table.tsx` components for each with dnd-kit reordering

**Sidebar & navigation:**
- Game Design sections now active with collapsible groups: Core Rules (Stats, Elements, Damage Types), Characters & Classes (Professions), Abilities & Skills (Ability Types), Equipment & Items (Armor Types, Equipment Types, Weapon Types)
- Dynamic breadcrumbs for all new routes in project layout

**Patterns established (Editor UI Design Standards):**
- Route pattern: loader (`requireProjectAccess` + fetch ordered data) → action (`switch` on `formData.get("action")` with `create_`, `update_`, `delete_`, `reorder_` prefixes)
- Dialog-based create/edit with Zod + react-hook-form + shadcn Form components
- AlertDialog delete confirmation with consequence description
- Drag-and-drop reordering via @dnd-kit with immediate persistence (transactional batch updates)
- Smart save pattern for bulk operations (ref-based change tracking, unsaved changes badge)
- `useEffect` watching `actionData` for Sonner toast notifications
- All patterns documented in CLAUDE.md for consistency in future phases

**Dependencies added:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

**Deferred to later phases:**
- "Seed from template" button for stats (FFT-style, FE-style, custom blank)
- Core stat seeding on project creation (HP, MP, MOV)

---

## Phase 2: Professions/Job Classes

**Expand the Profession model into a full job class system.** Basic Profession CRUD with weapon/armor type permissions already exists from Phase 1. This phase adds stat integration, growth rates, prerequisites, and a tabbed detail editor.

### Already complete (from Phase 1)
- Profession model with name, displayOrder, projectId
- ProfessionWeaponType and ProfessionArmorType junction tables
- Profession list route (`projects.$projectId.professions.tsx`) with CRUD + drag-and-drop reorder
- ProfessionFormDialog with weapon/armor type checkbox selection

### Schema (new)
- **Modify** `prisma/schema/profession.prisma` — add `description`, `iconKey`
- **Create** `professionBaseStat.prisma`: professionId + statDefinitionId + value (`@@unique` pair)
- **Create** `professionGrowthRate.prisma`: professionId + statDefinitionId + growthRate (Float) (`@@unique` pair)
- **Create** `professionPrerequisite.prisma`: professionId + requiredProfessionId + requiredLevel (self-referential relation)

### Routes (new)
- `projects.$projectId.professions.$professionId.tsx` — profession detail editor (tabbed)

### Editor UI (tabbed detail view, enhances existing profession route)
- **General**: name, description, icon
- **Base Stats**: compact table with each project stat + value input
- **Growth Rates**: same layout for growth rate values
- **Equipment**: weapon/armor/equipment type checkboxes (refine existing implementation)
- **Prerequisites**: multi-select for other professions + level threshold each
- **Class Tree Visualizer**: read-only graph showing prerequisite chains (nice-to-have)

### Dependencies
- Phase 1 (StatDefinition) ✓

---

## Phase 3: Abilities & Status Effects

**The heart of tactical RPG combat.**

### Schema
- **Create** `statusEffect.prisma`: name, description, effectType (Buff/Debuff/Neutral), duration, stackable, maxStacks, iconKey, projectId
- **Create** `statusEffectStatModifier.prisma`: statusEffectId + statDefinitionId + modifierType (Flat/Percentage) + value
- **Create** `ability.prisma`:
  ```
  Ability: id, name, description, abilityTypeId, damageTypeId?, elementId?,
           targetType (enum: Self/SingleAlly/SingleEnemy/SingleAny/AllAllies/AllEnemies/AreaAlly/AreaEnemy/AreaAny/Tile),
           mpCost, hpCost, tpCost,
           minRange, maxRange, aoeShape (enum: Single/Line/Cross/Diamond/Square/Cone), areaSize, verticalRange,
           castTime, cooldown,
           damageFormula?, healingFormula?, accuracyFormula?,
           projectId, iconKey, displayOrder
  ```
- **Create** `abilityStatusEffect.prisma`: abilityId + statusEffectId + chance (Int, 0-100)
- **Create** `abilityStatModifier.prisma`: abilityId + statDefinitionId + modifierType + value
- **Create** `professionAbility.prisma`: professionId + abilityId + learnLevel + jpCost? (`@@unique` pair)

### Routes
- `projects.$projectId.abilities.tsx` — ability list (filterable by AbilityType)
- `projects.$projectId.abilities.$abilityId.tsx` — ability detail editor
- `projects.$projectId.status-effects.tsx` — status effect list + detail

### Editor UI
- **Ability detail** (tabs): General, Costs, Targeting (range/AoE with visual shape selector), Formulas (with stat autocomplete + preview), Status Effects (multi-select + chance %), Timing
- **Status Effect detail**: General, Stat Modifiers table
- **Profession abilities** (new tab on Phase 2's profession editor): abilities this class teaches + learn level

### Reusable Component
- **FormulaInput** — shared component with stat abbreviation autocomplete and formula validation. Used across abilities, battle config, scenarios.

### Dependencies
- Phase 1 (StatDefinition, Element)
- Phase 2 (Profession — for ProfessionAbility)

---

## Phase 4: Equipment

### Schema
- **Create** `weapon.prisma`: name, description, weaponTypeId, attackPower, hitRate, critRate, minRange, maxRange, isTwoHanded, iconKey, projectId
- **Create** `armor.prisma`: name, description, armorTypeId, defensePower, magicDefense, iconKey, projectId
- **Create** `accessory.prisma`: name, description, equipmentTypeId, iconKey, projectId
- **Create** `consumable.prisma`: name, description, effectAbilityId?, healAmount?, restoreResource?, maxStack, iconKey, projectId
- **Create** `equipmentStatModifier.prisma`: weaponId?/armorId?/accessoryId? + statDefinitionId + modifierType + value
- **Create** `weaponElement.prisma`: weaponId + elementId (`@@unique` pair)
- **Create** `weaponGrantedAbility.prisma`: weaponId (unique) + abilityId
- **Create** `elementResistance.prisma`: armorId?/accessoryId? + elementId + resistance (Float)
- **Create** `accessoryStatusEffect.prisma`: accessoryId (unique) + statusEffectId

### Routes
- `projects.$projectId.weapons.tsx` — weapon list + detail
- `projects.$projectId.armor.tsx` — armor list + detail
- `projects.$projectId.accessories.tsx` — accessory list + detail
- `projects.$projectId.consumables.tsx` — consumable list + detail

### Editor UI Pattern (repeated for each equipment type)
- List view filtered by type category
- Detail editor: General, Combat Stats, Stat Bonuses (modifier table), Elements/Resistances, Special (granted ability/status effect)

### Dependencies
- Phase 1 (StatDefinition, Element)
- Phase 3 (Ability — for weapon granted abilities, consumable effects)

---

## Phase 5: Characters/Units

### Schema
- **Create** `unit.prisma`:
  ```
  Unit: id, name, description, unitType (enum: Player/Enemy/NPC/GuestAlly),
        professionId, level,
        portraitKey?, spriteKey?,
        aiBehavior? (enum: Aggressive/Defensive/Balanced/Support/Cowardly/Stationary),
        aiPriority? (enum: Nearest/Weakest/Strongest/Healer/Leader/Random),
        projectId, displayOrder
  ```
- **Create** `unitBaseStat.prisma`: unitId + statDefinitionId + value (`@@unique` pair)
- **Create** `unitEquipment.prisma`: unitId + slot (enum: MainHand/OffHand/Head/Body/Accessory1/Accessory2) + weaponId?/armorId?/accessoryId? (`@@unique [unitId, slot]`)
- **Create** `unitLearnedAbility.prisma`: unitId + abilityId (`@@unique` pair)

### Routes
- `projects.$projectId.units.tsx` — unit list (tabs: Player/Enemy/NPC)
- `projects.$projectId.units.$unitId.tsx` — unit detail editor

### Editor UI
- **General**: name, description, type, level, portrait/sprite
- **Profession**: dropdown assignment, shows profession base stats as reference
- **Stats**: override table — profession defaults shown, per-unit overrides on top, computed total displayed
- **Equipment**: visual slot-based loadout, dropdowns filtered by profession permissions
- **Abilities**: checklist (auto-populated from profession + level, manual overrides allowed)
- **AI** (Enemy/NPC/GuestAlly only): behavior + priority dropdowns
- **Preview Panel**: read-only card with computed final stats

### Dependencies
- Phase 2 (Profession), Phase 3 (Ability), Phase 4 (Equipment)

---

## Phase 6: Maps & Terrain (can be developed in PARALLEL with Phases 3-5)

### Schema
- **Create** `terrainType.prisma`: name, description, movementCost, canFlyOver, canWalkOn, damagePerTurn, healPerTurn, defenseBonus, evasionBonus, color (hex), tilesetKey?, projectId
- **Create** `battleMap.prisma`: name, description, width, height, projectId
- **Create** `mapTile.prisma`: battleMapId, x, y, elevation (Int), terrainTypeId (`@@unique [battleMapId, x, y]`)
- **Create** `spawnZone.prisma`: battleMapId, zoneType (enum: PlayerSpawn/EnemySpawn/AllySpawn/EventTrigger), x, y
- **Create** `mapEvent.prisma`: battleMapId, name, eventType (enum: Chest/Switch/Trap/Portal/Destructible/Conversation), x, y, triggerData (Json?)

### Routes
- `projects.$projectId.terrain.tsx` — terrain type list + CRUD
- `projects.$projectId.maps.tsx` — map list (card grid with thumbnails) — placeholder already exists
- `projects.$projectId.maps.$mapId.tsx` — full-page map editor

### Map Editor (Canvas-based)
- **Toolbar**: terrain paint brush, elevation +/-, spawn zone paint, event placement, eraser
- **Canvas Grid**: 2D top-down view, each cell shows terrain color + elevation number. Click/drag to paint. Optional isometric toggle.
- **Properties Panel** (right sidebar): selected tile info, or map-level settings
- **Layers Toggle**: terrain, elevation labels, spawn zones, events
- **Performance**: bulk tile upserts (debounced save after painting stops), `createMany`/`updateMany` for batch operations

### Dependencies
- None beyond project context (Phase 0). Can be built in parallel with Phases 3-5.

---

## Phase 7: Story, Scenarios & Battle Config

**Ties everything together.**

### Schema (many new models)
- `campaign.prisma`: name, description, projectId
- `chapter.prisma`: name, description, campaignId, displayOrder
- `scenario.prisma`: name, description, battleMapId, turnOrderFormula?, maxTurns?, expFormula?, goldReward, projectId
- `chapterScenario.prisma`: chapterId + scenarioId + isBranch (Bool), displayOrder
- `scenarioUnit.prisma`: scenarioId + unitId + spawnX + spawnY + levelOverride? + isRequired (Bool)
- `victoryCondition.prisma`: scenarioId + conditionType (enum: DefeatAllEnemies/DefeatTarget/SurviveTurns/ReachTile/ProtectUnit/Custom) + targetData (Json?) + description
- `defeatCondition.prisma`: scenarioId + conditionType (enum: AllPlayersDead/SpecificUnitDead/TurnLimitExceeded/Custom) + targetData (Json?)
- `scenarioReward.prisma`: scenarioId + rewardType (enum) + weaponId?/armorId?/accessoryId?/consumableId? + quantity
- `dialogue.prisma`: name, description, projectId
- `dialogueLine.prisma`: dialogueId, speakerName, speakerUnitId?, text, emotion?, nextLineId?, displayOrder
- `dialogueChoice.prisma`: dialogueLineId, text, nextLineId?, displayOrder
- `scenarioDialogue.prisma`: scenarioId + dialogueId + triggerType (enum: BattleStart/BattleEnd/TurnStart/UnitDefeated/TileReached/HpThreshold) + triggerData (Json?)
- `battleConfig.prisma`: projectId (unique 1:1), turnOrderSystem (enum), ctFormula?, physicalDamageFormula?, magicalDamageFormula?, healingFormula?, expFormula?, levelUpFormula?, jumpFormula?, maxLevel, maxPartySize

### Routes
- `projects.$projectId.campaign.tsx` — chapter list with drag-reorder, scenarios per chapter
- `projects.$projectId.scenarios.$scenarioId.tsx` — scenario editor (tabs: Setup, Unit Placement, Conditions, Rewards, Dialogue)
- `projects.$projectId.dialogues.tsx` — dialogue list + sequential/node editor
- `projects.$projectId.battle-config.tsx` — project-wide battle system configuration

### Key UI
- **Scenario Unit Placement**: shows the selected map grid on canvas, drag units from side panel onto spawn zones
- **Dialogue Editor**: sequential line editor with speaker select, text input, emotion tag, branching choices
- **Battle Config**: turn order system selection, formula inputs (using FormulaInput component), level progression settings

### Dependencies
- Phase 5 (Units), Phase 6 (Maps), Phase 3 (Abilities for formulas), Phase 4 (Equipment for rewards)

---

## Phase 8: Game Runtime (In-Browser Playtest Engine)

**No new database models.** Purely client-side rendering and game logic.

### Architecture
- Route: `/play/:projectId/:scenarioId` — separate from dashboard
- Single loader: fetches ALL scenario data (map tiles, units, abilities, equipment, battle config, dialogue) in one query with nested includes
- Canvas-based rendering (reuses canvas infrastructure from Phase 6 map editor)
- Client-side game state machine (React context or Zustand)

### Core Systems to Build
1. **Grid Renderer** — draw tiles, terrain, elevation, unit sprites on canvas
2. **Pathfinding** — A* algorithm respecting movement costs, elevation, occupied tiles
3. **Turn Manager** — implements project's turn order system (CT-based, speed-based, etc.)
4. **Formula Evaluator** — sandboxed expression parser for user-defined formulas (use `expr-eval` or `mathjs`, NEVER `eval()`)
5. **Combat Resolver** — apply damage formulas, element interactions, status effects
6. **AI Controller** — implement AIBehavior/AIPriority enums for enemy turns
7. **Dialogue Player** — render dialogue boxes with speaker portraits, text, choices
8. **Condition Checker** — evaluate victory/defeat conditions each turn

### Runtime UI
- Grid view with terrain and units
- Turn order display (unit portrait queue)
- Selected unit info panel (stats, abilities, equipment)
- Action menu (Move, Attack, Ability, Item, Wait)
- Ability targeting overlay (range/AoE visualization)
- Dialogue overlay
- Victory/defeat screen
- **Debug Panel** (toggle-able): CT values, damage calc breakdowns, AI reasoning, tile info on hover

### Sub-phases (internal breakdown)
1. Grid rendering + tile display
2. Unit placement + movement (pathfinding)
3. Turn order system
4. Basic attack/ability resolution
5. Status effects + element interactions
6. AI behavior
7. Dialogue integration
8. Victory/defeat conditions
9. Debug tools

---

## Phase Summary & Dependency Graph

```
Phase 0: Project Management          [COMPLETE]
    |
Phase 1: Stats, Elements & Editors   [COMPLETE]
    |
Phase 2: Professions/Jobs            [depends on Phase 1]
    |
Phase 3: Abilities & Status Effects   [depends on Phases 1, 2]
    |                                       |
Phase 4: Equipment                          Phase 6: Maps & Terrain [PARALLEL — no data deps]
    |  [depends on Phases 1, 3]             |  [depends only on Phase 0]
    |                                       |
Phase 5: Characters/Units                   |
    |  [depends on Phases 2, 3, 4]          |
    +---------------------------------------+
    |
Phase 7: Story, Scenarios, Battle Config    [depends on Phases 5, 6]
    |
Phase 8: Game Runtime                       [depends on ALL phases]
```

Phase 6 (Maps) can be built in parallel with Phases 3-5 since it only needs project context.

---

## Total New Schema Files: ~40 models, ~15 enums

## Route Structure (complete)
```
Existing:
  /                                                 (redirects to /dashboard or /auth/sign-in)
  /auth/sign-in                                     (existing)
  /auth/sign-up                                     (existing)
  /auth/logout                                      (existing)
  /dashboard                                        (existing — project card grid)
  /dashboard/profile                                (existing)

Project Routes:
  /projects/new                                     (existing — Phase 0)
  /projects/:projectId                              (existing — Phase 0, project layout)
  /projects/:projectId/settings                     (existing — Phase 0, includes game settings + danger zone)
  /projects/:projectId/maps                         (placeholder — Phase 6)
  /projects/:projectId/stats                        (existing — Phase 1)
  /projects/:projectId/elements                     (existing — Phase 1)
  /projects/:projectId/damage-types                 (existing — Phase 1)
  /projects/:projectId/professions                  (existing — Phase 1, enhanced in Phase 2)
  /projects/:projectId/weapon-types                 (existing — Phase 1)
  /projects/:projectId/armor-types                  (existing — Phase 1)
  /projects/:projectId/ability-types                (existing — Phase 1)
  /projects/:projectId/equipment-types              (existing — Phase 1)
  /projects/:projectId/professions/:id              (Phase 2)
  /projects/:projectId/abilities                    (Phase 3)
  /projects/:projectId/abilities/:id                (Phase 3)
  /projects/:projectId/status-effects               (Phase 3)
  /projects/:projectId/weapons                      (Phase 4)
  /projects/:projectId/armor                        (Phase 4)
  /projects/:projectId/accessories                  (Phase 4)
  /projects/:projectId/consumables                  (Phase 4)
  /projects/:projectId/units                        (Phase 5)
  /projects/:projectId/units/:id                    (Phase 5)
  /projects/:projectId/terrain                      (Phase 6)
  /projects/:projectId/maps/:mapId                  (Phase 6)
  /projects/:projectId/campaign                     (Phase 7)
  /projects/:projectId/scenarios/:id                (Phase 7)
  /projects/:projectId/dialogues                    (Phase 7)
  /projects/:projectId/battle-config                (Phase 7)

Runtime:
  /play/:projectId/:scenarioId                      (Phase 8)
```

## Verification Strategy

After each phase, verify by:
1. `npm run typecheck` — no TypeScript errors
2. `npm run lint` — no linting errors
3. `npx prisma generate` — schema compiles
4. `npm run dev` — app runs, navigate through new routes
5. Manual test: create/read/update/delete for each new entity type
6. Confirm Sonner toasts appear for all success/error states
7. Confirm sidebar navigation correctly shows/hides sections based on project context
