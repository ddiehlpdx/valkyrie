import { Link, useRouteLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Plus, Users, Calendar, FolderOpen } from "lucide-react";

interface DashboardProject {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  owner: { id: string; username: string; email: string };
  collaborators: Array<{
    id: string;
    userId: string;
    user: { id: string; username: string; email: string };
  }>;
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  user: { id: string; email: string; username: string };
  projects: DashboardProject[];
}

export default function DashboardIndex() {
  const data = useRouteLoaderData<DashboardData>("routes/dashboard");
  const projects = data?.projects ?? [];

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-6" />
        <h2 className="text-2xl font-bold tracking-tight mb-2">No projects yet</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Create your first tactical RPG project to start designing maps, characters, abilities, and more.
        </p>
        <Button asChild size="lg">
          <Link to="/projects/new">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Project
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
          <p className="text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link to="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`} className="block group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                {project.description && (
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{project.collaborators.length + 1}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
