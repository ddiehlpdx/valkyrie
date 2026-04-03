# Valkyrie Full Feature Roadmap: Current State to Playable MVP

## Context

Valkyrie aims to be the "RPG Maker" for tactical RPGs (Final Fantasy Tactics, Tactics Ogre, Triangle Strategy) — a full in-browser editor AND game runtime.

**Current state:** Phases 0 and 1 are complete. Phase 3 schema is done. The foundation includes authentication (sign-up/sign-in with async bcrypt, cookie sessions), user profiles with avatar upload, full project CRUD with collaborator management, ProjectSettings (grid/battle/progression config + base damage type colors), project deletion with cascade, access control middleware (owner vs collaborator roles), a dashboard with project card grid, and conditional sidebar navigation. Phase 1 delivered the core game data layer: StatDefinition (with CategoryType enum), DamageType (with BaseDamageType enum, color, icon, description, and DamageTypeInteraction N×N multiplier matrix), plus full CRUD editors for Profession (with weapon/armor type permissions), WeaponType, ArmorType, AbilityType, and EquipmentType. Note: the original Element/ElementInteraction models were refactored out — elements are now expressed as DamageTypes with color/icon/description and a DamageTypeInteraction matrix. Phase 3 schema work added StatusEffect, StatusEffectStatModifier, Ability, AbilityStatusEffect, and ProfessionAbility. All editors feature drag-and-drop reordering (@dnd-kit), Zod + react-hook-form validation, Dialog-based create/edit, AlertDialog delete confirmation, and Sonner toast notifications. The smart save pattern and Editor UI Design Standards are established.

This roadmap takes us from current state to a playable MVP across 9 phases.

### Key Architectural Decisions
- **Route structure**: Projects live at `/projects/:projectId/...` (separate from `/dashboard`). This gives projects their own layout with dedicated sidebar and breadcrumbs, independent of the dashboard layout.
- **Stat system**: Hybrid — fixed core stats (HP, MP, MOV) + user-defined custom stats per project
- **Rendering**: Pixi.js (v8) for isometric 2.5D — WebGL-accelerated sprite rendering with depth sorting via z-index, elevation via y-offset, and camera panning/zoom. Chosen over raw Canvas (insufficient for isometric depth sorting) and Three.js (overkill for sprite-based games). Shared rendering module used by both map editor and game runtime.
- **Isometric coordinate system**: Tiles render as isometric diamonds with `(x, y, elevation)` coordinates. Utility module provides `gridToScreen` / `screenToGrid` conversions. Elevation adjusts y-offset and z-index for correct visual stacking (FFT-style 2.5D).
- **Formulas**: Stored as string expressions, validated with `expr-eval` library (lightweight, zero-dep). Sandboxed parser — never `eval()`. Formulas reference stat abbreviations + built-in keywords (`level`, `random`, etc.). Validated at save time, evaluated at runtime only.
- **Dialogue system**: Branching with consequences — boolean flags + enum state variables per project. Dialogue choices can set flags; scenario conditions can check flags. Sequential line editor for MVP (visual node graph deferred to post-MVP).
- **Asset management**: Cloudflare R2 (S3-compatible, zero egress fees) for cloud storage. Presigned upload URLs — browser uploads directly to R2, no server streaming. Every entity with an `iconKey` also gets an optional `assetId` FK; `iconKey` serves as fallback. Asset browser dialog is a shared component used across all entity editors.
- **Computed stats**: Calculated on read, not stored. Server-side utility function combines profession base stats + level growth + unit overrides + equipment bonuses. No cache invalidation needed.

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
- `DamageType`: id, name, description?, color, iconKey, baseType (`BaseDamageType` enum: Physical/Magical/Chemical/Environmental), projectId, displayOrder. Relations: `sourceInteractions DamageTypeInteraction[]`, `targetInteractions DamageTypeInteraction[]`
- `DamageTypeInteraction`: id, sourceDamageTypeId, targetDamageTypeId, multiplier (Float, default 1.0), projectId. `@@unique([projectId, sourceDamageTypeId, targetDamageTypeId])`. Replaces the old Element/ElementInteraction pattern.
- `WeaponType`: expanded with optional `damageTypeId` (SetNull on delete)
- `Profession`: expanded with `displayOrder`, relations to `ProfessionWeaponType` and `ProfessionArmorType`
- `ProfessionWeaponType`: junction table — professionId + weaponTypeId + projectId. `@@unique([professionId, weaponTypeId])`. Cascade delete from both sides
- `ProfessionArmorType`: junction table — professionId + armorTypeId + projectId. `@@unique([professionId, armorTypeId])`. Cascade delete from both sides
- `ArmorType`, `AbilityType`, `EquipmentType`: expanded with `displayOrder`
- `ProjectSettings`: expanded with `physicalColor`, `magicalColor`, `chemicalColor`, `environmentalColor` (base damage type color defaults)
- Project model updated with relations to all new entities
- **Note:** `Element` and `ElementInteraction` models were removed in a post-Phase-1 refactor. DamageType now fulfills the visual/elemental role (color, icon, description, interaction matrix).

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

## Phase 2: Professions/Job Classes + Template Seeding

**Expand the Profession model into a full job class system and implement project template seeding.** Basic Profession CRUD with weapon/armor type permissions already exists from Phase 1. This phase introduces the first "detail editor" route pattern (tabbed sub-page) which becomes the template for all future detail editors.

### Already Complete (from Phase 1)
- Profession model with name, displayOrder, projectId
- ProfessionWeaponType and ProfessionArmorType junction tables
- Profession list route (`projects.$projectId.professions.tsx`) with CRUD + drag-and-drop reorder
- ProfessionFormDialog with weapon/armor type checkbox selection

### Key Architectural Decisions
- **Detail route pattern**: First tabbed detail editor (`professions.$professionId.tsx`). Uses shadcn `Tabs` component. This pattern is reused by abilities, equipment, units, and scenario editors in later phases.
- **Stat-referencing junction tables**: `ProfessionBaseStat` and `ProfessionGrowthRate` establish the "entity + stat + value" junction table pattern reused heavily in Phases 3-5. All carry `projectId` for cascade and query scoping.
- **Self-referential prerequisites**: `ProfessionPrerequisite` creates a DAG. Cycle detection happens in the API layer (walk the graph in application code — dataset is small, rarely >30 professions).
- **Template seeding as transaction extension**: `seedStarterTemplate()` is called inside the existing `createProject` transaction in `app/api/project.ts`. Template data lives in `app/lib/seed-templates.server.ts` as typed constants.

### Schema
- **Modify** `profession.prisma` — add `description: String?`, `iconKey: String @default("graduation-cap")`
- **Create** `professionBaseStat.prisma`: professionId + statDefinitionId + `baseValue: Int`, projectId. `@@unique([professionId, statDefinitionId])`
- **Create** `professionGrowthRate.prisma`: professionId + statDefinitionId + `growthRate: Float`, projectId. `@@unique([professionId, statDefinitionId])`
- **Create** `professionPrerequisite.prisma`: professionId + requiredProfessionId + `requiredLevel: Int @default(1)`, projectId. `@@unique([professionId, requiredProfessionId])`. Two named self-relations on Profession.

### Routes
- `projects.$projectId.professions.$professionId.tsx` — tabbed detail editor (Overview, Base Stats, Growth Rates, Prerequisites)

### Editor UI
- **Overview tab**: name, description, iconKey, weapon/armor type checkboxes (refactored from existing dialog into inline form with smart save)
- **Base Stats tab**: table of all project stats with editable base value column, smart save pattern
- **Growth Rates tab**: same structure, with tooltip explaining growth model semantics based on `ProjectSettings.statGrowthModel`
- **Prerequisites tab**: list of current prerequisites with remove button, combobox to add (filtered to exclude self and cycles)
- **Class Tree Visualizer**: read-only prerequisite chain graph (nice-to-have)

