export type SegmentFilter = {
    field: string
    operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_EQUALS" | "LESS_THAN" | "LESS_THAN_EQUALS" | "IN" | "NOT_IN" | "EXISTS" | "NOT_EXISTS" | "LIKE"
    value: any
    nextLogic: "AND" | "OR"
}

export type SegmentGroup = {
    filters: SegmentFilter[],
    nextLogic: "AND" | "OR"
}


export type Segment = {
    id: string
    name: string
    description: string
    groups: SegmentGroup[]
    createdAt: string
    updatedAt: string
    customersCount: number
    growth: number
    avgOrderValue: number
    lifetimeValue: number
    totalRevenue: number
    retentionRate: number
    churnRate: number
    engagementRate: number
    avgSessionDuration: number
    avgPageViews: number
    peakActivity: number
    
}

export type SegmentsInsights = {
    totalSegments: number
    customersSegmented: number
    coverageRate: number
}