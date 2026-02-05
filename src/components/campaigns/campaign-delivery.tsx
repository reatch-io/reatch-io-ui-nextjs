"use client";

import { useEffect, useState } from "react";
import { Calendar, Zap, Code2 } from "lucide-react";
import { Campaign, DeliveryType } from "@/models/campaign";
import ScheduledDeliveryComponent from "./scheduled-delivery";
import { useParams } from "next/navigation";
import api from "@/api/auth/app-api";
import ActionBasedDeliveryComponent from "./action-based-delivery";
import { Badge } from "@/components/ui/badge";

const deliveryTypes = [
    {
        value: "SCHEDULED",
        label: "Scheduled",
        icon: <Calendar size={20} className="text-blue-600" />,
        description: "Send your campaign at a specific date and time.",
    },
    {
        value: "ACTION_BASED",
        label: "Action Based",
        icon: <Zap size={20} className="text-yellow-500" />,
        description: "Trigger your campaign based on user actions or events.",
    },
    {
        value: "API_TRIGGERED",
        label: "API Triggered",
        icon: <Code2 size={20} className="text-purple-600" />,
        description: "Send your campaign by calling an API endpoint.",
    },
];

export default function CampaignDelivery({ isReadOnly = false }: { isReadOnly?: boolean }) {

    const params = useParams();
    const { projectId, campaignId } = params as { projectId: string; campaignId: string };
    const [campaign, setCampaign] = useState<Campaign>();


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

    const getDeliveryTypeInfo = (type: DeliveryType | undefined) => {
        return deliveryTypes.find((dt) => dt.value === type);
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="font-medium mb-4">Delivery Type</div>
                {isReadOnly ? (
                    <div>
                        {campaign?.deliveryType ? (
                            <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                                <div className="flex-shrink-0">
                                    {getDeliveryTypeInfo(campaign.deliveryType)?.icon}
                                </div>
                                <div className="flex flex-col">
                                    <Badge variant="outline" className="w-fit mb-1">
                                        {getDeliveryTypeInfo(campaign.deliveryType)?.label}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {getDeliveryTypeInfo(campaign.deliveryType)?.description}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <span className="text-muted-foreground">No delivery type selected</span>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {deliveryTypes.map((type) => (
                            <div
                                key={type.value}
                                className={`cursor-pointer border rounded-lg p-4 transition hover:shadow-md
                                    ${campaign?.deliveryType === type.value
                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                        : "border-gray-200 bg-white hover:border-primary/50"}
                                `}
                                onClick={() => setCampaign(prev => prev ? { ...prev, deliveryType: type.value as DeliveryType } : prev)}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    {type.icon}
                                    <div className={`font-semibold ${campaign?.deliveryType === type.value ? "text-primary" : "text-gray-900"}`}>
                                        {type.label}
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground leading-relaxed">
                                    {type.description}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {campaign?.deliveryType === "SCHEDULED" && (
                <ScheduledDeliveryComponent campaign={campaign} isReadOnly={isReadOnly} />
            )}
            {campaign?.deliveryType === "ACTION_BASED" && (
                <ActionBasedDeliveryComponent campaign={campaign} isReadOnly={isReadOnly} />
            )}
            {campaign?.deliveryType === "API_TRIGGERED" && (
                <div className="mt-6 p-4 border rounded bg-purple-50">
                    <p className="font-semibold mb-2">API Triggered Delivery</p>
                    <p>Integrate with your backend to trigger this campaign via API.</p>
                    {/* Add your API integration info here */}
                </div>
            )}
        </div>
    );
}