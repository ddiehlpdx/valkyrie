# Valkyrie Full Feature Roadmap: Current State to Playable MVP

## Context

Valkyrie aims to be the "RPG Maker" for tactical RPGs (Final Fantasy Tactics, Tactics Ogre, Triangle Strategy) — a full in-browser editor AND game runtime. The app currently has authentication, user profiles, a dashboard shell with a 15-section sidebar (all links pointing to `#`), 44 Radix UI components, and 6 bare-bones game type models in the database (Profession, AbilityType, DamageType, WeaponType, ArmorType, EquipmentType — each with only `id`, `name`, `projectId`, `displayOrder`).

This roadmap takes us from current state to a playable MVP across 9 phases.

### Key Architectural Decisions
- **Project context**: URL-based (`/dashboard/projects/:projectId/...`) — aligns with Remix, supports deep links, multiple tabs, bookmarks
- **Stat system**: Hybrid — fixed core stats (HP, MP, MOV) + user-defined custom stats per project
- **Map rendering**: HTML5 Canvas from the start (needed for runtime anyway)
- **Formulas**: Stored as string expressions, evaluated with a sandboxed parser (never `eval()`)

---

## Phase 0: Project Management (Foundation)

**Everything depends on this.** No game feature works without project context.

### Schema Changes
- **Modify** `prisma/schema/project.prisma` — add `description` (Text), `thumbnail` (String?), `settings` relation, `@@index([ownerId])`
- **Create** `prisma/schema/projectSettings.prisma` — ProjectSettings model with:
  - Grid defaults: `defaultGridSizeX`, `defaultGridSizeY`, `maxMapHeight`
  - Battle: `maxUnitsPerBattle`, `turnSystem` (enum: Initiative/RoundRobin/PhaseBase), `enablePermadeath`, `enableFriendlyFire`
  - Progression: `maxLevel`, `baseStatPoints`, `statGrowthModel` (enum: ClassBased/Individual/Hybrid)
  - Display: `tileSize`
- **Modify** all 6 game type schemas + collaborator — add `onDelete: Cascade` to project relations

### Routes
| Route File | Purpose |
|---|---|
| `dashboard._index.tsx` | Dashboard home — project card grid, empty state CTA |
| `dashboard.projects.new.tsx` | Create project form (name, description, thumbnail) |
| `dashboard.projects.$projectId.tsx` | Project layout/gateway — validates access, loads project + settings |
| `dashboard.projects.$projectId._index.tsx` | Project overview — name, description, quick stats, quick actions |
| `dashboard.projects.$projectId.settings.tsx` | Project settings form (grid, battle, progression sections) |

### API Layer
- **Fix** `app/api/project.ts` — `getProjectsByUserId` has a bug (unawaited async map for collaborations)
- **Add** to `app/api/project.ts`: `createProject` (transaction: project + default settings), `updateProject`, `deleteProject`, `getProjectWithSettings`, `userHasProjectAccess`
- **Create** `app/api/projectSettings.ts`: `getProjectSettings` (upsert pattern), `updateProjectSettings`

### Components
- **Rewrite** `app/components/dashboard/project-selector.tsx` — URL-based navigation (no local state)
- **Create** `project-card.tsx`, `create-project-form.tsx`, `project-settings-form.tsx`, `delete-project-dialog.tsx`
- **Modify** `app-sidebar.tsx` — wire up ProjectSelector, conditionally show game sections only when project is active
- **Modify** `nav-main.tsx` — change `<a>` tags to Remix `<Link>` components

### Sidebar Behavior
- No project selected: show only Dashboard + Project nav sections
- Project selected: show all 15 sections with URLs pointing to `/dashboard/projects/:projectId/...`

---

## Phase 1: Stats & Elements

**The atoms of the RPG system.** Everything references stats and elements.

### Schema
- **Create** `prisma/schema/statDefinition.prisma`:
  ```
  StatDefinition: id, name, abbreviation, description, category (enum: Core/Offensive/Defensive/Speed/Luck/Custom),
                  minValue, maxValue, defaultValue, isPercentage, isCore (Boolean — true for fixed stats),
                  projectId, displayOrder
  @@unique([projectId, abbreviation])
  ```
  - Core stats (seeded on project creation): HP, MP, MOV
  - Custom stats: user-defined per project (STR, DEF, MAG, SPD, etc.)

- **Create** `prisma/schema/element.prisma`:
  ```
  Element: id, name, description, color (hex), iconKey, projectId, displayOrder
  ```

- **Create** `prisma/schema/elementInteraction.prisma`:
  ```
  ElementInteraction: id, sourceElementId, targetElementId, multiplier (Float, default 1.0), projectId
  @@unique([projectId, sourceElementId, targetElementId])
  ```

### Routes
- `dashboard.projects.$projectId.stats.tsx` — stat definition list with CRUD
- `dashboard.projects.$projectId.elements.tsx` — element list + interaction matrix

