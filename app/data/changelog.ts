export type ChangelogCategory =
  | "feature"
  | "improvement"
  | "infrastructure"
  | "milestone";

export type PhaseId =
  | "phase-0"
  | "phase-1"
  | "phase-2"
  | "phase-3"
  | "phase-4"
  | "phase-5"
  | "phase-5b"
  | "phase-6"
  | "phase-7a"
  | "phase-7b"
  | "phase-7c"
  | "phase-8";

export interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  category: ChangelogCategory;
  phase?: PhaseId;
}

export interface RoadmapPhase {
  id: PhaseId;
  name: string;
  shortName: string;
  description: string;
  status: "complete" | "in-progress" | "upcoming";
  highlights: string[];
}

export const CATEGORY_CONFIG: Record<
  ChangelogCategory,
  { label: string; color: string }
> = {
  feature: {
    label: "Feature",
    color: "text-green-400 border-green-400/30 bg-green-400/10",
  },
  improvement: {
    label: "Improvement",
    color: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  },
  infrastructure: {
    label: "Infrastructure",
    color: "text-muted-foreground border-muted bg-muted/50",
  },
  milestone: {
    label: "Milestone",
    color: "text-primary border-primary/30 bg-primary/10",
  },
};

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: "phase-0",
    name: "Project Management",
    shortName: "P0",
    description:
      "User auth, project CRUD, collaborator management, and project settings.",
    status: "complete",
    highlights: [
      "User authentication with secure cookie-based sessions",
      "Project CRUD with collaborator invitations and role-based access",
      "Project settings for grid layout, battle system, and progression config",
      "Collapsible sidebar with project selector and conditional navigation",
      "User profiles with avatar upload, taglines, and bios",
    ],
  },
  {
    id: "phase-1",
    name: "Stats, Elements & Type Editors",
    shortName: "P1",
    description:
      "Core RPG data layer: stats, elements, damage types, professions, weapon/armor/ability/equipment types with full editors.",
    status: "complete",
    highlights: [
      "Stat definitions with core engine stats (HP, MP, MOV) and free-form grouping",
      "Elements with color/icon customization and N\u00D7N interaction matrix",
      "Full CRUD editors for damage types, professions, weapon/armor/ability/equipment types",
      "Drag-and-drop reordering with @dnd-kit across all editors",
      "Dialog-based create/edit with Zod validation and smart save pattern",
    ],
  },
  {
    id: "phase-2",
    name: "Professions & Templates",
    shortName: "P2",
    description:
      "Job class system with base stats, growth rates, prerequisites, and starter template seeding.",
    status: "upcoming",
    highlights: [
      "Tabbed profession detail editor (overview, base stats, growth rates, prerequisites)",
      "Profession prerequisite chains with cycle detection",
      "Starter template seeding on project creation (FFT-inspired defaults)",
      "Base stats and growth rates per profession linked to stat definitions",
    ],
  },
  {
    id: "phase-3",
    name: "Abilities & Status Effects",
    shortName: "P3",
    description:
      "Combat abilities with formula system, status effects, and targeting rules.",
    status: "upcoming",
    highlights: [
      "Status effects with stat modifiers, duration, and stacking rules",
      "Abilities with formula-based power, AoE targeting shapes, and range settings",
      "Formula system using expr-eval with stat autocomplete and validation",
      "Profession-ability links with learn level and JP cost",
      "Tabbed ability detail editor (overview, targeting, formula & power, effects)",
    ],
  },
  {
    id: "phase-4",
    name: "Equipment",
    shortName: "P4",
    description:
      "Weapons, armor, accessories, and consumable items with stat modifiers and requirements.",
    status: "upcoming",
    highlights: [
      "Weapons with attack power, accuracy, range, and granted abilities",
      "Armor with defense stats and element resistances",
      "Accessories with stat modifiers, granted abilities, and status effects",
      "Consumable items with targeting and formula-based effects",
      "Shared stat modifier and element resistance editor components",
    ],
  },
  {
    id: "phase-5",
    name: "Characters & Units",
    shortName: "P5",
    description:
      "Player characters, enemies, and NPCs with full stat computation and equipment loadouts.",
    status: "upcoming",
    highlights: [
      "Unit types: Player, Enemy, NPC, and Guest Ally",
      "Computed stats combining profession, growth, overrides, and equipment bonuses",
      "Visual equipment slot layout with profession-based restrictions",
      "AI configuration for enemy behavior (aggressive, defensive, support, balanced)",
      "Unit detail editor with stats, equipment, abilities, and AI tabs",
    ],
  },
  {
    id: "phase-5b",
    name: "Asset Management",
    shortName: "P5b",
    description:
      "Cloud-based asset storage with Cloudflare R2 for sprites, portraits, and tilesets.",
    status: "upcoming",
    highlights: [
      "Cloudflare R2 cloud storage with presigned upload URLs",
      "Asset browser dialog reusable across all entity editors",
      "Asset types: Sprite, Portrait, Tileset, Icon, Effect",
      "Client-side thumbnail generation on upload",
      "Fallback to icon keys when no asset is uploaded",
    ],
  },
  {
    id: "phase-6",
    name: "Maps & Terrain",
    shortName: "P6",
    description:
      "Isometric map editor with Pixi.js for tile placement, elevation, and terrain types.",
    status: "upcoming",
    highlights: [
      "Isometric 2.5D rendering with Pixi.js and depth sorting",
      "Terrain types with movement cost, defense/evasion bonuses, and damage effects",
      "Tile painting with terrain brush and elevation tools",
      "Spawn zone and map event placement",
      "Camera panning, zooming, and keyboard navigation",
    ],
  },
  {
    id: "phase-7a",
    name: "Battle Config & Formulas",
    shortName: "P7a",
    description:
      "Battle system configuration, damage formulas, and turn order mechanics.",
    status: "upcoming",
    highlights: [
      "Project-wide damage, healing, accuracy, and evasion formulas",
      "Experience and level-up progression formulas",
      "Turn system configuration (Initiative, Round Robin, Phase-Based)",
      "Formula editor with stat autocomplete and test evaluation",
    ],
  },
  {
    id: "phase-7b",
    name: "Campaigns & Scenarios",
    shortName: "P7b",
    description:
      "Campaign structure with scenario conditions, win/loss states, and progression.",
    status: "upcoming",
    highlights: [
      "Campaign > Chapter > Scenario hierarchy with drag-and-drop ordering",
      "Scenario editor with embedded Pixi.js map for unit placement",
      "Victory and defeat conditions (defeat target, survive turns, reach tile, etc.)",
      "Scenario rewards: equipment, gold, and experience",
    ],
  },
  {
    id: "phase-7c",
    name: "Dialogue & Flags",
    shortName: "P7c",
    description:
      "Branching dialogue system with boolean flags and enum state variables.",
    status: "upcoming",
    highlights: [
      "Project-level boolean and enum flags for tracking game state",
      "Branching dialogue with speaker portraits and choices",
      "Dialogue choices that set flags and branch to different lines",
      "Scenario dialogue triggers (battle start, unit defeated, tile reached, etc.)",
    ],
  },
  {
    id: "phase-8",
    name: "Game Runtime",
    shortName: "P8",
    description:
      "In-browser playtest engine that brings all systems together into a playable tactical RPG.",
    status: "upcoming",
    highlights: [
      "Full in-browser playtest engine with isometric rendering",
      "A* pathfinding with movement range and attack range overlays",
      "Three turn order systems: Initiative (CT), Round Robin, and Phase-Based",
      "Combat resolver with formula evaluation, element interactions, and terrain bonuses",
      "AI controller with aggressive, defensive, support, and balanced behaviors",
      "Dialogue overlay with branching choices and flag consequences",
      "Victory/defeat condition checking after every action",
    ],
  },
];

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    id: "2026-03-icon-system",
    date: "2026-03-28",
    title: "Comprehensive Icon System with 4,000+ Icons",
    description:
      "Built a shared icon picker with 4,300+ icons from two libraries: Lucide (340+ clean UI icons) and game-icons.net (4,000+ RPG-specific icons). Icons are auto-categorized into 50+ groups covering weapons, armor, shields, accessories, creatures, professions, status effects, magic, items, nature, buildings, and more. Features a searchable dialog with collection tabs and keyword typeahead — search 'fire' to find flame icons, 'melee' to find swords and axes, etc. All entity editors (Damage Types, Professions, Ability Types, Armor Types, Equipment Types, Weapon Types) now support icon selection.",
    category: "improvement",
    phase: "phase-1",
  },
  {
    id: "2026-03-stat-system-redesign",
    date: "2026-03-28",
    title: "Stat System Redesign",
    description:
      "Introduced core engine stats (HP, MP, MOV) that are auto-created per project and protected from deletion. Replaced rigid stat categories with free-form groups for full customization. Stats now have a systemKey that decouples engine identity from display names.",
    category: "feature",
    phase: "phase-1",
  },
  {
    id: "2026-03-db-resilience",
    date: "2026-03-28",
    title: "Database Resilience for Prisma Accelerate",
    description:
      "Added automatic retry logic with exponential backoff for transient Prisma Accelerate errors, preventing intermittent connection failures from surfacing to users.",
    category: "infrastructure",
  },
  {
    id: "2026-03-prisma-7",
    date: "2026-03-27",
    title: "Prisma 7 Upgrade",
    description:
      "Upgraded the database toolkit to Prisma 7 for improved performance and modern configuration. This keeps Valkyrie on the latest foundation as we build out more complex data models.",
    category: "infrastructure",
  },
  {
    id: "2026-03-abilities-schema",
    date: "2026-03-27",
    title: "Abilities & Status Effects Data Models",
    description:
      "Laid the groundwork for the combat system with new data models for abilities, status effects, targeting rules, and the formula system. Visual editors are coming next.",
    category: "feature",
    phase: "phase-3",
  },
  {
    id: "2026-03-damage-types-overhaul",
    date: "2026-03-27",
    title: "DamageTypes Overhaul",
    description:
      "Refined the damage type system with a new base type classification (Physical, Magical, Chemical, Environmental) and optional element associations for richer combat interactions.",
    category: "improvement",
    phase: "phase-1",
  },
  {
    id: "2026-03-editors",
    date: "2026-03-22",
    title: "Stats & Elements Editors",
    description:
      "Full visual editors for stats and elements are live. Create custom stat definitions with categories, define elements with colors and icons, and configure element interaction matrices — all with drag-and-drop reordering.",
    category: "feature",
    phase: "phase-1",
  },
  {
    id: "2026-03-core-types",
    date: "2026-03-22",
    title: "Core RPG Type System",
    description:
      "Introduced the foundational RPG data layer: stat definitions, elements with interaction multipliers, and complete CRUD editors for damage types, professions, weapon types, armor types, ability types, and equipment types.",
    category: "feature",
    phase: "phase-1",
  },
  {
    id: "2026-03-phase-0-complete",
    date: "2026-03-18",
    title: "Phase 0 Complete: Project Management",
    description:
      "The project management foundation is fully operational. Create and manage projects, invite collaborators with role-based access, configure game settings for grid layout, battle systems, and progression — all wrapped in a polished sidebar navigation.",
    category: "milestone",
    phase: "phase-0",
  },
  {
    id: "2025-08-projects",
    date: "2025-08-17",
    title: "Project Management & Collaboration",
    description:
      "Launched the project system with full create, edit, and delete operations. The sidebar project selector lets you switch between projects instantly, and collaborator management supports owner and member roles.",
    category: "feature",
    phase: "phase-0",
  },
  {
    id: "2025-08-profiles",
    date: "2025-08-16",
    title: "User Profiles & Avatars",
    description:
      "Added user profiles with customizable avatars, taglines, and bios. Upload your own profile image and personalize your Valkyrie identity.",
    category: "feature",
    phase: "phase-0",
  },
  {
    id: "2025-02-dashboard",
    date: "2025-02-28",
    title: "Dashboard & Navigation",
    description:
      "Built the main dashboard shell with a collapsible sidebar, breadcrumb navigation, and responsive layout — the scaffolding for the entire editing experience.",
    category: "feature",
    phase: "phase-0",
  },
  {
    id: "2025-02-auth",
    date: "2025-02-24",
    title: "User Accounts & Authentication",
    description:
      "Sign up and sign in are live with secure cookie-based sessions and encrypted password storage. Your projects and progress are safe.",
    category: "feature",
    phase: "phase-0",
  },
];
