# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Remix dev server with Vite
- **Build**: `npm run build` - Builds app for production using Remix Vite
- **Production**: `npm start` - Runs built app in production mode
- **Linting**: `npm run lint` - ESLint with TypeScript support
- **Type checking**: `npm run typecheck` - TypeScript compiler check

## Architecture Overview

This is a **Remix** application using **Vite** as the build tool, with a PostgreSQL database managed through **Prisma ORM**.

### Tech Stack
- **Framework**: Remix v2 with Vite
- **Database**: PostgreSQL with Prisma ORM
- **UI**: React with Tailwind CSS v4 and Radix UI components
- **Authentication**: Cookie-based sessions with bcrypt password hashing
- **Styling**: Tailwind CSS with custom theme support

### Key Architectural Patterns

#### Database Layer (`app/db.server.ts`)
- Extended Prisma client with custom user authentication methods
- Centralized database access with built-in password hashing/comparison
- Uses Prisma 7 with `prisma-client` generator and `prisma.config.ts`
- Generated client output at `generated/prisma/` (gitignored, auto-generated)
- Server-side code imports from `@prisma/client` (resolves to `generated/prisma/client.ts`)
- Browser-safe imports (types, enums) use `@prisma/client/browser` (resolves to `generated/prisma/browser.ts`)
- Uses `accelerateUrl` constructor option for Prisma Accelerate connection

#### Session Management (`app/session.server.ts`)
- Cookie-based session storage with secure configuration
- Requires `AUTH_SECRET` environment variable
- 24-hour session expiration with secure/httpOnly cookies

#### API Layer (`app/api/`)
- Service layer pattern separating database operations from route handlers
- Functions like `getUserById`, `signUp`, `signIn` for user operations
- Similar patterns for `profile.ts` and `project.ts`

#### Route Structure
- **Public routes**: `/auth/sign-in`, `/auth/sign-up`, `/` (index)
- **Protected routes**: `/dashboard` - requires authentication, redirects to sign-in if not authenticated
- Dashboard uses loader function to fetch user data, profile, and projects

#### Component Architecture
- **UI Components**: Located in `app/components/ui/` - Radix UI primitives with Tailwind styling
- **Dashboard Components**: `app/components/dashboard/` - App-specific sidebar, navigation
- **Auth Components**: `app/components/auth/` - Sign-in/sign-up forms
- **Shared Components**: `app/components/shared/` - Error boundaries and reusable components

#### Database Schema (`prisma/schema/`)
- **Modular schema**: Uses Prisma schema folder feature with separate files per domain
- **Core entities**: User, Profile, Project, Collaborator
- **Game-related entities**: AbilityType, ArmorType, DamageType, EquipmentType, Profession, WeaponType
- PostgreSQL provider with database URL from environment

### Development Patterns

#### Authentication Flow
1. Users sign up/in through forms in `app/components/auth/`
2. Credentials processed via `app/api/user.ts` service functions
3. Sessions managed through `app/session.server.ts`
4. Protected routes check session in loader functions

#### Data Fetching
- Remix loader functions handle server-side data fetching
- Dashboard loader fetches user, profile, and projects data
- API layer abstracts database operations from route handlers

#### Styling System
- Tailwind CSS v4 with Vite plugin integration
- Custom theme configuration in `app/theme.css`
- Radix UI for accessible component primitives
- Dark mode support (default theme is dark)

### Important Configuration

#### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (or Prisma Accelerate URL)
- `DIRECT_DATABASE_URL`: *(Optional)* Direct PostgreSQL connection string for Prisma CLI — falls back to `DATABASE_URL`
- `AUTH_SECRET`: Required for session encryption

#### Database Management
- Prisma 7 with config in `prisma.config.ts` (datasource URL, schema path)
- Use `npx prisma generate` after schema changes (generates to `generated/prisma/`)
- Use `npx prisma db push` for development schema updates
- Use `npx prisma migrate dev` for production-ready migrations
- Schema files are organized in `prisma/schema/` folder

### Code Conventions
- Server-side code uses `.server.ts` suffix
- API functions in `app/api/` return Prisma objects
- Components use TypeScript with strict type checking
- Authentication required routes should include session checks in loaders

## House Rules
- Don't be so quick to agree with me all the time, it's okay to challenge me when I am going against best practice or not thinking ahead. Best practice is crucially important and we always want to work with performance and scale in mind.
- All success/failure notifications should use toast/flash messages (via Sonner) that appear briefly and auto-dismiss. Never use Alert components or other elements that push page content around.
- Else statements are for chumps. Never use else, and instead use an early return strategy or a switch for multiple cases. Switches should include a default and appropriate error handling when possible.
- **Smart Forms Pattern**: All forms with editable content must implement the smart save pattern:
  - Use controlled components with state tracking for current vs saved values
  - Only show save button when there are actual unsaved changes
  - Display orange "Unsaved changes" badge in card header when changes are detected
  - Update saved state after successful form submission to clear the badge
  - Include Badge import: `import { Badge } from "~/components/ui/badge"`
  - Badge styling: `<Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Unsaved changes</Badge>`
