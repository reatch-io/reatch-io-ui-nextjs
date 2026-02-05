"use client";

import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ActionBasedGroupComponent } from "./action-based-group";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { FilterGroup } from "@/models/campaign";
import api from "@/api/auth/app-api";
import { useParams } from "next/navigation";
import { Label } from "@/components/ui/label";

const LOGIC_OPTIONS = [
    { value: "AND", label: "AND" },
    { value: "OR", label: "OR" },
];

type ActionBasedGroupsProps = {
    initialGroups?: FilterGroup[];
    initialEventName?: string;
    readOnly?: boolean;
};

export const ActionBasedGroups = forwardRef(function ActionBasedGroups(
    props: ActionBasedGroupsProps,
    ref
) {
    const createEmptyFilter = (): FilterGroup["filters"][number] => ({
        field: "",
        operator: "EQUALS",
        value: "",
        nextLogic: "AND",
    });

    const { initialGroups = [], initialEventName = "", readOnly } = props;
    const [groups, setGroups] = useState<FilterGroup[]>(
        initialGroups.length > 0 ? initialGroups : [{ filters: [createEmptyFilter()], nextLogic: "AND" }]
    );
    const [eventName, setEventName] = useState<string>(initialEventName);
    const [availableEvents, setAvailableEvents] = useState<string[]>([]);
    const params = useParams();
    const { projectId } = params as { projectId: string };

    useEffect(() => {
        api.get(`/api/segments/customers/attributes`, {
            headers: {
                "X-Project-ID": projectId,
            },
        })
            .then((response) => {
                setAvailableEvents(response.data.eventsDefinitions.map((event: any) => event.name));
            })
            .catch((error) => {
                console.error("Failed to load events:", error);
            });
    }, [projectId]);

    useImperativeHandle(ref, () => ({
        getEventName: () => eventName,
        getGroups: () => groups,
    }));

    const handleAddGroup = () => {
        setGroups((prev) => [...prev, { filters: [createEmptyFilter()], nextLogic: "AND" }]);
    };

    const handleRemoveGroup = (idx: number) => {
        setGroups((prev) => {
            const newGroups = prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev;
            return newGroups.map(group =>
                !group.filters || group.filters.length === 0
                    ? { ...group, filters: [createEmptyFilter()] }
                    : group
            );
        });
    };

    const handleFiltersChange = (idx: number, filters: FilterGroup["filters"]) => {
        setGroups((prev) =>
            prev.map((group, i) =>
                i === idx
                    ? { ...group, filters: filters.length === 0 ? [createEmptyFilter()] : filters }
                    : group
            )
        );
    };

    const handleLogicChange = (idx: number, value: string) => {
        setGroups((prev) =>
            prev.map((group, i) =>
                i === idx ? { ...group, nextLogic: value as "AND" | "OR" } : group
            )
        );
    };

    const handleEventChange = (value: string) => {
        setEventName(value);
        // Reset groups when event changes
        setGroups([{ filters: [createEmptyFilter()], nextLogic: "AND" }]);
    };

    return (
        <div className="space-y-6">
            {/* Event Selector */}
            <div className="space-y-2">
                <Label>Trigger Event</Label>
                <Select
                    value={eventName}
                    onValueChange={handleEventChange}
                    disabled={readOnly}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select event to trigger on" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableEvents.map((event) => (
                            <SelectItem key={event} value={event}>
                                {event}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                    Select the event that will trigger this action
                </p>
            </div>

            {/* Filter Groups - Only show if event is selected */}
            {eventName && (
                <div className="space-y-8">

                    {groups.map((group, idx) => (
                        <div key={idx} className="relative">
                            {idx > 0 && (
                                <div className="flex justify-center mb-2">
                                    <Select
                                        value={groups[idx - 1].nextLogic}
                                        onValueChange={(val) => handleLogicChange(idx - 1, val)}
                                        disabled={readOnly}
                                    >
                                        <SelectTrigger className="w-24">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LOGIC_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <ActionBasedGroupComponent
                                filters={group.filters}
                                index={idx + 1}
                                eventName={eventName}
                                onFiltersChange={(filters) => handleFiltersChange(idx, filters)}
                                readOnly={readOnly}
                            />
                            {groups.length > 1 && !readOnly && (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-2 right-2"
                                    onClick={() => handleRemoveGroup(idx)}
                                    aria-label="Remove group"
                                >
                                    <Trash2 size={18} />
                                </Button>
                            )}
                        </div>
                    ))}
                    {!readOnly && (
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-2"
                            onClick={handleAddGroup}
                        >
                            <Plus className="mr-2" size={18} />
                            Add Filter Group
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
});