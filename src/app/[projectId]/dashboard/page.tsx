'use client'

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/api/auth/app-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Users, 
    Mail, 
    MousePointerClick, 
    TrendingUp, 
    Send,
    Eye,
    Zap,
    Calendar,
    BarChart3,
    Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardStats {
    totalCampaigns: number;
    activeCampaigns: number;
    totalCustomers: number;
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
    openRate: number;
    clickRate: number;
    recentCampaigns: RecentCampaign[];
}

interface RecentCampaign {
    id: string;
    name: string;
    status: string;
    deliveryType: string;
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
    lastSent: string;
}

export default function DashboardPage() {
    const params = useParams();
    const { projectId } = params as { projectId: string };
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/api/analytics/dashboard`, {
            headers: {
                "X-Project-ID": projectId,
            },
        })
            .then((response) => {
                setStats(response.data);
            })
            .catch((error) => {
                console.error("Failed to load dashboard:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [projectId]);

    if (loading) {
        return (
            <div className="p-8 text-center">
                <p>Loading dashboard...</p>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Campaigns",
            value: stats?.totalCampaigns || 0,
            icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
            bgColor: "bg-blue-50",
            change: null,
        },
        {
            title: "Active Campaigns",
            value: stats?.activeCampaigns || 0,
            icon: <Activity className="w-5 h-5 text-green-600" />,
            bgColor: "bg-green-50",
            change: null,
        },
        {
            title: "Total Customers",
            value: stats?.totalCustomers || 0,
            icon: <Users className="w-5 h-5 text-purple-600" />,
            bgColor: "bg-purple-50",
            change: null,
        },
        {
            title: "Messages Sent",
            value: stats?.totalSent || 0,
            icon: <Send className="w-5 h-5 text-indigo-600" />,
            bgColor: "bg-indigo-50",
            change: null,
        },
        {
            title: "Total Opens",
            value: stats?.totalOpens || 0,
            icon: <Eye className="w-5 h-5 text-cyan-600" />,
            bgColor: "bg-cyan-50",
            change: null,
        },
        {
            title: "Total Clicks",
            value: stats?.totalClicks || 0,
            icon: <MousePointerClick className="w-5 h-5 text-orange-600" />,
            bgColor: "bg-orange-50",
            change: null,
        },
        {
            title: "Open Rate",
            value: `${stats?.openRate?.toFixed(1) || 0}%`,
            icon: <Mail className="w-5 h-5 text-pink-600" />,
            bgColor: "bg-pink-50",
            change: null,
        },
        {
            title: "Click Rate",
            value: `${stats?.clickRate?.toFixed(1) || 0}%`,
            icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
            bgColor: "bg-emerald-50",
            change: null,
        },
    ];

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "DRAFT":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "ACTIVE":
                return "bg-green-100 text-green-800 border-green-200";
            case "PAUSED":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "ARCHIVED":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-muted text-muted-foreground border-muted";
        }
    };

    const getDeliveryTypeIcon = (type: string) => {
        switch (type) {
            case "SCHEDULED":
                return <Calendar className="w-4 h-4 text-blue-600" />;
            case "ACTION_BASED":
                return <Zap className="w-4 h-4 text-yellow-600" />;
            default:
                return <Send className="w-4 h-4 text-gray-600" />;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        // include time
        const options: Intl.DateTimeFormatOptions = { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Overview of your campaigns and engagement metrics
                    </p>
                </div>
                <Link href={`/${projectId}/campaigns`}>
                    <Button className="bg-gradient-primary">
                        View All Campaigns
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-bold">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Campaigns */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Recent Campaigns
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {stats?.recentCampaigns && stats.recentCampaigns.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recentCampaigns.map((campaign) => (
                                <Link
                                    key={campaign.id}
                                    href={`/${projectId}/campaigns/${campaign.id}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex items-center gap-2">
                                                {getDeliveryTypeIcon(campaign.deliveryType)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold">{campaign.name}</h4>
                                                    <Badge className={`uppercase border ${getStatusBadgeClass(campaign.status)}`}>
                                                        {campaign.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Last sent: {formatDate(campaign.lastSent)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <p className="font-semibold">{campaign.totalSent ? campaign.totalSent : "-"}</p>
                                                <p className="text-muted-foreground">Sent</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold">{campaign.totalOpens ? campaign.totalOpens : "-"}</p>
                                                <p className="text-muted-foreground">Opens</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold">{campaign.totalClicks ? campaign.totalClicks : "-"}</p>
                                                <p className="text-muted-foreground">Clicks</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">No campaigns yet</p>
                            <Link href={`/${projectId}/campaigns`}>
                                <Button variant="outline">Create Your First Campaign</Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}