import { useOutletContext } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { 
  Users, 
  Crown, 
  User, 
  Settings, 
  Map, 
  Sword, 
  Zap, 
  Shield,
  Calendar,
  Activity
} from "lucide-react";

interface ProjectContext {
  user: {
    id: string;
    username: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
    description?: string | null;
    ownerId: string;
    owner: {
      id: string;
      username: string;
      email: string;
    };
    collaborators: Array<{
      id: string;
      userId: string;
      user: {
        id: string;
        username: string;
        email: string;
      };
      createdAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
  };
  userRole: 'owner' | 'collaborator';
  isOwner: boolean;
  projectId: string;
}

export default function ProjectOverview() {
  const { user, project, userRole, isOwner } = useOutletContext<ProjectContext>();

  const quickActions = [
    {
      title: "Maps & Battlefields",
      description: "Design battle maps and world locations",
      icon: Map,
      href: `/projects/${project.id}/maps`,
      color: "bg-blue-500"
    },
    {
      title: "Characters & Classes",
      description: "Create heroes, enemies, and job classes",
      icon: User,
      href: `/projects/${project.id}/characters`,
      color: "bg-green-500"
    },
    {
      title: "Abilities & Skills",
      description: "Design combat abilities and special moves",
      icon: Zap,
      href: `/projects/${project.id}/abilities`,
      color: "bg-purple-500"
    },
    {
      title: "Equipment & Items",
      description: "Create weapons, armor, and consumables",
      icon: Sword,
      href: `/projects/${project.id}/equipment`,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-lg text-muted-foreground mb-4">{project.description}</p>
          )}
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant={userRole === 'owner' ? 'default' : 'secondary'}>
                {userRole === 'owner' ? (
                  <>
                    <Crown className="h-3 w-3 mr-1" />
                    Owner
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 mr-1" />
                    Collaborator
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{project.collaborators.length + 1} member{project.collaborators.length !== 0 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        {isOwner && (
          <Button variant="outline" asChild>
            <a href={`/projects/${project.id}/settings`}>
              <Settings className="h-4 w-4 mr-2" />
              Project Settings
            </a>
          </Button>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <a href={action.href} className="block">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </a>
            </Card>
          ))}
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Project Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {project.owner.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{project.owner.username}</p>
                <p className="text-xs text-muted-foreground">{project.owner.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{project.collaborators.length + 1}</p>
                <p className="text-xs text-muted-foreground">
                  1 owner, {project.collaborators.length} collaborator{project.collaborators.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{new Date(project.updatedAt).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(project.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      {project.collaborators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              People with access to this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Owner */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {project.owner.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{project.owner.username}</p>
                    <p className="text-sm text-muted-foreground">{project.owner.email}</p>
                  </div>
                </div>
                <Badge>
                  <Crown className="h-3 w-3 mr-1" />
                  Owner
                </Badge>
              </div>

              {/* Collaborators */}
              {project.collaborators.map((collaboration) => (
                <div key={collaboration.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {collaboration.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{collaboration.user.username}</p>
                      <p className="text-sm text-muted-foreground">{collaboration.user.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <User className="h-3 w-3 mr-1" />
                    Collaborator
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}