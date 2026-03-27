import { useEffect } from "react";
import { useSubmit } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseDamageType } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  // Combat/Weapon
  Axe,
  Bomb,
  Construction,
  Crosshair,
  Hammer,
  Pickaxe,
  PocketKnife,
  Shield,
  Skull,
  Sword,
  Swords,
  Wand,
  WandSparkles,
  // Elemental/Nature
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
  Cloudy,
  Droplet,
  Droplets,
  Earth,
  Flame,
  FlameKindling,
  Gem,
  Heater,
  Leaf,
  LeafyGreen,
  Mountain,
  MountainSnow,
  Rainbow,
  Shrub,
  Snowflake,
  ThermometerSnowflake,
  Tornado,
  TreeDeciduous,
  TreePalm,
  TreePine,
  Trees,
  Waves,
  Wind,
  Zap,
  // Light/Holy
  Flashlight,
  FlashlightOff,
  Sparkle,
  Sparkles,
  Star,
  StarHalf,
  StarOff,
  Sun,
  SunDim,
  SunMedium,
  SunMoon,
  // Dark/Arcane
  Biohazard,
  Brain,
  BrainCircuit,
  CircleDot,
  Eclipse,
  Eye,
  EyeOff,
  Ghost,
  Hexagon,
  Moon,
  MoonStar,
  Orbit,
  Radiation,
  // Life/Drain
  HandHeart,
  Heart,
  HeartCrack,
  HeartOff,
  HeartPulse,
  // Crystal/Mineral
  Diamond,
  DiamondMinus,
  // Sound/Sonic
  AudioLines,
  Bell,
  BellRing,
  // Time/Gravity
  Hourglass,
  Timer,
  // Beast/Animal
  Bird,
  Bug,
  Rat,
  // Tech/Construct
  Bot,
  CircuitBoard,
  Cpu,
  Microchip,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const DAMAGE_TYPE_ICONS: Record<string, LucideIcon> = {
  // Combat/Weapon
  Axe,
  Bomb,
  Construction,
  Crosshair,
  Hammer,
  Pickaxe,
  PocketKnife,
  Shield,
  Skull,
  Sword,
  Swords,
  Wand,
  WandSparkles,
  // Elemental/Nature
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
  Cloudy,
  Droplet,
  Droplets,
  Earth,
  Flame,
  FlameKindling,
  Gem,
  Heater,
  Leaf,
  LeafyGreen,
  Mountain,
  MountainSnow,
  Rainbow,
  Shrub,
  Snowflake,
  ThermometerSnowflake,
  Tornado,
  TreeDeciduous,
  TreePalm,
  TreePine,
  Trees,
  Waves,
  Wind,
  Zap,
  // Light/Holy
  Flashlight,
  FlashlightOff,
  Sparkle,
  Sparkles,
  Star,
  StarHalf,
  StarOff,
  Sun,
  SunDim,
  SunMedium,
  SunMoon,
  // Dark/Arcane
  Biohazard,
  Brain,
  BrainCircuit,
  CircleDot,
  Eclipse,
  Eye,
  EyeOff,
  Ghost,
  Hexagon,
  Moon,
  MoonStar,
  Orbit,
  Radiation,
  // Life/Drain
  HandHeart,
  Heart,
  HeartCrack,
  HeartOff,
  HeartPulse,
  // Crystal/Mineral
  Diamond,
  DiamondMinus,
  // Sound/Sonic
  AudioLines,
  Bell,
  BellRing,
  // Time/Gravity
  Hourglass,
  Timer,
  // Beast/Animal
  Bird,
  Bug,
  Rat,
  // Tech/Construct
  Bot,
  CircuitBoard,
  Cpu,
  Microchip,
};

const damageTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().or(z.literal("")),
  baseType: z.nativeEnum(BaseDamageType, { errorMap: () => ({ message: "Select a base type" }) }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  iconKey: z.string().min(1, "Select an icon"),
});

type DamageTypeFormValues = z.infer<typeof damageTypeFormSchema>;

const BASE_TYPE_LABELS: Record<BaseDamageType, string> = {
  Physical: "Physical",
  Magical: "Magical",
  Chemical: "Chemical",
  Environmental: "Environmental",
};

interface DamageTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: {
    id: string;
    name: string;
    description: string | null;
    baseType: BaseDamageType;
    color: string;
    iconKey: string;
  } | null;
  projectId: string;
  defaultBaseType?: BaseDamageType | null;
  defaultColor?: string;
}

export function DamageTypeFormDialog({
  open,
  onOpenChange,
  item,
  projectId,
  defaultBaseType,
  defaultColor,
}: DamageTypeFormDialogProps) {
  const submit = useSubmit();
  const isEditing = !!item;

  const form = useForm<DamageTypeFormValues>({
    resolver: zodResolver(damageTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      baseType: BaseDamageType.Physical,
      color: "#ef4444",
      iconKey: "Swords",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (item) {
      form.reset({
        name: item.name,
        description: item.description || "",
        baseType: item.baseType,
        color: item.color,
        iconKey: item.iconKey,
      });
      return;
    }

    form.reset({
      name: "",
      description: "",
      baseType: defaultBaseType || BaseDamageType.Physical,
      color: defaultColor || "#ef4444",
      iconKey: "Swords",
    });
  }, [open, item, form, defaultBaseType, defaultColor]);

  function onSubmit(values: DamageTypeFormValues) {
    const formData = new FormData();
    formData.append("action", isEditing ? "update_damage_type" : "create_damage_type");
    if (item) {
      formData.append("damageTypeId", item.id);
    }
    formData.append("projectId", projectId);
    formData.append("name", values.name);
    formData.append("description", values.description || "");
    formData.append("baseType", values.baseType);
    formData.append("color", values.color);
    formData.append("iconKey", values.iconKey);

    submit(formData, { method: "post" });
    onOpenChange(false);
  }

  const selectedIconKey = form.watch("iconKey");
  const selectedColor = form.watch("color");
  const SelectedIcon = DAMAGE_TYPE_ICONS[selectedIconKey];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Damage Type" : "New Damage Type"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this damage type for your project."
              : "Create a new damage type for your project."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Preview */}
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              <div
                className="flex items-center justify-center h-10 w-10 rounded-lg"
                style={{ backgroundColor: selectedColor + "20", color: selectedColor }}
              >
                {SelectedIcon && <SelectedIcon className="h-5 w-5" />}
              </div>
              <span className="font-medium">{form.watch("name") || "Damage Type Preview"}</span>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Slash, Fire, Poison" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A destructive force of heat and flame..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional. Max 500 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a base type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(BASE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={field.value}
                          onChange={field.onChange}
                          className="h-9 w-12 rounded border cursor-pointer bg-transparent"
                        />
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="#ef4444"
                          className="font-mono"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iconKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(DAMAGE_TYPE_ICONS).map(([key, Icon]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{key}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save Changes" : "Create Damage Type"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
