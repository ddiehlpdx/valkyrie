import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, useOutletContext } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectAccess } from "~/lib/project-access.server";
import { BaseDamageType } from "@prisma/client";
import {
  getDamageTypesByProjectId,
  createDamageType,
  updateDamageType,
  deleteDamageType,
  reorderDamageTypes,
} from "~/api/damageType";
import { getElementsByProjectId } from "~/api/element";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Flame, Plus } from "lucide-react";
import { toast } from "sonner";
import { DamageTypeTable, type DamageTypeItem } from "~/components/core-rules/damage-type-table";
import { DamageTypeFormDialog } from "~/components/core-rules/damage-type-form-dialog";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  await requireProjectAccess(request, projectId);
  const [damageTypes, elements] = await Promise.all([
    getDamageTypesByProjectId(projectId),
    getElementsByProjectId(projectId),
  ]);
  return json({ damageTypes, elements });
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
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        if (!baseType || !Object.values(BaseDamageType).includes(baseType)) {
          return json({ error: "Valid base type is required" }, { status: 400 });
        }
        const elementId = (formData.get("elementId") as string) || null;
        await createDamageType({ name, baseType, projectId, elementId });
        return json({ success: "Damage type created successfully" });
      }

      case "update_damage_type": {
        const id = formData.get("damageTypeId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        const name = (formData.get("name") as string)?.trim();
        const baseType = formData.get("baseType") as BaseDamageType;
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        const elementId = (formData.get("elementId") as string) || null;
        await updateDamageType(id, { name, baseType, elementId });
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
  const { damageTypes, elements } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { projectId } = useOutletContext<ProjectContext>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DamageTypeItem | null>(null);

  useEffect(() => {
    if (!actionData) return;
    if ("success" in actionData && typeof actionData.success === "string") {
      toast.success(actionData.success);
    }
    if ("error" in actionData) {
      toast.error(actionData.error as string);
    }
  }, [actionData]);

  function handleEdit(item: DamageTypeItem) {
    setEditingItem(item);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingItem(null);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Flame className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Damage Types</h1>
          </div>
          <p className="text-muted-foreground">
            Define damage categories and their base types (e.g. Slash/Physical, Fire/Magical).
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Damage Type
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DamageTypeTable items={damageTypes} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <DamageTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        projectId={projectId}
        elements={elements}
      />
    </div>
  );
}