### Sub-Tasks
1. Update Profession schema — add `description`, `iconKey`, relation stubs. `prisma generate`, verify existing route still works.
2. Create ProfessionBaseStat, ProfessionGrowthRate, ProfessionPrerequisite schemas. Update Project relations. `prisma db push`.
3. Update `app/api/profession.ts` — add `upsertProfessionBaseStats`, `upsertProfessionGrowthRates` (bulk delete-then-createMany), `addPrerequisite`, `removePrerequisite` with cycle detection.
4. Update existing profession form dialog — add `description` and `iconKey` fields. Update profession table to show icon.
5. Create profession detail route with loader (single profession + all relations + project stat definitions) and action (update_overview, upsert_base_stats, upsert_growth_rates, add/remove_prerequisite).
6. Build profession detail components in `app/components/professions/`: overview-tab, base-stats-tab, growth-rates-tab, prerequisites-tab.
7. Update professions list — make name a clickable Link to detail route.
8. Create `app/lib/seed-templates.server.ts` with STARTER_TEMPLATE constant: stats (HP, MP, STR, MAG, DEF, RES, SPD, MOV, LCK), elements (Fire, Water, Earth, Wind, Lightning, Ice, Light, Dark) with interactions, damage types (Physical, Magical), weapon types (Sword, Spear, Axe, Bow, Staff, Dagger), armor types (Heavy, Light, Robes, Shield), professions (Squire, Knight, Mage, Archer, Thief, Priest) with weapon/armor assignments and base stats.
9. Update `createProject` in `app/api/project.ts` — when `template === 'starter'`, call `seedStarterTemplate(tx, projectId)` within the existing transaction. Seed in dependency order: stats → elements → interactions → damage types → weapon/armor types → professions.
10. Verify: create project with starter template, confirm all seeded data in every editor. Create blank project, confirm empty.

### Dependencies
- Phase 1 (StatDefinition) ✓

### Risks
- **displayOrder with autoincrement**: When seeding, explicitly set `displayOrder` values — auto-increment is global, not project-scoped.
- **Growth rate semantics**: UI must explain what the number means based on `StatGrowthModel` (ClassBased vs Individual vs Hybrid). Add contextual help text.
- **Prerequisite cycle detection**: Checking only `professionId !== requiredProfessionId` is insufficient. Walk the full graph. Application code is simpler than recursive CTE for this dataset size.

---

## Phase 3: Abilities & Status Effects

**The heart of tactical RPG combat.** Introduces the formula system, two new entity categories with cross-references, and the most complex data model so far.

### Key Architectural Decisions
- **Build status effects first**: Abilities reference status effects, so status effects must exist first.
- **Formula system**: String-based formulas with restricted grammar (e.g., `ATK * 1.5 - DEF * 0.5`). Validated with `expr-eval` parser. Client-side autocomplete for stat abbreviations. No visual formula builder for MVP — validated text input is sufficient.
- **Flat columns over JSON for targeting**: `rangeMin`, `rangeMax`, `aoeShape` (enum), `aoeSize` as typed columns. Better Prisma filtering and validation than a JSON blob.
- **FormulaInput as shared component**: `app/components/shared/formula-input.tsx` — reused in battle config (Phase 7a) and ability editor. Provides stat autocomplete, syntax validation, and a "Test" popover for sample evaluation.
- **JP cost on junction only**: `ProfessionAbility.jpCost` is the only JP cost field. No `jpCost` on Ability itself — JP is class-specific, not skill-intrinsic. `mpCost` stays on Ability since it's inherent to the skill.

### Schema — BUILT
- **Enums**: `TargetType` (Self, SingleAlly, SingleEnemy, AllAllies, AllEnemies, Area, Line), `StatusEffectCategory` (Buff/Debuff/Neutral), `DurationType` (Temporary/Permanent/UntilBattleEnd), `EffectType` (Inflict/Cure), `ModifierType` (Flat/Percentage)
- **StatusEffect**: name, description?, color, iconKey, category (StatusEffectCategory), durationType, duration (Int?), stackable, preventsActions, causesRecurring, recurringFormula?, projectId, displayOrder. Relations: `statModifiers StatusEffectStatModifier[]`, `abilities AbilityStatusEffect[]`
- **StatusEffectStatModifier**: statusEffectId + statId (→StatDefinition) + modifierType (ModifierType) + value (Float) + projectId. `@@unique([statusEffectId, statId])`
- **Ability**: name, description?, abilityTypeId?, damageTypeId?, targetType, rangeMin, rangeMax, aoeRadius, mpCost, powerFormula?, projectId, displayOrder. Relations: `professions ProfessionAbility[]`, `statusEffects AbilityStatusEffect[]`
- **AbilityStatusEffect**: abilityId + statusEffectId + effectType (EffectType) + chance (Float, 0–1.0) + projectId. `@@unique([abilityId, statusEffectId, effectType])`
- **ProfessionAbility**: professionId + abilityId + jpCost + projectId. `@@unique([professionId, abilityId])`

