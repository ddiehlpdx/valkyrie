# Shared Components

This folder is for components reused across multiple features — not tied to any single entity or route. Components here should be general-purpose.

- `ui/` folder contains shadcn primitives (Button, Dialog, etc.) — this `shared/` folder is for app-level reusable components built on top of those primitives.
- Entity-specific components belong in `app/components/{entity-name}/` (e.g., `core-rules/`, `changelog/`), not here.

## Icon Picker (`icon-picker.tsx`)

This file exports the shared icon system used by all entity editors (Damage Types, Professions, Weapon Types, etc.).

**Key exports:**
- `ICON_MAP` — flat lookup of all icons by key string (used by tables/cards to render saved icons)
- `ICON_GROUPS` — grouped icons for the picker UI (lucide + auto-categorized game-icons)
- `IconPicker` — Dialog-based picker component with search, tabs (Lucide/Game Icons), and keyword typeahead
- `AppIcon` — union type (`LucideIcon | IconType`) for typing icon components from either library
- `DEFAULT_ICON_KEY` — single source of truth for the fallback icon (`"CircleDot"`)

**When adding new icons:**

1. **Lucide icons**: Add the import and place in the appropriate group in `LUCIDE_GROUPS` with `collection: "lucide"`
2. **Game icons**: Auto-categorized via `GI_CATEGORY_PATTERNS` regex — add new patterns if a new category is needed. All `Gi*` exports from `react-icons/gi` are included automatically via wildcard import.
3. **Keyword aliases**: Always update `KEYWORD_ALIASES` to cover any new icons or categories so keyword search stays accurate. For example, if you add frost-themed icons, ensure the ice/cold alias pattern covers the new names. If you add a new weapon type, add an alias mapping for common search terms users might type.

## Error Boundary (`error-boundary.layout.tsx`)

Reusable error boundary card for route-level error handling. Handles both Remix route error responses and generic JS errors.
