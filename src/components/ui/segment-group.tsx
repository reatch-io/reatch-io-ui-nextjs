"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SegmentFilterComponent } from "./segment-filter";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SegmentFilter } from "@/models/segment";
import { useEffect } from "react";

type SegmentGroupProps = {
  filters: SegmentFilter[];
  index: number;
  onFiltersChange: (filters: SegmentFilter[]) => void;
  readOnly?: boolean;
};

const LOGIC_OPTIONS = [
  { value: "AND", label: "AND" },
  { value: "OR", label: "OR" },
];

export function SegmentGroupComponent({ filters, index, onFiltersChange, readOnly }: SegmentGroupProps) {
  // Ensure at least one filter exists on mount or when filters become empty
  useEffect(() => {
    if (!filters || filters.length === 0) {
      onFiltersChange([{} as SegmentFilter]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Default to "AND" if not set
  const getNextLogic = (filter: SegmentFilter) => filter.nextLogic || "AND";

  const handleAddFilter = () => {
    onFiltersChange([...filters, {} as SegmentFilter]);
  };

  const handleRemoveFilter = (idx: number) => {
    if (filters.length > 1) {
      onFiltersChange(filters.filter((_, i) => i !== idx));
    }
  };

  const handleFilterChange = (idx: number, filter: SegmentFilter) => {
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
        <span className="font-semibold text-lg">{`Group ${index}`}</span>
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
            <SegmentFilterComponent
              idx={idx}
              onRemoveFilter={() => handleRemoveFilter(idx)}
              onFilterChange={handleFilterChange}
              filter={filter}
              readOnly={readOnly}
            />
            {/* Show nextlogic selector between filters, except after the last filter */}
            {idx < filters.length - 1 && (
              
              <div className="flex my-2">
                <Select
                  value={getNextLogic(filter)}
                  onValueChange={val => handleNextLogicChange(idx, val)}
                  disabled={readOnly} // <-- Make select read-only if readOnly is true
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