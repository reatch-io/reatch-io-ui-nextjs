import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { SegmentFilter } from "@/models/segment";
import api from "@/api/auth/app-api";
import { useParams } from "next/navigation";
import { TagsInput } from "@/components/ui/tags-input";
import { DatePicker } from "@/components/ui/date-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { da } from "date-fns/locale";


type Attribute = {
    name: string;
    type: "STRING_LIST" | "NUMBER_LIST" | "NUMBER" | "DATE" | "DATE_TIME" | "STRING" | "BOOLEAN";
};

type EventDefinition = {
    name: string
    attributeDefinitions: Attribute[]
}

type CustomersAttributes = {
    customAttributes: Attribute[]
    eventsDefinitions: EventDefinition[]
};

const profileAttributes = [
    { value: "customerId", label: "Customer ID", type: "DATE_TIME" },
    { value: "firstName", label: "First Name", type: "STRING" },
    { value: "lastName", label: "Last Name", type: "STRING" },
    { value: "email", label: "Email", type: "STRING" },
    { value: "phoneNumber", label: "Phone Number", type: "STRING" },
    { value: "country", label: "Country", type: "STRING" }
];

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

type SegmentFilterProps = {
    idx: number;
    filter: SegmentFilter;
    onRemoveFilter: () => void;
    onFilterChange: (idx: number, filter: SegmentFilter) => void;
};

function getAttributeType(
    property: string,
    attributes?: CustomersAttributes
): Attribute["type"] | undefined {
    const profile = profileAttributes.find(attr => attr.value === property);
    if (profile) return profile.type as Attribute["type"];

    if (attributes?.customAttributes) {
        const custom = attributes.customAttributes.find(attr => `attributes.${attr.name}` === property);
        if (custom) return custom.type;
    }

    if (attributes?.eventsDefinitions) {
        for (const event of attributes.eventsDefinitions) {
            if (`events.${event.name}.time` === property) return "DATE_TIME";
            for (const attr of event.attributeDefinitions) {
                if (`events.${event.name}.${attr.name}` === property) return attr.type;
            }
        }
    }

    return undefined;
}

export function SegmentFilterComponent({
    onRemoveFilter,
    onFilterChange,
    idx,
    filter = { field: "", operator: "EQUALS", value: "", nextLogic: "AND" },
    readOnly = false
}: SegmentFilterProps & { idx: number; nextlogic?: string; readOnly?: boolean }) {

    const [property, setProperty] = useState<string>(filter?.field || "");
    const [operator, setOperator] = useState<SegmentFilter["operator"] | "EQUALS">(filter?.operator || "EQUALS");
    const [value, setValue] = useState<any>(filter?.value || "");
    const [localNextLogic] = useState<SegmentFilter["nextLogic"] | undefined>(filter?.nextLogic);
    const [attributes, setAttributes] = useState<CustomersAttributes>();
    const params = useParams();
    const { projectId } = params as { projectId: string };

    useEffect(() => {
        api.get("/api/segments/customers/attributes", {
            headers: {
                "Content-Type": "application/json",
                "X-Project-ID": projectId,
            }
        })
            .then((response) => {
                setAttributes(response.data);
                setProperty(filter?.field || "");
                setOperator(filter?.operator || "EQUALS");
                setValue(filter?.value || "");
            });
    }, []);

    // Call onFilterChange whenever property, operator, value, or nextlogic changes
    useEffect(() => {
        onFilterChange(idx, {
            field: property,
            operator,
            value,
            nextLogic: localNextLogic ?? "AND",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [property, operator, value, localNextLogic]);

    const attributeType = getAttributeType(property, attributes);

    const allowedOperators = attributeType
        ? operators.filter(op => operatorMap[attributeType]?.includes(op.value))
        : operators;

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
                disabled={readOnly}
            >
                <SelectTrigger className="grow" disabled={readOnly}>
                    <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Profile</SelectLabel>
                        {profileAttributes.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                                {p.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                    {attributes?.customAttributes && attributes.customAttributes.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Custom attributes</SelectLabel>
                            {attributes.customAttributes.map((attr) => (
                                <SelectItem key={"attributes." + attr.name} value={"attributes." + attr.name}>
                                    {attr.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    )}
                    {attributes?.eventsDefinitions && attributes.eventsDefinitions.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Custom events</SelectLabel>
                            {attributes.eventsDefinitions.map((event) => (
                                <SelectItem key={"events." + event.name + ".time"} value={"events." + event.name + ".time"}>
                                    {event.name} at
                                </SelectItem>
                            ))}
                            {attributes.eventsDefinitions.map((event) => (
                                event.attributeDefinitions.map((attr) => (
                                    <SelectItem key={"events." + event.name + ".attributes." + attr.name} value={"events." + event.name + ".attributes." + attr.name}>
                                        {event.name} with {attr.name}
                                    </SelectItem>
                                ))
                            ))}
                        </SelectGroup>
                    )}
                </SelectContent>
            </Select>
            <Select
                onValueChange={value => {
                    if (readOnly) return;
                    setOperator(value as SegmentFilter["operator"]);
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
        </div >
    );

    function setupValueInput() {
        const attributeType = getAttributeType(property, attributes);

        // If operator is IN or NOT_IN, always use TagsInput
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
}