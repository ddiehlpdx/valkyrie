# Engine Type Protection Pattern

Some entities have "engine types" — records that the game engine requires and that users cannot delete. This pattern ensures they always exist and are protected at every layer.

## How It Works

### 1. Schema: Enum + nullable `systemKey` field

Create an enum for the system keys and add a nullable `systemKey` field with a unique constraint per project:

```prisma
enum SystemEquipmentKey {
  MAIN_HAND
  OFF_HAND
}

model EquipmentType {
  systemKey SystemEquipmentKey?
  // ... other fields
  @@unique([projectId, systemKey])
}
```

- `systemKey = null` means user-created (custom)
- `systemKey != null` means engine-protected

### 2. API: Defaults array, backfill function, delete guard

In the entity's API file (e.g. `app/api/equipmentType.ts`):

- **`CORE_*_DEFAULTS`**: Exported array of default engine records with `systemKey`, `name`, `iconKey`, `displayOrder`
- **`ensureCore*(projectId)`**: Backfill function that checks for missing engine records and creates them. Called in the route loader for legacy project support.
- **`delete*(id)`**: Must check `systemKey` before deleting and throw if it's an engine type.

### 3. Project Creation: Seed in transaction

In `app/api/project.ts` `createProject()`, seed engine types inside the transaction alongside other core records (stats, etc.).

### 4. Route Loader: Backfill call

Call `ensureCore*()` in the entity's route loader before fetching data. This handles projects created before the engine types were added.

### 5. UI: Visual indicator + delete protection

- **Table**: Show blue `Cpu` icon with tooltip for engine types. Conditionally hide the delete button when `!!item.systemKey`.
- **Form Dialog**: Show "Engine Type" badge in dialog header. Show engine-specific description text.

## Current Engine Types

| Entity | Enum | Keys | Defaults |
|--------|------|------|----------|
| StatDefinition | `SystemStatKey` | HP, MP, MOV | Hit Points, Magic Points, Movement |
| EquipmentType | `SystemEquipmentKey` | MAIN_HAND, OFF_HAND | Main Hand, Off Hand |

## Adding New Engine Types to an Existing Entity

1. Add new values to the existing enum in the `.prisma` file
2. Add entries to the `CORE_*_DEFAULTS` array in the API file
3. Run `npx prisma db push` and `npx prisma generate`
4. The backfill function handles the rest automatically

## Adding Engine Protection to a New Entity

1. Create the enum and add `systemKey` field + `@@unique` constraint to the schema
2. Add `CORE_*_DEFAULTS`, `ensureCore*()`, and delete guard to the API file
3. Seed defaults in `createProject()` transaction
4. Call `ensureCore*()` in the route loader
5. Add UI indicators (Cpu icon, badge, conditional delete) to table and form dialog
