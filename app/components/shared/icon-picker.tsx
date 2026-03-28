import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

export type AppIcon = LucideIcon | IconType;
import {
  // Combat / Weapon
  Anvil,
  Axe,
  Bomb,
  Construction,
  Cross,
  Crosshair,
  Crown,
  Gavel,
  Hammer,
  Pickaxe,
  PocketKnife,
  Skull,
  Slice,
  Sword,
  Swords,
  Target,
  Trophy,
  Wand,
  WandSparkles,
  // Defense / Protection
  BrickWall,
  Castle,
  Fence,
  HardHat,
  Lock,
  LockKeyhole,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  ShieldPlus,
  // Elemental / Nature
  Clover,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudMoonRain,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Cloudy,
  Earth,
  Flower,
  Flower2,
  Leaf,
  LeafyGreen,
  Mountain,
  Rainbow,
  Shrub,
  Sprout,
  Sunrise,
  Sunset,
  Tornado,
  TreeDeciduous,
  TreePalm,
  TreePine,
  Trees,
  Wind,
  // Fire / Heat
  CookingPot,
  FireExtinguisher,
  Flame,
  FlameKindling,
  Fuel,
  Heater,
  ThermometerSun,
  // Ice / Cold
  IceCreamCone,
  MountainSnow,
  Snowflake,
  SunSnow,
  ThermometerSnowflake,
  // Water / Ocean
  Dam,
  Droplet,
  Droplets,
  Fish,
  Sailboat,
  Shell,
  ShowerHead,
  Waves,
  // Lightning / Energy
  PlugZap,
  Zap,
  // Light / Holy
  Church,
  Flashlight,
  FlashlightOff,
  Haze,
  Lightbulb,
  Medal,
  Sparkle,
  Sparkles,
  Star,
  StarHalf,
  StarOff,
  Stars,
  Sun,
  SunDim,
  SunMedium,
  SunMoon,
  // Dark / Arcane
  CircleDot,
  CircleDotDashed,
  Drama,
  Eclipse,
  EyeClosed,
  Ghost,
  Moon,
  MoonStar,
  Omega,
  Orbit,
  Origami,
  Radiation,
  VenetianMask,
  // Poison / Toxin
  Biohazard,
  Cannabis,
  FlaskConical,
  FlaskRound,
  Pipette,
  SprayCan,
  Syringe,
  TestTube,
  TestTubes,
  // Psychic / Mind
  Brain,
  BrainCircuit,
  BrainCog,
  Ear,
  Eye,
  EyeOff,
  Fingerprint,
  Radar,
  ScanEye,
  ScanFace,
  Speech,
  Telescope,
  // Life / Healing
  Bandage,
  HandCoins,
  HandHeart,
  HandHelping,
  Heart,
  HeartCrack,
  HeartHandshake,
  HeartOff,
  HeartPulse,
  Pill,
  PillBottle,
  ScanHeart,
  Stethoscope,
  // Crystal / Mineral
  Cone,
  Cuboid,
  Diamond,
  DiamondMinus,
  DiamondPlus,
  Gem,
  Hexagon,
  Pentagon,
  Pyramid,
  // Sound / Sonic
  AudioLines,
  AudioWaveform,
  Bell,
  BellElectric,
  BellRing,
  Drum,
  Guitar,
  Megaphone,
  Music,
  Music2,
  Piano,
  Volume2,
  // Time / Gravity
  Clock,
  History,
  Hourglass,
  Infinity,
  Magnet,
  RotateCcw,
  RotateCw,
  Timer,
  TimerReset,
  Weight,
  // Beast / Animal
  Bird,
  Bone,
  Bug,
  Cat,
  Dog,
  Drumstick,
  Egg,
  Feather,
  PawPrint,
  Rabbit,
  Rat,
  Snail,
  Squirrel,
  Turtle,
  Worm,
  // Tech / Construct
  Bolt,
  Bot,
  BotMessageSquare,
  CircuitBoard,
  Cog,
  Cpu,
  Gamepad2,
  HardDrive,
  Joystick,
  Microchip,
  Plug,
  Rocket,
  Satellite,
  Wrench,
  // Magic / Spell
  Atom,
  BookOpen,
  Dna,
  Scroll,
  ScrollText,
  Shapes,
  Variable,
  Waypoints,
  // People / Roles
  BicepsFlexed,
  CircleUser,
  Contact,
  HandMetal,
  PersonStanding,
  User,
  UserRound,
  Users,
  // Movement / Navigation
  Compass,
  Footprints,
  Globe,
  Landmark,
  Map,
  MapPin,
  Navigation2,
  Route,
  Signpost,
  // Buffs / Debuffs
  Activity,
  ArrowBigDown,
  ArrowBigUp,
  ArrowDown,
  ArrowUp,
  CircleArrowDown,
  CircleArrowUp,
  Gauge,
  Layers,
  Repeat,
  ShieldOff,
  TrendingDown,
  TrendingUp,
  VolumeOff,
  // Status Indicators
  AlertTriangle,
  Badge,
  BadgeAlert,
  BadgeCheck,
  CircleAlert,
  CircleCheck,
  CircleX,
  // Items / Equipment
  Archive,
  Backpack,
  Box,
  Coins,
  Dumbbell,
  Gift,
  Glasses,
  Package,
  Shirt,
  // Exploration / Utility
  Aperture,
  Blend,
  Bookmark,
  Flag,
  Focus,
  Hand,
  Milestone,
  Proportions,
  ScanSearch,
  Shovel,
  Siren,
  Spade,
  Tag,
  Tags,
  Tent,
  Wheat,
  Workflow,
  // New lucide additions
  // Defense
  ShieldBan,
  ShieldClose,
  ShieldEllipsis,
  ShieldMinus,
  ShieldQuestion,
  ShieldX,
  // Items
  Boxes,
  Container,
  Package2,
  PackageCheck,
  PackageOpen,
  PackagePlus,
  PackageX,
  ShoppingBag,
  Vault,
  // Books / Knowledge
  Book,
  BookA,
  BookCheck,
  BookCopy,
  BookDashed,
  BookHeart,
  BookKey,
  BookLock,
  BookMarked,
  BookMinus,
  BookOpenCheck,
  BookOpenText,
  BookPlus,
  BookText,
  BookType,
  BookUp,
  BookUp2,
  BookUser,
  BookX,
  // Keys / Doors
  DoorClosed,
  DoorOpen,
  Key,
  KeyRound,
  KeySquare,
  LockKeyholeOpen,
  LockOpen,
  Unlock,
  UnlockKeyhole,
  // Light Sources
  Lamp,
  LampCeiling,
  LampDesk,
  LampFloor,
  LampWallDown,
  LampWallUp,
  // Food / Consumables
  CupSoda,
  UtensilsCrossed,
  Utensils,
  Wine,
  // Misc
  Armchair,
  ChefHat,
  Club,
  FlaskConicalOff,
  GraduationCap,
  Handshake,
  HandPlatter,
  Headphones,
  Headset,
  LightbulbOff,
  Ribbon,
  Scale,
  Scale3d,
  SignpostBig,
  Wand2,
} from "lucide-react";
import * as GameIcons from "react-icons/gi";
import { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Search, ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";

export interface IconGroup {
  label: string;
  collection: "lucide" | "game-icons";
  icons: Record<string, AppIcon>;
}

// ── Lucide Icon Groups (manually curated) ──────────────────────────

const LUCIDE_GROUPS: IconGroup[] = [
  {
    label: "Combat / Weapon",
    collection: "lucide",
    icons: { Anvil, Axe, Bomb, Club, Construction, Cross, Crosshair, Crown, Gavel, Hammer, Pickaxe, PocketKnife, Skull, Slice, Sword, Swords, Target, Trophy, Wand, Wand2, WandSparkles },
  },
  {
    label: "Defense / Protection",
    collection: "lucide",
    icons: { BrickWall, Castle, Fence, HardHat, Lock, LockKeyhole, Shield, ShieldAlert, ShieldBan, ShieldCheck, ShieldClose, ShieldEllipsis, ShieldHalf, ShieldMinus, ShieldPlus, ShieldQuestion, ShieldX },
  },
  {
    label: "Elemental / Nature",
    collection: "lucide",
    icons: { Clover, Cloud, CloudDrizzle, CloudFog, CloudHail, CloudLightning, CloudMoon, CloudMoonRain, CloudRain, CloudRainWind, CloudSnow, CloudSun, Cloudy, Earth, Flower, Flower2, Leaf, LeafyGreen, Mountain, Rainbow, Shrub, Sprout, Sunrise, Sunset, Tornado, TreeDeciduous, TreePalm, TreePine, Trees, Wind },
  },
  {
    label: "Fire / Heat",
    collection: "lucide",
    icons: { CookingPot, FireExtinguisher, Flame, FlameKindling, Fuel, Heater, ThermometerSun },
  },
  {
    label: "Ice / Cold",
    collection: "lucide",
    icons: { IceCreamCone, MountainSnow, Snowflake, SunSnow, ThermometerSnowflake },
  },
  {
    label: "Water / Ocean",
    collection: "lucide",
    icons: { Dam, Droplet, Droplets, Fish, Sailboat, Shell, ShowerHead, Waves },
  },
  {
    label: "Lightning / Energy",
    collection: "lucide",
    icons: { PlugZap, Zap },
  },
  {
    label: "Light / Holy",
    collection: "lucide",
    icons: { Church, Flashlight, FlashlightOff, Haze, Lightbulb, LightbulbOff, Medal, Sparkle, Sparkles, Star, StarHalf, StarOff, Stars, Sun, SunDim, SunMedium, SunMoon },
  },
  {
    label: "Dark / Arcane",
    collection: "lucide",
    icons: { CircleDot, CircleDotDashed, Drama, Eclipse, EyeClosed, Ghost, Moon, MoonStar, Omega, Orbit, Origami, Radiation, VenetianMask },
  },
  {
    label: "Poison / Toxin",
    collection: "lucide",
    icons: { Biohazard, Cannabis, FlaskConical, FlaskConicalOff, FlaskRound, Pipette, SprayCan, Syringe, TestTube, TestTubes },
  },
  {
    label: "Psychic / Mind",
    collection: "lucide",
    icons: { Brain, BrainCircuit, BrainCog, Ear, Eye, EyeOff, Fingerprint, Radar, ScanEye, ScanFace, Speech, Telescope },
  },
  {
    label: "Life / Healing",
    collection: "lucide",
    icons: { Bandage, HandCoins, HandHeart, HandHelping, Heart, HeartCrack, HeartHandshake, HeartOff, HeartPulse, Pill, PillBottle, ScanHeart, Stethoscope },
  },
  {
    label: "Crystal / Mineral",
    collection: "lucide",
    icons: { Cone, Cuboid, Diamond, DiamondMinus, DiamondPlus, Gem, Hexagon, Pentagon, Pyramid },
  },
  {
    label: "Sound / Sonic",
    collection: "lucide",
    icons: { AudioLines, AudioWaveform, Bell, BellElectric, BellRing, Drum, Guitar, Megaphone, Music, Music2, Piano, Volume2 },
  },
  {
    label: "Time / Gravity",
    collection: "lucide",
    icons: { Clock, History, Hourglass, Infinity, Magnet, RotateCcw, RotateCw, Scale, Scale3d, Timer, TimerReset, Weight },
  },
  {
    label: "Beast / Animal",
    collection: "lucide",
    icons: { Bird, Bone, Bug, Cat, Dog, Drumstick, Egg, Feather, PawPrint, Rabbit, Rat, Snail, Squirrel, Turtle, Worm },
  },
  {
    label: "Tech / Construct",
    collection: "lucide",
    icons: { Bolt, Bot, BotMessageSquare, CircuitBoard, Cog, Cpu, Gamepad2, HardDrive, Joystick, Microchip, Plug, Rocket, Satellite, Wrench },
  },
  {
    label: "Magic / Spell",
    collection: "lucide",
    icons: { Atom, BookOpen, Dna, Scroll, ScrollText, Shapes, Variable, Waypoints },
  },
  {
    label: "People / Roles",
    collection: "lucide",
    icons: { BicepsFlexed, CircleUser, Contact, HandMetal, PersonStanding, User, UserRound, Users },
  },
  {
    label: "Movement / Navigation",
    collection: "lucide",
    icons: { Compass, Footprints, Globe, Landmark, Map, MapPin, Navigation2, Route, Signpost, SignpostBig },
  },
  {
    label: "Buffs / Debuffs",
    collection: "lucide",
    icons: { Activity, ArrowBigDown, ArrowBigUp, ArrowDown, ArrowUp, CircleArrowDown, CircleArrowUp, Gauge, Layers, Repeat, ShieldOff, TrendingDown, TrendingUp, VolumeOff },
  },
  {
    label: "Status Indicators",
    collection: "lucide",
    icons: { AlertTriangle, Badge, BadgeAlert, BadgeCheck, CircleAlert, CircleCheck, CircleX },
  },
  {
    label: "Items / Equipment",
    collection: "lucide",
    icons: { Archive, Backpack, Box, Boxes, Coins, Container, Dumbbell, Gift, Glasses, Package, Package2, PackageCheck, PackageOpen, PackagePlus, PackageX, Shirt, ShoppingBag, Vault },
  },
  {
    label: "Exploration / Utility",
    collection: "lucide",
    icons: { Aperture, Armchair, Blend, Bookmark, ChefHat, Flag, Focus, GraduationCap, Hand, Handshake, HandPlatter, Headphones, Headset, Milestone, Proportions, Ribbon, ScanSearch, Shovel, Siren, Spade, Tag, Tags, Tent, Wheat, Workflow },
  },
  {
    label: "Books / Knowledge",
    collection: "lucide",
    icons: { Book, BookA, BookCheck, BookCopy, BookDashed, BookHeart, BookKey, BookLock, BookMarked, BookMinus, BookOpenCheck, BookOpenText, BookPlus, BookText, BookType, BookUp, BookUp2, BookUser, BookX },
  },
  {
    label: "Keys / Doors",
    collection: "lucide",
    icons: { DoorClosed, DoorOpen, Key, KeyRound, KeySquare, LockKeyholeOpen, LockOpen, Unlock, UnlockKeyhole },
  },
  {
    label: "Light Sources",
    collection: "lucide",
    icons: { Lamp, LampCeiling, LampDesk, LampFloor, LampWallDown, LampWallUp },
  },
  {
    label: "Food / Consumables",
    collection: "lucide",
    icons: { CupSoda, Utensils, UtensilsCrossed, Wine },
  },
];

// ── Game Icons: keyword-based auto-categorization ──────────────────

const GI_CATEGORY_PATTERNS: [string, RegExp][] = [
  ["Weapons — Blades", /sword|blade|dagger|knife|katana|saber|scimitar|stiletto|rapier|cleaver|machete|cutlass|falchion/i],
  ["Weapons — Axes & Blunt", /axe\b|hammer|mace\b|club\b|flail|morning.*star|maul|bludgeon|bat\b|sledge|gavel|pick\b/i],
  ["Weapons — Ranged", /bow\b|arrow|crossbow|musket|pistol|gun\b|rifle|sling|shuriken|thrown|throw|boomerang|dart\b|javelin|cannon|catapult|ballista/i],
  ["Weapons — Polearms", /spear|halberd|trident|glaive|pike\b|lance\b|pole.*arm|naginata|pitchfork/i],
  ["Weapons — Staves & Wands", /staff|wand\b|scepter|sceptre|cane\b/i],
  ["Weapons — Other", /whip|chain.*weapon|bomb\b|dynamite|grenade|mine\b.*explo|scythe|sickle|hook.*sword|net\b.*weapon/i],
  ["Armor — Head", /helm|hat\b|hood\b|crown\b|tiara|circlet|cowl|bandana|turban|headband|barbute|visor|coif|mask\b|goggle|head.*piece|head.*gear/i],
  ["Armor — Body", /armor|breastplate|chain.*mail|scale.*mail|mail.*shirt|robe\b|vest\b|tunic|tabard|brigandine|cuirass|plate\b.*body|jerkin|hauberk/i],
  ["Armor — Hands", /gauntlet|glove|bracer|fist\b|mailed|knuckle|hand.*wrap/i],
  ["Armor — Feet", /boot|greave|sabaton|shoe\b|sandal|slipper|foot.*wear|leg.*armor/i],
  ["Shields", /shield/i],
  ["Accessories — Jewelry", /ring\b|necklace|pendant|amulet|earring|brooch|gem.*chain|charm\b|bracelet|jewel|locket|talisman|medallion|anklet/i],
  ["Accessories — Cloaks & Belts", /cloak|cape\b|belt\b(?!.*conveyor)|mantle\b|sash\b|shoulder.*pad|pauldron|epaulette/i],
  ["Creatures — Monsters", /dragon|demon|goblin|orc\b|troll|ogre|skeleton|zombie|vampire|werewolf|undead|golem|imp\b|devil|wyvern|basilisk|hydra|lich|wraith|specter|banshee|gargoyle|gorgon|chimera|cerberus|kraken|leviathan|behemoth|slime|ghoul|phantom|shade\b|fiend|abomination/i],
  ["Creatures — Beasts", /wolf|bear\b|lion|eagle|hawk|raven|snake|rat\b|boar|horse|deer|elk|stag|fox|panther|tiger|leopard|shark|whale|octopus|squid|crab|scorpion|spider|bat\b|beetle|mantis|wasp|bee\b|ant\b|lizard|frog|toad|turtle|owl|crow|falcon|vulture|bull|ram\b|goat|mammoth|rhino|elephant/i],
  ["Creatures — Fantasy Races", /elf\b|dwarf|fairy|pixie|centaur|minotaur|griffin|phoenix|unicorn|angel\b|titan|giant\b|gnome|halfling|mermaid|satyr|nymph|dryad/i],
  ["Professions & Classes", /knight|ninja|witch|monk\b|archer|healer|warrior|barbarian|paladin|fencer|bowman|tank\b|thief|rogue|ranger|druid|bard\b|cleric|mage\b|wizard|sorcerer|necromancer|assassin|berserker|samurai|gladiator|pirate|alchemist|blacksmith|merchant|hunter|scout\b|templar|priest|shaman|warlock|mystic/i],
  ["Status Effects", /poison|sleep|frozen|burn|stun|confus|haste|slow\b|blind|silence|curse|bless|regen|doom|petrif|paralyze|charm\b|disease|plague|bleed|fear\b|rage\b|berserk|weaken|empower|protect|reflect|absorb|immune|resist|vulnerable/i],
  ["Magic & Spells", /fire.*ball|ice.*bolt|lightning|holy\b|magic|spell|arcane|enchant|summon|teleport|portal|rune\b|sigil|glyph|ward\b|aura\b|beam\b|blast|bolt\b|nova\b|vortex|rift\b|conjur|divination|illusion|transmut|evocation|necro|resurrect|dispel/i],
  ["Potions & Consumables", /potion|elixir|brew\b|flask|bottle|vial|herb\b|mushroom|berry|apple|food|meat\b|bread|cheese|wine|ale\b|mead|stew|soup|cake|pie\b|fruit|fish\b|cook|meal|feast|ration|remedy|salve|ointment|bandage/i],
  ["Items & Treasure", /chest\b|treasure|gold\b|coin|loot|scroll|tome\b|map\b|key\b|lock\b|door\b|bag\b|sack|crate|barrel|box\b|lantern|torch|rope\b|tent\b|compass|hourglass|candle|lamp\b|mirror|scale\b|weight|dice|card\b|relic|artifact|idol|orb\b|crystal\b|gem\b(?!ini)/i],
  ["Nature & Elements", /fire\b|flame|ice\b|frost|snow|water\b|wave\b|wind\b|storm|thunder|earth\b|stone|rock\b|tree\b|leaf\b|flower|vine\b|thorn|root\b|seed|sun\b|moon\b|star\b|cloud|rain\b|tornado|volcano|mountain|river|ocean|forest|desert|swamp|jungle|coral|moss|crystal/i],
  ["Buildings & Structures", /castle|tower\b|wall\b|gate\b|bridge|house|temple|church|forge|throne|dungeon|cave\b|mine\b|camp\b|cabin|fortress|citadel|ruins|shrine|altar|tomb\b|crypt|arena|colosseum|monument|pillar|column|arch\b|dome|pyramid|lighthouse|windmill|mill\b|tavern|inn\b|shop\b|market|library|workshop/i],
  ["Transportation", /horse\b|ship\b|boat|wagon|cart|chariot|carriage|sail|anchor|wheel|saddle|caravan|sled|raft/i],
  ["Body & Anatomy", /skull|bone\b|heart\b|eye\b|brain|hand\b|foot\b|wing\b|tail\b|horn\b|claw|fang|tooth|blood|muscle|rib\b|spine|jaw|limb/i],
  ["Tools & Crafting", /anvil|hammer.*smith|forge|pickaxe|shovel|saw\b|wrench|gear\b|cog\b|lever|pulley|nail|screw|chisel|pliers|tongs|needle|thread|loom|spin|weave|craft|sew|knit|wood.*work|carv/i],
  ["Music & Performance", /drum\b|flute|harp|lute|horn\b.*music|trumpet|bell\b|chime|cymbal|tambourine|fiddle|pipe\b.*music|song|dance|mask.*theater|perform/i],
  ["Symbols & Marks", /cross\b|pentacle|pentagram|ankh|yin.*yang|triforce|spiral|celtic|norse|rune|symbol|emblem|crest|seal\b|insignia|banner|flag\b|standard/i],
];

// Cast wildcard import for easy lookup
const giIcons = GameIcons as unknown as Record<string, AppIcon>;
const allGiKeys = Object.keys(giIcons).filter((k) => k.startsWith("Gi"));

// Auto-categorize game icons by keyword matching
const giCategorized: Record<string, Record<string, AppIcon>> = {};
const giUsedKeys: Record<string, boolean> = {};

for (const key of allGiKeys) {
  const stripped = key.slice(2); // remove "Gi" prefix for matching
  for (const [label, regex] of GI_CATEGORY_PATTERNS) {
    if (regex.test(stripped)) {
      if (!giCategorized[label]) giCategorized[label] = {};
      giCategorized[label][key] = giIcons[key];
      giUsedKeys[key] = true;
      break; // first match wins
    }
  }
}

// Build categorized GI groups (preserving pattern order)
const giCategorizedGroups: IconGroup[] = GI_CATEGORY_PATTERNS
  .filter(([label]) => giCategorized[label])
  .map(([label]) => ({
    label: `GI: ${label}`,
    collection: "game-icons" as const,
    icons: giCategorized[label],
  }));

// Build alphabetical groups for uncategorized GI icons
const uncategorizedGiKeys = allGiKeys.filter((k) => !giUsedKeys[k]);
const giByLetter: Record<string, Record<string, AppIcon>> = {};
for (const key of uncategorizedGiKeys) {
  const letter = key.slice(2, 3).toUpperCase();
  (giByLetter[letter] ??= {})[key] = giIcons[key];
}
const giAlphaGroups: IconGroup[] = Object.keys(giByLetter)
  .sort()
  .map((letter) => ({
    label: `GI: Other — ${letter}`,
    collection: "game-icons" as const,
    icons: giByLetter[letter],
  }));

// ── Final exports ──────────────────────────────────────────────────

export const ICON_GROUPS: IconGroup[] = [
  ...LUCIDE_GROUPS,
  ...giCategorizedGroups,
  ...giAlphaGroups,
];

export const ICON_MAP: Record<string, AppIcon> = ICON_GROUPS.reduce<
  Record<string, AppIcon>
>((acc, group) => ({ ...acc, ...group.icons }), {});

export const DEFAULT_ICON_KEY = "CircleDot";

// ── Keyword search index ───────────────────────────────────────────
// Each icon gets keywords from: its name (split on caps), its group label,
// and explicit keyword aliases for common search terms.

const KEYWORD_ALIASES: [RegExp, string[]][] = [
  [/sword|blade|dagger|knife|katana|saber|scimitar|stiletto|rapier/i, ["sword", "blade", "melee", "sharp", "cut", "slash"]],
  [/axe|hammer|mace|club|flail|maul|bludgeon/i, ["blunt", "crush", "smash", "heavy", "melee"]],
  [/bow|arrow|crossbow|sling|shuriken|thrown|boomerang/i, ["ranged", "projectile", "shoot", "distance"]],
  [/musket|pistol|gun|rifle|cannon/i, ["ranged", "firearm", "shoot", "gun"]],
  [/spear|halberd|trident|glaive|pike|lance|naginata/i, ["polearm", "reach", "thrust", "melee"]],
  [/staff|wand|scepter/i, ["magic", "casting", "spell", "mage"]],
  [/helm|hat|hood|crown|tiara|circlet|bandana|turban|headband|barbute|visor/i, ["head", "helmet", "headgear", "armor"]],
  [/armor|breastplate|chain.*mail|scale.*mail|mail.*shirt|robe|vest|tunic/i, ["body", "torso", "chest", "armor", "protection"]],
  [/gauntlet|glove|bracer|fist|mailed|knuckle/i, ["hands", "arms", "armor", "grip"]],
  [/boot|greave|sabaton|shoe|sandal/i, ["feet", "legs", "armor", "walk"]],
  [/shield/i, ["block", "defend", "protection", "tank"]],
  [/ring|necklace|pendant|amulet|earring|brooch|bracelet|jewel|charm|locket|talisman|medallion/i, ["accessory", "jewelry", "trinket", "equip"]],
  [/cloak|cape|belt|mantle|sash/i, ["accessory", "wear", "equip"]],
  [/fire|flame|burn|heat|lava|magma|ember|inferno|blaze/i, ["fire", "heat", "burn", "hot", "flame", "elemental"]],
  [/ice|frost|snow|freeze|cold|blizzard|glacier/i, ["ice", "cold", "frost", "freeze", "elemental"]],
  [/water|wave|ocean|sea|rain|flood|aqua|tide|splash/i, ["water", "liquid", "wet", "elemental"]],
  [/lightning|thunder|electric|shock|spark|volt|storm/i, ["lightning", "electric", "thunder", "shock", "elemental"]],
  [/earth|stone|rock|ground|sand|dirt|crystal|mineral/i, ["earth", "ground", "stone", "elemental"]],
  [/wind|air|gust|breeze|tornado|cyclone/i, ["wind", "air", "elemental"]],
  [/poison|toxic|venom|acid/i, ["poison", "toxic", "damage", "debuff"]],
  [/heal|health|life|cure|restore|regen/i, ["heal", "life", "restore", "support"]],
  [/death|skull|undead|necro|grave|corpse/i, ["death", "dark", "undead", "necromancy"]],
  [/holy|sacred|divine|light|angel|blessing|celestial/i, ["holy", "light", "divine", "sacred"]],
  [/dark|shadow|void|abyss|eclipse|night/i, ["dark", "shadow", "void", "evil"]],
  [/dragon|drake|wyrm|wyvern/i, ["dragon", "flying", "legendary", "monster"]],
  [/potion|elixir|brew|flask|bottle|vial/i, ["potion", "consumable", "drink", "item"]],
  [/chest|treasure|gold|coin|loot/i, ["treasure", "loot", "reward", "gold", "money"]],
  [/scroll|book|tome|spell.*book/i, ["knowledge", "magic", "read", "learn"]],
  [/knight|warrior|fighter|soldier/i, ["class", "profession", "melee", "combat"]],
  [/mage|wizard|sorcerer|witch|warlock/i, ["class", "profession", "magic", "caster"]],
  [/rogue|thief|assassin|ninja/i, ["class", "profession", "stealth", "sneak"]],
  [/cleric|priest|healer|paladin/i, ["class", "profession", "holy", "support"]],
  [/ranger|archer|hunter|scout/i, ["class", "profession", "ranged", "nature"]],
  [/wolf|bear|lion|tiger|beast|creature|animal/i, ["beast", "animal", "creature", "wild"]],
  [/skeleton|zombie|ghost|phantom|wraith|specter/i, ["undead", "monster", "spirit", "haunted"]],
  [/demon|devil|fiend|imp/i, ["demon", "evil", "monster", "infernal"]],
  [/tree|leaf|flower|plant|vine|forest|nature/i, ["nature", "plant", "green", "growth"]],
  [/castle|tower|fortress|dungeon|ruins/i, ["building", "structure", "place", "location"]],
  [/key|lock|door|gate/i, ["access", "open", "close", "secure"]],
  [/sleep|stun|paralyze|freeze|blind|silence|confus/i, ["debuff", "status", "disable", "condition"]],
  [/haste|speed|sprint|quick|fast/i, ["buff", "speed", "fast", "movement"]],
  [/slow|heavy|weigh/i, ["debuff", "slow", "heavy", "weight"]],
  [/protect|shield|barrier|ward|resist|immune/i, ["buff", "defense", "protection"]],
  [/curse|doom|plague|disease|blight/i, ["debuff", "curse", "negative", "affliction"]],
];

// Build keyword index: icon key -> space-separated keyword string (for fast .includes() search)
const ICON_SEARCH_INDEX: Record<string, string> = {};

function buildSearchIndex() {
  for (const group of ICON_GROUPS) {
    for (const key of Object.keys(group.icons)) {
      // Start with the icon name split on capitals: "GiBroadsword" -> "gi broadsword"
      const nameParts = key.replace(/([A-Z])/g, " $1").toLowerCase().trim();
      // Add the group label
      const groupLabel = group.label.toLowerCase();
      // Collect alias keywords
      const aliases: string[] = [];
      for (const [pattern, keywords] of KEYWORD_ALIASES) {
        if (pattern.test(key.slice(key.startsWith("Gi") ? 2 : 0))) {
          aliases.push(...keywords);
        }
      }
      ICON_SEARCH_INDEX[key] = `${nameParts} ${groupLabel} ${aliases.join(" ")}`;
    }
  }
}
buildSearchIndex();

interface IconPickerProps {
  value?: string;
  onValueChange: (value: string) => void;
}

type CollectionFilter = "all" | "lucide" | "game-icons";

export function IconPicker({ value = DEFAULT_ICON_KEY, onValueChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<CollectionFilter>("all");

  const SelectedIcon = ICON_MAP[value];

  const filteredGroups = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    const searchTerms = lowerSearch.split(/\s+/).filter(Boolean);
    return ICON_GROUPS
      .filter((group) => tab === "all" || group.collection === tab)
      .map((group) => {
        const filtered = Object.entries(group.icons).filter(([key]) => {
          if (searchTerms.length === 0) return true;
          const indexEntry = ICON_SEARCH_INDEX[key] || key.toLowerCase();
          return searchTerms.every((term) => indexEntry.includes(term));
        });
        if (filtered.length === 0) return null;
        return { ...group, icons: Object.fromEntries(filtered) };
      })
      .filter(Boolean) as IconGroup[];
  }, [search, tab]);

  function handleSelect(key: string) {
    onValueChange(key);
    setOpen(false);
    setSearch("");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(""); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between font-normal"
        >
          <div className="flex items-center gap-2">
            {SelectedIcon && <SelectedIcon className="h-4 w-4" />}
            <span>{value}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="text-base">Choose an Icon</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as CollectionFilter)}>
          <div className="border-b px-4 pt-1">
            <TabsList className="h-8 w-full">
              <TabsTrigger value="all" className="text-xs flex-1">All</TabsTrigger>
              <TabsTrigger value="lucide" className="text-xs flex-1">Lucide</TabsTrigger>
              <TabsTrigger value="game-icons" className="text-xs flex-1">Game Icons</TabsTrigger>
            </TabsList>
          </div>
          {(["all", "lucide", "game-icons"] as const).map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="mt-0">
              <div className="h-[350px] overflow-y-auto">
                {filteredGroups.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No icons found.
                  </div>
                ) : (
                  <div className="p-3">
                    {filteredGroups.map((group) => (
                      <div key={group.label} className="mb-3">
                        <div className="px-1 pb-1 text-xs font-semibold text-muted-foreground">
                          {group.label}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Object.entries(group.icons).map(([key, Icon]) => (
                            <button
                              key={key}
                              type="button"
                              title={key}
                              onClick={() => handleSelect(key)}
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                                value === key && "bg-accent text-accent-foreground ring-1 ring-primary"
                              )}
                            >
                              <Icon className="h-6 w-6" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
