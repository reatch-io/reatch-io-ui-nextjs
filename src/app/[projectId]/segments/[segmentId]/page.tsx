'use client'

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SegmentGroup } from "@/models/segment";
import { Badge } from "@/components/ui/badge";
import { SegmentGroups } from "@/components/ui/segment-groups";
import api from "@/api/auth/app-api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, BarChart2, PieChart, LayoutDashboard } from "lucide-react";
import { InfoBox } from "@/components/ui/info-box";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SegmentOverview from "./segment-overview";
import { CustomerTableClient } from "../../customers/customers-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function SegmentDetailsPage() {
    const params = useParams();
    const { projectId, segmentId } = params as { projectId: string; segmentId: string };
    const [segment, setSegment] = useState<any>(null);
    const [tab, setTab] = useState("overview");

    useEffect(() => {
        api.get(`/api/segments/${segmentId}`)
            .then(res => setSegment(res.data))
            .catch(err => console.error(err));
    }, [projectId, segmentId]);

    if (!segment) {
        return (
            <div className="p-8">
                <div className="mb-6 flex items-center justify-between">
                    <Skeleton className="h-10 w-40 rounded" />
                    <Skeleton className="h-10 w-32 rounded" />
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <Skeleton className="h-8 w-64 mb-2 rounded" />
                        <Skeleton className="h-5 w-96 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-8">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded" />
                    ))}
                </div>
                <div className="mb-8">
                    <Skeleton className="h-12 w-full rounded" />
                </div>
                <div className="flex flex-col gap-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-40 w-full rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <Link href={`.`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Segments
                    </Button>
                </Link>
                <Link href={`${segmentId}/edit`} passHref>
                    <Button className="bg-gradient-primary text-white">
                        Edit Segment
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{segment.name}</h3>
                    <p className="leading-7">{segment.description}</p>
                </div>
            </div>
            {/* Info boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-8">
                <InfoBox
                    description="Total Customers"
                    title={segment.customersCount ?? "-"}
                />
                <InfoBox
                    description="Total Revenue"
                    title={segment.totalRevenue ?? "$4.2M"}
                    className="text-green-700"
                />
                <InfoBox
                    description="Retention Rate"
                    title={segment.retentionRate != null ? `${segment.retentionRate}%` : "78.5%"}
                    className="text-blue-700"
                />
                <InfoBox
                    description="Engagement Rate"
                    title={segment.engagementRate != null ? `${segment.engagementRate}%` : "65.3%"}
                    className="text-purple-700"
                />
            </div>
            {/* Tabs */}
            <Tabs value={tab} onValueChange={setTab} className="mb-8">
                <TabsList className="flex w-full justify-start gap-2">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <LayoutDashboard size={18} />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="customers" className="flex items-center gap-2">
                        <Users size={18} />
                        Customers
                        <span className="text-xs">
                            ({segment.customersCount ?? 0})
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="flex items-center gap-2">
                        <BarChart2 size={18} />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <PieChart size={18} />
                        Analytics
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="pt-6">
                    <SegmentOverview segment={segment} />
                </TabsContent>
                <TabsContent value="customers" className="pt-6">
                    <CustomerTableClient segmentId={segment.id} />
                </TabsContent>
                <TabsContent value="performance" className="pt-6">
                    {/* You can add your performance charts or stats here */}
                    <div className="text-muted-foreground">Performance content goes here.</div>
                </TabsContent>
                <TabsContent value="analytics" className="pt-6">
                    {/* You can add your analytics charts or stats here */}
                    <div className="text-muted-foreground">Analytics content goes here.</div>
                </TabsContent>
            </Tabs>
        </div>
    );
}