"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Filter as CampaignFilter } from "@/models/campaign";
import api from "@/api/auth/app-api";
import { useParams } from "next/navigation";
import { TagsInput } from "@/components/ui/tags-input";
import { DatePicker } from "@/components/ui/date-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";

type Attribute = {
    name: string;
    type: "STRING_LIST" | "NUMBER_LIST" | "NUMBER" | "DATE" | "DATE_TIME" | "STRING" | "BOOLEAN";
};

type EventDefinition = {
    name: string;
    attributeDefinitions: Attribute[];
};

const operators = [
    { value: "EQUALS", label: "Equals" },
    { value: "NOT_EQUALS", label: "Not Equals" },
    { value: "GREATER_THAN", label: "Greater Than" },
    { value: "GREATER_THAN_EQUALS", label: "Greater Than or Equals" },
    { value: "LESS_THAN", label: "Less Than" },
    { value: "LESS_THAN_EQUALS", label: "Less Than or Equals" },
    { value: "IN", label: "In" },
    { value: "NOT_IN", label: "Not In" },
    { value: "EXISTS", label: "Exists" },
    { value: "NOT_EXISTS", label: "Not Exists" },
    { value: "LIKE", label: "Like" }
];

const operatorMap: Record<string, string[]> = {
    STRING_LIST: ["EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS", "LIKE"],
    NUMBER_LIST: ["EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS"],
    NUMBER: [
        "EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS",
        "GREATER_THAN", "GREATER_THAN_EQUALS", "LESS_THAN", "LESS_THAN_EQUALS", "IN", "NOT_IN"
    ],
    DATE: [
        "EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS",
        "GREATER_THAN", "GREATER_THAN_EQUALS", "LESS_THAN", "LESS_THAN_EQUALS"
    ],
    DATE_TIME: [
        "EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS",
        "GREATER_THAN", "GREATER_THAN_EQUALS", "LESS_THAN", "LESS_THAN_EQUALS"
    ],
    STRING: [
        "EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS", "IN", "NOT_IN", "LIKE"
    ],
    BOOLEAN: ["EQUALS", "NOT_EQUALS", "EXISTS", "NOT_EXISTS"]
};

type ActionBasedFilterProps = {
    idx: number;
    filter: CampaignFilter;
    eventName: string;
    onRemoveFilter: () => void;
    onFilterChange: (idx: number, filter: CampaignFilter) => void;
    readOnly?: boolean;
};

function getAttributeType(
    property: string,
    eventDefinition?: EventDefinition
): Attribute["type"] | undefined {
    if (!eventDefinition) return undefined;

    // Check if property is event time
    if (property === "time") return "DATE_TIME";

    // Check event attributes
    const attr = eventDefinition.attributeDefinitions.find(a => a.name === property);
    return attr?.type;
}

