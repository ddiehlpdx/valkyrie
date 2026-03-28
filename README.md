# Valkyrie

The RPG Maker for tactical RPGs. Build games inspired by Final Fantasy Tactics, Tactics Ogre, and Triangle Strategy — entirely in your browser.

Valkyrie is a web-based game editor and runtime that lets you design grid-based tactical RPG battles: define job classes, craft abilities with custom damage formulas, build maps with elevation and terrain, compose battle scenarios, and playtest them in-browser.

## Tech Stack

- **Framework**: [Remix](https://remix.run) v2 with [Vite](https://vitejs.dev)
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io) ORM
- **UI**: React 18, [Radix UI](https://www.radix-ui.com), [Tailwind CSS](https://tailwindcss.com) v4
- **Auth**: Cookie-based sessions with bcrypt password hashing
- **Validation**: Zod schemas with react-hook-form

## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL

### Setup

```sh
# Install dependencies (also generates Prisma client via postinstall)
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, DIRECT_DATABASE_URL, and AUTH_SECRET

# Push the database schema
npx prisma db push

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Prisma Accelerate connection string (used at runtime) |
| `DIRECT_DATABASE_URL` | Direct PostgreSQL connection string (used by Prisma CLI for migrations) |
| `AUTH_SECRET` | Secret key for session encryption |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

```
app/
├── api/            # Service layer (database operations)
├── components/
│   ├── ui/         # Base UI components (Radix + Tailwind)
│   ├── dashboard/  # Dashboard layout, sidebar, navigation
│   ├── auth/       # Sign-in / sign-up forms
│   └── shared/     # Error boundaries, reusable components
├── hooks/          # React hooks
├── lib/            # Utilities (file upload, class merging)
├── routes/         # Remix route handlers
├── db.server.ts    # Prisma client with auth extensions
├── session.server.ts # Cookie session management
└── root.tsx        # App shell

generated/
└── prisma/         # Auto-generated Prisma client (gitignored)

prisma/
└── schema/         # Modular Prisma schema files (one per domain)

prisma.config.ts    # Prisma 7 configuration (datasource, schema path)

docs/
└── ROADMAP.md      # Full feature roadmap
```

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full feature roadmap from current state to playable MVP, organized across 9 phases:

0. **Project Management** — create/manage game projects
1. **Stats & Elements** — hybrid stat system, elemental interactions
2. **Professions/Jobs** — class system with stat growth and equipment permissions
3. **Abilities & Status Effects** — skills with custom formulas, targeting, AoE
4. **Equipment** — weapons, armor, accessories, consumables
5. **Characters/Units** — player, enemy, and NPC unit definitions
6. **Maps & Terrain** — canvas-based map editor with elevation and terrain types
7. **Story & Scenarios** — campaigns, battle scenarios, dialogue system
8. **Game Runtime** — in-browser playtest engine with pathfinding, combat, and AI

## License

Private — not currently open source.
