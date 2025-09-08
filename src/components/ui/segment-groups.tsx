"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SegmentGroupComponent } from "./segment-group";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { SegmentGroup } from "@/models/segment"; // Import the type

const LOGIC_OPTIONS = [
    { value: "AND", label: "AND" },
    { value: "OR", label: "OR" },
];

export const SegmentGroups = forwardRef(function SegmentGroups(props: { initialGroups?: SegmentGroup[], readOnly?: boolean }, ref) {
     const createEmptyFilter = (): SegmentGroup["filters"][number] => ({
        field: "",
        operator: "EQUALS",
        value: "",
        nextLogic: "AND",
    });


    const { initialGroups = [{ filters: [createEmptyFilter()], nextLogic: "AND" }], readOnly } = props;
    const [groups, setGroups] = useState<SegmentGroup[]>(initialGroups);

    // Expose getGroups method to parent via ref
    useImperativeHandle(ref, () => ({
        getGroups: () => groups,
    }));

    const handleAddGroup = () => {
        setGroups((prev) => [...prev, { filters: [createEmptyFilter()], nextLogic: "AND" }]);
    };

    const handleRemoveGroup = (idx: number) => {
        setGroups((prev) => {
            const newGroups = prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev;
            // Ensure at least one filter exists in every group
            return newGroups.map(group =>
                !group.filters || group.filters.length === 0
                    ? { ...group, filters: [createEmptyFilter()] }
                    : group
            );
        });
    };

    const handleFiltersChange = (idx: number, filters: SegmentGroup["filters"]) => {
        console.log("Filters changed for group", idx, filters);
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

    return (
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
                    <SegmentGroupComponent
                        filters={group.filters}
                        index={idx + 1}
                        onFiltersChange={(filters) => handleFiltersChange(idx, filters)}
                        readOnly={readOnly}
                    />
                    {groups.length > 1 && (
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
                    Add Group
                </Button>
            )}
        </div>
    );
});