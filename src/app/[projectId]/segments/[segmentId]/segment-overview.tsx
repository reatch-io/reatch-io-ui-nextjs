'use client'

import { SegmentGroups } from "@/components/ui/segment-groups";
import { Segment, SegmentGroup } from "@/models/segment";

export default function SegmentOverview({ segment }: { segment: Segment }) {
    return (
        <div className="flex flex-col gap-6">
            {/* Segment Details Card */}
            <div className="rounded-lg border bg-card shadow-sm p-6 flex flex-col w-full">
                <h4 className="font-semibold text-lg mb-4">Segment Details</h4>
                <div className="flex flex-row gap-4">
                    <div className="grow">
                        <div className="text-xs text-muted-foreground mb-1">Created At</div>
                        <div>
                            {segment.createdAt
                                ? new Date(segment.createdAt).toLocaleString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })
                                : "-"}
                        </div>
                    </div>
                    <div className="grow">
                        <div className="text-xs text-muted-foreground mb-1">Last Updated</div>
                        <div>
                            {segment.updatedAt
                                ? new Date(segment.updatedAt).toLocaleString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })
                                : "-"}
                        </div>
                    </div>
                    <div className="grow">
                        <div className="text-xs text-muted-foreground mb-1">Growth</div>
                        <span className={segment.growth > 0 ? "text-green-600" : "text-red-600"}>
                            {segment.growth > 0 ? `+${segment.growth}%` : `${segment.growth}%`} this month
                        </span>
                    </div>
                </div>
            </div>
            {/* Filter Conditions Card */}
            <div className="rounded-lg border bg-card shadow-sm p-6 flex flex-col w-full">
                <h4 className="font-semibold text-lg mb-2">Filter Conditions</h4>
                <SegmentGroups initialGroups={segment.groups as SegmentGroup[]} readOnly />
            </div>
            {/* Metrics Cards Row */}
            {/* <div className="flex flex-col md:flex-row gap-6 w-full">
                <div className="rounded-lg border bg-card shadow-sm p-6 flex flex-col w-full md:w-1/3">
                    <h4 className="font-semibold text-lg mb-2">Revenue Metrics</h4>
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Average Order Value:</span>
                        <span className="font-bold">{segment.avgOrderValue ?? "-"}</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Lifetime Value:</span>
                        <span className="font-bold">{segment.lifetimeValue ?? "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Revenue:</span>
                        <span className="font-bold">{segment.totalRevenue ?? "-"}</span>
                    </div>
                </div>
                <div className="rounded-lg border bg-card shadow-sm p-6 flex flex-col w-full md:w-1/3">
                    <h4 className="font-semibold text-lg mb-2">Customer Health</h4>
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Retention Rate:</span>
                        <span className="font-bold">{segment.retentionRate != null ? `${segment.retentionRate}%` : "-"}</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Churn Rate:</span>
                        <span className="font-bold">{segment.churnRate != null ? `${segment.churnRate}%` : "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Engagement Rate:</span>
                        <span className="font-bold">{segment.engagementRate != null ? `${segment.engagementRate}%` : "-"}</span>
                    </div>
                </div>
                
                <div className="rounded-lg border bg-card shadow-sm p-6 flex flex-col w-full md:w-1/3">
                    <h4 className="font-semibold text-lg mb-2">Behavior Insights</h4>
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Session Duration:</span>
                        <span className="font-bold">{segment.avgSessionDuration ?? "-"}</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg Page Views:</span>
                        <span className="font-bold">{segment.avgPageViews ?? "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Peak Activity:</span>
                        <span className="font-bold">{segment.peakActivity ?? "-"}</span>
                    </div>
                </div>
            </div> */}
        </div>
    );
}