import { Separator } from "~/components/ui/separator";
import { RoadmapTracker } from "~/components/changelog/roadmap-tracker";
import { ChangelogFeed } from "~/components/changelog/changelog-feed";
import { Swords } from "lucide-react";

export default function DashboardIndex() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Swords className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Valkyrie
          </h1>
        </div>
        <p className="text-muted-foreground">
          Track our progress building the ultimate tactical RPG editor.
        </p>
      </div>

      <RoadmapTracker />

      <Separator />

      <ChangelogFeed />
    </div>
  );
}
