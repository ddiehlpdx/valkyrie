import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BaseDamageType } from "../../../generated/prisma/browser";
import { Card, CardContent } from "~/components/ui/card";
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
import { GripVertical, Pencil, Trash2, ArrowRightLeft, Link } from "lucide-react";
import { DAMAGE_TYPE_ICONS } from "./damage-type-form-dialog";

export interface DamageTypeData {
  id: string;
  name: string;
  description: string | null;
  baseType: BaseDamageType;
  color: string;
  iconKey: string;
  displayOrder: number;
}

interface DamageTypeCardProps {
  damageType: DamageTypeData;
  onEdit: (damageType: DamageTypeData) => void;
  onDelete: (id: string) => void;
  onInteractions?: (damageType: DamageTypeData) => void;
  interactionCount: number;
}

export function DamageTypeCard({
  damageType,
  onEdit,
  onDelete,
  onInteractions,
  interactionCount,
}: DamageTypeCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: damageType.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = DAMAGE_TYPE_ICONS[damageType.iconKey];

  return (
    <Card ref={setNodeRef} style={style} className="group relative">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground mt-0.5 shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div
            className="flex items-center justify-center h-10 w-10 rounded-lg shrink-0"
            style={{ backgroundColor: damageType.color + "20", color: damageType.color }}
          >
            {Icon && <Icon className="h-5 w-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium leading-tight">{damageType.name}</h3>
            {damageType.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {damageType.description}
              </p>
            )}
            {interactionCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Link className="h-3 w-3" />
                <span>{interactionCount} interaction{interactionCount !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {onInteractions && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onInteractions(damageType)}
                title="Interactions"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(damageType)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete &ldquo;{damageType.name}&rdquo;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove this damage type and all of its interactions. Any weapons using this damage type will be unlinked.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(damageType.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
