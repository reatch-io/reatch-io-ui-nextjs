export type Campaign = {
    id: string;
    name: string;
    description: string;
    channel: string;
    status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";
    deliveryType: DeliveryType;
    createdAt: string;
    segmentId: string;
    totalSent: number;
    totalOpens: number;
    openRate: number;
    totalClicks: number;
    clickRate: number;
    lastSent: string;
};

export type CampaignsInsights = {
    totalCampaigns: number;
    activeCampaigns: number;
    pausedCampaigns: number;
    archivedCampaigns: number;
    averageOpenRate: number;
    messagesSent: number;
};

export type DeliveryType = "SCHEDULED" | "ACTION_BASED" | "API_TRIGGERED";

export type ScheduledDelivery = {
    type: DeliveryType;
    scheduleId: string;
    frequency: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";
    startingDate: string;
    recurrence: number;
    endingType: "NEVER" | "AFTER_NUMBER_OF_RECURRENCE" | "ON_SPECIFIC_DATE";
    endingDate: string;
    endingRecurrence: number;
    selectedDays: string[];
}

export const DEFAULT_SCHEDULED_DELIVERY: ScheduledDelivery = {
    type: "SCHEDULED",
    scheduleId: "",
    frequency: "ONCE",
    startingDate: new Date().toISOString(),
    recurrence: 1,
    endingType: "NEVER",
    endingDate: "",
    endingRecurrence: 1,
    selectedDays: [],
};

export type ActionBasedDelivery = {
    type: DeliveryType;
    id: string;
    triggers: TriggerConfig[];
    delayType: DelayType;
    afterNumberOfDays: number;
    delayTime: string;
    startingDate: string;
    endingDate: string | undefined;
}

export type TriggerConfig = {
    eventName: string;
    filterGroups: FilterGroup[];
}

export type FilterGroup = {
    filters: Filter[];
    nextLogic: LogicalOperator;
}

export type Filter = {
    field: string;
    operator: FilterOperator;
    value: any;
    nextLogic: LogicalOperator;
}

export type LogicalOperator = "AND" | "OR";

export type FilterOperator =
    | "EQUALS"
    | "NOT_EQUALS"
    | "GREATER_THAN"
    | "GREATER_THAN_EQUALS"
    | "LESS_THAN"
    | "LESS_THAN_EQUALS"
    | "IN"
    | "NOT_IN"
    | "EXISTS"
    | "NOT_EXISTS"
    | "LIKE";

export type DelayType = "IMMEDIATELY" | "AFTER_NUMBER_OF_DAYS";

export const DEFAULT_ACTION_BASED_DELIVERY: ActionBasedDelivery = {
    type: "ACTION_BASED",
    id: "",
    triggers: [],
    delayType: "IMMEDIATELY",
    afterNumberOfDays: 1,
    delayTime: "09:00",
    startingDate: new Date().toISOString(),
    endingDate: "",
};