### Schema — PLANNED (not yet built)
- **AbilityStatModifier**: abilityId + statDefinitionId + modifierType + value. `@@unique([abilityId, statDefinitionId])` — direct stat boosts from abilities (buffs, debuffs that aren't via status effects)

### Routes
- `projects.$projectId.status-effects.tsx` — list with Dialog CRUD (status effects are simple enough for dialogs)
- `projects.$projectId.abilities.tsx` — list filterable by AbilityType, click to detail
- `projects.$projectId.abilities.$abilityId.tsx` — tabbed detail editor (Overview, Targeting, Formula & Power, Effects)

### Sub-Tasks
1. ✓ Create enums and StatusEffect + StatusEffectStatModifier schemas. Update Project relations.
2. ✓ Create Ability schema and junction tables (AbilityStatusEffect, ProfessionAbility). Update Project, Profession, AbilityType, DamageType relations.
3. Build `app/api/statusEffect.ts` — CRUD + reorder + `upsertStatModifiers`.
4. Build `app/api/ability.ts` — CRUD + reorder + junction table management.
5. Add profession ability functions to `app/api/profession.ts`: getProfessionAbilities, add/remove/updateProfessionAbility.
6. Install `expr-eval`. Build formula utility module (`app/lib/formula/`): `variables.ts`, `validate.ts`, `evaluate.ts`.
7. Build FormulaInput component (`app/components/shared/formula-input.tsx`) — stat autocomplete via Popover, syntax validation on blur, "Test" popover with sample variable inputs.
8. Build status effects list route + components (`app/components/status-effects/`). Dialog includes inline stat modifier section.
9. Build abilities list route with AbilityType filtering (tabs or select).
10. Build ability detail route with tabs: Overview (name, type, element, costs, icon), Targeting (range, AoE shape selector, target type), Formula & Power (FormulaInput, power, accuracy), Effects (status effects junction + direct stat modifiers).
11. Build ability components in `app/components/abilities/`.
12. Add Abilities tab to Phase 2's profession detail route — shows abilities this profession teaches with learn level and JP cost.
13. Update sidebar — add "Status Effects" and "Abilities" under "Abilities & Skills". Update breadcrumbs.

### Dependencies
- Phase 1 (StatDefinition) ✓
- Phase 2 (Profession — for ProfessionAbility)

### Risks
- **Formula validation depth**: Validate syntax only at this stage (balanced parens, known operators, known variables). Actual evaluation is a runtime concern (Phase 8).
- **AbilityType vs Ability naming**: AbilityType is a classification ("Black Magic", "Skill"). Ability is the actual skill ("Fire", "Cure"). Clarify in UI with descriptive labels.
- **Cascading deletes on StatDefinition**: Deleting a stat cascades through StatusEffectStatModifier, AbilityStatModifier, ProfessionBaseStat, ProfessionGrowthRate. Warn users in the stat delete AlertDialog.
- **Formula defaults referencing nonexistent stats**: Default formulas use abbreviations like ATK, DEF that may not exist in a fresh project. Validation should warn (not block) — user may create those stats later.

---

## Phase 4: Equipment

**Concrete items that units equip.** Expands the Phase 1 type models (WeaponType, ArmorType, EquipmentType) into actual item instances with stat modifiers, element associations, and granted abilities.

### Key Architectural Decisions
- **Separate stat modifier tables** (not polymorphic): `WeaponStatModifier`, `ArmorStatModifier`, `AccessoryStatModifier` as separate tables. Prisma doesn't support union FK constraints, and separate tables keep queries simple and type-safe. Shared Zod schema and shared form component.
- **Shared equipment editor components**: Build Weapons first as the reference implementation, then replicate. Extract shared components: stat modifier editor, granted ability selector, element resistance editor.
- **Consumables are simpler**: No stat modifiers or element associations. Just name, icon, target type, optional formula, optional status effect reference. Dialog-based CRUD (no detail route).
- **Equipment slot system**: Slots are determined by EquipmentType and WeaponType, not by the equipment item itself. Validation (e.g., two-handed blocks off-hand) happens in Phase 5's API layer.

### Schema
- **Weapon**: name, description, iconKey, weaponTypeId, damageTypeId?, elementId?, attackPower, accuracy, critRate, rangeMin, rangeMax, twoHanded (Boolean), projectId, displayOrder. Relations: `statModifiers WeaponStatModifier[]`, `grantedAbilities WeaponGrantedAbility[]`
- **WeaponStatModifier**: weaponId + statDefinitionId + modifierType + value. `@@unique([weaponId, statDefinitionId])`
- **WeaponGrantedAbility**: weaponId + abilityId. `@@unique([weaponId, abilityId])`
- **Armor**: name, description, iconKey, armorTypeId, defense, magicDefense, projectId, displayOrder. Relations: `statModifiers ArmorStatModifier[]`, `elementResistances ArmorElementResistance[]`
- **ArmorStatModifier**: armorId + statDefinitionId + modifierType + value. `@@unique([armorId, statDefinitionId])`
- **ArmorElementResistance**: armorId + elementId + resistance (Float, default 1.0 — 0.5 = resist, 0.0 = immune, 2.0 = weak). `@@unique([armorId, elementId])`
- **Accessory**: name, description, iconKey, projectId, displayOrder. Relations: statModifiers, grantedAbilities, statusEffects, elementResistances (same pattern as weapon/armor)
- **AccessoryStatModifier, AccessoryGrantedAbility, AccessoryStatusEffect, AccessoryElementResistance** — same structural patterns
- **Consumable**: name, description, iconKey, targetType, formula?, statusEffectId?, aoeShape, aoeSize, projectId, displayOrder

### Routes
- `projects.$projectId.weapons.tsx` — list + `weapons.$weaponId.tsx` detail (tabs: Overview, Stat Bonuses, Granted Abilities)
- `projects.$projectId.armor.tsx` — list + `armor.$armorId.tsx` detail (tabs: Overview, Stat Bonuses, Element Resistances)
- `projects.$projectId.accessories.tsx` — list + `accessories.$accessoryId.tsx` detail (tabs: Overview, Stat Bonuses, Granted Abilities, Status Effects, Element Resistances)
- `projects.$projectId.consumables.tsx` — list with Dialog CRUD (no detail route)

### Sub-Tasks
1. Create Weapon + WeaponStatModifier + WeaponGrantedAbility schemas. Update Project, WeaponType, DamageType, Element, Ability relations.
2. Create Armor + ArmorStatModifier + ArmorElementResistance schemas. Update relations.
3. Create Accessory + four junction table schemas. Update relations.
4. Create Consumable schema. Update relations.
5. Build shared equipment components in `app/components/shared/`: `stat-modifier-editor.tsx` (reusable table/form for stat modifiers with smart save), `granted-ability-selector.tsx` (combobox for ability selection), `element-resistance-editor.tsx` (grid with color-coded multipliers matching Element Interaction pattern).
6. Build `app/api/weapon.ts` — CRUD + reorder + stat modifier upsert + granted ability management.
7. Build Weapon list route + detail route + components in `app/components/weapons/`.
8. Build Armor API, routes, and components (replicate weapon pattern, swap granted abilities for element resistances).
9. Build Accessory API, routes, and components (most complex — touches four junction tables).
10. Build Consumable API + list route with Dialog CRUD.
11. Update sidebar — replace "Equipment & Items" children with: Weapons, Armor, Accessories, Consumables. Move type definitions (Weapon Types, Armor Types, Equipment Types) to a "Configuration" sub-group.
12. Update breadcrumbs for all new routes.

### Dependencies
- Phase 1 (StatDefinition, Element) ✓
- Phase 3 (Ability — for weapon granted abilities, consumable effects; StatusEffect — for accessory status effects)

### Risks
- **Schema file count**: Phase 4 adds ~12 new schema files. Test `prisma generate` performance with `prismaSchemaFolder`.
- **Accessory complexity**: Accessories touch four junction tables. Consider deferring `AccessoryStatusEffect` and `AccessoryElementResistance` to a fast-follow if scope becomes an issue.
- **WeaponType vs Weapon naming**: Same as AbilityType/Ability. WeaponType = category ("Sword"), Weapon = specific item ("Excalibur"). Clarify in UI copy.
- **Two-handed constraint**: Plan for this now even though enforcement happens in Phase 5's equipment slot validation.

---

## Phase 5: Characters/Units

**The entities that populate battles.** Units combine professions, stats, equipment, and abilities into playable characters and enemies.

### Key Architectural Decisions
- **Single Unit model with type enum**: Player, Enemy, NPC, GuestAlly share 90%+ of their data structure. Type-specific fields (AI config) are nullable.
- **Computed stats on read, not write**: `computeUnitStats()` is a pure server-side utility in `app/lib/stat-computation.server.ts`. Takes all relevant data as args, returns computed totals. No stored computed fields — avoids cache invalidation when equipment/professions/stats change.
- **AI config as JSON**: `aiConfig: Json?` on Unit model with TypeScript interface and Zod validation. Flexible for iteration, simple schema. Shape: `{ behavior, targetPriority, abilityPreferences[], retreatThreshold }`.
- **Equipment slots**: `UnitEquipment` with one row per equipped slot. Single table with nullable `weaponId`, `armorId`, `accessoryId` (only one non-null per row). Validation in API layer. Accessory slot count configurable via `ProjectSettings.accessorySlotCount`.
- **Profession deletion safety**: `professionId` on Unit uses `onDelete: SetNull` (not Cascade) — a unit without a profession is recoverable; a deleted unit is not.

### Schema
- **Enums**: `UnitType` (Player, Enemy, NPC, GuestAlly), `AIBehavior` (Aggressive, Defensive, Support, Balanced, Custom)
- Add `accessorySlotCount: Int @default(2)` to ProjectSettings
- **Unit**: name, description, iconKey, unitType, level, professionId? (SetNull on delete), aiConfig (Json?), isUnique (Boolean), projectId, displayOrder. Relations: `baseStatOverrides UnitBaseStat[]`, `equipment UnitEquipment[]`, `learnedAbilities UnitLearnedAbility[]`
- **UnitBaseStat**: unitId + statDefinitionId + baseValue (Int?) + growthRate (Float?). Nullable fields mean "use profession default". `@@unique([unitId, statDefinitionId])`
- **UnitEquipment**: unitId + slot (String) + weaponId? + armorId? + accessoryId? (only one non-null per row, validated in API). `@@unique([unitId, slot])`
- **UnitLearnedAbility**: unitId + abilityId. `@@unique([unitId, abilityId])`

### Routes
- `projects.$projectId.units.tsx` — list with type tabs (All, Player, Enemy, NPC, Guest Ally), quick-create dialog
- `projects.$projectId.units.$unitId.tsx` — tabbed detail editor (Overview, Stats, Equipment, Abilities, AI Config)

### Sub-Tasks
1. Add `accessorySlotCount` to ProjectSettings schema.
2. Create Unit + UnitBaseStat + UnitEquipment + UnitLearnedAbility schemas with enums. Update Project, Profession, Ability, Weapon, Armor, Accessory relations.
3. Build `app/lib/stat-computation.server.ts` — pure function `computeUnitStats(unit, profession, professionBaseStats, professionGrowthRates, unitBaseStats, equipment, statDefinitions, projectSettings): ComputedStat[]`. Returns `{ statDefinition, baseValue, growthBonus, equipmentBonus, totalValue }` per stat.
4. Build `app/api/unit.ts` — CRUD + reorder + `upsertUnitBaseStats`, `equipItem` (with validation: profession allows type, two-handed check, slot availability), `unequipItem`, `learnAbility`, `unlearnAbility`.
5. Build Unit list route with type tabs. Table shows: name, type, level, profession, HP/MP summary. Quick-create dialog (name, type, level, profession select).
6. Build Unit detail route. Loader computes stats server-side. Tabs:
   - **Overview**: name, description, icon, type, level, profession dropdown, isUnique toggle
   - **Stats**: computed stats table (stat name, profession base, growth bonus, override, equipment bonus, total). Editable override columns for Individual/Hybrid growth models. Smart save.
   - **Equipment**: visual slot layout. Each slot is a card (equipped item or "Empty"). Click to open equip dialog filtered by profession permissions. Stat change preview on hover.
   - **Abilities**: "Available from Profession" (read-only) + "Learned" (toggleable checkboxes)
   - **AI Config** (Enemy/GuestAlly only): behavior select, target priority, ability preferences (sortable), retreat threshold slider
7. Build unit components in `app/components/units/`: unit-table, unit-form-dialog, tab components, equipment-slot, equip-dialog.
8. Build `app/components/shared/stat-preview.tsx` — before/after stat comparison (green increase, red decrease).
9. Update sidebar — add "Units" under "Characters & Classes". Update breadcrumbs.
10. Integration test: create unit → assign profession → set stat overrides → equip items → learn abilities → configure AI → verify computed stats.

### Dependencies
- Phase 2 (Profession with base stats/growth rates)
- Phase 3 (Ability — for learned abilities)
- Phase 4 (Equipment — for unit equipment slots)

### Risks
- **Computed stats performance**: For the list page, compute only HP/MP summary (skip equipment bonuses). Full computation only on detail route.
- **UnitEquipment polymorphic FK**: Trade-off vs three separate tables. Single table is better DX — equipment loadout is always displayed together. Validate one-non-null constraint in API.
- **AI config JSON migration**: Use Zod `.passthrough()` so unknown fields don't cause errors during shape evolution.
- **Cascade delete depth**: Deleting a profession nullifies unit references (SetNull). AlertDialog should warn about affected units.

---

## Phase 5b: Asset Management (can be developed in PARALLEL with Phases 2-5)

**Cloud-based asset storage for sprites, portraits, tilesets, and icons.** Replaces icon keys and colored placeholders with real uploaded images across all entities. Built as infrastructure early so every editor and the runtime can reference real assets.

### Key Architectural Decisions
- **Cloudflare R2** (S3-compatible, zero egress fees): Chosen for cost efficiency and S3 API compatibility. Swap-friendly with AWS S3 if needed.
- **Presigned upload URLs**: Server generates presigned PUT URLs via S3 SDK. Browser uploads directly to R2 — no file streaming through the Remix server. Avoids request size limits and server memory pressure.
- **Asset model as first-class entity**: `Asset` is project-scoped with metadata (type, dimensions, mime type). All entities get an optional `assetId` FK alongside their existing `iconKey`. `iconKey` serves as fallback when no asset is uploaded — keeps backward compatibility and works for quick prototyping.
- **Asset browser as reusable component**: `AssetBrowserDialog` component used by every entity editor that needs asset selection. Gallery grid with type filtering, search, drag-drop upload zone, and click-to-select.
- **Thumbnail generation**: Client-side via Canvas API on upload (generate a small thumbnail before uploading). Store thumbnail URL as a field on Asset. Avoids server-side image processing dependency.
- **AssetType enum scoping**: Assets are typed (Sprite, Portrait, Tileset, Icon, Effect) so the asset browser can filter by context (e.g., terrain editor only shows Tileset assets, unit editor only shows Portrait/Sprite).

### Schema
- **Enums**: `AssetType` (Sprite, Portrait, Tileset, Icon, Effect)
- **Asset**: id, projectId, assetType, filename, storageKey (R2 object key), mimeType, width (Int?), height (Int?), fileSize (Int), thumbnailKey?, uploadedById (FK to User), createdAt. `@@index([projectId, assetType])`
- **Entity updates** — add `assetId: String?` (FK to Asset, onDelete: SetNull) to every entity with an `iconKey`:
  - StatDefinition, Element, DamageType, Profession, AbilityType, WeaponType, ArmorType, EquipmentType (Phase 1 entities)
  - StatusEffect, Ability (Phase 3)
  - Weapon, Armor, Accessory, Consumable (Phase 4)
  - Unit (Phase 5 — portrait + sprite, so `portraitAssetId` and `spriteAssetId`)
  - TerrainType (Phase 6 — tilesetAssetId)

### Routes
- `projects.$projectId.assets.tsx` — asset library browser (gallery grid with upload, type filtering, search, delete)

### Sub-Tasks
1. **R2/S3 infrastructure setup**: Configure R2 bucket. Add `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` env vars. Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
2. **Create Asset schema** with enum and relations. Add `assetId` FK to all existing entity schemas that have `iconKey` (Phase 1 entities immediately; Phase 3-6 entities get theirs when those phases are built). `prisma db push`.
3. **Build server utility** `app/lib/asset-storage.server.ts`: `generateUploadUrl(projectId, filename, contentType): {uploadUrl, storageKey}`, `generateDownloadUrl(storageKey): string`, `deleteAsset(storageKey): void`. Presigned URLs with 15-minute expiry.
4. **Build `app/api/asset.ts`**: `getAssetsByProjectId(projectId, assetType?)`, `createAssetRecord(data)` (creates DB record after successful upload), `deleteAsset(assetId)` (deletes R2 object + DB record), `getAssetById(assetId)`.
5. **Build asset library route** `projects.$projectId.assets.tsx`: gallery grid with type filter tabs, search by filename, drag-drop upload zone, delete with AlertDialog. Upload flow: user drops file → client generates thumbnail → server returns presigned URL → browser uploads to R2 → on success, server creates Asset record with metadata.
6. **Build `AssetBrowserDialog` component** (`app/components/shared/asset-browser-dialog.tsx`): reusable dialog for selecting an asset. Props: `projectId`, `assetType` (filter), `onSelect(asset)`, `currentAssetId?`. Shows filtered gallery grid + "Upload New" button. Used by every entity editor's icon/image field.
7. **Build `AssetPreview` component** (`app/components/shared/asset-preview.tsx`): small inline preview showing either the uploaded asset thumbnail or the fallback Lucide icon. Used in entity cards, tables, and form fields.
8. **Retrofit Phase 1 entities**: Add `assetId` to StatDefinition, Element, DamageType, Profession, AbilityType, WeaponType, ArmorType, EquipmentType schemas. Update their form dialogs to show an optional "Custom Image" section with AssetBrowserDialog alongside the existing iconKey dropdown. Update table/card displays to use AssetPreview.
9. **Update sidebar** — add "Asset Library" under a "Project" group or as a top-level link.
10. **Document the asset integration pattern** so Phases 3-6 add `assetId` to their entities naturally as they're built (each phase's schema section should include the assetId FK).

