import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, useOutletContext } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectAccess } from "~/lib/project-access.server";
import {
  getProfessionsByProjectId,
  createProfession,
  updateProfession,
  deleteProfession,
  reorderProfessions,
} from "~/api/profession";
import { getWeaponTypesByProjectId } from "~/api/weaponType";
import { getArmorTypesByProjectId } from "~/api/armorType";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { GraduationCap, Plus } from "lucide-react";
import { toast } from "sonner";
import { ProfessionTable, type ProfessionItem } from "~/components/core-rules/profession-table";
import { ProfessionFormDialog } from "~/components/core-rules/profession-form-dialog";
import { DEFAULT_ICON_KEY } from "~/components/shared/icon-constants";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  await requireProjectAccess(request, projectId);
  const [professions, weaponTypes, armorTypes] = await Promise.all([
    getProfessionsByProjectId(projectId),
    getWeaponTypesByProjectId(projectId),
    getArmorTypesByProjectId(projectId),
  ]);
  return json({ professions, weaponTypes, armorTypes });
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
      case "create_profession": {
        const name = (formData.get("name") as string)?.trim();
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        const weaponTypeIds = JSON.parse((formData.get("weaponTypeIds") as string) || "[]");
        const armorTypeIds = JSON.parse((formData.get("armorTypeIds") as string) || "[]");
        const iconKey = (formData.get("iconKey") as string) || DEFAULT_ICON_KEY;
        await createProfession({ name, iconKey, projectId, weaponTypeIds, armorTypeIds });
        return json({ success: "Profession created successfully" });
      }

      case "update_profession": {
        const id = formData.get("professionId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        const name = (formData.get("name") as string)?.trim();
        if (!name) {
          return json({ error: "Name is required" }, { status: 400 });
        }
        const weaponTypeIds = JSON.parse((formData.get("weaponTypeIds") as string) || "[]");
        const armorTypeIds = JSON.parse((formData.get("armorTypeIds") as string) || "[]");
        const iconKey = (formData.get("iconKey") as string) || DEFAULT_ICON_KEY;
        await updateProfession(id, { name, iconKey, weaponTypeIds, armorTypeIds, projectId });
        return json({ success: "Profession updated successfully" });
      }

      case "delete_profession": {
        const id = formData.get("professionId") as string;
        if (!id) {
          return json({ error: "ID is required" }, { status: 400 });
        }
        await deleteProfession(id);
        return json({ success: "Profession deleted successfully" });
      }

      case "reorder_professions": {
        const orderedIds = JSON.parse(formData.get("orderedIds") as string);
        await reorderProfessions(projectId, orderedIds);
        return json({ success: "Professions reordered" });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Professions action error:", error);
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

export default function ProfessionsPage() {
  const { professions, weaponTypes, armorTypes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { projectId } = useOutletContext<ProjectContext>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProfessionItem | null>(null);

  useEffect(() => {
    if (!actionData) return;
    if ("success" in actionData && typeof actionData.success === "string") {
      toast.success(actionData.success);
    }
    if ("error" in actionData) {
      toast.error(actionData.error as string);
    }
  }, [actionData]);

  function handleEdit(item: ProfessionItem) {
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
            <GraduationCap className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Professions</h1>
          </div>
          <p className="text-muted-foreground">
            Define the jobs and classes available to characters (e.g. Knight, Mage, Thief).
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Profession
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ProfessionTable items={professions} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <ProfessionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        projectId={projectId}
        weaponTypes={weaponTypes}
        armorTypes={armorTypes}
      />
    </div>
  );
}
