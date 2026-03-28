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
import { DEFAULT_ICON_KEY, IconPicker } from "~/components/shared/icon-picker";

const namedTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
  iconKey: z.string().min(1, "Select an icon"),
});

type NamedTypeFormValues = z.infer<typeof namedTypeSchema>;

interface NamedTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: { id: string; name: string; iconKey?: string } | null;
  projectId: string;
  entityLabel: string;
  createAction: string;
  updateAction: string;
  updateIdField: string;
}

export function NamedTypeFormDialog({
  open,
  onOpenChange,
  item,
  projectId,
  entityLabel,
  createAction,
  updateAction,
  updateIdField,
}: NamedTypeFormDialogProps) {
  const submit = useSubmit();
  const isEditing = !!item;

  const form = useForm<NamedTypeFormValues>({
    resolver: zodResolver(namedTypeSchema),
    defaultValues: { name: "", iconKey: DEFAULT_ICON_KEY },
  });

  useEffect(() => {
    if (!open) return;

    if (item) {
      form.reset({ name: item.name, iconKey: item.iconKey || DEFAULT_ICON_KEY });
      return;
    }

    form.reset({ name: "", iconKey: DEFAULT_ICON_KEY });
  }, [open, item, form]);

  function onSubmit(values: NamedTypeFormValues) {
    const formData = new FormData();
    formData.append("action", isEditing ? updateAction : createAction);
    if (item) {
      formData.append(updateIdField, item.id);
    }
    formData.append("projectId", projectId);
    formData.append("name", values.name);
    formData.append("iconKey", values.iconKey);

    submit(formData, { method: "post" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit ${entityLabel}` : `New ${entityLabel}`}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update this ${entityLabel.toLowerCase()} for your project.`
              : `Create a new ${entityLabel.toLowerCase()} for your project.`}
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
                    <Input placeholder={`Enter ${entityLabel.toLowerCase()} name`} {...field} />
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save Changes" : `Create ${entityLabel}`}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
