import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, useOutletContext } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectAccess } from "~/lib/project-access.server";
import { getElementsByProjectId, createElement, updateElement, deleteElement, reorderElements } from "~/api/element";
import { getInteractionsByProjectId, bulkUpsertInteractions } from "~/api/elementInteraction";
import { Button } from "~/components/ui/button";
import { Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import { ElementGrid } from "~/components/elements/element-grid";
import { ElementFormDialog } from "~/components/elements/element-form-dialog";
import { InteractionDialog } from "~/components/elements/interaction-dialog";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  await requireProjectAccess(request, projectId);
  const [elements, interactions] = await Promise.all([
    getElementsByProjectId(projectId),
    getInteractionsByProjectId(projectId),
  ]);
  return json({ elements, interactions });
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
      case "create_element": {
        const name = (formData.get("name") as string)?.trim();
        const description = (formData.get("description") as string)?.trim();
        const color = formData.get("color") as string;
        const iconKey = formData.get("iconKey") as string;

        if (!name || !color || !iconKey) {
          return json({ error: "Name, color, and icon are required" }, { status: 400 });
        }

        await createElement({
          name,
          description: description || undefined,
          color,
          iconKey,
          projectId,
        });

        return json({ success: "Element created successfully" });
      }

      case "update_element": {
        const elementId = formData.get("elementId") as string;
        if (!elementId) {
          return json({ error: "Element ID is required" }, { status: 400 });
        }

        const name = (formData.get("name") as string)?.trim();
        const description = (formData.get("description") as string)?.trim();
        const color = formData.get("color") as string;
        const iconKey = formData.get("iconKey") as string;

        await updateElement(elementId, {
          name,
          description: description || undefined,
          color,
          iconKey,
        });

        return json({ success: "Element updated successfully" });
      }

      case "delete_element": {
        const elementId = formData.get("elementId") as string;
        if (!elementId) {
          return json({ error: "Element ID is required" }, { status: 400 });
        }

        await deleteElement(elementId);
        return json({ success: "Element deleted successfully" });
      }

      case "reorder_elements": {
        const orderedIds = JSON.parse(formData.get("orderedIds") as string);
        await reorderElements(projectId, orderedIds);
        return json({ success: "Elements reordered" });
      }

      case "bulk_upsert_interactions": {
        const interactionsJson = formData.get("interactions") as string;
        const interactions = JSON.parse(interactionsJson) as Array<{
          sourceElementId: string;
          targetElementId: string;
          multiplier: number;
        }>;

        await bulkUpsertInteractions(projectId, interactions);
        return json({ success: "Interactions saved successfully" });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Elements action error:", error);
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

export default function ElementsPage() {
  const { elements, interactions } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { projectId } = useOutletContext<ProjectContext>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<(typeof elements)[number] | null>(null);
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false);
  const [interactionElement, setInteractionElement] = useState<(typeof elements)[number] | null>(null);

  useEffect(() => {
    if (!actionData) return;
    if ("success" in actionData && typeof actionData.success === "string") {
      toast.success(actionData.success);
    }
    if ("error" in actionData) {
      toast.error(actionData.error as string);
    }
  }, [actionData]);

  function handleEdit(element: (typeof elements)[number]) {
    setEditingElement(element);
    setDialogOpen(true);
  }

  function handleNewElement() {
    setEditingElement(null);
    setDialogOpen(true);
  }

  function handleInteractions(element: (typeof elements)[number]) {
    setInteractionElement(element);
    setInteractionDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Elements</h1>
          </div>
          <p className="text-muted-foreground">
            Define the elemental types in your game and how they interact with each other.
          </p>
        </div>
        <Button onClick={handleNewElement}>
          <Plus className="h-4 w-4 mr-2" />
          New Element
        </Button>
      </div>

      <ElementGrid
        elements={elements}
        interactions={interactions}
        onEdit={handleEdit}
        onInteractions={handleInteractions}
      />

      <ElementFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        element={editingElement}
        projectId={projectId}
      />

      <InteractionDialog
        open={interactionDialogOpen}
        onOpenChange={setInteractionDialogOpen}
        sourceElement={interactionElement}
        allElements={elements}
        interactions={interactions}
      />
    </div>
  );
}
