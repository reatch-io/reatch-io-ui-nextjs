"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import api from "@/api/auth/app-api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Campaign } from "@/models/campaign";

function getStatusBadgeClass(status?: string) {
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
}

function getDeliverySummary(delivery?: any) {
    if (!delivery) return "No delivery schedule set.";
    const { frequency, startingDate, recurrence, endingType, endingDate, endingRecurrence, selectedDays } = delivery;
    if (!startingDate) return "No delivery schedule set.";

    const formattedDate = format(new Date(startingDate), "dd-MM-yyyy HH:mm");
    let summary = "";

    if (frequency === "ONCE") {
        summary = `The campaign will run once at ${formattedDate}`;
    } else if (frequency === "DAILY") {
        summary = `The campaign will run every ${recurrence > 1 ? `${recurrence} days` : "day"} starting from ${formattedDate}`;
    } else if (frequency === "WEEKLY") {
        const days = selectedDays && selectedDays.length
            ? selectedDays.join(", ")
            : "no days selected";
        summary = `The campaign will run every ${recurrence > 1 ? `${recurrence} weeks` : "week"} on ${days} starting from ${formattedDate}`;
    } else if (frequency === "MONTHLY") {
        summary = `The campaign will run every ${recurrence > 1 ? `${recurrence} months` : "month"} starting from ${formattedDate}`;
    }

    if (frequency !== "ONCE") {
        if (endingType === "NEVER") {
            summary += ", and will never end.";
        } else if (endingType === "AFTER_NUMBER_OF_RECURRENCE") {
            summary += `, and will end after ${endingRecurrence} ${endingRecurrence === 1 ? "recurrence" : "recurrences"}.`;
        } else if (endingType === "ON_SPECIFIC_DATE" && endingDate) {
            summary += `, and will end on ${format(new Date(endingDate), "dd-MM-yyyy")}.`;
        }
    }

    return summary;
}

export default function CampaignSummary() {
    const params = useParams();
    const { projectId, campaignId } = params as { projectId: string; campaignId: string };
    const [campaign, setCampaign] = useState<Campaign | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/api/campaigns/${campaignId}`, {
            headers: { "X-Project-ID": projectId },
        })
            .then((res) => setCampaign(res.data))
            .finally(() => setLoading(false));
    }, [projectId, campaignId]);

    if (loading) {
        return (
            <div className="p-8">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-5 w-1/4 mb-2" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Campaign not found.
            </div>
        );
    }

    // Delivery summary
    const deliverySummary = getDeliverySummary(campaign.deliveryType);

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{campaign.name}</h2>
                {campaign.status && (
                    <Badge className={`uppercase border ${getStatusBadgeClass(campaign.status)}`}>
                        {campaign.status}
                    </Badge>
                )}
            </div>
            <div className="mb-4 text-muted-foreground">{campaign.description}</div>
            <div className="mb-6">
                <div className="font-semibold mb-1">Created At:</div>
                <div>{campaign.createdAt ? new Date(campaign.createdAt).toLocaleString() : "-"}</div>
            </div>
            <div className="mb-6">
                <div className="font-semibold mb-1">Last Updated:</div>
                <div>{campaign.createdAt ? new Date(campaign.createdAt).toLocaleString() : "-"}</div>
            </div>
            <div className="mb-6">
                <div className="font-semibold mb-1">Segment:</div>
                <div>{campaign.segmentId || "Not set"}</div>
            </div>
            <div className="mb-6">
                <div className="font-semibold mb-1">Delivery</div>
                <div className="text-muted-foreground">{deliverySummary}</div>
            </div>
            <div className="mb-6">
                <div className="font-semibold mb-1">Target Audience</div>
                <div className="text-muted-foreground">
                    <div>{campaign.segmentId || "Not set"}</div>
                </div>
            </div>
        </div>
    );
}