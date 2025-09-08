"use client";

import { Button } from "@/components/ui/button";
import api from "@/api/auth/app-api";
import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { DateTimePicker } from "../ui/date-time-picker";
import { DatePicker } from "../ui/date-picker";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Campaign, ScheduledDelivery } from "@/models/campaign";
import { format } from "date-fns";

const frequencyOptions = [
    { value: "ONCE", label: "Once" },
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
];

const endingTypeOptions = [
    { value: "NEVER", label: "Never" },
    { value: "AFTER_NUMBER_OF_RECURRENCE", label: "After number of recurrences" },
    { value: "ON_SPECIFIC_DATE", label: "On specific date" },
];

const daysOfWeek = [
    { value: "MONDAY", label: "Mon" },
    { value: "TUESDAY", label: "Tue" },
    { value: "WEDNESDAY", label: "Wed" },
    { value: "THURSDAY", label: "Thu" },
    { value: "FRIDAY", label: "Fri" },
    { value: "SATURDAY", label: "Sat" },
    { value: "SUNDAY", label: "Sun" },
];

export default function ScheduledDeliveryComponent({ campaign }: { campaign: Campaign }) {
    const params = useParams();
    const { projectId, campaignId } = params as { projectId: string; campaignId: string };
    const [scheduledDelivery, setScheduledDelivery] = useState<ScheduledDelivery>();
    const [loading, setLoading] = useState(false);

    // Load schedule information from API
    useEffect(() => {
        setLoading(true);
        api.get(
            `/api/campaigns/${campaignId}/schedule`
        )
            .then((response) => {
                const data = response.data;
                setScheduledDelivery(data);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [campaignId]);

    // Helper to update scheduledDelivery fields
    function updateField<K extends keyof ScheduledDelivery>(key: K, value: ScheduledDelivery[K]) {
        setScheduledDelivery(prev => prev ? { ...prev, [key]: value } : { [key]: value } as unknown as ScheduledDelivery);
    }

    const handleDayToggle = (day: string) => {
        const selectedDays = scheduledDelivery?.selectedDays || [];
        if (selectedDays.includes(day)) {
            updateField("selectedDays", selectedDays.filter((d) => d !== day));
        } else {
            updateField("selectedDays", [...selectedDays, day]);
        }
    };

    function handleSave() {
        setLoading(true);
        api.post(
            `/api/campaigns/${campaignId}/schedule`,
            scheduledDelivery,
            {
                headers: { "X-Project-ID": projectId },
            }
        )
            .then(() => {
                toast.success("Campaign schedule updated successfully.");
            })
            .catch(() => {
                toast.error("Could not save schedule.");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    // Read values from scheduledDelivery object
    const frequency = scheduledDelivery?.frequency || "ONCE";
    const startingDate = scheduledDelivery?.startingDate ? new Date(scheduledDelivery.startingDate) : undefined;
    const recurrence = scheduledDelivery?.recurrence ?? 1;
    const endingType = scheduledDelivery?.endingType || "NEVER";
    const endingDate = scheduledDelivery?.endingDate || "";
    const endingRecurrence = scheduledDelivery?.endingRecurrence ?? 1;
    const selectedDays = scheduledDelivery?.selectedDays || [];

    // Helper to generate summary text (memoized for performance)
    const summaryText = useMemo(() => {
        if (!startingDate) return null;

        const formattedDate = format(startingDate, "dd-MM-yyyy HH:mm");
        let summary = "";

        if (frequency === "ONCE") {
            summary = `The campaign will run once at ${formattedDate}`;
        } else if (frequency === "DAILY") {
            summary = `The campaign will run every ${recurrence > 1 ? `${recurrence} days` : "day"} starting from ${formattedDate}`;
        } else if (frequency === "WEEKLY") {
            const days = selectedDays.length
                ? selectedDays.map(d => daysOfWeek.find(dw => dw.value === d)?.label).filter(Boolean).join(", ")
                : "no days selected";
            summary = `The campaign will run every ${recurrence > 1 ? `${recurrence} weeks` : "week"} on ${days} starting from ${formattedDate}`;
        } else if (frequency === "MONTHLY") {
            summary = `The campaign will run every ${recurrence > 1 ? `${recurrence} months` : "month"} starting from ${formattedDate}`;
        }

        // Add ending type/ending date to summary if not ONCE
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
    }, [frequency, startingDate, recurrence, selectedDays, endingType, endingDate]);

    return (
        <div className="mt-6 p-4 border rounded">
            <p className="font-semibold mb-2">Scheduled Delivery</p>
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium mb-1">Frequency</label>
                    <Select value={frequency} onValueChange={val => updateField("frequency", val as ScheduledDelivery["frequency"])}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            {frequencyOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                    <DateTimePicker
                        value={startingDate}
                        onChangeAction={val => updateField("startingDate", val ? new Date(val).toISOString() : "")}
                        step={900} // 15 minutes
                    />
                </div>
                {frequency !== "ONCE" && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Recurrence</label>
                        <Input
                            type="number"
                            min={1}
                            className="w-full border rounded px-3 py-2"
                            value={recurrence}
                            onChange={e => updateField("recurrence", Number(e.target.value))}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            {frequency === "DAILY" && recurrence > 1 && (
                                <>This campaign will repeat every {recurrence} days.</>
                            )}
                            {frequency === "DAILY" && recurrence === 1 && (
                                <>This campaign will repeat every day.</>
                            )}
                            {frequency === "WEEKLY" && recurrence > 1 && (
                                <>This campaign will repeat every {recurrence} weeks.</>
                            )}
                            {frequency === "WEEKLY" && recurrence === 1 && (
                                <>This campaign will repeat every week.</>
                            )}
                            {frequency === "MONTHLY" && recurrence > 1 && (
                                <>This campaign will repeat every {recurrence} months.</>
                            )}
                            {frequency === "MONTHLY" && recurrence === 1 && (
                                <>This campaign will repeat every month.</>
                            )}
                        </div>
                    </div>
                )}
                {frequency === "WEEKLY" && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Days of Week</label>
                        <div className="flex gap-2 flex-wrap">
                            {daysOfWeek.map(day => (
                                <button
                                    type="button"
                                    key={day.value}
                                    className={`px-2 py-1 rounded border text-xs ${selectedDays.includes(day.value)
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white text-gray-700 border-gray-300"
                                        }`}
                                    onClick={() => handleDayToggle(day.value)}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {/* Only show ending type if frequency is not ONCE */}
                {frequency !== "ONCE" && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Ending Type</label>
                        <Select value={endingType} onValueChange={val => updateField("endingType", val as ScheduledDelivery["endingType"])}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select ending type" />
                            </SelectTrigger>
                            <SelectContent>
                                {endingTypeOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                {frequency !== "ONCE" && endingType === "ON_SPECIFIC_DATE" && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Ending Date</label>
                        <DatePicker
                            value={endingDate ? new Date(endingDate) : undefined}
                            onChangeAction={val =>
                                updateField("endingDate", val ? new Date(val).toISOString() : "")
                            }
                            className="w-full"
                            disabled={false}
                        />
                    </div>
                )}
                {frequency !== "ONCE" && endingType === "AFTER_NUMBER_OF_RECURRENCE" && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Ending Recurrence</label>
                        <Input
                            type="number"
                            min={1}
                            className="w-full border rounded px-3 py-2"
                            value={endingRecurrence}
                            onChange={e => updateField("endingRecurrence", Number(e.target.value))}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                            The campaign will stop after {endingRecurrence} {endingRecurrence === 1 ? "recurrence" : "recurrences"}.
                        </div>
                    </div>
                )}
            </div>
            {summaryText && (
                <blockquote className="mt-6 border-l-2 pl-6 text-sm">{summaryText}</blockquote>
            )}
            <div className="flex mt-6">
                <Button onClick={handleSave} className="bg-gradient-primary" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </Button>
            </div>
        </div>
    );
}