export function ActionBasedFilterComponent({
    onRemoveFilter,
    onFilterChange,
    idx,
    filter = { field: "", operator: "EQUALS", value: "", nextLogic: "AND" },
    eventName,
    readOnly = false
}: ActionBasedFilterProps) {

    const [property, setProperty] = useState<string>(filter?.field || "");
    const [operator, setOperator] = useState<CampaignFilter["operator"] | "EQUALS">(filter?.operator || "EQUALS");
    const [value, setValue] = useState<any>(filter?.value || "");
    const [localNextLogic] = useState<CampaignFilter["nextLogic"] | undefined>(filter?.nextLogic);
    const [eventDefinition, setEventDefinition] = useState<EventDefinition>();
    const params = useParams();
    const { projectId } = params as { projectId: string };

    useEffect(() => {
        if (!eventName) return;

        api.get(`/api/segments/customers/attributes`, {
            headers: {
                "Content-Type": "application/json",
                "X-Project-ID": projectId,
            }
        })
            .then((response) => {
                // get attributes for the specific event
                const eventDef = response.data.eventsDefinitions.find((ev: any) => ev.name === eventName);
                setEventDefinition(eventDef);
                setProperty(filter?.field || "");
                setOperator(filter?.operator || "EQUALS");
                setValue(filter?.value || "");
            })
            .catch((error) => {
                console.error("Failed to load event definition:", error);
            });
    }, [eventName, projectId]);

    useEffect(() => {
        onFilterChange(idx, {
            field: property,
            operator,
            value,
            nextLogic: localNextLogic ?? "AND",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [property, operator, value, localNextLogic]);

    const attributeType = getAttributeType(property, eventDefinition);

    const allowedOperators = attributeType
        ? operators.filter(op => operatorMap[attributeType]?.includes(op.value))
        : operators;

    function setupValueInput() {
        const attributeType = getAttributeType(property, eventDefinition);

        if (operator === "IN" || operator === "NOT_IN") {
            return (
                <TagsInput
                    value={Array.isArray(value) ? value : value ? [value] : []}
                    onChange={vals => !readOnly && setValue(vals)}
                    type={attributeType === "NUMBER" || attributeType === "NUMBER_LIST" ? "number" : "text"}
                    disabled={readOnly}
                />
            );
        }

        let valueInput: React.ReactNode = (
            <Input
                className="w-40 grow"
                placeholder="Value"
                value={value}
                onChange={e => setValue(e.target.value)}
                disabled={readOnly}
            />
        );

        if (attributeType === "NUMBER" || attributeType === "NUMBER_LIST") {
            if (attributeType === "NUMBER_LIST") {
                valueInput = (
                    <TagsInput
                        value={Array.isArray(value) ? value : value ? [value] : []}
                        onChange={vals => !readOnly && setValue(vals)}
                        type="number"
                        disabled={readOnly}
                    />
                );
            } else {
                valueInput = (
                    <Input
                        className="w-40 grow"
                        type="number"
                        placeholder="Value"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        disabled={readOnly}
                    />
                );
            }
        } else if (attributeType === "DATE" || attributeType === "DATE_TIME") {
            if (attributeType === "DATE") {
                let dateValue: Date | undefined = undefined;
                if (value instanceof Date) {
                    dateValue = value;
                } else if (typeof value === "string" && value) {
                    const parsed = new Date(value);
                    if (!isNaN(parsed.getTime())) dateValue = parsed;
                }
                valueInput = (
                    <DatePicker
                        value={dateValue}
                        onChangeAction={date => !readOnly && setValue(date)}
                        className="grow"
                        disabled={readOnly}
                    />
                );
            } else {
                let dateTimeValue: Date | undefined = undefined;
                if (value instanceof Date) {
                    dateTimeValue = value;
                } else if (typeof value === "string" && value) {
                    const parsed = new Date(value);
                    if (!isNaN(parsed.getTime())) dateTimeValue = parsed;
                }
                valueInput = (
                    <DateTimePicker
                        className="w-40 grow"
                        value={dateTimeValue}
                        onChangeAction={date => !readOnly && setValue(date)}
                        disabled={readOnly}
                    />
                );
            }
        } else if (attributeType === "BOOLEAN") {
            valueInput = (
                <Select value={value} onValueChange={val => !readOnly && setValue(val)} disabled={readOnly}>
                    <SelectTrigger className="w-40 grow" disabled={readOnly}>
                        <SelectValue placeholder="Value" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                </Select>
            );
        } else if (attributeType === "STRING_LIST") {
            valueInput = (
                <TagsInput
                    value={Array.isArray(value) ? value : value ? [value] : []}
                    onChange={vals => !readOnly && setValue(vals)}
                    type="text"
                    disabled={readOnly}
                />
            );
        }
        return valueInput;
    }

    return (
        <div className="flex items-center gap-2 border rounded p-3 bg-gray-50">
            <Select
                onValueChange={value => {
                    if (readOnly) return;
                    setProperty(value);
                    setOperator("EQUALS");
                    setValue([]);
                }}
                value={property}
                disabled={readOnly || !eventDefinition}
            >
                <SelectTrigger className="grow" disabled={readOnly || !eventDefinition}>
                    <SelectValue placeholder="Select attribute" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Event Properties</SelectLabel>
                        <SelectItem value="time">Event Time</SelectItem>
                        {eventDefinition?.attributeDefinitions.map((attr) => (
                            <SelectItem key={attr.name} value={attr.name}>
                                {attr.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select
                onValueChange={value => {
                    if (readOnly) return;
                    setOperator(value as CampaignFilter["operator"]);
                    setValue([]);
                }}
                value={operator}
                disabled={readOnly}
            >
                <SelectTrigger className="grow" disabled={readOnly}>
                    <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Operators</SelectLabel>
                        {allowedOperators.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                                {p.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <div
                className="flex grow"
                style={{
                    visibility:
                        property && operator && operator !== "EXISTS" && operator !== "NOT_EXISTS"
                            ? "visible"
                            : "hidden"
                }}
            >
                {setupValueInput()}
            </div>
            {!readOnly && (
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => onRemoveFilter()}
                    aria-label="Remove filter"
                >
                    <Trash2 size={18} />
                </Button>
            )}
        </div>
    );
}