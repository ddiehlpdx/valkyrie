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
import { BaseDamageType } from "@prisma/client";
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
import { GripVertical, Pencil, Trash2 } from "lucide-react";

export interface DamageTypeItem {
  id: string;
  name: string;
  baseType: BaseDamageType;
  displayOrder: number;
  element?: { id: string; name: string; color: string } | null;
  [key: string]: unknown;
}

const BASE_TYPE_COLORS: Record<BaseDamageType, string> = {
  Physical: "bg-red-500/10 text-red-500 border-red-500/20",
  Magical: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Chemical: "bg-green-500/10 text-green-500 border-green-500/20",
  Environmental: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

interface SortableRowProps {
  item: DamageTypeItem;
  onEdit: (item: DamageTypeItem) => void;
  onDelete: (id: string) => void;
}

function SortableRow({ item, onEdit, onDelete }: SortableRowProps) {
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
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>
        <Badge variant="outline" className={BASE_TYPE_COLORS[item.baseType]}>
          {item.baseType}
        </Badge>
      </TableCell>
      <TableCell>
        {item.element ? (
          <div className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-full border"
              style={{ backgroundColor: item.element.color }}
            />
            <span className="text-sm">{item.element.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="w-[80px]">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
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
                  This will permanently remove this damage type. Any game data referencing it may be affected.
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
        </div>
      </TableCell>
    </TableRow>
  );
}

interface DamageTypeTableProps {
  items: DamageTypeItem[];
  onEdit: (item: DamageTypeItem) => void;
}

export function DamageTypeTable({ items: initialItems, onEdit }: DamageTypeTableProps) {
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
    formData.append("action", "reorder_damage_types");
    formData.append("orderedIds", JSON.stringify(newItems.map((item) => item.id)));
    submit(formData, { method: "post" });
  }

  function handleDelete(id: string) {
    const formData = new FormData();
    formData.append("action", "delete_damage_type");
    formData.append("damageTypeId", id);
    submit(formData, { method: "post" });
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No damage types defined yet</p>
        <p className="text-sm mt-1">Create your first damage type to get started.</p>
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
              <TableHead>Base Type</TableHead>
              <TableHead>Element</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <SortableRow
                key={item.id}
                item={item}
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
