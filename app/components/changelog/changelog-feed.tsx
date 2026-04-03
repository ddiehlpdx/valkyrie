import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Newspaper, FileText } from "lucide-react";
import { EmptyState } from "~/components/ui/empty-state";
import {
  CATEGORY_CONFIG,
  CHANGELOG_ENTRIES,
  type ChangelogCategory,
} from "~/data/changelog";
import { ChangelogEntryCard } from "./changelog-entry-card";
import { cn } from "~/lib/utils";

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as ChangelogCategory[];

export function ChangelogFeed() {
  const [activeFilter, setActiveFilter] = useState<ChangelogCategory | null>(
    null
  );

  const filteredEntries = activeFilter
    ? CHANGELOG_ENTRIES.filter((e) => e.category === activeFilter)
    : CHANGELOG_ENTRIES;

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Development Log</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors",
              !activeFilter
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveFilter(null)}
          >
            All
          </Badge>
          {CATEGORIES.map((category) => {
            const config = CATEGORY_CONFIG[category];
            const isActive = activeFilter === category;
            return (
              <Badge
                key={category}
                variant="outline"
                className={cn(
                  "cursor-pointer transition-colors",
                  isActive
                    ? config.color
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() =>
                  setActiveFilter(isActive ? null : category)
                }
              >
                {config.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div>
        {filteredEntries.map((entry) => (
          <ChangelogEntryCard key={entry.id} entry={entry} />
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No entries found"
          description="No entries match the selected filter."
          className="py-8"
        />
      )}
    </div>
  );
}
