---
name: sprite
description: Generate game art sprites and assets using SpriteCook AI. Use when creating character sprites, item icons, tilesets, UI elements, ability effects, or backgrounds for the Valkyrie tactical RPG editor.
argument-hint: "[description of the sprite to generate]"
allowed-tools:
  - MCP(spritecook:*)
  - Bash(ls *)
  - Bash(mkdir *)
  - Bash(mv *)
  - Read
  - Glob
---

# SpriteCook Sprite Generator for Valkyrie

You are generating game art assets for **Valkyrie**, a tactical RPG game editor in the style of Final Fantasy Tactics and Ogre Battle. All generated sprites must be consistent with this genre.

## Art Style Guidelines

When building SpriteCook prompts, always include these style directives unless the user explicitly overrides them:

- **Default style**: "32-bit pixel art, PS1-era tactical RPG style, detailed shading, top-down isometric perspective"
- **Default theme**: "dark fantasy medieval"
- **Default format**: pixel art mode enabled
- **Default background**: transparent
- **Default smart crop**: enabled

### Asset-Specific Defaults

| Asset Type | Default Size | Style Notes |
|---|---|---|
| Character sprite | 64x64 | Isometric 3/4 view, suitable for tactical grid |
| Item/equipment icon | 32x32 | Clean silhouette, identifiable at small size |
| Ability/spell effect | 64x64 | Transparent background, particle/glow effects |
| Status effect icon | 24x24 | Small badge-style, clear at tiny sizes |
| Tileset tile | 32x32 | Seamless edges, isometric perspective |
| UI element | Variable | Match the dark theme of the Valkyrie editor |
| Portrait | 128x128 | Bust portrait, detailed face, dark fantasy |
| Background/map | 256x256+ | Atmospheric, tactical RPG battlefield |

## Workflow

1. **Parse the user request** from `$ARGUMENTS` to determine what kind of asset is needed.
2. **Build the SpriteCook prompt** by combining the user's description with the appropriate style defaults above. Auto-detect the asset type from the description — do not require explicit sub-commands.
3. **Generate the sprite** using the SpriteCook MCP tools with the appropriate parameters.
4. **Save the output** to the project's sprite directory:
   - Default output path: `public/sprites/` under the project root
   - Create subdirectories by asset type: `characters/`, `items/`, `abilities/`, `effects/`, `tiles/`, `ui/`, `portraits/`, `backgrounds/`
   - Use descriptive kebab-case filenames (e.g., `fire-knight.png`, `healing-potion.png`)
5. **Report the result** including the file path, dimensions, and credits remaining.

## Style Consistency

When generating multiple related assets (e.g., a set of potion icons), use SpriteCook's reference asset feature to maintain visual consistency:

1. Generate the first asset as the style reference.
2. Note the asset ID from the response.
3. Pass that ID as a reference for subsequent assets in the set.

If the user asks for a batch or set of related assets, proactively use this approach.

## Valkyrie Entity Context

These are the game entities in Valkyrie that commonly need sprites:

- **Professions** (character classes like Knight, Mage, Archer): Need character sprites and portraits
- **Weapon Types** (Sword, Bow, Staff): Need item icons
- **Armor Types** (Plate, Leather, Robe): Need item icons
- **Equipment Types** (Main Hand, Off Hand): Need slot icons
- **Damage Types** (Physical, Magical, Fire, Ice): Need effect icons
- **Ability Types** (Attack, Magic, Support): Need category icons
- **Elements** (Fire, Water, Earth, Wind): Need elemental effect sprites
- **Status Effects** (Poison, Haste, Shield): Need small badge icons
- **Abilities** (Fire Bolt, Heal, Shield Bash): Need spell/ability effect sprites

## Examples

- `/sprite a fire knight in heavy plate armor` → 64x64 character sprite saved to `public/sprites/characters/fire-knight.png`
- `/sprite healing potion icon` → 32x32 item icon saved to `public/sprites/items/healing-potion.png`
- `/sprite fire explosion ability effect` → 64x64 spell effect saved to `public/sprites/abilities/fire-explosion.png`
- `/sprite poisoned status effect badge` → 24x24 status icon saved to `public/sprites/effects/poisoned.png`
- `/sprite grassy battlefield tile` → 32x32 tile saved to `public/sprites/tiles/grassy-battlefield.png`
- `/sprite dark knight portrait` → 128x128 portrait saved to `public/sprites/portraits/dark-knight.png`
