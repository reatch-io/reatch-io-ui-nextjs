"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Filter, Clock, Calendar } from "lucide-react";
import { Campaign, TriggerConfig, ActionBasedDelivery, DEFAULT_ACTION_BASED_DELIVERY, DelayType } from "@/models/campaign";
import api from "@/api/auth/app-api";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ActionBasedGroups } from "@/components/ui/action-based-groups";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const delayTypeOptions = [
    { value: "IMMEDIATELY", label: "Immediately" },
    { value: "AFTER_NUMBER_OF_DAYS", label: "After Number of Days" },
];

export default function ActionBasedDeliveryComponent({ campaign, isReadOnly }: { campaign: Campaign; isReadOnly?: boolean }) {
    const params = useParams();
    const { projectId, campaignId } = params as { projectId: string; campaignId: string };

    const [actionBasedDelivery, setActionBasedDelivery] = useState<ActionBasedDelivery>(() =>
        ({ ...DEFAULT_ACTION_BASED_DELIVERY })
    );

    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [delayTimeInput, setDelayTimeInput] = useState<string>("");

    // Create refs for each trigger
    const triggerRefs = useRef<any[]>([]);

    useEffect(() => {
        setLoading(true);
        api.get(
            `/api/campaigns/${campaignId}/delivery`,
            {
                headers: {
                    "X-Project-ID": projectId,
                },
            }
        )
            .then((response) => {
                const data = response.data;
                setActionBasedDelivery({ ...DEFAULT_ACTION_BASED_DELIVERY, ...(data || {}) });

                // Extract time from delayTime if it exists
                if (data?.delayTime) {
                    const date = new Date(data.delayTime);
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    setDelayTimeInput(`${hours}:${minutes}`);
                }
            })
            .catch((error) => {
                console.error("Failed to load delivery settings:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [campaignId, projectId]);

    // Update refs array when triggers change
    useEffect(() => {
        triggerRefs.current = triggerRefs.current.slice(0, actionBasedDelivery.triggers.length);
    }, [actionBasedDelivery.triggers.length]);

    const handleAddTrigger = () => {
        setActionBasedDelivery((prev) => ({
            ...prev,
            triggers: [
                ...prev.triggers,
                {
                    eventName: "",
                    filterGroups: []
                }
            ]
        }));
    };

    const handleRemoveTrigger = (index: number) => {
        if (actionBasedDelivery.triggers.length > 1) {
            setActionBasedDelivery((prev) => ({
                ...prev,
                triggers: prev.triggers.filter((_, i) => i !== index)
            }));
        }
    };

    const handleDelayTypeChange = (value: string) => {
        setActionBasedDelivery((prev) => ({
            ...prev,
            delayType: value as DelayType,
        }));
    };

    const handleAfterNumberOfDaysChange = (value: number) => {
        setActionBasedDelivery((prev) => ({
            ...prev,
            afterNumberOfDays: value
        }));
    };

    const handleDelayTimeChange = (time: string) => {
        setDelayTimeInput(time);
    };

    const convertTimeToDateTime = (timeString: string): string => {
        // Create a date object with today's date and the specified time
        const now = new Date();
        const [hours, minutes] = timeString.split(':');

        const dateTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            parseInt(hours),
            parseInt(minutes),
            0,
            0
        );

        // Format as ISO string to match the starting date format
        return dateTime.toISOString();
    };

    const handleSave = async () => {
        // Collect data from all trigger refs
        const triggers: TriggerConfig[] = [];

        for (let i = 0; i < triggerRefs.current.length; i++) {
            const ref = triggerRefs.current[i];
            if (ref) {
                const eventName = ref.getEventName();
                const filterGroups = ref.getGroups();

                if (!eventName) {
                    toast.error(`Please select an event for Trigger ${i + 1}`);
                    return;
                }

                triggers.push({
                    eventName,
                    filterGroups: filterGroups.map((group: any) => ({
                        filters: group.filters.filter((f: any) => f.field && f.operator),
                        nextLogic: group.nextLogic
                    }))
                });
            }
        }

        // Validate starting date
        if (!actionBasedDelivery.startingDate) {
            toast.error("Please select a starting date");
            return;
        }

        // Validate end date is after starting date if provided
        if (actionBasedDelivery.endingDate && actionBasedDelivery.endingDate <= actionBasedDelivery.startingDate) {
            toast.error("End date must be after starting date");
            return;
        }

        // Validate delay configuration
        if (actionBasedDelivery.delayType === "AFTER_NUMBER_OF_DAYS") {
            if (!actionBasedDelivery.afterNumberOfDays || actionBasedDelivery.afterNumberOfDays <= 0) {
                toast.error("Please enter a valid number of days");
                return;
            }
            if (!delayTimeInput) {
                toast.error("Please select a delay time");
                return;
            }
        }

        // Prepare payload with converted time
        const payload = {
            ...actionBasedDelivery,
            type: "ACTION_BASED",
            triggers,
            delayTime: actionBasedDelivery.delayType === "AFTER_NUMBER_OF_DAYS" && delayTimeInput
                ? convertTimeToDateTime(delayTimeInput)
                : undefined
        };

        setIsSaving(true);
        try {
            await api.post(
                `/api/campaigns/${campaignId}/delivery`,
                payload,
                {
                    headers: {
                        "X-Project-ID": projectId,
                    },
                }
            );
            toast.success("Action-based delivery settings saved successfully.");
        } catch (error) {
            console.error("Failed to save:", error);
            toast.error("Failed to save action-based delivery settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <p>Loading delivery settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Triggers Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Event Triggers
                        </CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddTrigger}
                            className="flex items-center gap-2"
                            disabled={isReadOnly}
                        >
                            <Plus size={16} />
                            Add Trigger
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    {actionBasedDelivery.triggers.map((trigger, index) => (
                        <Card key={index} className="border-2 relative">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-lg">Trigger {index + 1}</h4>
                                    {actionBasedDelivery.triggers.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveTrigger(index)}
                                            className="text-destructive hover:text-destructive"
                                            disabled={isReadOnly}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ActionBasedGroups
                                    ref={(el) => {
                                        if (el) {
                                            triggerRefs.current[index] = el;
                                        }
                                    }}
                                    initialGroups={trigger.filterGroups}
                                    initialEventName={trigger.eventName}
                                    readOnly={isReadOnly}
                                />
                            </CardContent>
                        </Card>
                    ))}

                    {actionBasedDelivery.triggers.length === 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddTrigger}
                            className="flex items-center gap-2"
                            disabled={isReadOnly}
                        >
                            <Plus size={16} />
                            Add Your First Trigger
                        </Button>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            💡 <strong>How it works:</strong> The campaign will be triggered when any of the specified events occur with matching attribute filters. If multiple triggers are defined, the campaign will trigger if ANY of them match.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Delay Configuration Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Delivery Timing
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Delay Type</Label>
                        <Select
                            value={actionBasedDelivery.delayType || "IMMEDIATELY"}
                            onValueChange={handleDelayTypeChange}
                            disabled={isReadOnly}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select delay type" />
                            </SelectTrigger>
                            <SelectContent>
                                {delayTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Choose when to send the campaign after the trigger event
                        </p>
                    </div>

                    {/* After Number of Days Configuration */}
                    {actionBasedDelivery.delayType === "AFTER_NUMBER_OF_DAYS" && (
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Number of Days</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="Enter days"
                                        value={actionBasedDelivery.afterNumberOfDays || ""}
                                        onChange={(e) => handleAfterNumberOfDaysChange(parseInt(e.target.value) || 0)}
                                        disabled={isReadOnly}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Delay Time</Label>
                                    <Input
                                        type="time"
                                        placeholder="09:00"
                                        value={delayTimeInput}
                                        onChange={(e) => handleDelayTimeChange(e.target.value)}
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Campaign will be sent {actionBasedDelivery.afterNumberOfDays || 0} day(s) after the trigger event at {delayTimeInput || "00:00"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Campaign Schedule Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Campaign Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label>
                                Starting Date <span className="text-destructive">*</span>
                            </Label>
                            <DateTimePicker
                                value={actionBasedDelivery.startingDate ? new Date(actionBasedDelivery.startingDate) : undefined}
                                onChangeAction={(date) => date && setActionBasedDelivery({ ...actionBasedDelivery, startingDate: date })}
                                className="w-full"
                                disabled={isReadOnly}
                            />
                            <p className="text-xs text-muted-foreground">
                                Campaign will start accepting triggers from this date
                            </p>
                        </div>
                        <div className="space-y-2 mt-2">
                            <Label>End Date (Optional)</Label>
                            <DateTimePicker
                                value={actionBasedDelivery.endingDate ? new Date(actionBasedDelivery.endingDate) : undefined}
                                onChangeAction={(date) => setActionBasedDelivery({ ...actionBasedDelivery, endingDate: date })}
                                className="w-full"
                                disabled={isReadOnly}
                            />
                            <p className="text-xs text-muted-foreground">
                                Campaign will stop accepting triggers after this date
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center gap-3">
                <Button
                    onClick={handleSave}
                    disabled={isSaving || actionBasedDelivery.triggers.length === 0 || !actionBasedDelivery.startingDate || isReadOnly}
                    className="bg-gradient-primary"

                >
                    {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
            </div>
        </div>
    );
}