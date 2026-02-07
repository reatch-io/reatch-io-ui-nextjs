'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FolderPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewProjectPage() {
    const router = useRouter();
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateProject = async () => {
        // Validation
        if (!projectName.trim()) {
            toast.error("Project name is required");
            return;
        }

        setIsCreating(true);
        try {
            const response = await api.post("/api/projects", {
                name: projectName.trim(),
                description: description.trim() || undefined,
            });

            toast.success("Project created successfully");
            
            // Reload the page with the new project ID in the URL
            const newProjectId = response.data.id;
            window.location.href = `/${newProjectId}/dashboard`;
        } catch (error) {
            console.error("Failed to create project:", error);
            toast.error("Failed to create project");
            setIsCreating(false);
        }
    };

    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
                <p className="text-muted-foreground mt-1">
                    Set up a new project to organize your campaigns and contacts
                </p>
            </div>

            {/* Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderPlus className="w-5 h-5" />
                        Project Details
                    </CardTitle>
                    <CardDescription>
                        Provide basic information about your project
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Project Name */}
                    <div className="space-y-2">
                        <Label htmlFor="projectName">
                            Project Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="projectName"
                            placeholder="e.g., Marketing Campaign 2026"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground">
                            Choose a clear, descriptive name for your project
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description <span className="text-muted-foreground">(Optional)</span>
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the purpose and goals of this project..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                            {description.length}/500 characters
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            💡 <strong>Tip:</strong> You can configure integrations and set up API keys after creating the project.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            onClick={handleCreateProject}
                            disabled={isCreating || !projectName.trim()}
                            className="bg-gradient-primary"
                        >
                            {isCreating ? "Creating..." : "Create Project"}
                        </Button>
                        {/* Cancel button goes back to the previous page */}
                        <Button
                            variant="outline"
                            disabled={isCreating}
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}