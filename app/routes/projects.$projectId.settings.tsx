import { LoaderFunctionArgs, ActionFunctionArgs, redirect, json } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit, useOutletContext, useRevalidator } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireProjectOwnership } from "~/lib/project-access.server";
import { 
  addCollaborator, 
  removeCollaborator,
  searchUsers,
  updateProject
} from "~/api/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  Plus, 
  Trash2, 
  Search,
  Crown,
  User
} from "lucide-react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;

  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  // Only project owners can access settings
  await requireProjectOwnership(request, projectId);

  return json({ success: true });
}

export async function action({ params, request }: ActionFunctionArgs) {
  const projectId = params.projectId;

  if (!projectId) {
    return json({ error: 'Project not found' }, { status: 404 });
  }

  // Only project owners can manage collaborators
  const accessCheck = await requireProjectOwnership(request, projectId);
  const userId = accessCheck.userId;

  const formData = await request.formData();
  const action = formData.get('action') as string;

  try {
    if (action === 'update_project') {
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
      
    } else if (action === 'add_collaborator') {
      const collaboratorId = formData.get('collaboratorId') as string;
      
      if (!collaboratorId) {
        return json({ error: 'Collaborator ID is required' }, { status: 400 });
      }

      if (collaboratorId === userId) {
        return json({ error: 'You cannot add yourself as a collaborator' }, { status: 400 });
      }

      await addCollaborator(projectId, collaboratorId);
      return json({ success: 'Collaborator added successfully' });
      
    } else if (action === 'remove_collaborator') {
      const collaboratorId = formData.get('collaboratorId') as string;
      
      if (!collaboratorId) {
        return json({ error: 'Collaborator ID is required' }, { status: 400 });
      }

      await removeCollaborator(projectId, collaboratorId);
      return json({ success: 'Collaborator removed successfully' });
      
    } else if (action === 'search_users') {
      const query = formData.get('query') as string;
      
      if (!query || query.length < 2) {
        return json({ users: [] });
      }

      const users = await searchUsers(query);
      return json({ users });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Collaboration action error:', error);
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

export default function ProjectSettingsPage() {
  const { user, project, userRole, isOwner } = useOutletContext<ProjectContext>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const revalidator = useRevalidator();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{id: string, username: string, email: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Project editing state
  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(project.description || '');
  
  // Keep track of the "saved" state to compare against
  const [savedName, setSavedName] = useState(project.name);
  const [savedDescription, setSavedDescription] = useState(project.description || '');
  
  // Check if there are changes from saved values
  const hasChanges = projectName !== savedName || projectDescription !== savedDescription;
  
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

  const handleUserSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const formData = new FormData();
    formData.append('action', 'search_users');
    formData.append('query', query);
    
    submit(formData, { 
      method: 'post',
      replace: true,
      fetcherKey: 'user-search'
    });
  };

  const handleAddCollaborator = (collaboratorId: string) => {
    const formData = new FormData();
    formData.append('action', 'add_collaborator');
    formData.append('collaboratorId', collaboratorId);
    submit(formData, { method: 'post' });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) {
      return;
    }
    
    const formData = new FormData();
    formData.append('action', 'remove_collaborator');
    formData.append('collaboratorId', collaboratorId);
    submit(formData, { method: 'post' });
  };

  // Filter out users who are already collaborators or the owner
  const availableUsers = searchResults.filter(searchUser => 
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
          Manage settings and collaborators for "{project.name}"
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
                  <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveCollaborator(collaboration.userId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No collaborators yet</p>
                    {isOwner && <p className="text-sm">Search for users above to add collaborators</p>}
                  </div>
                )}
              </div>

              {/* Permission Info */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Collaborator Permissions
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Can view and edit all project content</li>
                  <li>• Can create and modify game elements</li>
                  <li>• Cannot change project name or description</li>
                  <li>• Cannot delete the project</li>
                  <li>• Cannot manage other collaborators</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Success/Error Messages */}
          {actionData && 'success' in actionData && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-green-700 dark:text-green-300 text-sm">{actionData.success}</p>
            </div>
          )}
          
          {actionData && 'error' in actionData && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-700 dark:text-red-300 text-sm">{actionData.error}</p>
            </div>
          )}
        </div>
    </div>
  );
}