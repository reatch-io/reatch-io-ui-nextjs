'use client'

import { BarChart2, Globe, Home, Layers, MessageSquare, Send, Settings, Users, Plus } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@auth0/nextjs-auth0";
import api from "@/api/auth/app-api"
import { Usage } from "@/models/subscription"

// Setup menu items
const setupItems = [
    {
        title: "Email Domain",
        url: "domains",
        icon: Globe,
    },
    {
        title: "Whatsapp Senders",
        url: "whatsapp",
        icon: Send,
    },
    {
        title: "Whatsapp Templates",
        url: "whatsapp-templates",
        icon: MessageSquare,
    },
]

// Execution menu items
const executionItems = [
    {
        title: "Dashboard",
        url: "dashboard",
        icon: Home,
    },
    {
        title: "Customers",
        url: "customers",
        icon: Users,
    },
    {
        title: "Segments",
        url: "segments",
        icon: Layers,
    },
    {
        title: "Campaigns",
        url: "campaigns",
        icon: Send,
    },
]

type Project = {
    id: string;
    name: string;
};


export function AppSidebar() {
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProject, setSelectedProject] = useState<Project>()
    const [usage, setUsage] = useState<Usage | null>(null)
    const pathname = usePathname()
    const router = useRouter()
    const { user } = useUser();
    const [userRegisted, setUserRegisted] = useState<boolean>();

    useEffect(() => {
        if (user) {
            api.post("/api/users", {
                id: user.sub,
                username: user.name,
                email: user.email,
                emailVerified: user.email_verified,
                firstName: user.given_name,
                lastName: user.family_name,
            }).catch((error) => {
                console.error("Error saving user data:", error);
            })
                .then(() => {
                    setUserRegisted(true);
                })
        }
    }, [user]);

    useEffect(() => {
        api.get("/api/projects")
            .then((response) => {
                const data = response.data;
                setProjects(data);

                if (!selectedProject && data.length > 0) {
                    setSelectedProject(data[0]); // Set the first project as selected by default
                }
            })
            .catch((error) => {
                console.error("Error fetching projects:", error);
            });
    }, [userRegisted]);

    useEffect(() => {
        if (projects.length === 0 || !pathname) return
        const segments = pathname.split("/")
        const projectId = segments[1]
        if (!projectId && projects[0]) {
            router.replace(`/${projects[0].id}/dashboard`)
        } else if (projectId) {
            const project = projects.find((p) => p.id === projectId)
            if (project && project.id !== selectedProject?.id) {
                setSelectedProject(project)
            }
        }
    }, [projects, pathname, router]);

    // Fetch usage data
    useEffect(() => {
        const fetchUsage = async () => {
            if (!selectedProject?.id) return;

            try {
                const res = await api.get(`/api/usage`, {
                    headers: {
                        "X-Project-ID": selectedProject.id
                    }
                });
                setUsage(res.data);
            } catch (err) {
                console.error("Error fetching usage:", err);
            }
        };

        fetchUsage();
    }, [selectedProject?.id]);

    const handleProjectChange = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setSelectedProject(project);
            window.location.href = `/${projectId}/dashboard`;
        }
    };

    const handleAddNewProject = () => {
        console.log("Add new project");
        router.push('/projects/new');
    };

    const handleManageProject = () => {
        if (selectedProject?.id) {
            console.log("Manage project:", selectedProject.id);
            router.push(`/${selectedProject.id}/settings`);
        }
    };

    const formatUsageLimit = (limit: number) => {
        if (limit >= 1000000) {
            return `${(limit / 1000000).toFixed(1)}M`;
        } else if (limit >= 1000) {
            return `${(limit / 1000).toFixed(0)}K`;
        }
        return limit.toString();
    };

    const usagePercentage = usage && usage.limit > 0 ? (usage.consumed / usage.limit) * 100 : 0;

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 p-4">
                            <Avatar>
                                <AvatarImage src="/reatch-logo-purple-white.png" />
                            </Avatar>
                            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">reatch.io</span>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarGroupLabel>Projects</SidebarGroupLabel>
                        <Select onValueChange={handleProjectChange} value={selectedProject?.id}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Projects</SelectLabel>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        
                        {/* New buttons below project dropdown - subtle styling */}
                        <div className="flex gap-2 mt-2 px-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleAddNewProject}
                                className="flex-1 text-xs text-muted-foreground hover:text-foreground h-8"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                New Project
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleManageProject}
                                disabled={!selectedProject}
                                className="flex-1 text-xs text-muted-foreground hover:text-foreground h-8"
                            >
                                <Settings className="w-3 h-3 mr-1" />
                                Settings
                            </Button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {/* Execution Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>Execution</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {executionItems.map((item) => {
                                const href = '/' + selectedProject?.id + '/' + item.url
                                const isActive =
                                    pathname === href ||
                                    pathname.startsWith(href + "/")

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={'/' + selectedProject?.id + '/' + item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Setup Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>Setup</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {setupItems.map((item) => {
                                const href = '/' + selectedProject?.id + '/' + item.url
                                const isActive =
                                    pathname === href ||
                                    pathname.startsWith(href + "/")

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={'/' + selectedProject?.id + '/' + item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {/* Usage Progress Bar */}
                        {usage && usage.limit > 0 ? (
                            <div className="px-4 py-3 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" />
                                        TCoins
                                    </span>
                                    <span className="font-medium">
                                        {formatUsageLimit(usage.consumed)} / {formatUsageLimit(usage.limit)}
                                    </span>
                                </div>
                                <Progress
                                    value={usagePercentage}
                                    className="h-1.5"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{usagePercentage.toFixed(0)}% used</span>
                                    <span>{formatUsageLimit(usage.limit - usage.consumed)} remaining</span>
                                </div>
                                <Link href={`/${selectedProject?.id}/usages`} className="block">
                                    <Button
                                        size="sm"
                                        className="w-full text-xs bg-gradient-primary"
                                    >
                                        Buy Credit
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="px-4 py-3 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <MessageSquare className="w-3 h-3" />
                                    <span>No messages available</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Purchase message credits to start sending campaigns
                                </p>
                                <Link href={`/${selectedProject?.id}/usages`} className="block">
                                    <Button
                                        size="sm"
                                        className="w-full text-xs bg-gradient-primary"
                                    >
                                        Buy Messages
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <div className="flex items-center gap-3 p-4 border-t mt-auto">
                            <Avatar>
                                <AvatarImage src={user?.picture} alt={user?.name} />
                                <AvatarFallback>
                                    {(user?.name ?? "")
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{user?.name}</span>
                                <span className="text-xs text-muted-foreground">{user?.email}</span>
                            </div>
                        </div>
                        <div className="p-4 border-t">
                            <a
                                href="/auth/logout"
                                className="block w-full text-left text-sm text-muted-foreground hover:underline">
                                Logout
                            </a>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

        </Sidebar >
    )
}