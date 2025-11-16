export type DomainDnsRecordDto = {
    type: string;
    host: string;
    data: string;
    valid: boolean;
};

export type Domain = {
    id: number;
    domain: string;
    subdomain: string;
    valid: boolean;
    dns?: Record<string, DomainDnsRecordDto>;
};