### Dependencies
- Phase 0 (project context) only. Can start as early as after Phase 1.
- Phases 3-6 integrate with assets as they're built — each adds `assetId` FKs to their new entities.

### Risks
- **R2 configuration complexity**: Presigned URLs require correct CORS configuration on the R2 bucket. Test upload from browser early — CORS mismatches are the most common failure.
- **File size limits**: Set a max upload size (e.g., 5MB for sprites, 10MB for tilesets). Validate client-side before upload and server-side when generating presigned URL.
- **Orphaned R2 objects**: If the browser uploads to R2 but the Asset record creation fails, the R2 object is orphaned. Mitigate with a periodic cleanup job (post-MVP) or by generating very short-lived presigned URLs.
- **Migration for existing entities**: Adding nullable `assetId` to existing models is non-breaking (all existing rows get null). No data migration needed.
- **Pixi.js texture loading**: In Phase 6/8, the renderer needs to load textures from R2 URLs. Pixi.js `Assets.load()` handles this natively, but CORS headers must be set on R2 for cross-origin texture access.

### Verification
- Upload an image via the asset library; verify it appears in the gallery
- Select an asset from AssetBrowserDialog in an entity editor; verify the reference saves
- Clear an asset reference; verify fallback to iconKey display
- Delete an asset; verify R2 object removed and entity references nullified (SetNull)
- Upload from drag-drop zone; verify thumbnail generation and metadata capture
- Filter assets by type; verify correct filtering

---

## Phase 6: Maps & Terrain (can be developed in PARALLEL with Phases 3-5)

**The battlefield.** Introduces Pixi.js for isometric 2.5D rendering. The shared rendering module built here is reused directly by the game runtime in Phase 8.

### Key Architectural Decisions
- **Pixi.js as shared rendering module**: All rendering code in `app/lib/pixi/` — pure client-side, never imported server-side. Exports a `PixiMapRenderer` class used by both map editor and game runtime with different interaction handlers.
- **Isometric from day one**: Tiles render as isometric diamonds. `app/lib/pixi/iso-math.ts` provides `gridToScreen(x, y, elevation)` and `screenToGrid(screenX, screenY)` conversions. Tile dimensions driven by `ProjectSettings.defaultTileSize`.
- **Bulk tile persistence with debounced saves**: Paint strokes accumulate in a local buffer. Debounced submit (500ms after last paint) sends the batch as a single `bulk_upsert_tiles` action.
- **Full-page editor layout**: Map editor route breaks out of the standard `max-w-6xl` container. Left toolbar + center Pixi canvas + collapsible right properties panel.
- **TerrainType as standard CRUD entity**: Follows the exact same editor pattern as Elements — cards, drag-and-drop reorder, Dialog CRUD.
- **MapTile terrainTypeId uses onDelete: Restrict**: Cannot delete a terrain type that's in use on a map. Forces user to repaint first.

### Schema
- **TerrainType**: name, description, movementCost (Int, 0=impassable), canFlyOver, canWalkOn, damagePerTurn, healPerTurn, defenseBonus (%), evasionBonus (%), color (hex), tilesetKey?, projectId, displayOrder
- **BattleMap**: name, description, width, height, projectId. Relations: `tiles MapTile[]`, `spawnZones SpawnZone[]`, `mapEvents MapEvent[]`
- **MapTile**: battleMapId, x, y, elevation (Int, default 0), terrainTypeId. `@@unique([battleMapId, x, y])`, `@@index([battleMapId])`. TerrainType relation uses `onDelete: Restrict`.
- **SpawnZone**: battleMapId, zoneType (`SpawnZoneType` enum: PlayerSpawn/EnemySpawn/AllySpawn), x, y. `@@unique([battleMapId, x, y])`
- **MapEvent**: battleMapId, name, eventType (`MapEventType` enum: Chest/Switch/Trap/Portal/Destructible/Conversation), x, y, triggerData (Json?). `@@index([battleMapId])`

