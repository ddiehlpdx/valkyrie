import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getSession } from "~/session.server";
import { getUserById } from "~/api/user";
import { getProfileByUserId, updateProfile, clearAvatar } from "~/api/profile";
import { uploadAvatar } from "~/lib/file-upload.server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { X } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('userId')) {
    return redirect('/auth/sign-in');
  }

  const userId = session.get('userId') as string;
  const user = await getUserById(userId);
  const profile = await getProfileByUserId(userId);

  if (!user) {
    return redirect('/auth/sign-in');
  }

  return json({ user, profile });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('userId')) {
    return redirect('/auth/sign-in');
  }

  const userId = session.get('userId') as string;

  try {
    // Check if this is a clear avatar request first
    const contentType = request.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      // Handle simple form data (like clear avatar)
      const formData = await request.formData();
      const clearAvatarAction = formData.get('clearAvatar') as string;
      
      if (clearAvatarAction === 'true') {
        await clearAvatar(userId);
        return json({ success: true, message: "Avatar cleared successfully!" });
      }
    }

    // Parse multipart form data for file uploads
    const uploadHandler = unstable_createMemoryUploadHandler({
      maxPartSize: 5 * 1024 * 1024, // 5MB
    });
    
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);

    const tagline = formData.get('tagline') as string;
    const bio = formData.get('bio') as string;
    const avatarFile = formData.get('avatar') as File | null;

    let avatarUrl: string | undefined;

    // Handle avatar upload if file is provided
    if (avatarFile && avatarFile.size > 0) {
      try {
        avatarUrl = await uploadAvatar(avatarFile);
      } catch (uploadError) {
        return json({ 
          success: false, 
          message: uploadError instanceof Error ? uploadError.message : "Failed to upload avatar." 
        }, { status: 400 });
      }
    }

    // Update profile with new data
    await updateProfile(userId, {
      tagline: tagline || undefined,
      bio: bio || undefined,
      ...(avatarUrl && { avatar: avatarUrl }),
    });

    return json({ success: true, message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Profile update error:", error);
    return json({ success: false, message: "Failed to update profile. Please try again." }, { status: 400 });
  }
}

export default function ProfilePage() {
  const { user, profile } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  // State for image preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // State for tracking form changes
  const [currentValues, setCurrentValues] = useState({
    tagline: profile.tagline || "",
    bio: profile.bio || "",
  });
  
  const [savedValues, setSavedValues] = useState({
    tagline: profile.tagline || "",
    bio: profile.bio || "",
  });
  
  // Check if there are unsaved changes
  const hasUnsavedChanges = currentValues.tagline !== savedValues.tagline || 
                           currentValues.bio !== savedValues.bio ||
                           previewImage !== null;

  // Handle action results with toast notifications
  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message || "Profile updated successfully!");
      setPreviewImage(null);
      // Update saved values to match current values
      setSavedValues({
        tagline: currentValues.tagline,
        bio: currentValues.bio,
      });
      // Clear the file input
      const fileInput = document.getElementById('avatar') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      return;
    }
    
    if (actionData?.message && !actionData.success) {
      toast.error(actionData.message);
    }
  }, [actionData, currentValues]);

  // Handle file selection for preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        event.target.value = '';
        setPreviewImage(null);
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        event.target.value = '';
        setPreviewImage(null);
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      return;
    }
    
    setPreviewImage(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences.
        </p>
      </div>


      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your basic account details. Contact support to change your email or username.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar || undefined} alt={user.username} />
                <AvatarFallback className="text-lg">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>
                  Customize your profile information that others can see.
                </CardDescription>
              </div>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Form method="post" encType="multipart/form-data" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Avatar</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={previewImage || profile.avatar || undefined} 
                      alt={user.username} 
                    />
                    <AvatarFallback className="text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="avatar"
                          name="avatar"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                        <label
                          htmlFor="avatar"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground focus-within:ring-1 focus-within:ring-ring items-center"
                        >
                          <span className="flex-1 truncate text-muted-foreground">
                            {profile.avatar ? (
                              "Browse to select a new avatar"
                            ) : (
                              "No avatar set. Select now..."
                            )}
                          </span>
                        </label>
                      </div>
                      {profile.avatar && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Form method="post" className="inline">
                                <input type="hidden" name="clearAvatar" value="true" />
                                <Button
                                  type="submit"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 px-3"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </Form>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remove avatar from profile</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload a JPEG, PNG, GIF, or WebP image. Max size: 5MB.
                      {previewImage && (
                        <span className="text-green-600 block">
                          ✓ Image selected - preview shown above
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  name="tagline"
                  placeholder="Game developer, tactical RPG enthusiast"
                  value={currentValues.tagline}
                  onChange={(e) => setCurrentValues(prev => ({ ...prev, tagline: e.target.value }))}
                  maxLength={100}
                />
                <p className="text-sm text-muted-foreground">
                  A short description that appears on your profile.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself, your game development experience, or what you're working on..."
                  value={currentValues.bio}
                  onChange={(e) => setCurrentValues(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground">
                  Share more about yourself and your game development journey.
                </p>
              </div>

              {hasUnsavedChanges && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}