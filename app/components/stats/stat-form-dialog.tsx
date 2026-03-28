import { useEffect, useState } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { ChevronsUpDown, Cpu } from "lucide-react";
import { SystemStatKey } from "../../../generated/prisma/browser";

const SYSTEM_KEY_DESCRIPTIONS: Record<string, string> = {
  HP: "Used by the engine for death checks",
  MP: "Used by the engine for ability costs",
  MOV: "Used by the engine for movement range",
};

const statFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
    abbreviation: z.string().min(1, "Abbreviation is required").max(6, "Abbreviation must be 6 characters or less"),
    description: z.string().max(500, "Description must be 500 characters or less").optional().or(z.literal("")),
    group: z.string().max(32, "Group must be 32 characters or less").optional().or(z.literal("")),
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

interface StatFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stat?: {
    id: string;
    name: string;
    abbreviation: string;
    description: string | null;
    systemKey: SystemStatKey | null;
    group: string | null;
    minValue: number;
    maxValue: number;
    defaultValue: number;
    isPercentage: boolean;
  } | null;
  projectId: string;
  existingGroups?: string[];
}

export function StatFormDialog({ open, onOpenChange, stat, projectId, existingGroups = [] }: StatFormDialogProps) {
  const submit = useSubmit();
  const isEditing = !!stat;
  const isCoreStat = !!stat?.systemKey;
  const [groupPopoverOpen, setGroupPopoverOpen] = useState(false);

  const form = useForm<StatFormValues>({
    resolver: zodResolver(statFormSchema),
    defaultValues: {
      name: "",
      abbreviation: "",
      description: "",
      group: "",
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
        group: stat.group || "",
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
      group: "",
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
    formData.append("group", values.group || "");
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
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Stat" : "New Stat"}
            {isCoreStat && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                <Cpu className="h-3 w-3 mr-1" />
                Engine Stat
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCoreStat && stat?.systemKey
              ? SYSTEM_KEY_DESCRIPTIONS[stat.systemKey]
              : isEditing
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
              name="group"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Group</FormLabel>
                  {existingGroups.length > 0 ? (
                    <Popover open={groupPopoverOpen} onOpenChange={setGroupPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="justify-between font-normal"
                          >
                            {field.value || "Select or type a group..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search or create group..."
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {field.value ? `Use "${field.value}" as new group` : "Type to create a group"}
                            </CommandEmpty>
                            <CommandGroup>
                              {existingGroups.map((group) => (
                                <CommandItem
                                  key={group}
                                  value={group}
                                  onSelect={(value) => {
                                    field.onChange(value);
                                    setGroupPopoverOpen(false);
                                  }}
                                >
                                  {group}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <FormControl>
                      <Input placeholder="e.g. Offensive, Defensive, Speed..." {...field} />
                    </FormControl>
                  )}
                  <FormDescription>Optional. Organize stats into groups for display.</FormDescription>
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

            {!isCoreStat && (
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
            )}

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