### Pixi.js Rendering Module (`app/lib/pixi/`)
- **`iso-math.ts`**: `gridToScreen`, `screenToGrid`, `depthSort` (returns z-index from x, y, elevation)
- **`tile-renderer.ts`**: Manages Pixi.js Container of tile sprites. Accepts MapTile[] + TerrainType[], draws isometric diamonds with terrain color fill + elevation y-offset. Depth sorting via zIndex.
- **`camera-controller.ts`**: Pan (middle-mouse/two-finger), zoom (scroll wheel), keyboard pan (arrow keys). Manipulates stage position and scale.
- **`overlay-renderer.ts`**: Semi-transparent overlays for spawn zones (color-coded by type), map events (icon markers), grid lines, selection highlights.
- **`pixi-map-renderer.ts`**: Facade class. Constructor: `{container, width, height}`. Methods: `loadMap()`, `setTool()`, `onTilePaint(callback)`, `onTileSelect(callback)`, `destroy()`. Single entry point for both editor and runtime.

### Routes
- `projects.$projectId.terrain.tsx` — terrain type CRUD (card grid, same pattern as elements)
- `projects.$projectId.maps.tsx` — replace existing placeholder with real map list (card grid). Create dialog: name, description, width, height. On create, API generates width×height tiles with default terrain.
- `projects.$projectId.maps.$mapId.tsx` — full-page isometric map editor

### Map Editor Layout
- **Left toolbar** (~60px): tool buttons (Paint Terrain, Elevation +/-, Place Spawn, Place Event, Eraser, Select) via Radix ToggleGroup
- **Center**: Pixi.js canvas (mounted via `useRef` + `useEffect`, dynamic import to avoid SSR)
- **Right panel** (collapsible ~300px): terrain palette when painting, selected tile info when selecting, map settings tab
- **Bottom bar**: zoom controls, coordinate display, layer visibility toggles (terrain, grid, spawns, events)

### Sub-Tasks
1. Create all 5 schema files (TerrainType, BattleMap, MapTile, SpawnZone, MapEvent). Add Project relations. `prisma db push`.
2. Build API layer: `terrainType.ts` (CRUD + reorder), `battleMap.ts` (CRUD + create with default tiles), `mapTile.ts` (bulkUpsert using transaction), `spawnZone.ts` (CRUD), `mapEvent.ts` (CRUD).
3. Build Terrain Type editor route + components in `app/components/terrain/` (card grid pattern from elements).
4. Replace mock data in maps list route with real loader. Add create/delete actions.
5. Install Pixi.js v8: `npm install pixi.js`.
6. Build `app/lib/pixi/` module: iso-math, tile-renderer, camera-controller, overlay-renderer, pixi-map-renderer facade.
7. Build map editor route (`maps.$mapId.tsx`): full-page layout, mount PixiMapRenderer via useRef + useEffect with dynamic import.
8. Implement tile painting: active tool + selected terrain → click/drag → accumulate changes → debounced batch submit.
9. Implement elevation tool: increment/decrement on click, batch save.
10. Implement spawn zone placement: click tile to cycle through types or remove.
11. Implement event placement: click tile → dialog for event type + name + trigger data.
12. Update sidebar — add "Terrain Types" under "Maps & Terrain". Enable Maps link.

### Dependencies
- Phase 0 only (project context). Can genuinely be built in parallel with Phases 2-5.

### Risks
- **Pixi.js SSR crash**: Pixi accesses `window`/`document` at import time. Must use dynamic import (`React.lazy` or conditional `import()` inside `useEffect`). Never import at top level of a route file.
- **Large map performance**: 50×50 = 2,500 tiles. Pixi handles this fine, but bulk upsert must be efficient. For maps >40×40, consider chunked transactions (250 ops per chunk).
- **Isometric click detection**: `screenToGrid` for isometric diamonds requires inverse projection matrix. Write unit tests for `iso-math.ts`.
- **React + Pixi lifecycle**: Canvas must not double-mount on Remix revalidation. Use ref flag guard.
- **Map resize**: Defer resize-after-creation to secondary feature. First pass creates fixed-size maps.

### Verification
- Create terrain types with different movement costs and colors
- Create a battle map; verify tiles generated at correct count
- Open map editor; verify isometric rendering with correct depth sorting
- Paint terrain; verify debounced save persists correctly
- Adjust elevation; verify y-offset changes and depth re-sorting
- Place spawn zones; verify color-coded overlays
- Pan and zoom camera; verify smooth interaction
- Navigate away and back; verify persistence

---

## Phase 7a: Battle Config & Formula System

**Project-wide combat rules.** Expands the existing ProjectSettings model with formula fields and builds the formula validation/evaluation infrastructure.

### Key Architectural Decisions
- **Expand ProjectSettings**: Add formula string fields directly to the existing model. Keeps the 1:1 relationship with Project and avoids a second singleton model. The existing settings route already handles ProjectSettings updates.
- **Formula parser**: `expr-eval` (lightweight, zero-dep). Formula module at `app/lib/formula/` with validate, evaluate, and variable list functions. Validation runs server-side on save; evaluation is client-side only (runtime).
- **FormulaInput component**: May already be built in Phase 3 (for ability formulas). If so, reuse directly. If Phase 7a is built before Phase 3 (it can start after Phase 1), build it here first.

### Schema Changes (to existing `projectSettings.prisma`)
Add to ProjectSettings model:
- `physicalDamageFormula: String @default("ATK * 2 - DEF")`
- `magicalDamageFormula: String @default("MAG * 2 - RES")`
- `healingFormula: String @default("MAG * 1.5")`
- `accuracyFormula: String @default("HIT - EVA + 80")`
- `evasionFormula: String @default("SPD / 4")`
- `criticalHitFormula: String @default("LCK / 3")`
- `experienceFormula: String @default("baseExp * levelDiff")`
- `levelUpExpFormula: String @default("level * 100")`
- `ctFormula: String?` (only for Initiative turn system)
- `jumpFormula: String @default("JMP * 0.5")`
- `moveFormula: String @default("MOV")`

No new models required.

### Routes
- `projects.$projectId.battle-config.tsx` — formula editor with grouped cards

### Sub-Tasks
1. Install `expr-eval` (if not already done in Phase 3).
2. Build formula utility module `app/lib/formula/`: `variables.ts` (merge stat abbreviations with built-in keywords like `level`, `baseExp`, `random`), `validate.ts` (parse expression, check variable names), `evaluate.ts` (sandboxed evaluation for test preview).
3. Build FormulaInput component `app/components/shared/formula-input.tsx` (if not already built in Phase 3): input with validation on blur, "Variables" popover listing valid names, "Test" popover with sample inputs and computed result.
4. Add formula fields to ProjectSettings schema. `prisma db push`.
5. Update `app/api/projectSettings.ts` — extend update interface with formula fields.
6. Build battle config route. Loader fetches project settings + stat definitions (for autocomplete). Cards grouped by concern:
   - **Turn System**: turn system select + CT formula (shown only for Initiative)
   - **Damage Formulas**: physical, magical, accuracy, evasion, critical hit
   - **Healing**: healing formula
   - **Progression**: experience, level-up experience, max level
   - **Movement**: move formula, jump formula
   - Each card uses FormulaInput with smart save pattern.
7. Update sidebar — add "Battle Config" link under a "Battle System" group.

### Dependencies
- Phase 1 (StatDefinition — for variable autocomplete) ✓
- Note: Can start as early as after Phase 1 since it only needs stat definitions

### Risks
- **Formula defaults referencing nonexistent stats**: Default formulas use ATK, DEF, etc. which may not exist. Validation should warn, not block.
- **expr-eval SSR**: Pure JS, works server-side. But "Test" evaluation should be client-side only.

### Verification
- All formula fields display with defaults
- Edit formula → see valid/invalid feedback inline
- "Variables" button shows stat abbreviations + built-ins
- "Test" button → fill sample values → see computed result
- Invalid formula shows error, save button disabled
- Save and reload → formulas persist

---

## Phase 7b: Campaign, Scenarios & Conditions

**The battle orchestration layer.** Ties maps, units, and conditions into playable encounters organized by campaign structure.

