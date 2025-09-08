'use client'

import { InfoBox } from "@/components/ui/info-box";
import { useEffect, useState } from "react";
import api from "@/api/auth/app-api";
import { PlusIcon } from "lucide-react";
import { PaginationState } from "@tanstack/react-table";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CampaignsTableClient } from "./campaigns-list";
import { Campaign, CampaignsInsights } from "@/models/campaign";

export default function CampaignsPage() {
    const [data, setData] = useState<Campaign[]>([])
    const [totalElements, setTotalElements] = useState(0)
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [isLoading, setIsLoading] = useState(false);
    const [campaignsInsights, setCampaignsInsights] = useState<CampaignsInsights>();

    const router = useRouter();

    const params = useParams();
    const { projectId } = params as { projectId: string };

    useEffect(() => {
        setIsLoading(true);
        api.get(`/api/campaigns?page=${page}&size=${pageSize}`, {
            headers: {
                "X-Project-ID": projectId
            }
        }).then((response) => {
            setData(response.data.content)
            setTotalElements(response.data.totalElements)
            setIsLoading(false);
        }).catch(() => {
            setIsLoading(false);
        });
    }, [page, pageSize]);

    useEffect(() => {
        api.get(`/api/campaigns/insights`, {
            headers: {
                "X-Project-ID": projectId
            }
        }).then((response) => {
            setCampaignsInsights(response.data)
        }).catch(() => {
        });
    }, [projectId]);

    const handlePaginationChange = (pagination: PaginationState) => {
        setPage(pagination.pageIndex);
        setPageSize(pagination.pageSize);
    }

    function handleRowClick(row: Campaign): void {
        router.push(`campaigns/${row.id}`);
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Campaigns</h3>
                    <p className="leading-7">Create and manage your email and WhatsApp marketing campaigns.</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`campaigns/add`} passHref>
                        <Button className="bg-gradient-primary">
                            <PlusIcon /> Create Campaign
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="flex flex-row gap-4 mt-6 w-full">
                <InfoBox
                    title={campaignsInsights?.totalCampaigns != null ? String(campaignsInsights.totalCampaigns) : "—"}
                    description="Total Campaigns"
                />
                <InfoBox
                    title={campaignsInsights?.activeCampaigns != null ? String(campaignsInsights.activeCampaigns) : "—"}
                    description="Active Campaigns"
                    titleClassName="text-green-600"
                />
                <InfoBox
                    title={campaignsInsights?.messagesSent != null ? String(campaignsInsights.messagesSent) : "—"}
                    description="Messages Sent"
                    titleClassName="text-green-600"
                />
                <InfoBox
                    title={campaignsInsights?.averageOpenRate != null ? String(campaignsInsights.averageOpenRate) : "—"}
                    description="Average Open Rate"
                    titleClassName="text-green-600"
                />
            </div>
            <div className="py-10" style={{ height: "calc(-14.7rem + 100vh)", paddingTop: "1.5rem" }}>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="flex-1 grow text-lg font-semibold">Campaigns list</h4>
                </div>
                <div style={{ height: "calc(-21.8rem + 100vh)" }}>
                    {isLoading ? (
                        <DataTableSkeleton />
                    ) : (
                        <CampaignsTableClient
                            data={data}
                            totalElements={totalElements}
                            onPaginationChangeAction={handlePaginationChange}
                            onRowClickAction={handleRowClick}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}