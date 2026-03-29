import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, useOutletContext } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectAccess } from "~/lib/project-access.server";
import {
  getWeaponTypesByProjectId,
  createWeaponType,
  updateWeaponType,
  deleteWeaponType,
  reorderWeaponTypes,
} from "~/api/weaponType";
import { getDamageTypesByProjectId } from "~/api/damageType";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Sword, Plus } from "lucide-react";
import { toast } from "sonner";
import { WeaponTypeTable, type WeaponTypeItem } from "~/components/core-rules/weapon-type-table";
import { WeaponTypeFormDialog } from "~/components/core-rules/weapon-type-form-dialog";
import { DEFAULT_ICON_KEY } from "~/components/shared/icon-constants";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  await requireProjectAccess(request, projectId);
  const [weaponTypes, damageTypes] = await Promise.all([
    getWeaponTypesByProjectId(projectId),
    getDamageTypesByProjectId(projectId),
  ]);
  return json({ weaponTypes, damageTypes });
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
      case "create_weapon_type": {
        const name = (formData.get("name") as string)?.trim();
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        const iconKey = (formData.get("iconKey") as string) || DEFAULT_ICON_KEY;
        const damageTypeId = (formData.get("damageTypeId") as string) || null;
        const twoHanded = formData.get("twoHanded") === "true";
        const defaultMinRange = parseInt(formData.get("defaultMinRange") as string) || 1;
        const defaultMaxRange = parseInt(formData.get("defaultMaxRange") as string) || 1;
        await createWeaponType({ name, iconKey, projectId, damageTypeId, twoHanded, defaultMinRange, defaultMaxRange });
        return json({ success: "Weapon type created successfully" });
      }

      case "update_weapon_type": {
        const id = formData.get("weaponTypeId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        const name = (formData.get("name") as string)?.trim();
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        const iconKey = (formData.get("iconKey") as string) || DEFAULT_ICON_KEY;
        const damageTypeId = (formData.get("damageTypeId") as string) || null;
        const twoHanded = formData.get("twoHanded") === "true";
        const defaultMinRange = parseInt(formData.get("defaultMinRange") as string) || 1;
        const defaultMaxRange = parseInt(formData.get("defaultMaxRange") as string) || 1;
        await updateWeaponType(id, { name, iconKey, damageTypeId, twoHanded, defaultMinRange, defaultMaxRange });
        return json({ success: "Weapon type updated successfully" });
      }

      case "delete_weapon_type": {
        const id = formData.get("weaponTypeId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        await deleteWeaponType(id);
        return json({ success: "Weapon type deleted successfully" });
      }

      case "reorder_weapon_types": {
        const orderedIds = JSON.parse(formData.get("orderedIds") as string);
        await reorderWeaponTypes(projectId, orderedIds);
        return json({ success: "Weapon types reordered" });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Weapon types action error:", error);
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

export default function WeaponTypesPage() {
  const { weaponTypes, damageTypes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { projectId } = useOutletContext<ProjectContext>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WeaponTypeItem | null>(null);

  useEffect(() => {
    if (!actionData) return;
    if ("success" in actionData && typeof actionData.success === "string") {
      toast.success(actionData.success);
    }
    if ("error" in actionData) {
      toast.error(actionData.error as string);
    }
  }, [actionData]);

  function handleEdit(item: WeaponTypeItem) {
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
            <Sword className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Weapon Types</h1>
          </div>
          <p className="text-muted-foreground">
            Define weapon categories and their default damage types.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Weapon Type
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <WeaponTypeTable items={weaponTypes} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <WeaponTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        projectId={projectId}
        damageTypes={damageTypes}
      />
    </div>
  );
}