### Key Architectural Decisions
- **Campaign > Chapter > Scenario hierarchy**: Campaign → ordered Chapters → ordered Scenarios per chapter. A Scenario is the "battle instance" linking to a BattleMap with unit placement, conditions, and rewards.
- **Scenario editor embeds Pixi.js renderer**: Read-only map rendering (no painting) with unit placement overlay. First major reuse of the Phase 6 shared rendering module.
- **Typed conditions with JSON targetData**: VictoryCondition and DefeatCondition use `conditionType` enum + `targetData: Json?`. Shape depends on type: DefeatTarget → `{unitId}`, SurviveTurns → `{turns}`, ReachTile → `{x, y}`. Editor shows type-specific sub-forms dynamically.
- **ScenarioReward with polymorphic FKs**: Nullable weaponId/armorId/accessoryId/consumableId (one non-null per row). Maintains referential integrity with FKs and cascade deletes.
- **Scenarios can exist unlinked**: A Scenario can exist without being in any Chapter. Allows creating scenarios first, organizing later. UI surfaces "unlinked scenarios."

### Schema
- **Campaign**: name, description, projectId, displayOrder. Relations: `chapters Chapter[]`
- **Chapter**: name, description, campaignId, displayOrder. Relations: `scenarios ChapterScenario[]`
- **Scenario**: name, description, battleMapId? (SetNull on delete), maxTurns?, goldReward, expReward, projectId. Relations: units, victoryConditions, defeatConditions, rewards, dialogueTriggers
- **ChapterScenario**: chapterId + scenarioId + isBranch (Boolean), displayOrder. `@@unique([chapterId, scenarioId])`
- **ScenarioUnit**: scenarioId + unitId + spawnX + spawnY + levelOverride? + isRequired (Boolean). `@@unique([scenarioId, unitId])`
- **VictoryCondition**: scenarioId, conditionType (`VictoryConditionType` enum: DefeatAllEnemies/DefeatTarget/SurviveTurns/ReachTile/ProtectUnit/Custom), targetData (Json?), description
- **DefeatCondition**: scenarioId, conditionType (`DefeatConditionType` enum: AllPlayersDead/SpecificUnitDead/TurnLimitExceeded/Custom), targetData (Json?), description
- **ScenarioReward**: scenarioId, rewardType (`RewardType` enum: Weapon/Armor/Accessory/Consumable/Gold/Experience), quantity, weaponId?/armorId?/accessoryId?/consumableId?

### Routes
- `projects.$projectId.campaign.tsx` — campaign/chapter hierarchy with nested scenario lists
- `projects.$projectId.scenarios.$scenarioId.tsx` — tabbed scenario editor (Setup, Unit Placement, Victory Conditions, Defeat Conditions, Rewards)

### Sub-Tasks
1. Create all 7 schema files. Update Project, BattleMap, Unit relations.
2. Build API layer: `campaign.ts` (CRUD + reorder), `chapter.ts` (CRUD + reorder within campaign), `scenario.ts` (CRUD with nested includes), `scenarioUnit.ts` (CRUD + bulk placement), `victoryCondition.ts`/`defeatCondition.ts` (CRUD), `scenarioReward.ts` (CRUD).
3. Build campaign editor route: campaign list → collapsible chapters → ordered scenarios per chapter. Drag-and-drop reorder on chapters and scenarios. Dialog-based create for campaigns, chapters, and scenarios.
4. Build scenario editor route with tabs:
   - **Setup**: name, description, battle map dropdown, max turns, gold/exp reward
   - **Unit Placement**: embedded Pixi.js renderer (read-only map) + side panel of available units. Drag units onto spawn zone tiles. Click placed units to edit levelOverride or remove. Build as standalone `unit-placement-canvas.tsx` component.
   - **Victory Conditions**: list with add/remove. Type dropdown → type-specific fields appear (unit selector for DefeatTarget, number input for SurviveTurns, coordinate picker for ReachTile).
   - **Defeat Conditions**: same pattern as victory
   - **Rewards**: list with type dropdown, item selector (filtered by type), quantity
5. Update sidebar — add "Campaign" under "Story & Scenarios".

### Dependencies
- Phase 5 (Unit — for ScenarioUnit)
- Phase 6 (BattleMap — for map selection and unit placement overlay)
- Phase 4 (Equipment — for ScenarioReward item references)

### Risks
- **Unit placement complexity**: Combines Pixi.js rendering, spatial drag-and-drop (not @dnd-kit list reorder), and multiple data models. Encapsulate in a standalone component.
- **BattleMap deletion**: `onDelete: SetNull` on Scenario.battleMapId nullifies the reference. Scenario editor must handle `battleMapId = null` gracefully.
- **Orphaned scenarios**: Surface unlinked scenarios in the campaign editor UI to prevent confusion.

### Verification
- Create campaign with chapters; reorder chapters via drag-and-drop
- Create scenarios within chapters; verify chapter-scenario links
- Open scenario editor; select a battle map; see isometric rendering
- Place units on spawn zones; verify ScenarioUnit creation with correct coordinates
- Add victory/defeat conditions; verify type-specific fields
- Add rewards; verify item selection filtered by type

---

## Phase 7c: Dialogue & Flag System

**Branching narrative with gameplay consequences.** Project-level flags allow dialogue choices to affect scenario conditions and game state.

### Key Architectural Decisions
- **Flags as first-class entities**: `ProjectFlag` model (not ad-hoc JSON). Two types: boolean (true/false) and enum (user-defined string values). Enables autocomplete, reference validation, and cascade management.
- **Linear + branching dialogue model**: Dialogue contains ordered DialogueLines. Lines have optional DialogueChoices, each pointing to a `nextLineId` (creating branches). Lines without choices auto-advance by displayOrder.
- **Flag mutations on choices**: `DialogueChoiceFlagAction` junction model — normalized flag-setting, not stuffed into JSON. Each choice can set one or more flags.
- **ScenarioDialogue triggers**: Links dialogues to battle events (BattleStart, BattleEnd, TurnStart, UnitDefeated, TileReached, HpThreshold). Type-specific trigger parameters in `triggerData` JSON.
- **Sequential editor for MVP**: List view with branch indicators (indentation, "goto" arrows). Full visual node-graph editor deferred to post-MVP.

### Schema
- **Enums**: `FlagType` (Boolean, Enum), `DialogueTriggerType` (BattleStart/BattleEnd/TurnStart/UnitDefeated/TileReached/HpThreshold)
- **ProjectFlag**: name, description, flagType, enumValues (String[]), defaultValue (String), projectId. `@@unique([projectId, name])`
- **Dialogue**: name, description, projectId. Relations: `lines DialogueLine[]`, `triggers ScenarioDialogue[]`
- **DialogueLine**: dialogueId, speakerName, speakerUnitId?, text, emotion?, nextLineId? (explicit jump; null = advance by displayOrder), displayOrder. Relations: `choices DialogueChoice[]`
- **DialogueChoice**: dialogueLineId, text, nextLineId? (jump target; null = end dialogue), displayOrder. Relations: `flagActions DialogueChoiceFlagAction[]`
- **DialogueChoiceFlagAction**: dialogueChoiceId + projectFlagId + setValue (String). `@@unique([dialogueChoiceId, projectFlagId])`
- **ScenarioDialogue**: scenarioId + dialogueId + triggerType + triggerData (Json?)

### Routes
- `projects.$projectId.flags.tsx` — flag CRUD list (boolean/enum switch in form dialog)
- `projects.$projectId.dialogues.tsx` — dialogue list (card grid)
- `projects.$projectId.dialogues.$dialogueId.tsx` — sequential dialogue editor with branching
- Add "Dialogue" tab to scenario editor (Phase 7b)

### Sub-Tasks
1. Create all 6 schema files. Update Project, Scenario relations.
2. Build API layer: `projectFlag.ts` (CRUD), `dialogue.ts` (CRUD with nested includes), `dialogueLine.ts` (CRUD + reorder), `dialogueChoice.ts` (CRUD + flag action management), `scenarioDialogue.ts` (CRUD).
3. Build flag editor route — standard CRUD list. Form dialog switches between Boolean and Enum modes (Enum mode shows tag input for possible values).
4. Build dialogue list route — card grid with name, description, line count.
5. Build dialogue editor route:
   - Ordered list of DialogueLines as cards (speaker + portrait placeholder, text, emotion badge, choices)
   - Inline editing: click line to expand edit form (speaker dropdown from project units, text area, emotion select)
   - Choices as indented sub-items under parent line (text + "goes to: [line]" + flag action badges)
   - Choice edit: text, nextLineId dropdown (all lines in this dialogue), flag action section (flag + value pairs)
   - Drag-and-drop line reorder (warn if reordering branch targets)
   - "Add Line" and "Add Choice" buttons
6. Add Dialogue tab to scenario editor (Phase 7b): list of ScenarioDialogue triggers. "Add Trigger" dialog: trigger type → type-specific fields → select dialogue.
7. Update sidebar — add "Flags" and "Dialogues" under "Story" group.

