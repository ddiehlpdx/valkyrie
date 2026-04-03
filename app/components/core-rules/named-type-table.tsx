import { useState } from "react";
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
import { GripVertical, Pencil, Trash2, Cpu, Package } from "lucide-react";
import { EmptyState } from "~/components/ui/empty-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { ICON_MAP } from "~/components/shared/icon-picker";

export interface NamedTypeItem {
  id: string;
  name: string;
  displayOrder: number;
  [key: string]: unknown;
}

interface SortableRowProps {
  item: NamedTypeItem;
  entityLabel: string;
  onEdit: (item: NamedTypeItem) => void;
  onDelete: (id: string) => void;
}

function SortableRow({ item, entityLabel, onEdit, onDelete }: SortableRowProps) {
  const Icon = ICON_MAP[item.iconKey as string];
  const isEngineType = !!item.systemKey;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {item.name}
          {isEngineType && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Cpu className="h-3.5 w-3.5 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  Engine {entityLabel.toLowerCase()} ({String(item.systemKey)})
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell className="w-[80px]">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {!isEngineType && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete &ldquo;{item.name}&rdquo;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove this {entityLabel.toLowerCase()}. Any game data referencing it may be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(item.id)}
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

interface NamedTypeTableProps {
  items: NamedTypeItem[];
  entityLabel: string;
  reorderAction: string;
  deleteAction: string;
  deleteIdField: string;
  onEdit: (item: NamedTypeItem) => void;
}

export function NamedTypeTable({
  items: initialItems,
  entityLabel,
  reorderAction,
  deleteAction,
  deleteIdField,
  onEdit,
}: NamedTypeTableProps) {
  const submit = useSubmit();
  const [items, setItems] = useState(initialItems);

  if (
    initialItems.length !== items.length ||
    initialItems.some((s, i) => s.id !== items[i]?.id)
  ) {
    setItems(initialItems);
  }

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
    formData.append("action", reorderAction);
    formData.append("orderedIds", JSON.stringify(newItems.map((item) => item.id)));
    submit(formData, { method: "post" });
  }

  function handleDelete(id: string) {
    const formData = new FormData();
    formData.append("action", deleteAction);
    formData.append(deleteIdField, id);
    submit(formData, { method: "post" });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={`No ${entityLabel.toLowerCase()}s defined yet`}
        description={`Create your first ${entityLabel.toLowerCase()} to get started.`}
      />
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
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <SortableRow
                key={item.id}
                item={item}
                entityLabel={entityLabel}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  );
}
