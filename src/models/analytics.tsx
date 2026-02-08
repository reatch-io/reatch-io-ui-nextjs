export type DashboardStats = {
    totalCampaigns: number;
    activeCampaigns: number;
    totalCustomers: number;
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
    openRate: number;
    clickRate: number;
    recentCampaigns: CampaignAnalytics[];
}

export type CampaignAnalytics = {
    id: string;
    name: string;
    status: string;
    deliveryType: string;
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
    lastSent: string;
}

export type CampaignsAnalytics = {
    total: number;
    active: number;
    openRate: number;
    clickRate: number;
    totalSent: number;
};
