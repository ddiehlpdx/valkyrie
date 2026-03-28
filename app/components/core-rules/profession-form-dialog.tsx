import { useEffect } from "react";
import { useSubmit } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { DEFAULT_ICON_KEY, IconPicker } from "~/components/shared/icon-picker";

const professionSchema = z.object({
  name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
  iconKey: z.string().min(1, "Select an icon"),
  weaponTypeIds: z.array(z.string()).default([]),
  armorTypeIds: z.array(z.string()).default([]),
});

type ProfessionFormValues = z.infer<typeof professionSchema>;

interface TypeOption {
  id: string;
  name: string;
}

interface ProfessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: {
    id: string;
    name: string;
    iconKey?: string;
    allowedWeaponTypes?: Array<{ weaponType: { id: string } }>;
    allowedArmorTypes?: Array<{ armorType: { id: string } }>;
  } | null;
  projectId: string;
  weaponTypes: TypeOption[];
  armorTypes: TypeOption[];
}

export function ProfessionFormDialog({
  open,
  onOpenChange,
  item,
  projectId,
  weaponTypes,
  armorTypes,
}: ProfessionFormDialogProps) {
  const submit = useSubmit();
  const isEditing = !!item;

  const form = useForm<ProfessionFormValues>({
    resolver: zodResolver(professionSchema),
    defaultValues: { name: "", iconKey: DEFAULT_ICON_KEY, weaponTypeIds: [], armorTypeIds: [] },
  });

  useEffect(() => {
    if (!open) return;

    if (item) {
      form.reset({
        name: item.name,
        iconKey: item.iconKey || DEFAULT_ICON_KEY,
        weaponTypeIds: item.allowedWeaponTypes?.map((wt) => wt.weaponType.id) || [],
        armorTypeIds: item.allowedArmorTypes?.map((at) => at.armorType.id) || [],
      });
      return;
    }

    form.reset({ name: "", iconKey: DEFAULT_ICON_KEY, weaponTypeIds: [], armorTypeIds: [] });
  }, [open, item, form]);

  function onSubmit(values: ProfessionFormValues) {
    const formData = new FormData();
    formData.append("action", isEditing ? "update_profession" : "create_profession");
    if (item) {
      formData.append("professionId", item.id);
    }
    formData.append("projectId", projectId);
    formData.append("name", values.name);
    formData.append("iconKey", values.iconKey);
    formData.append("weaponTypeIds", JSON.stringify(values.weaponTypeIds));
    formData.append("armorTypeIds", JSON.stringify(values.armorTypeIds));

    submit(formData, { method: "post" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Profession" : "New Profession"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this profession and its equipment permissions."
              : "Create a new profession and configure what it can equip."}
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
                    <Input placeholder="e.g. Knight, Mage, Thief" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="iconKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <IconPicker
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {weaponTypes.length > 0 && (
              <FormField
                control={form.control}
                name="weaponTypeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allowed Weapon Types</FormLabel>
                    <div className="max-h-[140px] overflow-y-auto rounded-md border p-3 space-y-2">
                      {weaponTypes.map((wt) => (
                        <div key={wt.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`wt-${wt.id}`}
                            checked={field.value.includes(wt.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, wt.id]);
                                return;
                              }
                              field.onChange(field.value.filter((id: string) => id !== wt.id));
                            }}
                          />
                          <Label htmlFor={`wt-${wt.id}`} className="text-sm font-normal cursor-pointer">
                            {wt.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {armorTypes.length > 0 && (
              <FormField
                control={form.control}
                name="armorTypeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allowed Armor Types</FormLabel>
                    <div className="max-h-[140px] overflow-y-auto rounded-md border p-3 space-y-2">
                      {armorTypes.map((at) => (
                        <div key={at.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`at-${at.id}`}
                            checked={field.value.includes(at.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, at.id]);
                                return;
                              }
                              field.onChange(field.value.filter((id: string) => id !== at.id));
                            }}
                          />
                          <Label htmlFor={`at-${at.id}`} className="text-sm font-normal cursor-pointer">
                            {at.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save Changes" : "Create Profession"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
