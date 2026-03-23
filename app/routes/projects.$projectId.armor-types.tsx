import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, useOutletContext } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectAccess } from "~/lib/project-access.server";
import {
  getArmorTypesByProjectId,
  createArmorType,
  updateArmorType,
  deleteArmorType,
  reorderArmorTypes,
} from "~/api/armorType";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Shield, Plus } from "lucide-react";
import { toast } from "sonner";
import { NamedTypeTable, type NamedTypeItem } from "~/components/core-rules/named-type-table";
import { NamedTypeFormDialog } from "~/components/core-rules/named-type-form-dialog";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  await requireProjectAccess(request, projectId);
  const armorTypes = await getArmorTypesByProjectId(projectId);
  return json({ armorTypes });
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
      case "create_armor_type": {
        const name = (formData.get("name") as string)?.trim();
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        await createArmorType({ name, projectId });
        return json({ success: "Armor type created successfully" });
      }

      case "update_armor_type": {
        const id = formData.get("armorTypeId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        const name = (formData.get("name") as string)?.trim();
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        await updateArmorType(id, { name });
        return json({ success: "Armor type updated successfully" });
      }

      case "delete_armor_type": {
        const id = formData.get("armorTypeId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        await deleteArmorType(id);
        return json({ success: "Armor type deleted successfully" });
      }

      case "reorder_armor_types": {
        const orderedIds = JSON.parse(formData.get("orderedIds") as string);
        await reorderArmorTypes(projectId, orderedIds);
        return json({ success: "Armor types reordered" });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Armor types action error:", error);
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

export default function ArmorTypesPage() {
  const { armorTypes } = useLoaderData<typeof loader>();
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
            <Shield className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Armor Types</h1>
          </div>
          <p className="text-muted-foreground">
            Define armor categories for your game (e.g. Light, Heavy, Robe).
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Armor Type
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <NamedTypeTable
            items={armorTypes}
            entityLabel="Armor Type"
            reorderAction="reorder_armor_types"
            deleteAction="delete_armor_type"
            deleteIdField="armorTypeId"
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      <NamedTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        projectId={projectId}
        entityLabel="Armor Type"
        createAction="create_armor_type"
        updateAction="update_armor_type"
        updateIdField="armorTypeId"
      />
    </div>
  );
}
