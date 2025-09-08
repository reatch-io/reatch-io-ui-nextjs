"use client";

import { useEffect, useState } from "react";
import api from "@/api/auth/app-api";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { Campaign } from "@/models/campaign";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Segment } from "@/models/segment";
import { CustomerTableClient } from "@/app/[projectId]/customers/customers-list";


export default function TargetAudience() {
    const params = useParams();
    const { projectId, campaignId } = params as { projectId: string; campaignId: string };
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState<Campaign>();
    const [selectedSegment, setSelectedSegment] = useState<string | undefined>(campaign?.segmentId);
    const [saving, setSaving] = useState(false);

    const [segmentDetails, setSegmentDetails] = useState<Segment | null>(null);
    const [segmentDetailsLoading, setSegmentDetailsLoading] = useState(false);

    useEffect(() => {
        api.get(`/api/campaigns/${campaignId}`, {
            headers: {
                "X-Project-ID": projectId,
            },
        }).then((response) => {
            setCampaign(response.data);
        }).catch((error) => {
            console.error(error);
        });
    }, [campaignId, projectId]);

    useEffect(() => {
        setLoading(true);
        api.get("/api/segments/lite", {
            headers: {
                "X-Project-ID": projectId,
            },
        })
            .then(res => {
                setSegments(res.data || []);
            })
            .catch(() => {
                setSegments([]);
            })
            .finally(() => setLoading(false));
    }, [projectId]);

    useEffect(() => {
        if (campaign?.segmentId) {
            setSelectedSegment(campaign.segmentId);
        }
    }, [campaign?.segmentId]);

    useEffect(() => {
        if (!selectedSegment) {
            setSegmentDetails(null);
            return;
        }
        setSegmentDetailsLoading(true);
        api.get(`/api/segments/${selectedSegment}`, {
            headers: {
                "X-Project-ID": projectId,
            },
        })
            .then(res => {
                setSegmentDetails(res.data);
            })
            .catch(() => {
                setSegmentDetails(null);
            })
            .finally(() => setSegmentDetailsLoading(false));
    }, [selectedSegment, projectId]);

    const handleSave = () => {
        if (!selectedSegment) {
            toast.error("Please select a segment.");
            return;
        }
        setSaving(true);
        api.post(
            `/api/campaigns/${campaignId}/segment/${selectedSegment}`,
            {},
            { headers: { "X-Project-ID": projectId } }
        )
            .then(() => {
                toast.success("Segment saved successfully.");
                // Reload campaign after saving
                return api.get(`/api/campaigns/${campaignId}`, {
                    headers: {
                        "X-Project-ID": projectId,
                    },
                });
            })
            .then((response) => {
                setCampaign(response.data);
            })
            .catch(() => {
                toast.error("Failed to save segment.");
            })
            .finally(() => setSaving(false));
    };

    return (
        <div>
            <div className="grid w-full items-center gap-3 border rounded-lg p-6 mt-6 mb-6">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">Target Audiences</h3>
                <div className="font-semibold mb-2">Select Target Segment</div>
                {loading ? (
                    <Skeleton className="h-10 w-full rounded" />
                ) : (
                    <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a segment" />
                        </SelectTrigger>
                        <SelectContent>
                            {segments.map(segment => (
                                <SelectItem key={segment.id} value={segment.id}>
                                    {segment.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                
                <div className="flex mt-4">
                    <Button className="bg-gradient-primary" onClick={handleSave} disabled={saving || !selectedSegment}>
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
            <div className="grid w-full items-center gap-3 border rounded-lg p-6 mt-6 mb-6">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">Audience Summary</h3>
                {selectedSegment && (
                    <div className="mt-4">
                        {segmentDetailsLoading ? (
                            <Skeleton className="h-16 w-full rounded" />
                        ) : segmentDetails ? (
                            <div className="p-4 border rounded" data-testid="audience-summary">
                                <div className="font-semibold text-base mb-1">{segmentDetails.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    Customers in segment: <span className="font-bold">{segmentDetails.customersCount}</span>
                                </div>
                                <CustomerTableClient segmentId={selectedSegment} />
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}