'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog";

interface Project {
    id: string;
    name: string;
    description?: string;
}

export default function ProjectSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { projectId } = params as { projectId: string };
    
    const [project, setProject] = useState<Project | null>(null);
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get(`/api/projects/${projectId}`, {
            headers: {
                "X-Project-ID": projectId,
            },
        })
            .then((response) => {
                const data = response.data;
                setProject(data);
                setProjectName(data.name || "");
                setDescription(data.description || "");
            })
            .catch((error) => {
                console.error("Failed to load project:", error);
                toast.error("Failed to load project");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [projectId]);

    const handleUpdateProject = async () => {
        if (!projectName.trim()) {
            toast.error("Project name is required");
            return;
        }

        setIsSaving(true);
        try {
            await api.post(
                `/api/projects/${projectId}`,
                {
                    name: projectName.trim(),
                    description: description.trim() || undefined,
                }
            );
            
            toast.success("Project updated successfully");
            window.location.reload();
        } catch (error) {
            console.error("Failed to update project:", error);
            toast.error("Failed to update project");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProject = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/api/projects/${projectId}`);
            
            toast.success("Project deleted successfully");
            
            // Redirect to projects list or home
            window.location.href = "/";
        } catch (error) {
            console.error("Failed to delete project:", error);
            toast.error("Failed to delete project");
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <p>Loading project settings...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-8 text-center">
                <p className="text-destructive">Project not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href={`/${projectId}/dashboard`}>
                        <Button variant="ghost" className="flex items-center gap-2 mb-2">
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Settings className="w-8 h-8" />
                        Project Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your project configuration and preferences
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="general" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-6">
                    {/* Project Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Information</CardTitle>
                            <CardDescription>
                                Update your project's basic details
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
                                    placeholder="Enter project name"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    maxLength={100}
                                />
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
                                />
                            </div>

                            {/* Save Button */}
                            <div className="flex items-center gap-3 pt-4">
                                <Button
                                    onClick={handleUpdateProject}
                                    disabled={isSaving || !projectName.trim()}
                                    className="bg-gradient-primary"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone Card */}
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>
                                Irreversible actions that will permanently affect your project
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                                <div>
                                    <h4 className="font-semibold text-destructive mb-1">Delete Project</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete this project and all its data. This action cannot be undone.
                                    </p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={isDeleting}>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Project
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the project
                                                <strong className="text-foreground"> "{project.name}" </strong>
                                                and remove all associated data including campaigns, contacts, and analytics.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDeleteProject}
                                                className="bg-gradient-primary"
                                            >
                                                {isDeleting ? "Deleting..." : "Yes, delete project"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}