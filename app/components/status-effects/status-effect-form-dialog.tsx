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
import { Switch } from "~/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { IconPicker, DEFAULT_ICON_KEY } from "~/components/shared/icon-picker";

type StatModifier = {
    statId: string;
    modifierType: "Flat" | "Percentage";
    value: number;
};

type Stat = {
    id: string;
    name: string;
    abbreviation: string;
};

type StatusEffect = {
    id: string;
    name: string;
    description: string | null;
    color: string;
    iconKey: string;
    category: "Buff" | "Debuff" | "Neutral";
    durationType: "Temporary" | "Permanent" | "UntilBattleEnd";
    duration: number | null;
    stackable: boolean;
    preventsActions: boolean;
    causesRecurring: boolean;
    recurringFormula: string | null;
    statModifiers: {
        statId: string;
        modifierType: string;
        value: number;
        statDefinition: Stat;
    }[];
};

const statusEffectFormSchema = z.object({
    name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
    description: z.string().max(500, "Description must be 500 characters or less").optional().or(z.literal("")),
    color: z.string().min(1, "Color is required"),
    iconKey: z.string().min(1, "Icon is required"),
    category: z.enum(["Buff", "Debuff", "Neutral"]),
    durationType: z.enum(["Temporary", "Permanent", "UntilBattleEnd"]),
    duration: z.coerce.number().int().positive().optional().or(z.literal("")).transform((v) => v === "" ? undefined : v),
    stackable: z.boolean().default(false),
    preventsActions: z.boolean().default(false),
    causesRecurring: z.boolean().default(false),
    recurringFormula: z.string().optional().or(z.literal("")),
});

type StatusEffectFormValues = z.infer<typeof statusEffectFormSchema>;


interface StatusEffectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    statusEffect?: StatusEffect | null;
    projectId: string;
    stats: Stat[];
}

