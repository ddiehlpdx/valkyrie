import { useState, useEffect } from "react";
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
import { GripVertical, Pencil, Trash2, Ban, RefreshCw, Layers } from "lucide-react";
import { EmptyState } from "~/components/ui/empty-state";
import { Zap } from "lucide-react";

interface StatModifier {
    statId: string;
    modifierType: string;
    value: number;
    statDefinition: { name: string; abbreviation: string };
}

interface StatusEffect {
    id: string;
    name: string;
    color: string;
    iconKey: string;
    category: "Buff" | "Debuff" | "Neutral";
    durationType: "Temporary" | "Permanent" | "UntilBattleEnd";
    duration: number | null;
    stackable: boolean;
    preventsActions: boolean;
    causesRecurring: boolean;
    statModifiers: StatModifier[];
    displayOrder: number;
}

const CATEGORY_STYLES: Record<string, string> = {
    Buff: "bg-green-500/10 text-green-500 border-green-500/20",
    Debuff: "bg-red-500/10 text-red-500 border-red-500/20",
    Neutral: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

function formatDuration(effect: StatusEffect): string {
    if (effect.durationType === "Permanent") return "Permanent";
    if (effect.durationType === "UntilBattleEnd") return "Battle";
    if (effect.duration) return `${effect.duration}t`;
    return "—";
}

interface SortableRowProps {
    effect: StatusEffect;
    onEdit: (effect: StatusEffect) => void;
    onDelete: (id: string) => void;
}

function SortableRow({ effect, onEdit, onDelete }: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: effect.id });

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
                    <span
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: effect.color }}
                    />
                    {effect.name}
                </div>
            </TableCell>

            <TableCell>
                <Badge variant="outline" className={CATEGORY_STYLES[effect.category]}>
                    {effect.category}
                </Badge>
            </TableCell>

            <TableCell className="text-muted-foreground text-sm">
                {formatDuration(effect)}
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-1.5">
                    {effect.stackable && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>Stackable</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {effect.preventsActions && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Ban className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>Prevents Actions</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {effect.causesRecurring && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>Recurring Effect</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </TableCell>

            <TableCell className="text-muted-foreground text-sm">
                {effect.statModifiers.length > 0
                    ? `${effect.statModifiers.length} modifier${effect.statModifiers.length !== 1 ? "s" : ""}`
                    : "—"}
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(effect)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete &ldquo;{effect.name}&rdquo;?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently remove the status effect and all of its stat modifiers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(effect.id)}
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

interface StatusEffectTableProps {
    statusEffects: StatusEffect[];
    onEdit: (effect: StatusEffect) => void;
}

export function StatusEffectTable({ statusEffects, onEdit }: StatusEffectTableProps) {
    const submit = useSubmit();
    const [items, setItems] = useState(statusEffects);

    useEffect(() => {
        setItems(statusEffects);
    }, [statusEffects]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        setItems(newItems);

        const formData = new FormData();
        formData.append("action", "reorder_status_effects");
        formData.append("orderedIds", JSON.stringify(newItems.map((item) => item.id)));
        submit(formData, { method: "post" });
    }

    function handleDelete(id: string) {
        const formData = new FormData();
        formData.append("action", "delete_status_effect");
        formData.append("statusEffectId", id);
        submit(formData, { method: "post" });
    }

    if (items.length === 0) {
        return (
            <EmptyState
                icon={Zap}
                title="No status effects defined yet"
                description="Create your first status effect to get started."
            />
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]" />
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Flags</TableHead>
                            <TableHead>Modifiers</TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((effect) => (
                            <SortableRow
                                key={effect.id}
                                effect={effect}
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
