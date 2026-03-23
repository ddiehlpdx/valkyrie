import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { ELEMENT_ICONS } from "./element-form-dialog";

interface ElementData {
  id: string;
  name: string;
  description: string | null;
  color: string;
  iconKey: string;
  displayOrder: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface ElementCardProps {
  element: ElementData;
  onEdit: (element: ElementData) => void;
  onDelete: (elementId: string) => void;
  onInteractions: (element: ElementData) => void;
  interactionCount: number;
}

export function ElementCard({ element, onEdit, onDelete, onInteractions, interactionCount }: ElementCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = ELEMENT_ICONS[element.iconKey];

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
            style={{ backgroundColor: element.color + "20", color: element.color }}
          >
            {Icon && <Icon className="h-5 w-5" />}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium leading-tight">{element.name}</h3>
            {element.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {element.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full border"
                  style={{ backgroundColor: element.color }}
                />
                <span className="text-xs text-muted-foreground font-mono">{element.color}</span>
              </div>
              {interactionCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Link className="h-3 w-3" />
                  <span>{interactionCount} interaction{interactionCount !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onInteractions(element)}
              title="Interactions"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(element)}>
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
                  <AlertDialogTitle>Delete &ldquo;{element.name}&rdquo;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the element and all of its interactions.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(element.id)}
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
