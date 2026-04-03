import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, useOutletContext } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectAccess } from "~/lib/project-access.server";
import {
    getAbilitiesByProjectId,
    createAbility,
    updateAbility,
    deleteAbility,
    reorderAbilities,
} from "~/api/ability";
import { getAbilityTypesByProjectId } from "~/api/abilityType";
import { getDamageTypesByProjectId } from "~/api/damageType";
import { getProfessionsByProjectId } from "~/api/profession";
import { getStatusEffectsByProjectId } from "~/api/statusEffect";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Swords, Plus } from "lucide-react";
import { toast } from "sonner";
import { AbilityTable } from "~/components/abilities/ability-table";
import { AbilityFormDialog } from "~/components/abilities/ability-form-dialog";

export async function loader({ params, request }: LoaderFunctionArgs) {
    const projectId = params.projectId;
    if (!projectId) {
        throw new Response("Project not found", { status: 404 });
    }

    await requireProjectAccess(request, projectId);

    const [abilities, abilityTypes, damageTypes, professions, statusEffects] =
        await Promise.all([
            getAbilitiesByProjectId(projectId),
            getAbilityTypesByProjectId(projectId),
            getDamageTypesByProjectId(projectId),
            getProfessionsByProjectId(projectId),
            getStatusEffectsByProjectId(projectId),
        ]);

    return json({ abilities, abilityTypes, damageTypes, professions, statusEffects });
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
            case "create_ability": {
                const name = (formData.get("name") as string)?.trim();
                if (!name) {
                    return json({ error: "Name is required" }, { status: 400 });
                }

                const description = (formData.get("description") as string)?.trim();
                const abilityTypeId = (formData.get("abilityTypeId") as string) || null;
                const damageTypeId = (formData.get("damageTypeId") as string) || null;
                const targetType = formData.get("targetType") as "Self" | "SingleAlly" | "SingleEnemy" | "AllAllies" | "AllEnemies" | "Area" | "Line";
                const rangeMin = parseInt(formData.get("rangeMin") as string, 10);
                const rangeMax = parseInt(formData.get("rangeMax") as string, 10);
                const aoeRadius = parseInt(formData.get("aoeRadius") as string, 10);
                const mpCost = parseInt(formData.get("mpCost") as string, 10);
                const powerFormula = (formData.get("powerFormula") as string)?.trim() || null;
                const professionEntries = JSON.parse((formData.get("professionEntries") as string) || "[]");
                const statusEffectEntries = JSON.parse((formData.get("statusEffectEntries") as string) || "[]");

                await createAbility({
                    name,
                    description: description || undefined,
                    abilityTypeId,
                    damageTypeId,
                    targetType: targetType || "SingleEnemy",
                    rangeMin: isNaN(rangeMin) ? 1 : rangeMin,
                    rangeMax: isNaN(rangeMax) ? 1 : rangeMax,
                    aoeRadius: isNaN(aoeRadius) ? 0 : aoeRadius,
                    mpCost: isNaN(mpCost) ? 0 : mpCost,
                    powerFormula,
                    projectId,
                    professionEntries,
                    statusEffectEntries,
                });

                return json({ success: "Ability created successfully" });
            }

            case "update_ability": {
                const abilityId = formData.get("abilityId") as string;
                if (!abilityId) {
                    return json({ error: "Ability ID is required" }, { status: 400 });
                }

                const name = (formData.get("name") as string)?.trim();
                if (!name) {
                    return json({ error: "Name is required" }, { status: 400 });
                }

                const description = (formData.get("description") as string)?.trim();
                const abilityTypeId = (formData.get("abilityTypeId") as string) || null;
                const damageTypeId = (formData.get("damageTypeId") as string) || null;
                const targetType = formData.get("targetType") as "Self" | "SingleAlly" | "SingleEnemy" | "AllAllies" | "AllEnemies" | "Area" | "Line";
                const rangeMin = parseInt(formData.get("rangeMin") as string, 10);
                const rangeMax = parseInt(formData.get("rangeMax") as string, 10);
                const aoeRadius = parseInt(formData.get("aoeRadius") as string, 10);
                const mpCost = parseInt(formData.get("mpCost") as string, 10);
                const powerFormula = (formData.get("powerFormula") as string)?.trim() || null;
                const professionEntries = JSON.parse((formData.get("professionEntries") as string) || "[]");
                const statusEffectEntries = JSON.parse((formData.get("statusEffectEntries") as string) || "[]");

                await updateAbility(abilityId, {
                    name,
                    description: description || null,
                    abilityTypeId,
                    damageTypeId,
                    targetType,
                    rangeMin: isNaN(rangeMin) ? 1 : rangeMin,
                    rangeMax: isNaN(rangeMax) ? 1 : rangeMax,
                    aoeRadius: isNaN(aoeRadius) ? 0 : aoeRadius,
                    mpCost: isNaN(mpCost) ? 0 : mpCost,
                    powerFormula,
                    projectId,
                    professionEntries,
                    statusEffectEntries,
                });

                return json({ success: "Ability updated successfully" });
            }

            case "delete_ability": {
                const abilityId = formData.get("abilityId") as string;
                if (!abilityId) {
                    return json({ error: "Ability ID is required" }, { status: 400 });
                }

                await deleteAbility(abilityId);
                return json({ success: "Ability deleted successfully" });
            }

            case "reorder_abilities": {
                const orderedIds = JSON.parse(formData.get("orderedIds") as string);
                await reorderAbilities(projectId, orderedIds);
                return json({ success: "Abilities reordered" });
            }

            default:
                return json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        console.error("Abilities action error:", error);
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

export default function AbilitiesPage() {
    const { abilities, abilityTypes, damageTypes, professions, statusEffects } =
        useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const { projectId } = useOutletContext<ProjectContext>();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAbility, setEditingAbility] = useState<(typeof abilities)[number] | null>(null);

    useEffect(() => {
        if (!actionData) return;
        if ("success" in actionData && typeof actionData.success === "string") {
            toast.success(actionData.success);
        }
        if ("error" in actionData) {
            toast.error(actionData.error as string);
        }
    }, [actionData]);

    function handleEdit(ability: (typeof abilities)[number]) {
        setEditingAbility(ability);
        setDialogOpen(true);
    }

    function handleNew() {
        setEditingAbility(null);
        setDialogOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Swords className="h-6 w-6" />
                        <h1 className="text-3xl font-bold tracking-tight">Abilities</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Define the abilities and skills that professions can learn and use in battle.
                    </p>
                </div>
                <Button onClick={handleNew}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Ability
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <AbilityTable abilities={abilities} onEdit={handleEdit} />
                </CardContent>
            </Card>

            <AbilityFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                ability={editingAbility}
                projectId={projectId}
                abilityTypes={abilityTypes}
                damageTypes={damageTypes}
                professions={professions}
                statusEffects={statusEffects}
            />
        </div>
    );
}
