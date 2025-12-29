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

export type WhatsAppTemplate = {
    id: string;
    name: string;
    category: string;
    status: string;
    language: string;
    type: TemplateType;
    body: string;
    variables: string[];
    media: string[];
    actions: ActionDto[];
    externalTemplateId: string;
    createdAt: string;
};

export type TemplateType = "TEXT" | "MEDIA" | "CALL_TO_ACTION";

export type ActionDto = {
    type: ActionType,
    title: string,
    url: string | null,
    phone: string | null,
    code: string | null
};
export type ActionType = "URL" | "PHONE_NUMBER" | "COPY_CODE";