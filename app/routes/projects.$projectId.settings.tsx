import { LoaderFunctionArgs, ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useActionData, useFetcher, useSubmit, useOutletContext, useRevalidator, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectOwnership } from "~/lib/project-access.server";
import {
  addCollaborator,
  removeCollaborator,
  searchUsers,
  updateProject,
  deleteProject
} from "~/api/project";
import { getProjectSettings, updateProjectSettings } from "~/api/projectSettings";
import { TurnSystem, StatGrowthModel } from "../../generated/prisma/browser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Settings,
  Users,
  Plus,
  Trash2,
  Search,
  Crown,
  User,
  Grid3X3,
  Swords,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "~/components/ui/empty-state";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;

  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  // Only project owners can access settings
  await requireProjectOwnership(request, projectId);

  const settings = await getProjectSettings(projectId);

  return json({ settings });
}

export async function action({ params, request }: ActionFunctionArgs) {
  const projectId = params.projectId;

  if (!projectId) {
    return json({ error: 'Project not found' }, { status: 404 });
  }

  // Only project owners can manage settings
  const accessCheck = await requireProjectOwnership(request, projectId);
  const userId = accessCheck.userId;

  const formData = await request.formData();
  const action = formData.get('action') as string;

  try {
    switch (action) {
      case 'update_project': {
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;

        if (!name || name.trim().length === 0) {
          return json({ error: 'Project name is required' }, { status: 400 });
        }

        if (name.trim().length > 100) {
          return json({ error: 'Project name must be 100 characters or less' }, { status: 400 });
        }

        if (description && description.length > 500) {
          return json({ error: 'Project description must be 500 characters or less' }, { status: 400 });
        }

        await updateProject(projectId, {
          name: name.trim(),
          description: description?.trim() || undefined
        });

        return json({ success: 'Project updated successfully' });
      }

      case 'add_collaborator': {
        const collaboratorId = formData.get('collaboratorId') as string;

        if (!collaboratorId) {
          return json({ error: 'Collaborator ID is required' }, { status: 400 });
        }

        if (collaboratorId === userId) {
          return json({ error: 'You cannot add yourself as a collaborator' }, { status: 400 });
        }

        await addCollaborator(projectId, collaboratorId);
        return json({ success: 'Collaborator added successfully' });
      }

      case 'remove_collaborator': {
        const collaboratorId = formData.get('collaboratorId') as string;

        if (!collaboratorId) {
          return json({ error: 'Collaborator ID is required' }, { status: 400 });
        }

        await removeCollaborator(projectId, collaboratorId);
        return json({ success: 'Collaborator removed successfully' });
      }

      case 'search_users': {
        const query = formData.get('query') as string;

        if (!query || query.length < 2) {
          return json({ users: [] });
        }

        const users = await searchUsers(query);
        return json({ users });
      }

      case 'update_settings': {
        const data: Record<string, number | TurnSystem | StatGrowthModel> = {};

        const gridX = formData.get('defaultGridSizeX');
        const gridY = formData.get('defaultGridSizeY');
        const tileSize = formData.get('defaultTileSize');
        const turnSystem = formData.get('turnSystem');
        const maxUnits = formData.get('maxUnitsPerBattle');
        const maxLevel = formData.get('maxLevel');
        const growthModel = formData.get('statGrowthModel');

        if (gridX) data.defaultGridSizeX = Math.max(1, Math.min(100, parseInt(gridX as string, 10)));
        if (gridY) data.defaultGridSizeY = Math.max(1, Math.min(100, parseInt(gridY as string, 10)));
        if (tileSize) data.defaultTileSize = Math.max(8, Math.min(128, parseInt(tileSize as string, 10)));
        if (turnSystem && Object.values(TurnSystem).includes(turnSystem as TurnSystem)) {
          data.turnSystem = turnSystem as TurnSystem;
        }
        if (maxUnits) data.maxUnitsPerBattle = Math.max(1, Math.min(32, parseInt(maxUnits as string, 10)));
        if (maxLevel) data.maxLevel = Math.max(1, Math.min(999, parseInt(maxLevel as string, 10)));
        if (growthModel && Object.values(StatGrowthModel).includes(growthModel as StatGrowthModel)) {
          data.statGrowthModel = growthModel as StatGrowthModel;
        }

        await updateProjectSettings(projectId, data);
        return json({ success: 'Game settings updated successfully' });
      }

      case 'delete_project': {
        await deleteProject(projectId);
        return redirect('/dashboard');
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Settings action error:', error);
    return json({
      error: error instanceof Error ? error.message : 'An error occurred'
    }, { status: 500 });
  }
}

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
  };
  userRole: 'owner' | 'collaborator';
  isOwner: boolean;
  projectId: string;
}

