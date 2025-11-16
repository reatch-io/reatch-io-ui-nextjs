"use client";

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Campaign } from "@/models/campaign";
import { CheckCircle, Mail, MessageCircle, Bell } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const channelOptions = [
	{ value: "email", label: "Email", icon: <Mail size={16} className="text-blue-600" /> },
	{ value: "whatsapp", label: "WhatsApp", icon: <MessageCircle size={16} className="text-green-600" /> },
	{ value: "push", label: "Push Notifications", icon: <Bell size={16} className="text-purple-600" /> },
];

const channelApis = {
    email: (projectId: string, campaignId: string) =>
        api.get(`/api/email/${campaignId}`, { headers: { "X-Project-ID": projectId } }),
    whatsapp: (projectId: string, campaignId: string) =>
        api.get(`/api/whatsapp/campaigns/${campaignId}`, { headers: { "X-Project-ID": projectId } }),
    push: (projectId: string, campaignId: string) =>
        api.get(`/api/push/campaigns/${campaignId}`, { headers: { "X-Project-ID": projectId } }),
};

export default function CampaignChannels() {
	const router = useRouter();
    const params = useParams();
    const { projectId, campaignId } = params as { projectId: string; campaignId: string };

    const [channelStatus, setChannelStatus] = useState<Record<string, { loading: boolean; configured: boolean }>>({
        email: { loading: true, configured: false },
        whatsapp: { loading: true, configured: false },
        push: { loading: true, configured: false },
    });

    useEffect(() => {
        channelOptions.forEach((ch) => {
            setChannelStatus((prev) => ({
                ...prev,
                [ch.value]: { ...prev[ch.value], loading: true }
            }));
            channelApis[ch.value as keyof typeof channelApis](projectId, campaignId)
                .then(res => {
                    setChannelStatus((prev) => ({
                        ...prev,
                        [ch.value]: { loading: false, configured: true }
                    }));
                })
                .catch(() => {
                    setChannelStatus((prev) => ({
                        ...prev,
                        [ch.value]: { loading: false, configured: false }
                    }));
                });
        });
    }, [projectId, campaignId]);

	return (
		<div>
			<div className="font-semibold mb-2">Channels</div>
			<div className="flex flex-col gap-4 mt-2">
				{channelOptions.map((ch) => (
					<div key={ch.value} className="border rounded p-4 flex items-center gap-4">
						<div className="flex items-center gap-2">
							{ch.icon}
							<span className="font-semibold">{ch.label}</span>
						</div>
						<div className="ml-auto flex items-center gap-2">
							{channelStatus[ch.value]?.loading ? (
								<Skeleton className="h-5 w-5 rounded-full" />
							) : channelStatus[ch.value]?.configured ? (
								<CheckCircle className="text-green-600" size={20} />
							) : (
								<span className="text-xs text-muted-foreground">Not configured</span>
							)}
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									router.push(
										`/${projectId}/campaigns/${campaignId}/channels/${ch.value}/configure`
									)
								}
							>
								{channelStatus[ch.value]?.configured ? "Edit" : "Configure"}
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}