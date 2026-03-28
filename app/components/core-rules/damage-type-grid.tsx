import { useState } from "react";
import { useSubmit } from "@remix-run/react";
import { BaseDamageType } from "../../../generated/prisma/browser";
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
  arrayMove,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DamageTypeCard, type DamageTypeData } from "./damage-type-card";

interface InteractionData {
  id: string;
  sourceDamageTypeId: string;
  targetDamageTypeId: string;
  multiplier: number;
}

const BASE_TYPES: BaseDamageType[] = ["Physical", "Magical", "Chemical", "Environmental"];

export type BaseTypeColors = Record<BaseDamageType, string>;

const INTERACTIVE_BASE_TYPES: BaseDamageType[] = ["Magical", "Chemical"];

interface DamageTypeGridProps {
  damageTypes: DamageTypeData[];
  interactions: InteractionData[];
  baseTypeColors: BaseTypeColors;
  onEdit: (damageType: DamageTypeData) => void;
  onInteractions: (damageType: DamageTypeData) => void;
  onNewWithBaseType: (baseType: BaseDamageType) => void;
}

export function DamageTypeGrid({
  damageTypes,
  interactions,
  baseTypeColors,
  onEdit,
  onInteractions,
  onNewWithBaseType,
}: DamageTypeGridProps) {
  const submit = useSubmit();
  const [items, setItems] = useState(damageTypes);

  if (damageTypes.length !== items.length || damageTypes.some((d, i) => d.id !== items[i]?.id)) {
    setItems(damageTypes);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function getInteractionCount(damageTypeId: string): number {
    return interactions.filter(
      (i) => i.sourceDamageTypeId === damageTypeId && i.multiplier !== 1.0
    ).length;
  }

  function handleDelete(id: string) {
    const formData = new FormData();
    formData.append("action", "delete_damage_type");
    formData.append("damageTypeId", id);
    submit(formData, { method: "post" });
  }

  function handleDragEnd(baseType: BaseDamageType) {
    return (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const columnItems = items.filter((d) => d.baseType === baseType);
      const oldIndex = columnItems.findIndex((item) => item.id === active.id);
      const newIndex = columnItems.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(columnItems, oldIndex, newIndex);

      // Update local state: replace items of this baseType with reordered ones
      const otherItems = items.filter((d) => d.baseType !== baseType);
      const newItems = [...otherItems, ...reordered].sort((a, b) => {
        const aCol = BASE_TYPES.indexOf(a.baseType);
        const bCol = BASE_TYPES.indexOf(b.baseType);
        if (aCol !== bCol) return aCol - bCol;
        return reordered.indexOf(a) - reordered.indexOf(b);
      });
      setItems(newItems);

      const formData = new FormData();
      formData.append("action", "reorder_damage_types");
      formData.append("orderedIds", JSON.stringify(reordered.map((item) => item.id)));
      submit(formData, { method: "post" });
    };
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {BASE_TYPES.map((baseType) => {
        const columnItems = items.filter((d) => d.baseType === baseType);
        const color = baseTypeColors[baseType];
        const hasInteractions = INTERACTIVE_BASE_TYPES.includes(baseType);

        return (
          <div
            key={baseType}
            className="rounded-lg border bg-card"
            style={{ borderColor: color + "30" }}
          >
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-t-lg border-b"
              style={{
                backgroundColor: color + "15",
                borderColor: color + "30",
                color: color,
              }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const formData = new FormData();
                    formData.append("action", "update_base_type_color");
                    formData.append("baseType", baseType);
                    formData.append("color", e.target.value);
                    submit(formData, { method: "post" });
                  }}
                  className="h-4 w-4 rounded border-0 cursor-pointer bg-transparent p-0"
                  title={`Change ${baseType} column color`}
                />
                <h3 className="text-sm font-semibold">{baseType}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onNewWithBaseType(baseType)}
                title={`New ${baseType} damage type`}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="p-2 min-h-[120px]">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd(baseType)}
              >
                <SortableContext
                  items={columnItems.map((d) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {columnItems.map((damageType) => (
                      <DamageTypeCard
                        key={damageType.id}
                        damageType={damageType}
                        onEdit={onEdit}
                        onDelete={handleDelete}
                        onInteractions={hasInteractions ? onInteractions : undefined}
                        interactionCount={hasInteractions ? getInteractionCount(damageType.id) : 0}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {columnItems.length === 0 && (
                <div className="flex items-center justify-center h-[100px] text-xs text-muted-foreground">
                  No {baseType.toLowerCase()} types yet
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
