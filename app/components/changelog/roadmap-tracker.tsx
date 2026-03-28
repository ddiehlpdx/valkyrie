import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import { ChevronDown, CircleCheck, Circle, Map } from "lucide-react";
import { ROADMAP_PHASES, type PhaseId } from "~/data/changelog";
import { cn } from "~/lib/utils";

function getSegmentColor(status: string): string {
  switch (status) {
    case "complete":
      return "bg-primary";
    case "in-progress":
      return "bg-primary/40";
    default:
      return "bg-secondary";
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "complete":
      return (
        <Badge
          variant="outline"
          className="text-green-400 border-green-400/30 bg-green-400/10"
        >
          Complete
        </Badge>
      );
    case "in-progress":
      return (
        <Badge
          variant="outline"
          className="text-blue-400 border-blue-400/30 bg-blue-400/10"
        >
          In Progress
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Upcoming
        </Badge>
      );
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "complete":
      return <CircleCheck className="h-4 w-4 text-green-400 shrink-0" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />;
  }
}

export function RoadmapTracker() {
  const [expandedPhase, setExpandedPhase] = useState<PhaseId | null>(null);

  const completedCount = ROADMAP_PHASES.filter(
    (p) => p.status === "complete"
  ).length;
  const totalCount = ROADMAP_PHASES.length;

  function togglePhase(phaseId: PhaseId) {
    setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            <CardTitle>Roadmap Progress</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} phases complete
          </span>
        </div>
        <CardDescription>
          Tracking our journey from foundation to playable MVP. Click a phase to
          see details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Segmented progress bar */}
        <TooltipProvider>
          <div className="flex gap-1">
            {ROADMAP_PHASES.map((phase, index) => (
              <Tooltip key={phase.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => togglePhase(phase.id)}
                    className={cn(
                      "h-4 flex-1 transition-all cursor-pointer",
                      getSegmentColor(phase.status),
                      index === 0 && "rounded-l-full",
                      index === ROADMAP_PHASES.length - 1 && "rounded-r-full",
                      expandedPhase === phase.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-xs bg-popover text-popover-foreground border"
                >
                  <div className="space-y-1.5 p-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{phase.shortName}</span>
                      <span className="text-xs">{phase.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click to expand details
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        {/* Phase labels - clickable */}
        <div className="hidden md:flex gap-1">
          {ROADMAP_PHASES.map((phase) => (
            <button
              key={phase.id}
              type="button"
              onClick={() => togglePhase(phase.id)}
              className={cn(
                "flex-1 text-center text-[10px] leading-tight cursor-pointer transition-colors rounded px-0.5 py-0.5",
                expandedPhase === phase.id
                  ? "text-primary font-semibold bg-primary/10"
                  : phase.status === "complete"
                    ? "text-primary font-medium hover:bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {phase.shortName}
            </button>
          ))}
        </div>

        {/* Phase list (mobile-friendly + expandable details) */}
        <div className="space-y-1 pt-2">
          {ROADMAP_PHASES.map((phase) => {
            const isExpanded = expandedPhase === phase.id;
            return (
              <div key={phase.id}>
                <button
                  type="button"
                  onClick={() => togglePhase(phase.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer",
                    isExpanded
                      ? "bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  {getStatusIcon(phase.status)}
                  <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">
                    {phase.shortName}
                  </span>
                  <span
                    className={cn(
                      "text-sm flex-1 truncate",
                      phase.status === "complete"
                        ? "font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {phase.name}
                  </span>
                  {getStatusBadge(phase.status)}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="ml-[52px] mr-3 pb-3 pt-1 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {phase.description}
                    </p>
                    <ul className="space-y-1.5">
                      {phase.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="text-primary mt-1.5 shrink-0">
                            &bull;
                          </span>
                          <span className="text-muted-foreground">
                            {highlight}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