const TURN_SYSTEM_LABELS: Record<TurnSystem, string> = {
  Initiative: 'Initiative-based',
  RoundRobin: 'Round Robin',
  PhaseBased: 'Phase-based',
};

const STAT_GROWTH_LABELS: Record<StatGrowthModel, string> = {
  ClassBased: 'Class-based',
  Individual: 'Individual',
  Hybrid: 'Hybrid',
};

export default function ProjectSettingsPage() {
  const { project, userRole, isOwner } = useOutletContext<ProjectContext>();
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const revalidator = useRevalidator();
  const userSearchFetcher = useFetcher<{ users: Array<{id: string, username: string, email: string}> }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);

  // Project editing state
  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(project.description || '');

  // Keep track of the "saved" state to compare against
  const [savedName, setSavedName] = useState(project.name);
  const [savedDescription, setSavedDescription] = useState(project.description || '');

  // Check if there are changes from saved values
  const hasChanges = projectName !== savedName || projectDescription !== savedDescription;

  // Game settings state
  const [gridX, setGridX] = useState(settings?.defaultGridSizeX ?? 10);
  const [gridY, setGridY] = useState(settings?.defaultGridSizeY ?? 10);
  const [tileSize, setTileSize] = useState(settings?.defaultTileSize ?? 32);
  const [turnSystem, setTurnSystem] = useState<TurnSystem>((settings?.turnSystem as TurnSystem) ?? 'Initiative');
  const [maxUnits, setMaxUnits] = useState(settings?.maxUnitsPerBattle ?? 8);
  const [maxLevel, setMaxLevel] = useState(settings?.maxLevel ?? 99);
  const [statGrowth, setStatGrowth] = useState<StatGrowthModel>((settings?.statGrowthModel as StatGrowthModel) ?? 'ClassBased');

  // Reset form state when project data changes (after successful save)
  useEffect(() => {
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setSavedName(project.name);
    setSavedDescription(project.description || '');
  }, [project.name, project.description]);

  // Reset saved state after successful save
  useEffect(() => {
    if (actionData && 'success' in actionData) {
      setSavedName(projectName);
      setSavedDescription(projectDescription);
    }
  }, [actionData, projectName, projectDescription]);

  // Sync game settings when loader data updates
  useEffect(() => {
    if (!settings) return;
    setGridX(settings.defaultGridSizeX);
    setGridY(settings.defaultGridSizeY);
    setTileSize(settings.defaultTileSize);
    setTurnSystem(settings.turnSystem as TurnSystem);
    setMaxUnits(settings.maxUnitsPerBattle);
    setMaxLevel(settings.maxLevel);
    setStatGrowth(settings.statGrowthModel as StatGrowthModel);
  }, [settings]);

  // Show toast notifications for action results
  useEffect(() => {
    if (!actionData) return;
    if ('success' in actionData && typeof actionData.success === 'string') {
      toast.success(actionData.success);
    }
    if ('error' in actionData) {
      toast.error(actionData.error as string);
    }
  }, [actionData]);

  const handleUserSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) return;

    const formData = new FormData();
    formData.append('action', 'search_users');
    formData.append('query', query);
    userSearchFetcher.submit(formData, { method: 'post' });
  };

  const handleAddCollaborator = (collaboratorId: string) => {
    const formData = new FormData();
    formData.append('action', 'add_collaborator');
    formData.append('collaboratorId', collaboratorId);
    submit(formData, { method: 'post' });
    setSearchQuery('');
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    const formData = new FormData();
    formData.append('action', 'remove_collaborator');
    formData.append('collaboratorId', collaboratorId);
    submit(formData, { method: 'post' });
    setPendingRemovalId(null);
  };

  const handleSaveGameSettings = (fields: Record<string, string>) => {
    const formData = new FormData();
    formData.append('action', 'update_settings');
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }
    submit(formData, { method: 'post' });
    revalidator.revalidate();
  };

  const handleDeleteProject = () => {
    const formData = new FormData();
    formData.append('action', 'delete_project');
    submit(formData, { method: 'post' });
  };

  // Filter out users who are already collaborators or the owner
  const availableUsers = (userSearchFetcher.data?.users ?? []).filter(searchUser =>
    searchUser.id !== project.ownerId &&
    !project.collaborators.some(collab => collab.userId === searchUser.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Manage settings and collaborators for &ldquo;{project.name}&rdquo;
        </p>
      </div>

      <div className="space-y-6">
        {/* Project Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>
                  {isOwner ? 'Manage your project details and ownership' : 'Project details and ownership information'}
                </CardDescription>
              </div>
              {isOwner && hasChanges && (
                <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-400/10">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Details Form/Display */}
            {isOwner ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData();
                  formData.append('action', 'update_project');
                  formData.append('name', projectName);
                  formData.append('description', projectDescription);
                  submit(formData, { method: 'post' });

                  // Trigger revalidation to refresh the project data
                  revalidator.revalidate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum 100 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your tactical RPG project..."
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional. Maximum 500 characters
                  </p>
                </div>

                {hasChanges && (
                  <Button type="submit" className="w-full sm:w-auto">
                    Save Changes
                  </Button>
                )}
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Project Name</Label>
                  <p className="text-lg mt-1">{project.name}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-muted-foreground mt-1">
                    {project.description || 'No description provided'}
                  </p>
                </div>
              </div>
            )}

            {/* Owner Information */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Project Owner</Label>
              <div className="flex items-center gap-3 mt-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {project.owner.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.owner.username}</p>
                  <p className="text-sm text-muted-foreground">{project.owner.email}</p>
                </div>
                <Crown className="h-4 w-4 text-yellow-500 ml-2" />
              </div>
            </div>

            {/* User Role */}
            <div>
              <Label className="text-sm font-medium">Your Role</Label>
              <div className="mt-1">
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
            </div>
          </CardContent>
        </Card>

        {/* Game Settings */}
        {isOwner && (
          <>
            {/* Grid Defaults */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5" />
                  Grid Defaults
                </CardTitle>
                <CardDescription>
                  Default grid dimensions for new maps in this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grid-x">Grid Width</Label>
                    <Input
                      id="grid-x"
                      type="number"
                      min={1}
                      max={100}
                      value={gridX}
                      onChange={(e) => setGridX(parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grid-y">Grid Height</Label>
                    <Input
                      id="grid-y"
                      type="number"
                      min={1}
                      max={100}
                      value={gridY}
                      onChange={(e) => setGridY(parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tile-size">Tile Size (px)</Label>
                    <Input
                      id="tile-size"
                      type="number"
                      min={8}
                      max={128}
                      value={tileSize}
                      onChange={(e) => setTileSize(parseInt(e.target.value, 10) || 8)}
                    />
                  </div>
                </div>
                <Button
                  className="mt-4"
                  onClick={() => handleSaveGameSettings({
                    defaultGridSizeX: String(gridX),
                    defaultGridSizeY: String(gridY),
                    defaultTileSize: String(tileSize),
                  })}
                >
                  Save Grid Settings
                </Button>
              </CardContent>
            </Card>

            {/* Battle Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5" />
                  Battle Configuration
                </CardTitle>
                <CardDescription>
                  Configure the core battle system for your tactical RPG
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="turn-system">Turn System</Label>
                    <Select value={turnSystem} onValueChange={(v) => setTurnSystem(v as TurnSystem)}>
                      <SelectTrigger id="turn-system">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TURN_SYSTEM_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How turn order is determined in battle
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-units">Max Units Per Battle</Label>
                    <Input
                      id="max-units"
                      type="number"
                      min={1}
                      max={32}
                      value={maxUnits}
                      onChange={(e) => setMaxUnits(parseInt(e.target.value, 10) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum number of units on a single side
                    </p>
                  </div>
                </div>
                <Button
                  className="mt-4"
                  onClick={() => handleSaveGameSettings({
                    turnSystem,
                    maxUnitsPerBattle: String(maxUnits),
                  })}
                >
                  Save Battle Settings
                </Button>
              </CardContent>
            </Card>

            {/* Progression Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progression Settings
                </CardTitle>
                <CardDescription>
                  Character leveling and stat growth configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-level">Max Level</Label>
                    <Input
                      id="max-level"
                      type="number"
                      min={1}
                      max={999}
                      value={maxLevel}
                      onChange={(e) => setMaxLevel(parseInt(e.target.value, 10) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum level a character can reach
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stat-growth">Stat Growth Model</Label>
                    <Select value={statGrowth} onValueChange={(v) => setStatGrowth(v as StatGrowthModel)}>
                      <SelectTrigger id="stat-growth">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STAT_GROWTH_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      How character stats increase on level up
                    </p>
                  </div>
                </div>
                <Button
                  className="mt-4"
                  onClick={() => handleSaveGameSettings({
                    maxLevel: String(maxLevel),
                    statGrowthModel: statGrowth,
                  })}
                >
                  Save Progression Settings
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Collaborators Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Collaborators
                </CardTitle>
                <CardDescription>
                  Manage who has access to this project
                </CardDescription>
              </div>
              {isOwner && (
                <Badge variant="outline">
                  {project.collaborators.length} collaborator{project.collaborators.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Collaborator Section (Owner Only) */}
            {isOwner && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user-search">Add Collaborator</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="user-search"
                      type="text"
                      placeholder="Search by username or email..."
                      value={searchQuery}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {searchQuery.length >= 2 && (
                  <div className="border rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Search Results</p>
                    {availableUsers.length > 0 ? (
                      <div className="space-y-2">
                        {availableUsers.map((searchUser) => (
                          <div key={searchUser.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {searchUser.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{searchUser.username}</p>
                                <p className="text-sm text-muted-foreground">{searchUser.email}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddCollaborator(searchUser.id)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {searchQuery.length >= 2 ? 'No available users found' : 'Type at least 2 characters to search'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Current Collaborators List */}
            <div>
              <Label className="text-sm font-medium">Current Collaborators</Label>
              {project.collaborators.length > 0 ? (
                <div className="space-y-3 mt-3">
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
                          <p className="text-xs text-muted-foreground">
                            Added {new Date(collaboration.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          <User className="h-3 w-3 mr-1" />
                          Collaborator
                        </Badge>
                        {isOwner && (
                          pendingRemovalId === collaboration.userId ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveCollaborator(collaboration.userId)}
                              >
                                Confirm
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPendingRemovalId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPendingRemovalId(collaboration.userId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No collaborators yet"
                  description={isOwner ? "Search for users above to add collaborators." : "No collaborators have been added to this project."}
                />
              )}
            </div>

            {/* Permission Info */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Collaborator Permissions
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>&#8226; Can view and edit all project content</li>
                <li>&#8226; Can create and modify game elements</li>
                <li>&#8226; Cannot change project name or description</li>
                <li>&#8226; Cannot delete the project</li>
                <li>&#8226; Cannot manage other collaborators</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {isOwner && (
          <Card className="border-red-300 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that permanently affect this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
                <div>
                  <p className="font-medium">Delete this project</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete &ldquo;{project.name}&rdquo; and all of its data including maps, characters, and settings.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Delete Project
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete &ldquo;{project.name}&rdquo;?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the project
                        and all associated data including maps, characters, abilities, equipment,
                        settings, and collaborator access.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteProject}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
