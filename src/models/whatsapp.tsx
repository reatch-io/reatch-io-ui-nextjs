export type Sender = {
    id: string;
    businessDisplayName: string;
    wabaId: string;
    phoneNumber: string;
    status: string;
    createdAt: string;
    profile: SenderProfile;
    messagingLimit: string;
    qualityRating: string;
};

export type SenderProfile = {
    about: string;
    name: string;
    vertical: string;
    websites: string[];
    address: string;
    logoUrl: string;
    emails: string[];
    description: string;
};

export type Account = {
    id: string;
    createdAt?: string;
    status?: string | null;
};
