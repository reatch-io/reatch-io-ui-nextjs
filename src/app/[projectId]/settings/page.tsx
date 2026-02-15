'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Save, Trash2, Key, Copy, Plus, Eye, EyeOff } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ApiKeysTableClient } from "./api-keys-list";
import { Project } from "@/models/project";


export default function ProjectSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { projectId } = params as { projectId: string };
    
    const [project, setProject] = useState<Project | null>(null);
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Get active tab from URL or default to "general"
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");

    // API Keys state
    const [newKeyName, setNewKeyName] = useState("");
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
    const [showKeyDialog, setShowKeyDialog] = useState(false);
    
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

    // Sync tab with URL
    useEffect(() => {
        const tabFromUrl = searchParams.get("tab");
        if (tabFromUrl && (tabFromUrl === "general" || tabFromUrl === "api-keys")) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        // Update URL without triggering a full page reload
        const url = new URL(window.location.href);
        url.searchParams.set("tab", value);
        router.push(url.pathname + url.search, { scroll: false });
    };

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

    const handleCreateApiKey = async () => {
        if (!newKeyName.trim()) {
            toast.error("API key name is required");
            return;
        }

        setIsCreatingKey(true);
        try {
            const response = await api.post(
                `/api/projects/api-keys`,
                { name: newKeyName.trim() },
                {
                    headers: {
                        "X-Project-ID": projectId,
                    },
                }
            );
            
            setNewKeyName("");
            setNewlyCreatedKey(response.data.apiKey);
            setShowKeyDialog(true);
            toast.success("API key created successfully");
        } catch (error) {
            console.error("Failed to create API key:", error);
            toast.error("Failed to create API key");
        } finally {
            setIsCreatingKey(false);
        }
    };

    const handleCopyNewKey = () => {
        if (newlyCreatedKey) {
            navigator.clipboard.writeText(newlyCreatedKey);
            toast.success("API key copied to clipboard");
        }
    };

    const handleCloseKeyDialog = () => {
        setShowKeyDialog(false);
        setNewlyCreatedKey(null);
        window.location.reload(); // Reload to show the new key in the list
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
                    <div className="mb-8">
                        <Link href={`/${projectId}/dashboard`}>
                            <Button variant="outline">
                                <ArrowLeft size={16} />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
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
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="api-keys">API Keys</TabsTrigger>
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

                {/* API Keys Tab */}
                <TabsContent value="api-keys" className="space-y-6">
                    {/* Create New API Key Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="w-5 h-5" />
                                Create API Key
                            </CardTitle>
                            <CardDescription>
                                Generate a new API key for programmatic access to your project
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Enter API key name (e.g., Production Server)"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        maxLength={100}
                                    />
                                </div>
                                <Button
                                    onClick={handleCreateApiKey}
                                    disabled={isCreatingKey || !newKeyName.trim()}
                                    className="bg-gradient-primary"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {isCreatingKey ? "Creating..." : "Create Key"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* API Keys List Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your API Keys</CardTitle>
                            <CardDescription>
                                Manage your existing API keys. Delete keys that are no longer needed.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ApiKeysTableClient />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* New API Key Dialog */}
            <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Key className="w-5 h-5" />
                            API Key Created Successfully
                        </DialogTitle>
                        <DialogDescription className="text-base pt-2">
                            Make sure to copy your API key now. You won't be able to see it again!
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-muted rounded-lg border-2 border-primary/20">
                            <p className="text-sm font-medium mb-2">Your API Key:</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 p-3 bg-background rounded border font-mono text-sm break-all">
                                    {newlyCreatedKey}
                                </code>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopyNewKey}
                                    className="shrink-0"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm font-semibold text-destructive mb-1">
                                ⚠️ Important Security Notice
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Store this key in a secure location</li>
                                <li>Never share it or commit it to version control</li>
                                <li>This key will not be displayed again</li>
                                <li>If lost, you'll need to create a new one</li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleCloseKeyDialog}
                            className="bg-gradient-primary"
                        >
                            I've saved my key
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}