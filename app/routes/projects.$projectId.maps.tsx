import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useOutletContext } from "@remix-run/react";
import { requireProjectAccess } from "~/lib/project-access.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  Map, 
  Plus, 
  Grid3x3,
  Mountain,
  Trees,
  Sword,
  Settings,
  Eye
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
    }>;
  };
  userRole: 'owner' | 'collaborator';
  isOwner: boolean;
  projectId: string;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;

  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  // Ensure user has project access (owner or collaborator)
  await requireProjectAccess(request, projectId);

  return json({ success: true });
}

export default function ProjectMapsPage() {
  const { user, project, userRole, isOwner } = useOutletContext<ProjectContext>();

  // Sample map data - in a real app this would come from the database
  const maps = [
    {
      id: "1",
      name: "Castle Courtyard",
      type: "Battle Map",
      size: "20x15",
      terrain: ["Grass", "Stone", "Water"],
      lastModified: "2 days ago"
    },
    {
      id: "2", 
      name: "Forest Clearing",
      type: "Battle Map", 
      size: "25x20",
      terrain: ["Grass", "Trees", "Rocks"],
      lastModified: "1 week ago"
    },
    {
      id: "3",
      name: "Mountain Pass",
      type: "World Map",
      size: "30x25", 
      terrain: ["Mountain", "Path", "Cliff"],
      lastModified: "3 days ago"
    }
  ];

  const getTerrainIcon = (terrain: string) => {
    switch (terrain.toLowerCase()) {
      case 'mountain':
      case 'cliff':
      case 'rocks':
        return Mountain;
      case 'trees':
      case 'forest':
        return Trees;
      case 'grass':
      case 'stone':
      case 'path':
        return Grid3x3;
      default:
        return Grid3x3;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Map className="h-6 w-6" />
            <h1 className="text-3xl font-bold tracking-tight">Maps & Battlefields</h1>
          </div>
          <p className="text-muted-foreground">
            Design battle maps and world locations for your tactical RPG
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Map
        </Button>
      </div>

      {/* Permission Info */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
            <Sword className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              {userRole === 'owner' ? 'Full Map Access' : 'Collaborator Access'}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {userRole === 'owner' 
                ? 'As the project owner, you can create, edit, and delete maps.'
                : 'As a collaborator, you can create and edit maps, but cannot delete them.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Maps Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Project Maps</h2>
          <Badge variant="outline">
            {maps.length} map{maps.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {maps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maps.map((map) => {
              const primaryTerrain = map.terrain[0];
              const TerrainIcon = getTerrainIcon(primaryTerrain);
              
              return (
                <Card key={map.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                          <TerrainIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{map.name}</CardTitle>
                          <CardDescription>{map.type} • {map.size}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-2">Terrain Types</p>
                        <div className="flex flex-wrap gap-1">
                          {map.terrain.map((terrain) => (
                            <Badge key={terrain} variant="secondary" className="text-xs">
                              {terrain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Modified {map.lastModified}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No maps yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start creating battle maps and world locations for your game
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Map
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}