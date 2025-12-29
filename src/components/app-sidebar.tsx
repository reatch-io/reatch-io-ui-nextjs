'use client'

import { BarChart2, Globe, Home, Layers, MessageSquare, Send, Settings, Users } from "lucide-react"

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
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@auth0/nextjs-auth0";
import api from "@/api/auth/app-api"

// Menu items.
const items = [
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
    {
        title: "Domains",
        url: "domains",
        icon: Globe,
    },
    {
        title: "Whatsapp",
        url: "whatsapp",
        icon: Send,
    },
    {
        title: "Whatsapp Templates",
        url: "whatsapp-templates",
        icon: MessageSquare,
    },
    {
        title: "Analytics",
        url: "analytics",
        icon: BarChart2,
    },
    {
        title: "Settings",
        url: "settings",
        icon: Settings,
    },
]

type Project = {
    id: string;
    name: string;
};


export function AppSidebar() {
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProject, setSelectedProject] = useState<Project>()
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

    const handleProjectChange = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            setSelectedProject(project);
        }
    };

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
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const href = '/' + selectedProject?.id + '/' + item.url
                                // Check if the current pathname matches the menu item's path
                                const isActive =
                                    pathname === href ||
                                    pathname.startsWith(href + "/") // for subroutes

                                return (<SidebarMenuItem key={item.title}>
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
                            <Link
                                href="/auth/logout"
                                className="block w-full text-left text-sm text-muted-foreground hover:underline">
                                Logout
                            </Link>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

        </Sidebar >
    )
}