### Dependencies
- Phase 5 (Unit — for speaker unit references)
- Phase 7b (Scenario — for ScenarioDialogue triggers)

### Risks
- **Branching visualization**: Sequential list gets confusing with complex trees. Provide a "flow preview" button that renders a simple top-to-bottom flowchart (basic HTML/CSS, not a graph library). Full node-graph editor is post-MVP.
- **Circular dialogue references**: A choice's nextLineId pointing to an earlier line is valid (intentional loops) but editor should warn about potential infinite loops.
- **Orphaned lines on delete**: If a target line is deleted, referencing choices point to nothing. Use SetNull on nextLineId references, or Restrict and force fixing references first. Restrict is safer.
- **Flag deletion cascade**: Deleting a flag cascade-deletes all DialogueChoiceFlagActions referencing it. Warn in the flag delete AlertDialog.

---

## Phase 8: Game Runtime (In-Browser Playtest Engine)

**No new database models.** Purely client-side rendering and game logic. The culmination of all previous phases — every model is consumed here.

### Key Architectural Decisions
- **Separate route tree**: `/play/$projectId/$scenarioId`, completely outside the editor layout. No sidebar. Full-viewport game canvas.
- **Client-side state machine**: `useReducer`-based (not Zustand — keep deps minimal). Well-defined game phases: `LOADING`, `DIALOGUE`, `PLAYER_TURN_SELECT_UNIT`, `PLAYER_TURN_SELECT_ACTION`, `PLAYER_TURN_SELECT_TARGET`, `PLAYER_TURN_ANIMATE`, `ENEMY_TURN`, `CONDITION_CHECK`, `VICTORY`, `DEFEAT`.
- **Reuse PixiMapRenderer from Phase 6**: Extended with runtime mode — unit sprites (colored rectangles + name/HP bar for MVP), movement range overlay (blue), attack range overlay (red), animated movement along path nodes.
- **Formula evaluator reuse**: `app/lib/formula/evaluate.ts` from Phase 7a. Runtime builds variable context from unit stats, terrain bonuses, element interactions, then calls `evaluateFormula`.
- **AI runs synchronously**: Simple heuristic loops with brief animation delays via `requestAnimationFrame`. Web Workers for AI is post-MVP.
- **No save/load for MVP**: Single scenario from start to finish. Refresh restarts. Save/load is post-MVP.

### Runtime Module Architecture (`app/lib/runtime/` — all client-side only)
- **`game-state.ts`**: TypeScript types for full game state tree. `GameState` (phase, turnOrder, map, flags, turnCount, dialogueQueue). `UnitState` (current HP/MP/CT, position, status effects, computed stats).
- **`game-reducer.ts`**: Pure function `gameReducer(state, action): GameState`. Actions: SELECT_UNIT, SELECT_MOVE, CONFIRM_MOVE, SELECT_ABILITY, SELECT_TARGET, EXECUTE_ACTION, END_TURN, ADVANCE_CT, START_DIALOGUE, ADVANCE_DIALOGUE, SELECT_CHOICE, CHECK_CONDITIONS. Heart of game logic, fully testable.
- **`pathfinding.ts`**: A* implementation. `findPath(map, start, end, unit): PathNode[]`. Respects movement costs, elevation (climb ≤ jumpStat), occupied tiles, fly/walk flags. Also `getMovementRange(map, start, unit): Set<{x,y}>` and `getAttackRange` for overlay.
- **`turn-order.ts`**: All three TurnSystem variants:
  - *Initiative*: CT-based accumulation. Unit turns when CT ≥ threshold. Uses project's ctFormula.
  - *RoundRobin*: All player units, then all enemy units.
  - *PhaseBased*: All units of one faction in speed order, then the other.
- **`combat-resolver.ts`**: `resolveAction(attacker, target, ability, map, config): CombatResult`. Applies damage formulas (physical vs magical based on damage type), element interaction multipliers, terrain defense bonuses, status effect modifiers. Returns `{damage, hit, critical, effectsApplied, targetDefeated}`.
- **`ai-controller.ts`**: `determineAIAction(unit, gameState): AIAction`. Implements AIBehavior logic:
  - *Aggressive*: prioritize attacking, move toward priority target
  - *Defensive*: stay near allies, heal/buff if available
  - *Balanced*: attack if in range, otherwise position strategically
  - *Support*: prioritize healing lowest-HP ally, buff allies
  - *Custom*: user-defined priority from aiConfig
- **`dialogue-player.ts`**: Manages dialogue queue. `getNextLine(dialogue, currentLineId, flags)`. Applies flag actions on choice selection.
- **`condition-checker.ts`**: `checkVictoryConditions(conditions, gameState): boolean` and `checkDefeatConditions`. Evaluated after every action resolves.

### Runtime UI Components (`app/components/runtime/`)
- **`game-canvas.tsx`**: Mounts Pixi.js renderer in runtime mode. Renders tiles, units (colored placeholders for MVP), movement/attack overlays, AoE preview.
- **`turn-order-bar.tsx`**: Horizontal bar showing unit portraits in turn order. CT values for Initiative system.
- **`unit-info-panel.tsx`**: Side panel with selected unit stats, HP/MP bars, status effects, equipment.
- **`action-menu.tsx`**: Contextual menu for player units: Move, Attack, Ability (submenu), Item (submenu), Wait.
- **`ability-target-overlay.tsx`**: Highlights valid target tiles (range + AoE preview on hover).
- **`dialogue-overlay.tsx`**: Full-width bottom overlay with speaker name, portrait placeholder, text (typewriter effect), choice buttons. Flag actions fire on choice selection.
- **`victory-defeat-screen.tsx`**: Modal with win/loss message, rewards summary, "Return to Editor" button.
- **`debug-panel.tsx`**: Toggle-able (F12). Shows game phase, unit CT values, last damage calc breakdown, AI reasoning, hovered tile info, flag states.

### Route: `app/routes/play.$projectId.$scenarioId.tsx`
Single loader fetches scenario with deep includes (map + tiles + terrain types, units with profession/stats/equipment/abilities, conditions, rewards, dialogue triggers with nested lines/choices/flag actions) plus project-level data (settings with formulas, elements, element interactions, project flags).

### Sub-Tasks
1. Game state types and reducer skeleton — all TypeScript types, reducer with phase transitions (no logic yet).
2. Pathfinding — A* in `pathfinding.ts`, self-contained and testable. Include `getMovementRange` and `getAttackRange`.
3. Turn order system — all three variants in `turn-order.ts`. CT accumulation loop for Initiative (with max-iteration guard against infinite loop).
4. Formula evaluator integration — helper functions in `stat-calculator.ts` that build variable context from UnitState and call `evaluateFormula`.
5. Combat resolver — needs formula evaluator, element interactions, terrain data.
6. Pixi.js runtime rendering — extend Phase 6 renderer with unit sprites, movement/attack overlays, animated movement tweens.
7. Runtime route + basic UI shell — route with loader, game canvas + turn order bar + unit info panel. See map with units placed.
8. Player interaction flow — full turn loop: select unit → action menu → select action → targeting overlay → confirm → resolve → animate → check conditions → next turn.
9. AI controller — start with "move toward nearest enemy and attack" (Aggressive). Build other behaviors incrementally.
10. Dialogue player — dialogue-player.ts + overlay component. Fire triggers at battle events.
11. Victory/defeat checking — run condition checkers after every action. Transition to end screen.
12. Debug panel — build last. Read-only internal state display.

### Dependencies
- ALL previous phases

### Risks
- **Data volume**: A 30×30 map + all units with nested data = large JSON payload. Flatten terrain types into lookup map. Consider Remix `clientLoader` to disable SSR for this route.
- **Pixi.js dynamic import**: Same SSR concern as Phase 6. Use `React.lazy` or `ClientOnly` wrapper.
- **Reducer complexity**: Split into sub-reducers by phase (movement, combat, dialogue) composed into main reducer.
- **Animation timing**: Combat animations must play before next action. Use promise-based animation queue that dispatches "animation complete" to advance state.
- **Formula errors at runtime**: Wrap every `evaluateFormula` in try-catch. Fall back to sensible defaults (0 damage, 100% hit). Log errors to debug panel.
- **CT infinite loop**: If all units have 0 speed, CT never reaches threshold. Add max-iteration guard (1000 steps, then force-grant turn to highest-CT unit).

### Verification
- Load scenario → see isometric map with units at spawn positions
- Select player unit → movement range highlighted (blue)
- Move unit → animated movement along path
- Select ability → targeting overlay with AoE preview
- Execute ability → damage calculated per battle config formulas
- Element interaction multipliers affect damage correctly
- Terrain defense bonuses applied
- AI enemies take reasonable actions
- Dialogue triggers at battle start → overlay with choices
- Dialogue choice sets flag → flag state changes in debug panel
- Defeat all enemies → victory screen with rewards
- Lose all player units → defeat screen
- Debug panel shows CT values, damage breakdowns, flag states

