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
- Uses Prisma schema folder structure for modular schema organization

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
- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: Required for session encryption

#### Database Management
- Use `npx prisma generate` after schema changes
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

## Additional Important Context
- The app we are building is called Valkyrie. Valkyrie is meant to be like the "RPG Maker" for tactical RPGs like Final Fantasy Tactics and Ogre Battle. We should always keep this in mind when developing new features and maintaining existing ones.