import { useState, useMemo } from "react";
import { useSubmit } from "@remix-run/react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { GripVertical, Pencil, Trash2, Percent, Cpu } from "lucide-react";
import { SystemStatKey } from "../../../generated/prisma/browser";

interface Stat {
  id: string;
  name: string;
  abbreviation: string;
  description: string | null;
  systemKey: SystemStatKey | null;
  group: string | null;
  minValue: number;
  maxValue: number;
  defaultValue: number;
  isPercentage: boolean;
  displayOrder: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

const GROUP_COLOR_PALETTE = [
  "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "bg-red-500/10 text-red-500 border-red-500/20",
  "bg-green-500/10 text-green-500 border-green-500/20",
  "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "bg-pink-500/10 text-pink-500 border-pink-500/20",
  "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "bg-teal-500/10 text-teal-500 border-teal-500/20",
  "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
];

const UNGROUPED_COLOR = "bg-gray-500/10 text-gray-500 border-gray-500/20";

function getGroupColor(group: string | null, groupColorMap: Map<string, string>): string {
  if (!group) return UNGROUPED_COLOR;
  return groupColorMap.get(group) || UNGROUPED_COLOR;
}

interface SortableRowProps {
  stat: Stat;
  onEdit: (stat: Stat) => void;
  onDelete: (statId: string) => void;
  groupColorMap: Map<string, string>;
}

function SortableRow({ stat, onEdit, onDelete, groupColorMap }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isCoreStat = !!stat.systemKey;

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-[40px]">
        <button
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {stat.name}
          {isCoreStat && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Cpu className="h-3.5 w-3.5 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  Engine stat ({stat.systemKey})
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell>
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{stat.abbreviation}</code>
      </TableCell>
      <TableCell>
        {stat.group && (
          <Badge variant="outline" className={getGroupColor(stat.group, groupColorMap)}>
            {stat.group}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {stat.minValue} – {stat.maxValue}
      </TableCell>
      <TableCell className="text-muted-foreground">{stat.defaultValue}</TableCell>
      <TableCell>
        {stat.isPercentage && <Percent className="h-4 w-4 text-muted-foreground" />}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(stat)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {!isCoreStat && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete &ldquo;{stat.name}&rdquo;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the stat definition. Any characters or classes using this stat may be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(stat.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

interface StatTableProps {
  stats: Stat[];
  onEdit: (stat: Stat) => void;
}

export function StatTable({ stats, onEdit }: StatTableProps) {
  const submit = useSubmit();
  const [items, setItems] = useState(stats);

  // Sync when loader data changes
  if (stats.length !== items.length || stats.some((s, i) => s.id !== items[i]?.id)) {
    setItems(stats);
  }

  // Build a stable color map from unique group names
  const groupColorMap = useMemo(() => {
    const uniqueGroups = [...new Set(items.map((s) => s.group).filter(Boolean))] as string[];
    uniqueGroups.sort();
    const map = new Map<string, string>();
    uniqueGroups.forEach((group, index) => {
      map.set(group, GROUP_COLOR_PALETTE[index % GROUP_COLOR_PALETTE.length]);
    });
    return map;
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    const formData = new FormData();
    formData.append("action", "reorder_stats");
    formData.append("orderedIds", JSON.stringify(newItems.map((item) => item.id)));
    submit(formData, { method: "post" });
  }

  function handleDelete(statId: string) {
    const formData = new FormData();
    formData.append("action", "delete_stat");
    formData.append("statId", statId);
    submit(formData, { method: "post" });
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No stats defined yet</p>
        <p className="text-sm mt-1">Create your first stat definition to get started.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]" />
              <TableHead>Name</TableHead>
              <TableHead>Abbr</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Range</TableHead>
              <TableHead>Default</TableHead>
              <TableHead className="w-[40px]">%</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((stat) => (
              <SortableRow
                key={stat.id}
                stat={stat}
                onEdit={onEdit}
                onDelete={handleDelete}
                groupColorMap={groupColorMap}
              />
            ))}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  );
}
