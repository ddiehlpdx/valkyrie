import { LoaderFunctionArgs, ActionFunctionArgs, redirect, json } from "@remix-run/node";
import { useLoaderData, useActionData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { getSession } from "~/session.server";
import { getUserById } from "~/api/user";
import { createProject } from "~/api/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ArrowLeft, ArrowRight, FileText, Zap, CheckCircle, User } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('userId')) {
    return redirect('/auth/sign-in');
  }

  const userId = session.get('userId') as string;
  const user = await getUserById(userId);

  if (!user) {
    return redirect('/auth/sign-in');
  }

  return { user };
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('userId')) {
    return redirect('/auth/sign-in');
  }

  const userId = session.get('userId') as string;

  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const template = formData.get('template') as 'blank' | 'starter';

    // Validate required fields
    if (!name || name.trim().length < 3) {
      return json({ 
        success: false, 
        error: "Project name must be at least 3 characters long" 
      }, { status: 400 });
    }

    if (name.length > 50) {
      return json({ 
        success: false, 
        error: "Project name must be less than 50 characters" 
      }, { status: 400 });
    }

    if (description && description.length > 500) {
      return json({ 
        success: false, 
        error: "Description must be less than 500 characters" 
      }, { status: 400 });
    }

    if (!template || (template !== 'blank' && template !== 'starter')) {
      return json({ 
        success: false, 
        error: "Invalid template selection" 
      }, { status: 400 });
    }

    // Create the project
    const project = await createProject({
      name: name.trim(),
      description: description?.trim(),
      template,
      ownerId: userId
    });

    // Redirect to the new project's dashboard
    return redirect(`/dashboard`);
    
  } catch (error) {
    console.error("Project creation error:", error);
    return json({ 
      success: false, 
      error: "Failed to create project. Please try again." 
    }, { status: 500 });
  }
}

export default function NewProjectPage() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template: "blank" // blank or starter
  });

  // Form validation and submission state
  const [errors, setErrors] = useState({
    name: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep1 = () => {
    const newErrors = { name: "", description: "" };
    
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Project name must be at least 3 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Project name must be less than 50 characters";
    }

    if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.description;
  };

  const steps = [
    { number: 1, title: "Project Details", description: "Basic information about your game" },
    { number: 2, title: "Template", description: "Choose your starting point" },
    { number: 3, title: "Confirm", description: "Review and create your project" }
  ];

  const goToNextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateProject = () => {
    setIsSubmitting(true);
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('template', formData.template);
    submit(submitData, { method: 'post' });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Step 1: Project Details</h3>
              <p className="text-muted-foreground">Tell us about your game project.</p>
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                <div className="text-blue-600 dark:text-blue-400 text-sm">
                  💡 <strong>Tip:</strong> You can change the project name and description later in your project settings.
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your project name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Choose a memorable name for your game project
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="A tactical RPG about heroes fighting against evil forces..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={errors.description ? "border-red-500" : ""}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
                <div className="flex justify-between">
                  <p className="text-xs text-muted-foreground">
                    Optional: Describe your game's story, setting, or goals
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/500
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Step 2: Choose Template</h3>
              <p className="text-muted-foreground">Start with a blank project or use default game elements.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Blank Project Option */}
              <div 
                className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                  formData.template === 'blank' 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, template: 'blank' }))}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                    formData.template === 'blank' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Blank Project</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Start completely from scratch with an empty project. Perfect for experienced developers who want full control.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• No pre-configured elements</li>
                      <li>• Complete creative freedom</li>
                      <li>• Fastest setup time</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Starter Template Option */}
              <div 
                className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                  formData.template === 'starter' 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, template: 'starter' }))}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                    formData.template === 'starter' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">Starter Template</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Begin with common game elements pre-configured. Great for beginners or rapid prototyping.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Basic damage types (Physical, Magic, etc.)</li>
                      <li>• Common equipment types</li>
                      <li>• Standard elements (Fire, Water, Earth, Air)</li>
                      <li>• Sample character classes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
              <div className="text-amber-600 dark:text-amber-400 text-sm">
                <strong>Note:</strong> You can add, remove, or modify any game elements later regardless of which template you choose.
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Step 3: Confirm & Create</h3>
              <p className="text-muted-foreground">Review your project settings and create your game.</p>
            </div>

            <div className="space-y-6">
              {/* Project Details Summary */}
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Project Details
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Project Name</p>
                      <p className="text-lg">{formData.name}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                    >
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">Description</p>
                      <p className="text-muted-foreground">
                        {formData.description || "No description provided"}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Template Summary */}
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Template Selection
                </h4>
                
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                      formData.template === 'starter' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      {formData.template === 'starter' ? <Zap className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {formData.template === 'starter' ? 'Starter Template' : 'Blank Project'}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {formData.template === 'starter' 
                          ? 'Includes pre-configured game elements to get you started quickly'
                          : 'Start completely from scratch with full creative control'
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                  >
                    Edit
                  </Button>
                </div>
              </div>

              {/* Project Owner Info */}
              <div className="border rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Project Owner
                </h4>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Ready to Create */}
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Ready to Create Your Game!
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Your project will be created with the settings above. You can modify any of these settings later from your project dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </a>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground">
            Build your game with Valkyrie's powerful engine
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step.number <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.number}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    step.number <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Main Content */}
        <div>
          
          <Card>
            <CardHeader>
              <CardTitle>Step {currentStep} of {totalSteps}</CardTitle>
              <CardDescription>
                {steps[currentStep - 1].description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
              
              {/* Show any error messages */}
              {actionData?.error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-red-600 dark:text-red-400 text-sm">{actionData.error}</p>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={goToPreviousStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={goToNextStep}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    onClick={handleCreateProject}
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Project...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}