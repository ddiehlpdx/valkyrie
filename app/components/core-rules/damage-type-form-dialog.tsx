import { useEffect } from "react";
import { useSubmit } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseDamageType } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

const damageTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
  baseType: z.nativeEnum(BaseDamageType, { errorMap: () => ({ message: "Select a base type" }) }),
  elementId: z.string().optional().or(z.literal("")),
});

type DamageTypeFormValues = z.infer<typeof damageTypeSchema>;

const BASE_TYPE_LABELS: Record<BaseDamageType, string> = {
  Physical: "Physical",
  Magical: "Magical",
  Chemical: "Chemical",
  Environmental: "Environmental",
};

interface ElementOption {
  id: string;
  name: string;
  color: string;
}

interface DamageTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: { id: string; name: string; baseType: BaseDamageType; element?: { id: string } | null } | null;
  projectId: string;
  elements?: ElementOption[];
}

export function DamageTypeFormDialog({
  open,
  onOpenChange,
  item,
  projectId,
  elements = [],
}: DamageTypeFormDialogProps) {
  const submit = useSubmit();
  const isEditing = !!item;

  const form = useForm<DamageTypeFormValues>({
    resolver: zodResolver(damageTypeSchema),
    defaultValues: {
      name: "",
      baseType: BaseDamageType.Physical,
      elementId: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (item) {
      form.reset({ name: item.name, baseType: item.baseType, elementId: item.element?.id || "" });
      return;
    }

    form.reset({ name: "", baseType: BaseDamageType.Physical, elementId: "" });
  }, [open, item, form]);

  function onSubmit(values: DamageTypeFormValues) {
    const formData = new FormData();
    formData.append("action", isEditing ? "update_damage_type" : "create_damage_type");
    if (item) {
      formData.append("damageTypeId", item.id);
    }
    formData.append("projectId", projectId);
    formData.append("name", values.name);
    formData.append("baseType", values.baseType);
    formData.append("elementId", values.elementId || "");

    submit(formData, { method: "post" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Damage Type" : "New Damage Type"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this damage type for your project."
              : "Create a new damage type for your project."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Slash, Fire, Poison" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a base type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(BASE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {elements.length > 0 && (
              <FormField
                control={form.control}
                name="elementId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Element</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {elements.map((el) => (
                          <SelectItem key={el.id} value={el.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full border"
                                style={{ backgroundColor: el.color }}
                              />
                              {el.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save Changes" : "Create Damage Type"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
