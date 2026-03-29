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
import { ICON_MAP } from "~/components/shared/icon-picker";

export interface WeaponTypeItem {
  id: string;
  name: string;
  displayOrder: number;
  twoHanded?: boolean;
  defaultMinRange?: number;
  defaultMaxRange?: number;
  damageType?: { id: string; name: string } | null;
  [key: string]: unknown;
}

interface SortableRowProps {
  item: WeaponTypeItem;
  onEdit: (item: WeaponTypeItem) => void;
  onDelete: (id: string) => void;
}

function formatRange(min?: number, max?: number) {
  const minR = min ?? 1;
  const maxR = max ?? 1;
  if (minR === maxR) return String(minR);
  return `${minR}–${maxR}`;
}

function SortableRow({ item, onEdit, onDelete }: SortableRowProps) {
  const Icon = ICON_MAP[item.iconKey as string];
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
        </div>
      </TableCell>
      <TableCell>
        {item.damageType ? (
          <Badge variant="outline">{item.damageType.name}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{formatRange(item.defaultMinRange, item.defaultMaxRange)}</Badge>
      </TableCell>
      <TableCell>
        {item.twoHanded ? (
          <Badge variant="outline">Two-Handed</Badge>
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
                  This will permanently remove this weapon type. Any game data referencing it may be affected.
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

interface WeaponTypeTableProps {
  items: WeaponTypeItem[];
  onEdit: (item: WeaponTypeItem) => void;
}

export function WeaponTypeTable({ items: initialItems, onEdit }: WeaponTypeTableProps) {
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
    formData.append("action", "reorder_weapon_types");
    formData.append("orderedIds", JSON.stringify(newItems.map((item) => item.id)));
    submit(formData, { method: "post" });
  }

  function handleDelete(id: string) {
    const formData = new FormData();
    formData.append("action", "delete_weapon_type");
    formData.append("weaponTypeId", id);
    submit(formData, { method: "post" });
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No weapon types defined yet</p>
        <p className="text-sm mt-1">Create your first weapon type to get started.</p>
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
              <TableHead>Damage Type</TableHead>
              <TableHead>Range</TableHead>
              <TableHead>Two-Handed</TableHead>
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
