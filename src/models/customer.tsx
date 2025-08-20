export type CustomerAttribute = {
    key: string
    value: string
}

type CustomerEvent = {
  name: string;
  time: string;
  attributes: { key: string; value: string }[];
};

export type Customer = {
    systemId: string
    customerId: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    country: string
    createdAt: string
    lastActivity: string
    segment: string
    status: "Active" | "Inactive"
    totalSpent: string
    attributes: CustomerAttribute[]
    events: CustomerEvent[]
}