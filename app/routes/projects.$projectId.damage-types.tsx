import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, useOutletContext } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectAccess } from "~/lib/project-access.server";
import { BaseDamageType } from "../../generated/prisma/browser";
import {
  getDamageTypesByProjectId,
  createDamageType,
  updateDamageType,
  deleteDamageType,
  reorderDamageTypes,
} from "~/api/damageType";
import { getInteractionsByProjectId, bulkUpsertInteractions } from "~/api/damageTypeInteraction";
import { getProjectSettings, updateProjectSettings } from "~/api/projectSettings";
import { Flame } from "lucide-react";
import { toast } from "sonner";
import { DamageTypeGrid } from "~/components/core-rules/damage-type-grid";
import { DamageTypeFormDialog } from "~/components/core-rules/damage-type-form-dialog";
import { DamageTypeInteractionDialog } from "~/components/core-rules/damage-type-interaction-dialog";
import type { DamageTypeData } from "~/components/core-rules/damage-type-card";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  await requireProjectAccess(request, projectId);
  const [damageTypes, interactions, settings] = await Promise.all([
    getDamageTypesByProjectId(projectId),
    getInteractionsByProjectId(projectId),
    getProjectSettings(projectId),
  ]);

  const baseTypeColors = {
    Physical: settings?.physicalColor ?? "#d4d4d4",
    Magical: settings?.magicalColor ?? "#d4d4d4",
    Chemical: settings?.chemicalColor ?? "#d4d4d4",
    Environmental: settings?.environmentalColor ?? "#d4d4d4",
  };

  return json({ damageTypes, interactions, baseTypeColors });
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
      case "create_damage_type": {
        const name = (formData.get("name") as string)?.trim();
        const baseType = formData.get("baseType") as BaseDamageType;
        const color = formData.get("color") as string;
        const iconKey = formData.get("iconKey") as string;
        const description = (formData.get("description") as string)?.trim() || null;

        if (!name || !color || !iconKey) {
          return json({ error: "Name, color, and icon are required" }, { status: 400 });
        }
        if (!baseType || !Object.values(BaseDamageType).includes(baseType)) {
          return json({ error: "Valid base type is required" }, { status: 400 });
        }

        await createDamageType({ name, baseType, color, iconKey, description, projectId });
        return json({ success: "Damage type created successfully" });
      }

      case "update_damage_type": {
        const id = formData.get("damageTypeId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }

        const name = (formData.get("name") as string)?.trim();
        const baseType = formData.get("baseType") as BaseDamageType;
        const color = formData.get("color") as string;
        const iconKey = formData.get("iconKey") as string;
        const description = (formData.get("description") as string)?.trim() || null;

        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }

        await updateDamageType(id, { name, baseType, color, iconKey, description });
        return json({ success: "Damage type updated successfully" });
      }

      case "delete_damage_type": {
        const id = formData.get("damageTypeId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        await deleteDamageType(id);
        return json({ success: "Damage type deleted successfully" });
      }

      case "reorder_damage_types": {
        const orderedIds = JSON.parse(formData.get("orderedIds") as string);
        await reorderDamageTypes(projectId, orderedIds);
        return json({ success: "Damage types reordered" });
      }

      case "update_base_type_color": {
        const baseType = formData.get("baseType") as string;
        const color = formData.get("color") as string;
        if (!baseType || !color) {
          return json({ error: "Base type and color are required" }, { status: 400 });
        }
        const colorFieldMap: Record<string, string> = {
          Physical: "physicalColor",
          Magical: "magicalColor",
          Chemical: "chemicalColor",
          Environmental: "environmentalColor",
        };
        const field = colorFieldMap[baseType];
        if (!field) {
          return json({ error: "Invalid base type" }, { status: 400 });
        }
        await updateProjectSettings(projectId, { [field]: color });
        return json({ success: `${baseType} color updated` });
      }

      case "bulk_upsert_interactions": {
        const interactionsJson = formData.get("interactions") as string;
        const interactions = JSON.parse(interactionsJson) as Array<{
          sourceDamageTypeId: string;
          targetDamageTypeId: string;
          multiplier: number;
        }>;

        await bulkUpsertInteractions(projectId, interactions);
        return json({ success: "Interactions saved successfully" });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Damage types action error:", error);
    return json({
      error: error instanceof Error ? error.message : "An error occurred",
    }, { status: 500 });
  }
}

interface ProjectContext {
  user: { id: string; username: string; email: string };
  project: { id: string; name: string };
  projectId: string;
}

export default function DamageTypesPage() {
  const { damageTypes, interactions, baseTypeColors } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { projectId } = useOutletContext<ProjectContext>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DamageTypeData | null>(null);
  const [defaultBaseType, setDefaultBaseType] = useState<BaseDamageType | null>(null);
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);
  const [interactionDamageType, setInteractionDamageType] = useState<DamageTypeData | null>(null);

  useEffect(() => {
    if (!actionData) return;
    if ("success" in actionData && typeof actionData.success === "string") {
      toast.success(actionData.success);
    }
    if ("error" in actionData) {
      toast.error(actionData.error as string);
    }
  }, [actionData]);

  function handleEdit(item: DamageTypeData) {
    setEditingItem(item);
    setDefaultBaseType(null);
    setDialogOpen(true);
  }

  function handleNewWithBaseType(baseType: BaseDamageType) {
    setEditingItem(null);
    setDefaultBaseType(baseType);
    setDialogOpen(true);
  }

  function handleInteractions(item: DamageTypeData) {
    setInteractionDamageType(item);
    setInteractionDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Flame className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Damage Types</h1>
        </div>
        <p className="text-muted-foreground">
          Define damage types with visual identity and configure how they interact with each other.
        </p>
      </div>

      <DamageTypeGrid
        damageTypes={damageTypes}
        interactions={interactions}
        baseTypeColors={baseTypeColors}
        onEdit={handleEdit}
        onInteractions={handleInteractions}
        onNewWithBaseType={handleNewWithBaseType}
      />

      <DamageTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        projectId={projectId}
        defaultBaseType={defaultBaseType}
        defaultColor={defaultBaseType ? baseTypeColors[defaultBaseType] : undefined}
      />

      <DamageTypeInteractionDialog
        open={interactionDialogOpen}
        onOpenChange={setInteractionDialogOpen}
        sourceDamageType={interactionDamageType}
        allDamageTypes={damageTypes}
        interactions={interactions}
      />
    </div>
  );
}