export function StatusEffectFormDialog({
    open,
    onOpenChange,
    statusEffect,
    projectId,
    stats,
}: StatusEffectFormDialogProps) {
    const submit = useSubmit();
    const isEditing = !!statusEffect;

    const [modifiers, setModifiers] = useState<StatModifier[]>([]);

    const form = useForm<StatusEffectFormValues>({
        resolver: zodResolver(statusEffectFormSchema),
        defaultValues: {
            name: "",
            description: "",
            color: "#6366f1",
            iconKey: DEFAULT_ICON_KEY,
            category: "Neutral",
            durationType: "Temporary",
            duration: undefined,
            stackable: false,
            preventsActions: false,
            causesRecurring: false,
            recurringFormula: "",
        },
    });

    const durationType = form.watch("durationType");
    const causesRecurring = form.watch("causesRecurring");

    useEffect(() => {
        if (!open) return;

        if (statusEffect) {
            form.reset({
                name: statusEffect.name,
                description: statusEffect.description || "",
                color: statusEffect.color,
                iconKey: statusEffect.iconKey,
                category: statusEffect.category,
                durationType: statusEffect.durationType,
                duration: statusEffect.duration ?? undefined,
                stackable: statusEffect.stackable,
                preventsActions: statusEffect.preventsActions,
                causesRecurring: statusEffect.causesRecurring,
                recurringFormula: statusEffect.recurringFormula || "",
            });
            setModifiers(
                statusEffect.statModifiers.map((m) => ({
                    statId: m.statId,
                    modifierType: m.modifierType as "Flat" | "Percentage",
                    value: m.value,
                }))
            );
            return;
        }

        form.reset({
            name: "",
            description: "",
            color: "#6366f1",
            iconKey: DEFAULT_ICON_KEY,
            category: "Neutral",
            durationType: "Temporary",
            duration: undefined,
            stackable: false,
            preventsActions: false,
            causesRecurring: false,
            recurringFormula: "",
        });
        setModifiers([]);
    }, [open, statusEffect, form]);

    function addModifier() {
        const firstStat = stats[0];
        if (!firstStat) return;
        setModifiers((prev) => [
            ...prev,
            { statId: firstStat.id, modifierType: "Flat", value: 0 },
        ]);
    }

    function removeModifier(index: number) {
        setModifiers((prev) => prev.filter((_, i) => i !== index));
    }

    function updateModifier(index: number, patch: Partial<StatModifier>) {
        setModifiers((prev) =>
            prev.map((m, i) => (i === index ? { ...m, ...patch } : m))
        );
    }

    function onSubmit(values: StatusEffectFormValues) {
        const formData = new FormData();
        formData.append("action", isEditing ? "update_status_effect" : "create_status_effect");
        if (statusEffect) {
            formData.append("statusEffectId", statusEffect.id);
        }
        formData.append("projectId", projectId);
        formData.append("name", values.name);
        formData.append("description", values.description || "");
        formData.append("color", values.color);
        formData.append("iconKey", values.iconKey);
        formData.append("category", values.category);
        formData.append("durationType", values.durationType);
        formData.append("duration", values.duration != null ? String(values.duration) : "");
        formData.append("stackable", String(values.stackable));
        formData.append("preventsActions", String(values.preventsActions));
        formData.append("causesRecurring", String(values.causesRecurring));
        formData.append("recurringFormula", values.recurringFormula || "");
        formData.append("statModifiers", JSON.stringify(modifiers));

        submit(formData, { method: "post" });
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Status Effect" : "New Status Effect"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update this status effect."
                            : "Create a new buff, debuff, or condition for your game."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name + Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Poison" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Buff">Buff</SelectItem>
                                                <SelectItem value="Debuff">Debuff</SelectItem>
                                                <SelectItem value="Neutral">Neutral</SelectItem>
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
                                        <Textarea placeholder="Deals damage each turn..." rows={2} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Color + Icon */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    className="h-9 w-12 cursor-pointer rounded border border-input bg-transparent p-1"
                                                />
                                                <Input
                                                    placeholder="#6366f1"
                                                    value={field.value}
                                                    onChange={field.onChange}
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
                                        <FormControl>
                                            <IconPicker
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Duration */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="durationType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Temporary">Temporary</SelectItem>
                                                <SelectItem value="Permanent">Permanent</SelectItem>
                                                <SelectItem value="UntilBattleEnd">Until Battle End</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {durationType === "Temporary" && (
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (turns)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder="3"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Behavior flags */}
                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="stackable"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Stackable</FormLabel>
                                            <FormDescription>Can multiple instances apply simultaneously</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="preventsActions"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Prevents Actions</FormLabel>
                                            <FormDescription>Unit cannot act while afflicted (sleep, stop, petrify)</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="causesRecurring"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>Causes Recurring Effect</FormLabel>
                                            <FormDescription>Applies damage or healing each turn (poison, regen)</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Recurring formula */}
                        {causesRecurring && (
                            <FormField
                                control={form.control}
                                name="recurringFormula"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recurring Formula</FormLabel>
                                        <FormControl>
                                            <Input placeholder="maxHP * 0.1" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Formula evaluated each turn. Use stat names as variables.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Stat Modifiers */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Stat Modifiers</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addModifier}
                                    disabled={stats.length === 0}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Modifier
                                </Button>
                            </div>

                            {modifiers.length === 0 && (
                                <p className="text-sm text-muted-foreground py-2">
                                    No stat modifiers. Add one to affect unit stats.
                                </p>
                            )}

                            <div className="space-y-2">
                                {modifiers.map((modifier, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <Select
                                            value={modifier.statId}
                                            onValueChange={(value) => updateModifier(index, { statId: value })}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stats.map((stat) => (
                                                    <SelectItem key={stat.id} value={stat.id}>
                                                        {stat.name} ({stat.abbreviation})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={modifier.modifierType}
                                            onValueChange={(value) =>
                                                updateModifier(index, { modifierType: value as "Flat" | "Percentage" })
                                            }
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Flat">Flat</SelectItem>
                                                <SelectItem value="Percentage">%</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <Input
                                                type="number"
                                                value={modifier.value}
                                                onChange={(e) =>
                                                    updateModifier(index, { value: parseFloat(e.target.value) || 0 })
                                                }
                                                className="w-[80px]"
                                            />
                                            <span className="text-sm text-muted-foreground w-4">
                                                {modifier.modifierType === "Percentage" ? "%" : ""}
                                            </span>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-destructive shrink-0"
                                            onClick={() => removeModifier(index)}
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
                                {isEditing ? "Save Changes" : "Create Status Effect"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
