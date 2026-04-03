import { useEffect, useState } from "react";
import { useSubmit } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

// ─── Local types ─────────────────────────────────────────────────────────────

type StatusEffectEntry = { statusEffectId: string; effectType: "Inflict" | "Cure"; chance: number };

type AbilityType = { id: string; name: string };
type DamageType = { id: string; name: string };
type StatusEffect = { id: string; name: string; category: string };

type Ability = {
    id: string;
    name: string;
    description: string | null;
    abilityTypeId: string | null;
    damageTypeId: string | null;
    targetType: string;
    rangeMin: number;
    rangeMax: number;
    aoeRadius: number;
    mpCost: number;
    powerFormula: string | null;
    statusEffects: { statusEffectId: string; effectType: string; chance: number; statusEffect: StatusEffect }[];
};

// ─── Schema ──────────────────────────────────────────────────────────────────

const abilityFormSchema = z.object({
    name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
    description: z.string().max(500).optional().or(z.literal("")),
    abilityTypeId: z.string().optional().or(z.literal("")),
    damageTypeId: z.string().optional().or(z.literal("")),
    targetType: z.enum(["Self", "SingleAlly", "SingleEnemy", "AllAllies", "AllEnemies", "Area", "Line"]),
    rangeMin: z.coerce.number().int().min(0),
    rangeMax: z.coerce.number().int().min(0),
    aoeRadius: z.coerce.number().int().min(0),
    mpCost: z.coerce.number().int().min(0),
    powerFormula: z.string().optional().or(z.literal("")),
});

type AbilityFormValues = z.infer<typeof abilityFormSchema>;

