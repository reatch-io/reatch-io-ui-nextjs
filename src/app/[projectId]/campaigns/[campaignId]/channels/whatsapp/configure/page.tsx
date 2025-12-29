"use client";

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { WhatsAppTemplate } from "@/models/whatsapp";

export default function WhatsAppChannelConfigurePage() {
    const params = useParams();
    const { projectId, campaignId } = params as { projectId: string; campaignId: string };
    const router = useRouter();
    
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch WhatsApp templates
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const res = await api.get("/api/whatsapp/templates/lite", {
                    headers: { "X-Project-ID": projectId }
                });
                setTemplates(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load WhatsApp templates");
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [projectId]);

    // Fetch existing configuration
    useEffect(() => {
        const fetchConfiguration = async () => {
            try {
                const res = await api.get(`/api/whatsapp/templates/campaigns/${campaignId}`, {
                    headers: { "X-Project-ID": projectId }
                });
                if (res.data?.templateId) {
                    setSelectedTemplateId(res.data.templateId);
                }
            } catch (err) {
                console.error(err);
                // It's OK if there's no configuration yet
            }
        };

        fetchConfiguration();
    }, [projectId, campaignId]);

    const handleSave = async () => {
        if (!selectedTemplateId) {
            toast.error("Please select a template");
            return;
        }

        try {
            setSaving(true);
            await api.post(
                `/api/whatsapp/templates/${selectedTemplateId}/campaigns/${campaignId}/setup`,
                {},
                {
                    headers: { "X-Project-ID": projectId }
                }
            );
            toast.success("WhatsApp channel configured successfully");
            router.push(`/${projectId}/campaigns/${campaignId}`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <Link href={`/${projectId}/campaigns/${campaignId}`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Campaign
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Configure WhatsApp Channel</h1>
                <p className="text-sm text-muted-foreground mt-1">Configure the WhatsApp channel for this campaign.</p>
            </div>

            <div className="max-w-2xl space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">WhatsApp Template</label>
                    {loading ? (
                        <div className="text-sm text-muted-foreground">Loading templates...</div>
                    ) : (
                        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground">No templates available</div>
                                ) : (
                                    templates.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{template.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Select the WhatsApp template to use for this campaign
                    </p>
                </div>

                <div className="flex justify-start gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={!selectedTemplateId || saving}
                        className="bg-gradient-primary"
                    >
                        {saving ? "Saving..." : "Save Configuration"}
                    </Button>
                    <Link href={`/${projectId}/campaigns/${campaignId}`}>
                        <Button variant="ghost">Cancel</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}