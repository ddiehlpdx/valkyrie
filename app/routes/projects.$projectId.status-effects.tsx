import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, useOutletContext } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectAccess } from "~/lib/project-access.server";
import {
    getStatusEffectsByProjectId,
    createStatusEffect,
    updateStatusEffect,
    deleteStatusEffect,
    reorderStatusEffects,
} from "~/api/statusEffect";
import { getStatsByProjectId } from "~/api/statDefinition";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Zap, Plus } from "lucide-react";
import { toast } from "sonner";
import { StatusEffectTable } from "~/components/status-effects/status-effect-table";
import { StatusEffectFormDialog } from "~/components/status-effects/status-effect-form-dialog";

export async function loader({ params, request }: LoaderFunctionArgs) {
    const projectId = params.projectId;
    if (!projectId) {
        throw new Response("Project not found", { status: 404 });
    }

    await requireProjectAccess(request, projectId);

    const [statusEffects, stats] = await Promise.all([
        getStatusEffectsByProjectId(projectId),
        getStatsByProjectId(projectId),
    ]);

    return json({ statusEffects, stats });
}

export async function action({ params, request }: ActionFunctionArgs) {
    const projectId = params.projectId;
    if (!projectId) {
        return json({ error: "Project not found" }, { status: 404 });
    }

    await requireProjectAccess(request, projectId);
    const formData = await request.formData();
    const actionType = formData.get("action") as string;

    try {
        switch (actionType) {
            case "create_status_effect": {
                const name = (formData.get("name") as string)?.trim();
                if (!name) {
                    return json({ error: "Name is required" }, { status: 400 });
                }

                const description = (formData.get("description") as string)?.trim();
                const color = (formData.get("color") as string)?.trim();
                const iconKey = (formData.get("iconKey") as string)?.trim();
                const category = formData.get("category") as "Buff" | "Debuff" | "Neutral";
                const durationType = formData.get("durationType") as "Temporary" | "Permanent" | "UntilBattleEnd";
                const durationRaw = formData.get("duration") as string;
                const duration = durationRaw ? parseInt(durationRaw, 10) : null;
                const stackable = formData.get("stackable") === "true";
                const preventsActions = formData.get("preventsActions") === "true";
                const causesRecurring = formData.get("causesRecurring") === "true";
                const recurringFormula = (formData.get("recurringFormula") as string)?.trim() || null;
                const statModifiers = JSON.parse((formData.get("statModifiers") as string) || "[]");

                await createStatusEffect({
                    name,
                    description: description || undefined,
                    color: color || "#6366f1",
                    iconKey: iconKey || "Zap",
                    category: category || "Neutral",
                    durationType: durationType || "Temporary",
                    duration,
                    stackable,
                    preventsActions,
                    causesRecurring,
                    recurringFormula,
                    projectId,
                    statModifiers,
                });

                return json({ success: "Status effect created successfully" });
            }

            case "update_status_effect": {
                const statusEffectId = formData.get("statusEffectId") as string;
                if (!statusEffectId) {
                    return json({ error: "Status effect ID is required" }, { status: 400 });
                }

                const name = (formData.get("name") as string)?.trim();
                if (!name) {
                    return json({ error: "Name is required" }, { status: 400 });
                }

                const description = (formData.get("description") as string)?.trim();
                const color = (formData.get("color") as string)?.trim();
                const iconKey = (formData.get("iconKey") as string)?.trim();
                const category = formData.get("category") as "Buff" | "Debuff" | "Neutral";
                const durationType = formData.get("durationType") as "Temporary" | "Permanent" | "UntilBattleEnd";
                const durationRaw = formData.get("duration") as string;
                const duration = durationRaw ? parseInt(durationRaw, 10) : null;
                const stackable = formData.get("stackable") === "true";
                const preventsActions = formData.get("preventsActions") === "true";
                const causesRecurring = formData.get("causesRecurring") === "true";
                const recurringFormula = (formData.get("recurringFormula") as string)?.trim() || null;
                const statModifiers = JSON.parse((formData.get("statModifiers") as string) || "[]");

                await updateStatusEffect(statusEffectId, {
                    name,
                    description: description || null,
                    color,
                    iconKey,
                    category,
                    durationType,
                    duration,
                    stackable,
                    preventsActions,
                    causesRecurring,
                    recurringFormula,
                    projectId,
                    statModifiers,
                });

                return json({ success: "Status effect updated successfully" });
            }

            case "delete_status_effect": {
                const statusEffectId = formData.get("statusEffectId") as string;
                if (!statusEffectId) {
                    return json({ error: "Status effect ID is required" }, { status: 400 });
                }

                await deleteStatusEffect(statusEffectId);
                return json({ success: "Status effect deleted successfully" });
            }

            case "reorder_status_effects": {
                const orderedIds = JSON.parse(formData.get("orderedIds") as string);
                await reorderStatusEffects(projectId, orderedIds);
                return json({ success: "Status effects reordered" });
            }

            default:
                return json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        console.error("Status effects action error:", error);
        return json(
            { error: error instanceof Error ? error.message : "An error occurred" },
            { status: 500 }
        );
    }
}

interface ProjectContext {
    user: { id: string; username: string; email: string };
    project: { id: string; name: string };
    projectId: string;
}

export default function StatusEffectsPage() {
    const { statusEffects, stats } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const { projectId } = useOutletContext<ProjectContext>();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingStatusEffect, setEditingStatusEffect] = useState<(typeof statusEffects)[number] | null>(null);

    useEffect(() => {
        if (!actionData) return;
        if ("success" in actionData && typeof actionData.success === "string") {
            toast.success(actionData.success);
        }
        if ("error" in actionData) {
            toast.error(actionData.error as string);
        }
    }, [actionData]);

    function handleEdit(statusEffect: (typeof statusEffects)[number]) {
        setEditingStatusEffect(statusEffect);
        setDialogOpen(true);
    }

    function handleNew() {
        setEditingStatusEffect(null);
        setDialogOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Zap className="h-6 w-6" />
                        <h1 className="text-3xl font-bold tracking-tight">Status Effects</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Define buffs, debuffs, and conditions that can be applied to units during battle.
                    </p>
                </div>
                <Button onClick={handleNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Status Effect
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <StatusEffectTable statusEffects={statusEffects} onEdit={handleEdit} />
                </CardContent>
            </Card>

            <StatusEffectFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                statusEffect={editingStatusEffect}
                projectId={projectId}
                stats={stats}
            />
        </div>
    );
}
