"use client";

import { useEffect, useState } from "react";
import { Calendar, Zap, Code2 } from "lucide-react";
import { Campaign, DeliveryType } from "@/models/campaign";
import ScheduledDeliveryComponent from "./scheduled-delivery";
import { useParams } from "next/navigation";
import api from "@/api/auth/app-api";

const deliveryTypes = [
    {
        value: "SCHEDULED",
        label: "Scheduled",
        icon: (
            <Calendar size={24} className="mb-2 mx-auto text-blue-600" />
        ),
        description: "Send your campaign at a specific date and time.",
    },
    {
        value: "ACTION_BASED",
        label: "Action Based",
        icon: <Zap size={24} className="mb-2 mx-auto text-yellow-500" />,
        description: "Trigger your campaign based on user actions or events.",
    },
    {
        value: "API_TRIGGERED",
        label: "API Triggered",
        icon: <Code2 size={24} className="mb-2 mx-auto text-purple-600" />,
        description: "Send your campaign by calling an API endpoint.",
    },
];

export default function CampaignDelivery() {

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

    return (
        <div className="space-y-6">
            <div>
                <div className="font-medium mb-2">Delivery Type</div>
                <div className="flex gap-4">
                    {deliveryTypes.map((type) => (
                        <div
                            key={type.value}
                            className={`flex-1 min-w-0 cursor-pointer border rounded-lg p-4 text-center transition
                                ${campaign?.deliveryType === type.value
                                    ? "border-primary bg-primary/10 text-primary font-semibold"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-primary"}
                            `}
                            onClick={() => setCampaign(prev => prev ? { ...prev, deliveryType: type.value as DeliveryType } : prev)}                        >
                            {type.icon}
                            <div>{type.label}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {type.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {campaign?.deliveryType === "SCHEDULED" && (
                <ScheduledDeliveryComponent campaign={campaign} />
            )}
            {campaign?.deliveryType === "ACTION_BASED" && (
                <div className="mt-6 p-4 border rounded bg-yellow-50">
                    <p className="font-semibold mb-2">Action Based Delivery</p>
                    <p>Configure triggers based on user actions or events.</p>
                    {/* Add your trigger configuration UI here */}
                </div>
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