import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, useOutletContext } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectAccess } from "~/lib/project-access.server";
import {
  getAbilityTypesByProjectId,
  createAbilityType,
  updateAbilityType,
  deleteAbilityType,
  reorderAbilityTypes,
} from "~/api/abilityType";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Zap, Plus } from "lucide-react";
import { toast } from "sonner";
import { NamedTypeTable, type NamedTypeItem } from "~/components/core-rules/named-type-table";
import { NamedTypeFormDialog } from "~/components/core-rules/named-type-form-dialog";
import { DEFAULT_ICON_KEY } from "~/components/shared/icon-picker";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  await requireProjectAccess(request, projectId);
  const abilityTypes = await getAbilityTypesByProjectId(projectId);
  return json({ abilityTypes });
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
      case "create_ability_type": {
        const name = (formData.get("name") as string)?.trim();
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        const iconKey = (formData.get("iconKey") as string) || DEFAULT_ICON_KEY;
        await createAbilityType({ name, iconKey, projectId });
        return json({ success: "Ability type created successfully" });
      }

      case "update_ability_type": {
        const id = formData.get("abilityTypeId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        const name = (formData.get("name") as string)?.trim();
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        const iconKey = (formData.get("iconKey") as string) || DEFAULT_ICON_KEY;
        await updateAbilityType(id, { name, iconKey });
        return json({ success: "Ability type updated successfully" });
      }

      case "delete_ability_type": {
        const id = formData.get("abilityTypeId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        await deleteAbilityType(id);
        return json({ success: "Ability type deleted successfully" });
      }

      case "reorder_ability_types": {
        const orderedIds = JSON.parse(formData.get("orderedIds") as string);
        await reorderAbilityTypes(projectId, orderedIds);
        return json({ success: "Ability types reordered" });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Ability types action error:", error);
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

export default function AbilityTypesPage() {
  const { abilityTypes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { projectId } = useOutletContext<ProjectContext>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NamedTypeItem | null>(null);

  useEffect(() => {
    if (!actionData) return;
    if ("success" in actionData && typeof actionData.success === "string") {
      toast.success(actionData.success);
    }
    if ("error" in actionData) {
      toast.error(actionData.error as string);
    }
  }, [actionData]);

  function handleEdit(item: NamedTypeItem) {
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
            <Zap className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Ability Types</h1>
          </div>
          <p className="text-muted-foreground">
            Categorize abilities in your game (e.g. Active, Passive, Reaction).
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Ability Type
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <NamedTypeTable
            items={abilityTypes}
            entityLabel="Ability Type"
            reorderAction="reorder_ability_types"
            deleteAction="delete_ability_type"
            deleteIdField="abilityTypeId"
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      <NamedTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        projectId={projectId}
        entityLabel="Ability Type"
        createAction="create_ability_type"
        updateAction="update_ability_type"
        updateIdField="abilityTypeId"
      />
    </div>
  );
}
