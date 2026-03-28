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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { DEFAULT_ICON_KEY, IconPicker, ICON_MAP } from "~/components/shared/icon-picker";

const weaponTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
  iconKey: z.string().min(1, "Select an icon"),
  damageTypeId: z.string().optional().or(z.literal("")),
  twoHanded: z.boolean().default(false),
});

type WeaponTypeFormValues = z.infer<typeof weaponTypeSchema>;

interface DamageTypeOption {
  id: string;
  name: string;
  iconKey: string;
}

interface WeaponTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: { id: string; name: string; iconKey?: string; twoHanded?: boolean; damageType?: { id: string } | null } | null;
  projectId: string;
  damageTypes: DamageTypeOption[];
}

export function WeaponTypeFormDialog({
  open,
  onOpenChange,
  item,
  projectId,
  damageTypes,
}: WeaponTypeFormDialogProps) {
  const submit = useSubmit();
  const isEditing = !!item;

  const form = useForm<WeaponTypeFormValues>({
    resolver: zodResolver(weaponTypeSchema),
    defaultValues: { name: "", iconKey: DEFAULT_ICON_KEY, damageTypeId: "", twoHanded: false },
  });

  useEffect(() => {
    if (!open) return;

    if (item) {
      form.reset({
        name: item.name,
        iconKey: item.iconKey || DEFAULT_ICON_KEY,
        damageTypeId: item.damageType?.id || "",
        twoHanded: item.twoHanded ?? false,
      });
      return;
    }

    form.reset({ name: "", iconKey: DEFAULT_ICON_KEY, damageTypeId: "", twoHanded: false });
  }, [open, item, form]);

  function onSubmit(values: WeaponTypeFormValues) {
    const formData = new FormData();
    formData.append("action", isEditing ? "update_weapon_type" : "create_weapon_type");
    if (item) {
      formData.append("weaponTypeId", item.id);
    }
    formData.append("projectId", projectId);
    formData.append("name", values.name);
    formData.append("iconKey", values.iconKey);
    formData.append("damageTypeId", values.damageTypeId || "");
    formData.append("twoHanded", String(values.twoHanded));

    submit(formData, { method: "post" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Weapon Type" : "New Weapon Type"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this weapon type for your project."
              : "Create a new weapon type for your project."}
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
                    <Input placeholder="e.g. Sword, Bow, Staff" {...field} />
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

            <FormField
              control={form.control}
              name="damageTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Damage Type</FormLabel>
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
                      {damageTypes.map((dt) => {
                        const DtIcon = ICON_MAP[dt.iconKey];
                        return (
                          <SelectItem key={dt.id} value={dt.id}>
                            <span className="flex items-center gap-2">
                              {DtIcon && <DtIcon className="h-4 w-4" />}
                              {dt.name}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="twoHanded"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Two-Handed</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save Changes" : "Create Weapon Type"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
