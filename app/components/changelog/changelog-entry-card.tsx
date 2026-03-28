import { Badge } from "~/components/ui/badge";
import {
  CATEGORY_CONFIG,
  ROADMAP_PHASES,
  type ChangelogEntry,
} from "~/data/changelog";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ChangelogEntryCardProps {
  entry: ChangelogEntry;
}

export function ChangelogEntryCard({ entry }: ChangelogEntryCardProps) {
  const categoryConfig = CATEGORY_CONFIG[entry.category];
  const phase = entry.phase
    ? ROADMAP_PHASES.find((p) => p.id === entry.phase)
    : null;

  return (
    <div className="relative pl-8 pb-8 last:pb-0 group">
      {/* Timeline connector */}
      <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border group-last:hidden" />

      {/* Timeline dot */}
      <div className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 border-primary bg-background" />

      <div className="space-y-2">
        {/* Date */}
        <time className="text-sm text-muted-foreground">
          {formatDate(entry.date)}
        </time>

        {/* Title */}
        <h3 className="text-lg font-semibold leading-tight">{entry.title}</h3>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={categoryConfig.color}>
            {categoryConfig.label}
          </Badge>
          {phase && (
            <Badge variant="outline" className="text-muted-foreground">
              {phase.shortName}: {phase.name}
            </Badge>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {entry.description}
        </p>
      </div>
    </div>
  );
}