const TARGET_TYPE_LABELS: Record<string, string> = {
    Self: "Self",
    SingleAlly: "Single Ally",
    SingleEnemy: "Single Enemy",
    AllAllies: "All Allies",
    AllEnemies: "All Enemies",
    Area: "Area",
    Line: "Line",
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface AbilityFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ability?: Ability | null;
    projectId: string;
    abilityTypes: AbilityType[];
    damageTypes: DamageType[];
    statusEffects: StatusEffect[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AbilityFormDialog({
    open,
    onOpenChange,
    ability,
    projectId,
    abilityTypes,
    damageTypes,
    statusEffects,
}: AbilityFormDialogProps) {
    const submit = useSubmit();
    const isEditing = !!ability;

    const [statusEffectEntries, setStatusEffectEntries] = useState<StatusEffectEntry[]>([]);

    const form = useForm<AbilityFormValues>({
        resolver: zodResolver(abilityFormSchema),
        defaultValues: {
            name: "",
            description: "",
            abilityTypeId: "",
            damageTypeId: "",
            targetType: "SingleEnemy",
            rangeMin: 1,
            rangeMax: 1,
            aoeRadius: 0,
            mpCost: 0,
            powerFormula: "",
        },
    });

    useEffect(() => {
        if (!open) return;

        if (ability) {
            form.reset({
                name: ability.name,
                description: ability.description || "",
                abilityTypeId: ability.abilityTypeId || "",
                damageTypeId: ability.damageTypeId || "",
                targetType: ability.targetType as AbilityFormValues["targetType"],
                rangeMin: ability.rangeMin,
                rangeMax: ability.rangeMax,
                aoeRadius: ability.aoeRadius,
                mpCost: ability.mpCost,
                powerFormula: ability.powerFormula || "",
            });
            setStatusEffectEntries(
                ability.statusEffects.map((s) => ({
                    statusEffectId: s.statusEffectId,
                    effectType: s.effectType as "Inflict" | "Cure",
                    chance: s.chance,
                }))
            );
            return;
        }

        form.reset({
            name: "",
            description: "",
            abilityTypeId: "",
            damageTypeId: "",
            targetType: "SingleEnemy",
            rangeMin: 1,
            rangeMax: 1,
            aoeRadius: 0,
            mpCost: 0,
            powerFormula: "",
        });
        setStatusEffectEntries([]);
    }, [open, ability, form]);

    // ── Status effect sub-editor helpers ─────────────────────────────────────

    function addStatusEffectEntry() {
        const first = statusEffects[0];
        if (!first) return;
        setStatusEffectEntries((prev) => [
            ...prev,
            { statusEffectId: first.id, effectType: "Inflict", chance: 1.0 },
        ]);
    }

    function removeStatusEffectEntry(index: number) {
        setStatusEffectEntries((prev) => prev.filter((_, i) => i !== index));
    }

    function updateStatusEffectEntry(index: number, patch: Partial<StatusEffectEntry>) {
        setStatusEffectEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    function onSubmit(values: AbilityFormValues) {
        const formData = new FormData();
        formData.append("action", isEditing ? "update_ability" : "create_ability");
        if (ability) {
            formData.append("abilityId", ability.id);
        }
        formData.append("projectId", projectId);
        formData.append("name", values.name);
        formData.append("description", values.description || "");
        formData.append("abilityTypeId", values.abilityTypeId || "");
        formData.append("damageTypeId", values.damageTypeId || "");
        formData.append("targetType", values.targetType);
        formData.append("rangeMin", String(values.rangeMin));
        formData.append("rangeMax", String(values.rangeMax));
        formData.append("aoeRadius", String(values.aoeRadius));
        formData.append("mpCost", String(values.mpCost));
        formData.append("powerFormula", values.powerFormula || "");
        formData.append("statusEffectEntries", JSON.stringify(statusEffectEntries));

        submit(formData, { method: "post" });
        onOpenChange(false);
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[660px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Ability" : "New Ability"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update this ability."
                            : "Create a new ability for your game."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name + Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Fire" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="abilityTypeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                            onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                                            value={field.value || "none"}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="None" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {abilityTypes.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Deals fire damage to one enemy..." rows={2} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Damage Type */}
                        <FormField
                            control={form.control}
                            name="damageTypeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Damage Type</FormLabel>
                                    <Select
                                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                                        value={field.value || "none"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {damageTypes.map((d) => (
                                                <SelectItem key={d.id} value={d.id}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Target + Range + AoE + MP */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="targetType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(TARGET_TYPE_LABELS).map(([value, label]) => (
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
                            <FormField
                                control={form.control}
                                name="mpCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>MP Cost</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="rangeMin"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Range Min</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rangeMax"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Range Max</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="aoeRadius"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>AoE Radius</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Power Formula */}
                        <FormField
                            control={form.control}
                            name="powerFormula"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Power Formula</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ATK * 1.5" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Optional. Formula evaluated at runtime using unit stats as variables.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Status Effect Links */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Status Effects</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addStatusEffectEntry}
                                    disabled={statusEffects.length === 0}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Effect
                                </Button>
                            </div>

                            {statusEffectEntries.length === 0 && (
                                <p className="text-sm text-muted-foreground py-1">
                                    No status effects linked.
                                </p>
                            )}

                            <div className="space-y-2">
                                {statusEffectEntries.map((entry, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <Select
                                            value={entry.statusEffectId}
                                            onValueChange={(value) =>
                                                updateStatusEffectEntry(index, { statusEffectId: value })
                                            }
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusEffects.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={entry.effectType}
                                            onValueChange={(value) =>
                                                updateStatusEffectEntry(index, {
                                                    effectType: value as "Inflict" | "Cure",
                                                })
                                            }
                                        >
                                            <SelectTrigger className="w-[100px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Inflict">Inflict</SelectItem>
                                                <SelectItem value="Cure">Cure</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-sm text-muted-foreground">Chance</span>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={Math.round(entry.chance * 100)}
                                                onChange={(e) =>
                                                    updateStatusEffectEntry(index, {
                                                        chance: (parseInt(e.target.value, 10) || 0) / 100,
                                                    })
                                                }
                                                className="w-[65px]"
                                            />
                                            <span className="text-sm text-muted-foreground">%</span>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-destructive shrink-0"
                                            onClick={() => removeStatusEffectEntry(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {isEditing ? "Save Changes" : "Create Ability"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