### Editor UI
- **Stats**: sortable table — name, abbreviation, category, min/max/default, isPercentage. Core stats are non-deletable. "Seed from template" button (FFT-style, FE-style, custom blank).
- **Elements**: list editor + color picker. Sub-page: interaction matrix (elements x elements grid, cells = multiplier values)

### API
- `app/api/statDefinition.ts` — CRUD + `seedCoreStats(projectId)` (called during project creation)
- `app/api/element.ts` — CRUD + `getInteractionMatrix`, `upsertInteraction`

---

## Phase 2: Professions/Job Classes

**Expand the bare Profession model into a full job class system.**

### Schema
- **Modify** `prisma/schema/profession.prisma` — add `description`, `iconKey`, relations to new models
- **Create** `professionBaseStat.prisma`: professionId + statDefinitionId + value (`@@unique` pair)
- **Create** `professionGrowthRate.prisma`: professionId + statDefinitionId + growthRate (Float) (`@@unique` pair)
- **Create** `professionEquipmentPermission.prisma`: professionId + weaponTypeId? + armorTypeId? + equipmentTypeId?
- **Create** `professionPrerequisite.prisma`: professionId + requiredProfessionId + requiredLevel (self-referential relation)

### Routes
- `dashboard.projects.$projectId.professions.tsx` — profession list
- `dashboard.projects.$projectId.professions.$professionId.tsx` — profession detail editor

### Editor UI (tabbed detail view)
- **General**: name, description, icon
- **Base Stats**: compact table with each project stat + value input
- **Growth Rates**: same layout for growth rate values
- **Equipment**: checkboxes for each WeaponType, ArmorType, EquipmentType
- **Prerequisites**: multi-select for other professions + level threshold each
- **Class Tree Visualizer**: read-only graph showing prerequisite chains (nice-to-have)

### Dependencies
- Phase 1 (StatDefinition)

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
- `dashboard.projects.$projectId.abilities.tsx` — ability list (filterable by AbilityType)
- `dashboard.projects.$projectId.abilities.$abilityId.tsx` — ability detail editor
- `dashboard.projects.$projectId.status-effects.tsx` — status effect list + detail

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
- `dashboard.projects.$projectId.weapons.tsx` — weapon list + detail
- `dashboard.projects.$projectId.armor.tsx` — armor list + detail
- `dashboard.projects.$projectId.accessories.tsx` — accessory list + detail
- `dashboard.projects.$projectId.consumables.tsx` — consumable list + detail

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
- `dashboard.projects.$projectId.units.tsx` — unit list (tabs: Player/Enemy/NPC)
- `dashboard.projects.$projectId.units.$unitId.tsx` — unit detail editor

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
- `dashboard.projects.$projectId.terrain.tsx` — terrain type list + CRUD
- `dashboard.projects.$projectId.maps.tsx` — map list (card grid with thumbnails)
- `dashboard.projects.$projectId.maps.$mapId.tsx` — full-page map editor

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
- `dashboard.projects.$projectId.campaign.tsx` — chapter list with drag-reorder, scenarios per chapter
- `dashboard.projects.$projectId.scenarios.$scenarioId.tsx` — scenario editor (tabs: Setup, Unit Placement, Conditions, Rewards, Dialogue)
- `dashboard.projects.$projectId.dialogues.tsx` — dialogue list + sequential/node editor
- `dashboard.projects.$projectId.battle-config.tsx` — project-wide battle system configuration

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
Phase 0: Project Management          [FOUNDATION — build first]
    |
Phase 1: Stats & Elements            [Core data types]
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
/dashboard                                          (existing — project list home)
/dashboard/profile                                  (existing)
/dashboard/projects/new                             (Phase 0)
/dashboard/projects/:projectId                      (Phase 0 — project layout)
/dashboard/projects/:projectId/settings             (Phase 0)
/dashboard/projects/:projectId/stats                (Phase 1)
/dashboard/projects/:projectId/elements             (Phase 1)
/dashboard/projects/:projectId/professions          (Phase 2)
/dashboard/projects/:projectId/professions/:id      (Phase 2)
/dashboard/projects/:projectId/abilities            (Phase 3)
/dashboard/projects/:projectId/abilities/:id        (Phase 3)
/dashboard/projects/:projectId/status-effects       (Phase 3)
/dashboard/projects/:projectId/weapons              (Phase 4)
/dashboard/projects/:projectId/armor                (Phase 4)
/dashboard/projects/:projectId/accessories          (Phase 4)
/dashboard/projects/:projectId/consumables          (Phase 4)
/dashboard/projects/:projectId/units                (Phase 5)
/dashboard/projects/:projectId/units/:id            (Phase 5)
/dashboard/projects/:projectId/terrain              (Phase 6)
/dashboard/projects/:projectId/maps                 (Phase 6)
/dashboard/projects/:projectId/maps/:mapId          (Phase 6)
/dashboard/projects/:projectId/campaign             (Phase 7)
/dashboard/projects/:projectId/scenarios/:id        (Phase 7)
/dashboard/projects/:projectId/dialogues            (Phase 7)
/dashboard/projects/:projectId/battle-config        (Phase 7)
/play/:projectId/:scenarioId                        (Phase 8)
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
