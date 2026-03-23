import { useState, useEffect, useCallback, useRef } from "react";
import { useSubmit } from "@remix-run/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Save } from "lucide-react";
import { ELEMENT_ICONS } from "./element-form-dialog";

interface ElementData {
  id: string;
  name: string;
  color: string;
  iconKey: string;
}

interface InteractionData {
  id: string;
  sourceElementId: string;
  targetElementId: string;
  multiplier: number;
}

interface InteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceElement: ElementData | null;
  allElements: ElementData[];
  interactions: InteractionData[];
}

function getRowTint(value: number): string {
  if (value < 1.0) return "bg-red-500/10 border-red-500/20";
  if (value > 1.0) return "bg-green-500/10 border-green-500/20";
  return "";
}

export function InteractionDialog({
  open,
  onOpenChange,
  sourceElement,
  allElements,
  interactions,
}: InteractionDialogProps) {
  const submit = useSubmit();
  const savedValuesRef = useRef<Map<string, number>>(new Map());
  const [currentValues, setCurrentValues] = useState<Map<string, number>>(new Map());

  // Initialize/reset state when dialog opens with a new source element
  useEffect(() => {
    if (!open || !sourceElement) return;

    const saved = new Map<string, number>();
    for (const interaction of interactions) {
      if (interaction.sourceElementId !== sourceElement.id) continue;
      saved.set(interaction.targetElementId, interaction.multiplier);
    }
    savedValuesRef.current = new Map(saved);
    setCurrentValues(new Map(saved));
  }, [open, sourceElement, interactions]);

  const targetElements = allElements.filter((el) => el.id !== sourceElement?.id);

  const hasUnsavedChanges = (() => {
    for (const target of targetElements) {
      const current = currentValues.get(target.id) ?? 1.0;
      const saved = savedValuesRef.current.get(target.id) ?? 1.0;
      if (current !== saved) return true;
    }
    return false;
  })();

  const handleChange = useCallback((targetId: string, value: number) => {
    setCurrentValues((prev) => {
      const next = new Map(prev);
      next.set(targetId, value);
      return next;
    });
  }, []);

  function handleSave() {
    if (!sourceElement) return;

    const changedInteractions: Array<{
      sourceElementId: string;
      targetElementId: string;
      multiplier: number;
    }> = [];

    for (const target of targetElements) {
      const current = currentValues.get(target.id) ?? 1.0;
      const saved = savedValuesRef.current.get(target.id) ?? 1.0;
      if (current !== saved) {
        changedInteractions.push({
          sourceElementId: sourceElement.id,
          targetElementId: target.id,
          multiplier: current,
        });
      }
    }

    if (changedInteractions.length === 0) return;

    const formData = new FormData();
    formData.append("action", "bulk_upsert_interactions");
    formData.append("interactions", JSON.stringify(changedInteractions));
    submit(formData, { method: "post" });

    // Optimistically update saved state
    for (const interaction of changedInteractions) {
      savedValuesRef.current.set(interaction.targetElementId, interaction.multiplier);
    }
    // Force re-render to clear unsaved badge
    setCurrentValues(new Map(currentValues));
  }

  const SourceIcon = sourceElement ? ELEMENT_ICONS[sourceElement.iconKey] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sourceElement && (
                <div
                  className="flex items-center justify-center h-9 w-9 rounded-lg"
                  style={{
                    backgroundColor: sourceElement.color + "20",
                    color: sourceElement.color,
                  }}
                >
                  {SourceIcon && <SourceIcon className="h-5 w-5" />}
                </div>
              )}
              <div>
                <DialogTitle>{sourceElement?.name}: Interactions</DialogTitle>
                <DialogDescription>
                  Set damage multipliers against other elements.
                </DialogDescription>
              </div>
            </div>
            {hasUnsavedChanges && (
              <Badge
                variant="outline"
                className="text-orange-400 border-orange-400/30 bg-orange-400/10 shrink-0"
              >
                Unsaved changes
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded bg-red-500/10 border border-red-500/20" />
            <span>Resistant (&lt; 1.0x)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded bg-green-500/10 border border-green-500/20" />
            <span>Weak (&gt; 1.0x)</span>
          </div>
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2 pr-3">
            {targetElements.map((target) => {
              const value = currentValues.get(target.id) ?? 1.0;
              const TargetIcon = ELEMENT_ICONS[target.iconKey];

              return (
                <div
                  key={target.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border ${getRowTint(value)}`}
                >
                  <div
                    className="flex items-center justify-center h-7 w-7 rounded shrink-0"
                    style={{
                      backgroundColor: target.color + "20",
                      color: target.color,
                    }}
                  >
                    {TargetIcon && <TargetIcon className="h-4 w-4" />}
                  </div>
                  <Label className="flex-1 text-sm font-medium">{target.name}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={value}
                    onChange={(e) => {
                      const parsed = parseFloat(e.target.value);
                      if (!isNaN(parsed)) {
                        handleChange(target.id, parsed);
                      }
                    }}
                    className="h-8 w-20 text-center text-sm"
                  />
                  <span className="text-xs text-muted-foreground w-3">x</span>
                </div>
              );
            })}

            {targetElements.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Create more elements to configure interactions.
              </p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {hasUnsavedChanges && (
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Interactions
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
