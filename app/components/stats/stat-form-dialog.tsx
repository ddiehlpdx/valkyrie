import { useEffect } from "react";
import { useSubmit } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CategoryType } from "@prisma/client";
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
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const statFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
    abbreviation: z.string().min(1, "Abbreviation is required").max(6, "Abbreviation must be 6 characters or less"),
    description: z.string().max(500, "Description must be 500 characters or less").optional().or(z.literal("")),
    category: z.nativeEnum(CategoryType, { errorMap: () => ({ message: "Select a category" }) }),
    minValue: z.coerce.number().int("Must be a whole number"),
    maxValue: z.coerce.number().int("Must be a whole number"),
    defaultValue: z.coerce.number().int("Must be a whole number"),
    isPercentage: z.boolean().default(false),
  })
  .refine((data) => data.maxValue > data.minValue, {
    message: "Max value must be greater than min value",
    path: ["maxValue"],
  })
  .refine((data) => data.defaultValue >= data.minValue && data.defaultValue <= data.maxValue, {
    message: "Default value must be between min and max",
    path: ["defaultValue"],
  });

type StatFormValues = z.infer<typeof statFormSchema>;

const CATEGORY_LABELS: Record<CategoryType, string> = {
  Core: "Core",
  Offensive: "Offensive",
  Defensive: "Defensive",
  Speed: "Speed",
  Luck: "Luck",
  Custom: "Custom",
};

interface StatFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stat?: {
    id: string;
    name: string;
    abbreviation: string;
    description: string | null;
    category: CategoryType;
    minValue: number;
    maxValue: number;
    defaultValue: number;
    isPercentage: boolean;
  } | null;
  projectId: string;
}

export function StatFormDialog({ open, onOpenChange, stat, projectId }: StatFormDialogProps) {
  const submit = useSubmit();
  const isEditing = !!stat;

  const form = useForm<StatFormValues>({
    resolver: zodResolver(statFormSchema),
    defaultValues: {
      name: "",
      abbreviation: "",
      description: "",
      category: CategoryType.Core,
      minValue: 0,
      maxValue: 999,
      defaultValue: 1,
      isPercentage: false,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (stat) {
      form.reset({
        name: stat.name,
        abbreviation: stat.abbreviation,
        description: stat.description || "",
        category: stat.category,
        minValue: stat.minValue,
        maxValue: stat.maxValue,
        defaultValue: stat.defaultValue,
        isPercentage: stat.isPercentage,
      });
      return;
    }

    form.reset({
      name: "",
      abbreviation: "",
      description: "",
      category: CategoryType.Core,
      minValue: 0,
      maxValue: 999,
      defaultValue: 1,
      isPercentage: false,
    });
  }, [open, stat, form]);

  function onSubmit(values: StatFormValues) {
    const formData = new FormData();
    formData.append("action", isEditing ? "update_stat" : "create_stat");
    if (stat) {
      formData.append("statId", stat.id);
    }
    formData.append("projectId", projectId);
    formData.append("name", values.name);
    formData.append("abbreviation", values.abbreviation);
    formData.append("description", values.description || "");
    formData.append("category", values.category);
    formData.append("minValue", String(values.minValue));
    formData.append("maxValue", String(values.maxValue));
    formData.append("defaultValue", String(values.defaultValue));
    formData.append("isPercentage", String(values.isPercentage));

    submit(formData, { method: "post" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Stat" : "New Stat"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this stat definition for your project."
              : "Create a new stat definition for your project."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Strength" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="abbreviation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abbreviation</FormLabel>
                    <FormControl>
                      <Input placeholder="STR" maxLength={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Determines physical attack power..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional. Max 500 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="minValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Value</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Value</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPercentage"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Percentage Stat</FormLabel>
                    <FormDescription>Display this stat as a percentage value</FormDescription>
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
              <Button type="submit">{isEditing ? "Save Changes" : "Create Stat"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
