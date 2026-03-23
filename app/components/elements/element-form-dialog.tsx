import { useEffect } from "react";
import { useSubmit } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Snowflake,
  Droplets,
  Zap,
  Wind,
  Mountain,
  Skull,
  Heart,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Leaf,
  Eye,
  Star,
  CloudLightning,
  Waves,
  Gem,
  Swords,
  CircleDot,
} from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const ELEMENT_ICONS: Record<string, LucideIcon> = {
  Flame,
  Snowflake,
  Droplets,
  Zap,
  Wind,
  Mountain,
  Skull,
  Heart,
  Shield,
  Sparkles,
  Sun,
  Moon,
  Leaf,
  Eye,
  Star,
  CloudLightning,
  Waves,
  Gem,
  Swords,
  CircleDot,
};

const elementFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  iconKey: z.string().min(1, "Select an icon"),
});

type ElementFormValues = z.infer<typeof elementFormSchema>;

interface ElementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  element?: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    iconKey: string;
  } | null;
  projectId: string;
}

export function ElementFormDialog({ open, onOpenChange, element, projectId }: ElementFormDialogProps) {
  const submit = useSubmit();
  const isEditing = !!element;

  const form = useForm<ElementFormValues>({
    resolver: zodResolver(elementFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#ef4444",
      iconKey: "Flame",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (element) {
      form.reset({
        name: element.name,
        description: element.description || "",
        color: element.color,
        iconKey: element.iconKey,
      });
      return;
    }

    form.reset({
      name: "",
      description: "",
      color: "#ef4444",
      iconKey: "Flame",
    });
  }, [open, element, form]);

  function onSubmit(values: ElementFormValues) {
    const formData = new FormData();
    formData.append("action", isEditing ? "update_element" : "create_element");
    if (element) {
      formData.append("elementId", element.id);
    }
    formData.append("projectId", projectId);
    formData.append("name", values.name);
    formData.append("description", values.description || "");
    formData.append("color", values.color);
    formData.append("iconKey", values.iconKey);

    submit(formData, { method: "post" });
    onOpenChange(false);
  }

  const selectedIconKey = form.watch("iconKey");
  const selectedColor = form.watch("color");
  const SelectedIcon = ELEMENT_ICONS[selectedIconKey];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Element" : "New Element"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this element for your project."
              : "Create a new element for your project."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Preview */}
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              <div
                className="flex items-center justify-center h-10 w-10 rounded-lg"
                style={{ backgroundColor: selectedColor + "20", color: selectedColor }}
              >
                {SelectedIcon && <SelectedIcon className="h-5 w-5" />}
              </div>
              <span className="font-medium">{form.watch("name") || "Element Preview"}</span>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Fire" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A destructive force of heat and flame..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional. Max 500 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={field.value}
                          onChange={field.onChange}
                          className="h-9 w-12 rounded border cursor-pointer bg-transparent"
                        />
                        <Input
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="#ef4444"
                          className="font-mono"
                        />
                      </div>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ELEMENT_ICONS).map(([key, Icon]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>{key}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Save Changes" : "Create Element"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
