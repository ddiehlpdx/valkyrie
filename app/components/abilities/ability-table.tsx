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
import { GripVertical, Pencil, Trash2, Swords } from "lucide-react";
import { EmptyState } from "~/components/ui/empty-state";

interface Ability {
    id: string;
    name: string;
    targetType: string;
    rangeMin: number;
    rangeMax: number;
    mpCost: number;
    displayOrder: number;
    abilityType: { id: string; name: string } | null;
    statusEffects: { statusEffectId: string }[];
}

const TARGET_TYPE_LABELS: Record<string, string> = {
    Self: "Self",
    SingleAlly: "Single Ally",
    SingleEnemy: "Single Enemy",
    AllAllies: "All Allies",
    AllEnemies: "All Enemies",
    Area: "Area",
    Line: "Line",
};

interface SortableRowProps {
    ability: Ability;
    onEdit: (ability: Ability) => void;
    onDelete: (id: string) => void;
}

function SortableRow({ ability, onEdit, onDelete }: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: ability.id });

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

            <TableCell className="font-medium">{ability.name}</TableCell>

            <TableCell>
                {ability.abilityType ? (
                    <Badge variant="outline">{ability.abilityType.name}</Badge>
                ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                )}
            </TableCell>

            <TableCell className="text-sm text-muted-foreground">
                {TARGET_TYPE_LABELS[ability.targetType] ?? ability.targetType}
            </TableCell>

            <TableCell className="text-sm text-muted-foreground">
                {ability.rangeMin === ability.rangeMax
                    ? ability.rangeMin
                    : `${ability.rangeMin}–${ability.rangeMax}`}
            </TableCell>

            <TableCell className="text-sm text-muted-foreground">{ability.mpCost}</TableCell>

            <TableCell className="text-sm text-muted-foreground">
                {ability.statusEffects.length > 0 ? ability.statusEffects.length : "—"}
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(ability)}
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
                                <AlertDialogTitle>Delete &ldquo;{ability.name}&rdquo;?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently remove the ability and all of its profession assignments and status effect links.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(ability.id)}
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

interface AbilityTableProps {
    abilities: Ability[];
    onEdit: (ability: Ability) => void;
}

export function AbilityTable({ abilities, onEdit }: AbilityTableProps) {
    const submit = useSubmit();
    const [items, setItems] = useState(abilities);

    useEffect(() => {
        setItems(abilities);
    }, [abilities]);

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
        formData.append("action", "reorder_abilities");
        formData.append("orderedIds", JSON.stringify(newItems.map((item) => item.id)));
        submit(formData, { method: "post" });
    }

    function handleDelete(id: string) {
        const formData = new FormData();
        formData.append("action", "delete_ability");
        formData.append("abilityId", id);
        submit(formData, { method: "post" });
    }

    if (items.length === 0) {
        return (
            <EmptyState
                icon={Swords}
                title="No abilities defined yet"
                description="Create your first ability to get started."
            />
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]" />
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Range</TableHead>
                            <TableHead>MP</TableHead>
                            <TableHead>Effects</TableHead>
                            <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((ability) => (
                            <SortableRow
                                key={ability.id}
                                ability={ability}
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