- **Form Validation**: All forms must use Zod schemas for validation:
  - Define validation schema with `z.object()` and appropriate field rules
  - Use `react-hook-form` with `zodResolver` for client-side validation
  - Include proper error messages for each validation rule
  - Use shadcn Form components (`FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`)
  - Example: `const formSchema = z.object({ email: z.string().email(), username: z.string().min(3).max(64) })`

## Editor UI Design Standards

These standards apply to all CRUD editor pages (Stats, Elements, and future entity editors).

### Page Layout
- **Header**: Entity name as `h1` with a lucide icon, descriptive subtitle below, and a "+ New [Entity]" button aligned right
- **Data Display**: Use data tables (`app/components/ui/table`) for entities with many fields (e.g., Stats); use card grids for visual/compact entities (e.g., Elements)
- **Sections**: If a page has multiple concerns (e.g., Elements + Interactions), separate with `<Separator>` and distinct Card boundaries

### CRUD Pattern
- **Create/Edit**: Use `Dialog` component (not Sheet or separate route) with Zod + react-hook-form validation inside shadcn `Form` components
- **Delete**: Always confirm via `AlertDialog` with a clear description of consequences (e.g., "This will permanently remove the element and all of its interactions.")
- **Reorder**: Use `@dnd-kit` drag-and-drop with `GripVertical` handle icon; persist order immediately on drop via form submission
- **Notifications**: All success/error feedback via Sonner toast (never Alert components)

### Form Dialogs
- Use shadcn `Dialog` with `DialogHeader`, `DialogFooter`
- Include `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` from shadcn Form
- Reset form state when dialog opens for "create"; pre-populate fields for "edit"
- Close dialog on submit, show toast on action result via `useEffect` watching `actionData`
- Cancel button uses `variant="outline"`; submit button is primary

### Interaction Matrices
- Use for NxN entity-vs-entity relationships (e.g., Element Interactions)
- Provide both grid view and per-entity list view, toggleable via a `INTERACTION_VIEW` constant (`"A"` = grid, `"B"` = list)
- Default multiplier is `1.0` (neutral); color-code cells: red tint for < 1.0 (resistance), green tint for > 1.0 (weakness)
- Use bulk save with the smart save pattern (unsaved changes badge + save button)

### Component Organization
- Editor components live in `app/components/{entity-name}/` folders (e.g., `app/components/stats/`, `app/components/elements/`)
- Common component types per entity: `{entity}-form-dialog.tsx`, `{entity}-table.tsx` or `{entity}-card.tsx` + `{entity}-grid.tsx`
- Icon/constant mappings (e.g., `ELEMENT_ICONS`) are exported from the form dialog file for reuse by card/grid components

### Route Conventions for Editors
- Routes live at `app/routes/projects.$projectId.{entity}.tsx`
- Loader: `requireProjectAccess` + fetch entity data
- Action: switch on `formData.get("action")` with cases for `create_`, `update_`, `delete_`, `reorder_` prefixed by entity name
- Page component: uses `useOutletContext` for project data, `useLoaderData` for entity data, `useActionData` + `useEffect` for toast notifications

## Dashboard Changelog & Roadmap Tracker

The dashboard (`app/routes/dashboard._index.tsx`) displays a changelog feed and roadmap progress tracker. The data lives in `app/data/changelog.ts` as static TypeScript arrays.

**When making roadmap-related changes, always update the dashboard tracker:**
- **Completing a phase**: Update the phase's `status` field in `ROADMAP_PHASES` (e.g., `"upcoming"` → `"in-progress"` → `"complete"`)
- **Adding new features**: Add a new `ChangelogEntry` to the top of `CHANGELOG_ENTRIES` with the current date, a user-friendly title and description, appropriate category (`feature`, `improvement`, `infrastructure`, `milestone`), and optional `phase` reference
- **Phase highlights**: Update the `highlights` array on any phase whose scope or deliverables change
- **Milestone entries**: When a phase is fully complete, add a `milestone` category changelog entry marking the completion

Components live in `app/components/changelog/`: `roadmap-tracker.tsx`, `changelog-feed.tsx`, `changelog-entry-card.tsx`.

## Additional Important Context
- The app we are building is called Valkyrie. Valkyrie is meant to be like the "RPG Maker" for tactical RPGs like Final Fantasy Tactics and Ogre Battle. We should always keep this in mind when developing new features and maintaining existing ones.