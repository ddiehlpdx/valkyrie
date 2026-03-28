import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, useOutletContext } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectAccess } from "~/lib/project-access.server";
import {
  getEquipmentTypesByProjectId,
  createEquipmentType,
  updateEquipmentType,
  deleteEquipmentType,
  reorderEquipmentTypes,
} from "~/api/equipmentType";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { NamedTypeTable, type NamedTypeItem } from "~/components/core-rules/named-type-table";
import { NamedTypeFormDialog } from "~/components/core-rules/named-type-form-dialog";
import { DEFAULT_ICON_KEY } from "~/components/shared/icon-constants";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  await requireProjectAccess(request, projectId);
  const equipmentTypes = await getEquipmentTypesByProjectId(projectId);
  return json({ equipmentTypes });
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
      case "create_equipment_type": {
        const name = (formData.get("name") as string)?.trim();
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        const iconKey = (formData.get("iconKey") as string) || DEFAULT_ICON_KEY;
        await createEquipmentType({ name, iconKey, projectId });
        return json({ success: "Equipment type created successfully" });
      }

      case "update_equipment_type": {
        const id = formData.get("equipmentTypeId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        const name = (formData.get("name") as string)?.trim();
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        const iconKey = (formData.get("iconKey") as string) || DEFAULT_ICON_KEY;
        await updateEquipmentType(id, { name, iconKey });
        return json({ success: "Equipment type updated successfully" });
      }

      case "delete_equipment_type": {
        const id = formData.get("equipmentTypeId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        await deleteEquipmentType(id);
        return json({ success: "Equipment type deleted successfully" });
      }

      case "reorder_equipment_types": {
        const orderedIds = JSON.parse(formData.get("orderedIds") as string);
        await reorderEquipmentTypes(projectId, orderedIds);
        return json({ success: "Equipment types reordered" });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Equipment types action error:", error);
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

export default function EquipmentTypesPage() {
  const { equipmentTypes } = useLoaderData<typeof loader>();
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
            <Package className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Equipment Types</h1>
          </div>
          <p className="text-muted-foreground">
            Define equipment slot categories (e.g. Accessory, Consumable, Key Item).
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Equipment Type
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <NamedTypeTable
            items={equipmentTypes}
            entityLabel="Equipment Type"
            reorderAction="reorder_equipment_types"
            deleteAction="delete_equipment_type"
            deleteIdField="equipmentTypeId"
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      <NamedTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        projectId={projectId}
        entityLabel="Equipment Type"
        createAction="create_equipment_type"
        updateAction="update_equipment_type"
        updateIdField="equipmentTypeId"
      />
    </div>
  );
}
