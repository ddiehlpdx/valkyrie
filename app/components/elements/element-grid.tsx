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
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ElementCard } from "./element-card";

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

interface InteractionData {
  id: string;
  sourceElementId: string;
  targetElementId: string;
  multiplier: number;
}

interface ElementGridProps {
  elements: ElementData[];
  interactions: InteractionData[];
  onEdit: (element: ElementData) => void;
  onInteractions: (element: ElementData) => void;
}

export function ElementGrid({ elements, interactions, onEdit, onInteractions }: ElementGridProps) {
  const submit = useSubmit();
  const [items, setItems] = useState(elements);

  // Sync when loader data changes
  if (elements.length !== items.length || elements.some((e, i) => e.id !== items[i]?.id)) {
    setItems(elements);
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
    formData.append("action", "reorder_elements");
    formData.append("orderedIds", JSON.stringify(newItems.map((item) => item.id)));
    submit(formData, { method: "post" });
  }

  function handleDelete(elementId: string) {
    const formData = new FormData();
    formData.append("action", "delete_element");
    formData.append("elementId", elementId);
    submit(formData, { method: "post" });
  }

  function getInteractionCount(elementId: string): number {
    return interactions.filter(
      (i) => i.sourceElementId === elementId && i.multiplier !== 1.0
    ).length;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No elements defined yet</p>
        <p className="text-sm mt-1">Create your first element to get started.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((e) => e.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((element) => (
            <ElementCard
              key={element.id}
              element={element}
              onEdit={onEdit}
              onDelete={handleDelete}
              onInteractions={onInteractions}
              interactionCount={getInteractionCount(element.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
