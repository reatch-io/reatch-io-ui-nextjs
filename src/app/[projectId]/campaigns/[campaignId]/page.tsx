'use client'

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Campaign } from "@/models/campaign";
import CampaignDelivery from "@/components/campaigns/campaign-delivery";
import CampaignChannels from "@/components/campaigns/campaign-channels";
import TargetAudience from "@/components/campaigns/target-audience";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";


const steps = [
    "Compose messages",
    "Schedule Delivery",
    "Target audiences",
];

function Stepper({ currentStep, onStepClick }: { currentStep: number; onStepClick: (idx: number) => void }) {
    return (
        <div className="flex justify-center">
            <div className="flex items-center gap-4 mb-8">
                {steps.map((step, idx) => (
                    <div key={step} className="flex items-center cursor-pointer select-none" onClick={() => onStepClick(idx)}>
                        <div className={`flex items-center justify-center rounded-full w-8 h-8 text-sm font-bold
                            ${idx === currentStep
                                ? "border-2 bg-gradient-primary text-white"
                                : "bg-gray-200 text-gray-400"}
                        `}>
                            {idx + 1}
                        </div>
                        <div className={`ml-2 mr-4 text-sm ${idx === currentStep ? "font-semibold text-primary" : "text-gray-500"}`}>
                            {step}
                        </div>
                        {idx < steps.length - 1 && (
                            <div className="w-8 h-0.5 bg-gray-300" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Helper to get badge color based on status
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

export default function CampaignPage() {
    const params = useParams();
    const { projectId, campaignId } = params as { projectId: string; campaignId: string };
    const [campaign, setCampaign] = useState<Campaign>();
    const [currentStep, setCurrentStep] = useState(0);


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

    // Action handlers
    const handleAction = (action: string) => {
        if (!campaign) return;
        let apiUrl = `/api/campaigns/${campaignId}/status/change`;
        api.post(apiUrl, { action: action.toUpperCase() }, { headers: { "X-Project-ID": projectId } })
            .then(() => {
                toast.success("Status updated");
                // Reload campaign
                return api.get(`/api/campaigns/${campaignId}`, {
                    headers: { "X-Project-ID": projectId },
                });
            })
            .then((response) => {
                setCampaign(response.data);
            })
            .catch(() => {
                toast.error("Failed to update status");
            });
    };

    // Determine actions based on status
    const getActions = () => {
        switch (campaign?.status) {
            case "DRAFT":
                return [
                    { label: "Launch", value: "launch" },
                    { label: "Archive", value: "archive" },
                ];
            case "ACTIVE":
                return [
                    { label: "Pause", value: "pause" },
                ];
            case "PAUSED":
                return [
                    { label: "Resume", value: "resume" },
                    { label: "Archive", value: "archive" },
                ];
            case "ARCHIVED":
                return [
                    { label: "Unarchive", value: "unarchive" },
                ];
            default:
                return [];
        }
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <Link href={`.`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Campaigns
                    </Button>
                </Link>
                {/* Actions as horizontal buttons */}
                {campaign && (
                    <div className="flex gap-2">
                        {getActions().map((action, idx) => (
                            <Button
                                key={action.value}
                                variant={idx === 0 ? "default" : "outline"}
                                className={idx === 0 ? "bg-gradient-primary" : ""}
                                onClick={() => handleAction(action.value)}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
            {/* Campaign name and description at the top */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                            {campaign?.name || <span className="text-muted-foreground">Campaign Name</span>}
                        </h3>
                        {campaign?.status && (
                            <Badge
                                className={`uppercase border ${getStatusBadgeClass(campaign.status)}`}
                            >
                                {campaign.status}
                            </Badge>
                        )}
                    </div>
                    <p className="leading-7">
                        {campaign?.description || <span className="text-muted-foreground">Campaign description</span>}
                    </p>
                </div>
            </div>
            <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
            {currentStep === 0 && (
                <div className="grid w-full items-center gap-3 border rounded-lg p-6 mt-6 mb-6">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">Compose Messages</h3>
                    <div className="mb-4">
                        <CampaignChannels />
                    </div>
                </div>
            )}
            {currentStep === 1 && (
                <div className="grid w-full items-center gap-3 border rounded-lg p-6 mt-6 mb-6">
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">Schedule Delivery</h3>
                    {campaign && <CampaignDelivery />}
                </div>
            )}
            {currentStep === 2 && (
                <TargetAudience />
            )}
        </div>
    );
}