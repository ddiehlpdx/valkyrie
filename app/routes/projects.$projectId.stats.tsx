import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useActionData, useOutletContext } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectAccess } from "~/lib/project-access.server";
import { getStatsByProjectId, createStat, updateStat, deleteStat, reorderStats } from "~/api/statDefinition";
import { CategoryType } from "../../generated/prisma/browser";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { BarChart3, Plus } from "lucide-react";
import { toast } from "sonner";
import { StatTable } from "~/components/stats/stat-table";
import { StatFormDialog } from "~/components/stats/stat-form-dialog";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;
  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  await requireProjectAccess(request, projectId);
  const stats = await getStatsByProjectId(projectId);
  return json({ stats });
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
      case "create_stat": {
        const name = (formData.get("name") as string)?.trim();
        const abbreviation = (formData.get("abbreviation") as string)?.trim();
        const description = (formData.get("description") as string)?.trim();
        const category = formData.get("category") as CategoryType;
        const minValue = parseInt(formData.get("minValue") as string, 10);
        const maxValue = parseInt(formData.get("maxValue") as string, 10);
        const defaultValue = parseInt(formData.get("defaultValue") as string, 10);
        const isPercentage = formData.get("isPercentage") === "true";

        if (!name || !abbreviation || !category) {
          return json({ error: "Name, abbreviation, and category are required" }, { status: 400 });
        }

        await createStat({
          name,
          abbreviation,
          description: description || undefined,
          category,
          minValue,
          maxValue,
          defaultValue,
          isPercentage,
          projectId,
        });

        return json({ success: "Stat created successfully" });
      }

      case "update_stat": {
        const statId = formData.get("statId") as string;
        if (!statId) {
          return json({ error: "Stat ID is required" }, { status: 400 });
        }

        const name = (formData.get("name") as string)?.trim();
        const abbreviation = (formData.get("abbreviation") as string)?.trim();
        const description = (formData.get("description") as string)?.trim();
        const category = formData.get("category") as CategoryType;
        const minValue = parseInt(formData.get("minValue") as string, 10);
        const maxValue = parseInt(formData.get("maxValue") as string, 10);
        const defaultValue = parseInt(formData.get("defaultValue") as string, 10);
        const isPercentage = formData.get("isPercentage") === "true";

        await updateStat(statId, {
          name,
          abbreviation,
          description: description || undefined,
          category,
          minValue,
          maxValue,
          defaultValue,
          isPercentage,
        });

        return json({ success: "Stat updated successfully" });
      }

      case "delete_stat": {
        const statId = formData.get("statId") as string;
        if (!statId) {
          return json({ error: "Stat ID is required" }, { status: 400 });
        }

        await deleteStat(statId);
        return json({ success: "Stat deleted successfully" });
      }

      case "reorder_stats": {
        const orderedIds = JSON.parse(formData.get("orderedIds") as string);
        await reorderStats(projectId, orderedIds);
        return json({ success: "Stats reordered" });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Stats action error:", error);
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

export default function StatsPage() {
  const { stats } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { projectId } = useOutletContext<ProjectContext>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<(typeof stats)[number] | null>(null);

  useEffect(() => {
    if (!actionData) return;
    if ("success" in actionData && typeof actionData.success === "string") {
      toast.success(actionData.success);
    }
    if ("error" in actionData) {
      toast.error(actionData.error as string);
    }
  }, [actionData]);

  function handleEdit(stat: (typeof stats)[number]) {
    setEditingStat(stat);
    setDialogOpen(true);
  }

  function handleNewStat() {
    setEditingStat(null);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Stat Definitions</h1>
          </div>
          <p className="text-muted-foreground">
            Define the stats that characters and classes use in your game.
          </p>
        </div>
        <Button onClick={handleNewStat}>
          <Plus className="h-4 w-4 mr-2" />
          New Stat
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <StatTable stats={stats} onEdit={handleEdit} />
        </CardContent>
      </Card>

      <StatFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        stat={editingStat}
        projectId={projectId}
      />
    </div>
  );
}
