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
import { Save, Zap } from "lucide-react";
import { EmptyState } from "~/components/ui/empty-state";
import { ICON_MAP } from "~/components/shared/icon-picker";

interface DamageTypeData {
  id: string;
  name: string;
  baseType: string;
  color: string;
  iconKey: string;
}

interface InteractionData {
  id: string;
  sourceDamageTypeId: string;
  targetDamageTypeId: string;
  multiplier: number;
}

interface DamageTypeInteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceDamageType: DamageTypeData | null;
  allDamageTypes: DamageTypeData[];
  interactions: InteractionData[];
}

function getRowTint(value: number): string {
  if (value < 1.0) return "bg-red-500/10 border-red-500/20";
  if (value > 1.0) return "bg-green-500/10 border-green-500/20";
  return "";
}

export function DamageTypeInteractionDialog({
  open,
  onOpenChange,
  sourceDamageType,
  allDamageTypes,
  interactions,
}: DamageTypeInteractionDialogProps) {
  const submit = useSubmit();
  const savedValuesRef = useRef<Map<string, number>>(new Map());
  const [currentValues, setCurrentValues] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!open || !sourceDamageType) return;

    const saved = new Map<string, number>();
    for (const interaction of interactions) {
      if (interaction.sourceDamageTypeId !== sourceDamageType.id) continue;
      saved.set(interaction.targetDamageTypeId, interaction.multiplier);
    }
    savedValuesRef.current = new Map(saved);
    setCurrentValues(new Map(saved));
  }, [open, sourceDamageType, interactions]);

  const targets = allDamageTypes.filter(
    (dt) => dt.id !== sourceDamageType?.id && dt.baseType === sourceDamageType?.baseType
  );

  const hasUnsavedChanges = (() => {
    for (const target of targets) {
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
    if (!sourceDamageType) return;

    const changedInteractions: Array<{
      sourceDamageTypeId: string;
      targetDamageTypeId: string;
      multiplier: number;
    }> = [];

    for (const target of targets) {
      const current = currentValues.get(target.id) ?? 1.0;
      const saved = savedValuesRef.current.get(target.id) ?? 1.0;
      if (current !== saved) {
        changedInteractions.push({
          sourceDamageTypeId: sourceDamageType.id,
          targetDamageTypeId: target.id,
          multiplier: current,
        });
      }
    }

    if (changedInteractions.length === 0) return;

    const formData = new FormData();
    formData.append("action", "bulk_upsert_interactions");
    formData.append("interactions", JSON.stringify(changedInteractions));
    submit(formData, { method: "post" });

    for (const interaction of changedInteractions) {
      savedValuesRef.current.set(interaction.targetDamageTypeId, interaction.multiplier);
    }
    setCurrentValues(new Map(currentValues));
  }

  const SourceIcon = sourceDamageType ? ICON_MAP[sourceDamageType.iconKey] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {sourceDamageType && (
                <div
                  className="flex items-center justify-center h-9 w-9 rounded-lg"
                  style={{
                    backgroundColor: sourceDamageType.color + "20",
                    color: sourceDamageType.color,
                  }}
                >
                  {SourceIcon && <SourceIcon className="h-5 w-5" />}
                </div>
              )}
              <div>
                <DialogTitle>{sourceDamageType?.name}: Interactions</DialogTitle>
                <DialogDescription>
                  How much damage does {sourceDamageType?.name} deal against each type? 1.0x is normal, higher is more effective, lower is less.
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

        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded bg-green-500/10 border border-green-500/20" />
            <span>Super effective (&gt; 1.0x)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-6 rounded bg-red-500/10 border border-red-500/20" />
            <span>Resisted (&lt; 1.0x)</span>
          </div>
          <span>1.0x = normal damage</span>
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2 pr-3">
            {targets.map((target) => {
              const value = currentValues.get(target.id) ?? 1.0;
              const TargetIcon = ICON_MAP[target.iconKey];

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
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">{target.name}</Label>
                    <p className="text-xs text-muted-foreground">
                      {sourceDamageType?.name} deals{" "}
                      <span className={
                        value > 1.0 ? "text-green-500 font-medium" :
                        value < 1.0 ? "text-red-500 font-medium" : ""
                      }>
                        {value}x
                      </span>
                      {" "}to {target.name}
                      {value > 1.0 && " (super effective)"}
                      {value < 1.0 && value > 0 && " (resisted)"}
                      {value === 0 && " (immune)"}
                    </p>
                  </div>
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
                    className="h-8 w-20 text-center text-sm shrink-0"
                  />
                </div>
              );
            })}

            {targets.length === 0 && (
              <EmptyState
                icon={Zap}
                title="Not enough damage types"
                description="Create at least two damage types of the same category to configure interactions."
                className="py-6"
              />
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