---

## Post-MVP Backlog

### 1. Project Templates & Presets (expand Phase 2's starter template)
- "FFT-style" template: PA/MA/SPD/MOV/JMP/CT/BR/FA stats, classic elements, terrain types, 5 professions with base stats and growth rates
- "Fire Emblem-style" template: different stat set, weapon triangle, simpler terrain
- JSON template definitions in `app/lib/templates/`
- Template preview during project creation

### 2. Data Import/Export
- **Export**: Full project as versioned JSON file (all entities, excludes user data)
- **Import**: Upload JSON to create new project. Validate schema version. Generate new UUIDs preserving internal references.
- Useful for backup, sharing, migration between instances

### 3. Completeness Validator
Pre-play validation checking project readiness:
- At least one battle map with tiles
- At least one scenario with linked map, placed units, victory/defeat conditions
- All formulas parse successfully with existing stat references
- Units have valid profession/equipment references
- UI: "Validate Project" button on project overview → checklist with green/red indicators → clicking failures navigates to relevant editor

### 4. Community Sharing / Project Gallery
- `isPublished` boolean on Project
- Public gallery route at `/gallery` with published projects
- "Clone to My Projects" (reuses import logic)
- Rating/feedback system
- Moderation (flagging, content policy)

### 5. Advanced Rendering & Gameplay
- **Camera rotation**: 4-way isometric rotation (update `iso-math.ts` with rotation parameter)
- **Animated tiles**: Water shimmer, lava glow via Pixi.js sprite sheet animations
- **Ability animations**: Particle effects for spells, slash animations via Pixi particle emitters
- **Multi-scenario campaigns**: Campaign playthrough with persistent unit progression, story flag carry-over
- **Save/load**: Serialize game state to allow resume
- **Multiplayer**: WebSocket-based two-player battles (long-term)
- **Undo/redo in map editor**: Command pattern for tile changes
- **Custom scripting**: Lightweight scripting engine for advanced event triggers (extremely scope-risky)

---

## Phase Summary & Dependency Graph

```
Phase 0: Project Management              [COMPLETE]
    |
Phase 1: Stats, Elements & Editors       [COMPLETE]
    |
    +-- Phase 5b: Asset Management        [PARALLEL with 2-5, depends on Phase 1]
    |       |
    +-- Phase 6: Maps & Terrain           [PARALLEL with 2-5, depends on Phase 0]
    |       |
    +-- Phase 7a: Battle Config           [can start after Phase 1]
    |       |
Phase 2: Professions/Jobs + Templates    |
    |                                     |
Phase 3: Abilities & Status Effects       |
    |                                     |
Phase 4: Equipment                        |
    |                                     |
Phase 5: Characters/Units                 |
    |                                     |
    +-------+-----------------------------+
    |
Phase 7b: Campaign, Scenarios            [depends on Phases 4, 5, 5b, 6]
    |
Phase 7c: Dialogue & Flag System         [depends on Phases 5, 7b]
    |
Phase 8: Game Runtime                    [depends on ALL phases]
    |
Post-MVP: Templates, Import/Export, Validation, Gallery, Advanced Features
```

**Parallel tracks:**
- Phase 5b (Assets), Phase 6 (Maps), and Phase 7a (Battle Config) can all start after Phase 1, running in parallel with Phases 2-5.
- Phase 5b is numbered 5b because it's infrastructure that all entity phases integrate with, not because it depends on Phase 5. Build it early, and each subsequent phase adds `assetId` FKs to their new entities naturally.
- The FormulaInput component (built in 7a or 3, whichever comes first) is shared between battle config and ability formulas.

---

## Total Estimated Schema: ~57 models, ~21 enums

## Route Structure (complete)
```
Existing (Phases 0-1):
  /                                                 (redirects to /dashboard or /auth/sign-in)
  /auth/sign-in                                     (existing)
  /auth/sign-up                                     (existing)
  /auth/logout                                      (existing)
  /dashboard                                        (existing — project card grid)
  /dashboard/profile                                (existing)
  /projects/new                                     (existing — Phase 0)
  /projects/:projectId                              (existing — Phase 0, project layout)
  /projects/:projectId/settings                     (existing — Phase 0, game settings + danger zone)
  /projects/:projectId/stats                        (existing — Phase 1)
  /projects/:projectId/elements                     (existing — Phase 1)
  /projects/:projectId/damage-types                 (existing — Phase 1)
  /projects/:projectId/professions                  (existing — Phase 1, enhanced in Phase 2)
  /projects/:projectId/weapon-types                 (existing — Phase 1)
  /projects/:projectId/armor-types                  (existing — Phase 1)
  /projects/:projectId/ability-types                (existing — Phase 1)
  /projects/:projectId/equipment-types              (existing — Phase 1)

Phase 5b (Asset Management):
  /projects/:projectId/assets                       (asset library browser)

Phase 2:
  /projects/:projectId/professions/:id              (profession detail editor)

Phase 3:
  /projects/:projectId/abilities                    (ability list)
  /projects/:projectId/abilities/:id                (ability detail editor)
  /projects/:projectId/status-effects               (status effect list)

Phase 4:
  /projects/:projectId/weapons                      (weapon list)
  /projects/:projectId/weapons/:id                  (weapon detail editor)
  /projects/:projectId/armor                        (armor list)
  /projects/:projectId/armor/:id                    (armor detail editor)
  /projects/:projectId/accessories                  (accessory list)
  /projects/:projectId/accessories/:id              (accessory detail editor)
  /projects/:projectId/consumables                  (consumable list, Dialog CRUD)

Phase 5:
  /projects/:projectId/units                        (unit list with type tabs)
  /projects/:projectId/units/:id                    (unit detail editor)

Phase 6:
  /projects/:projectId/terrain                      (terrain type list)
  /projects/:projectId/maps                         (battle map list)
  /projects/:projectId/maps/:mapId                  (full-page isometric map editor)

Phase 7a:
  /projects/:projectId/battle-config                (formula editor)

Phase 7b:
  /projects/:projectId/campaign                     (campaign/chapter hierarchy)
  /projects/:projectId/scenarios/:id                (scenario detail editor)

Phase 7c:
  /projects/:projectId/flags                        (project flag list)
  /projects/:projectId/dialogues                    (dialogue list)
  /projects/:projectId/dialogues/:id                (dialogue editor)

Phase 8 (Runtime):
  /play/:projectId/:scenarioId                      (full-viewport game)
```

## Cross-Phase Concerns

**Migration strategy**: Each phase = one `prisma migrate dev` migration, named descriptively (`phase2_professions_and_seeding`, `phase3_abilities_and_status_effects`, etc.).

**Project model growth**: By Phase 5, Project has ~30+ relation arrays. This is normal for an aggregate root. Each child route fetches only what it needs — never eagerly load all relations in the layout loader.

**Sidebar organization**: By Phase 5, sidebar sections should be: Core Rules (Stats, Elements, Damage Types), Classes & Abilities (Professions, Abilities, Status Effects), Equipment (Weapons, Armor, Accessories, Consumables), Units, Maps & Terrain, Story (Campaign, Dialogues, Flags), Battle System (Battle Config). Type definitions (Ability Types, Weapon Types, etc.) in a "Configuration" section.

**Shared component library**: Phases 3-5 produce reusable components in `app/components/shared/`: FormulaInput, StatModifierEditor, GrantedAbilitySelector, ElementResistanceEditor, StatPreview, AssetBrowserDialog, AssetPreview. These are building blocks for all entity editors.

**Asset integration pattern**: Every entity phase should add `assetId: String?` (FK to Asset, onDelete: SetNull) to new entities alongside `iconKey`. Entity form dialogs include an optional "Custom Image" section using AssetBrowserDialog. Display components use AssetPreview (shows uploaded asset or falls back to Lucide icon).

## Verification Strategy

After each phase, verify by:
1. `npm run typecheck` — no TypeScript errors
2. `npm run lint` — no linting errors
3. `npx prisma generate` — schema compiles
4. `npm run dev` — app runs, navigate through new routes
5. Manual test: create/read/update/delete for each new entity type
6. Confirm Sonner toasts appear for all success/error states
7. Confirm sidebar navigation correctly shows/hides sections based on project context
8. For phases with computed data (Phase 5): verify stat computation chain end-to-end
9. For phases with Pixi.js (Phases 6, 7b, 8): verify isometric rendering, camera controls, and interaction handling
10. For Phase 8: play a complete scenario from start to victory/defeat
