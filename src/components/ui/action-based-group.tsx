"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ActionBasedFilterComponent } from "./action-based-filter";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Filter as CampaignFilter } from "@/models/campaign";
import { useEffect } from "react";

type ActionBasedGroupProps = {
  filters: CampaignFilter[];
  index: number;
  eventName: string;
  onFiltersChange: (filters: CampaignFilter[]) => void;
  readOnly?: boolean;
};

const LOGIC_OPTIONS = [
  { value: "AND", label: "AND" },
  { value: "OR", label: "OR" },
];

export function ActionBasedGroupComponent({ filters, index, eventName, onFiltersChange, readOnly }: ActionBasedGroupProps) {
  useEffect(() => {
    if (!filters || filters.length === 0) {
      onFiltersChange([{} as CampaignFilter]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const getNextLogic = (filter: CampaignFilter) => filter.nextLogic || "AND";

  const handleAddFilter = () => {
    onFiltersChange([...filters, {} as CampaignFilter]);
  };

  const handleRemoveFilter = (idx: number) => {
    if (filters.length > 1) {
      onFiltersChange(filters.filter((_, i) => i !== idx));
    }
  };

  const handleFilterChange = (idx: number, filter: CampaignFilter) => {
    const updated = [...filters];
    updated[idx] = { ...updated[idx], ...filter };
    onFiltersChange(updated);
  };

  const handleNextLogicChange = (idx: number, value: string) => {
    const updated = [...filters];
    updated[idx] = { ...updated[idx], nextLogic: value as "AND" | "OR" };
    onFiltersChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <span className="font-semibold text-lg">{`Filter Group ${index}`}</span>
        {!readOnly && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="ml-2 flex items-center gap-2"
            onClick={handleAddFilter}
            aria-label="Add filter"
          >
            <Plus size={18} />
            Add Filter
          </Button>
        )}
      </div>
      <div className="border rounded p-4">
        {filters.map((filter, idx) => (
          <div key={idx} className={idx !== filters.length - 1 ? "mb-4" : ""}>
            <ActionBasedFilterComponent
              idx={idx}
              eventName={eventName}
              onRemoveFilter={() => handleRemoveFilter(idx)}
              onFilterChange={handleFilterChange}
              filter={filter}
              readOnly={readOnly}
            />
            {idx < filters.length - 1 && (
              <div className="flex my-2">
                <Select
                  value={getNextLogic(filter)}
                  onValueChange={val => handleNextLogicChange(idx, val)}
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOGIC_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}