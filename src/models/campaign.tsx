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
    id: string;
    frequency: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";
    startingDate: string;
    recurrence: number;
    endingType: "NEVER" | "AFTER_NUMBER_OF_RECURRENCE" | "ON_SPECIFIC_DATE";
    endingDate: string;
    endingRecurrence: number;
    selectedDays: string[];
}

