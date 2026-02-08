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
import { Campaign } from "@/models/campaign";
import { CampaignAnalytics, CampaignsAnalytics } from "@/models/analytics";

export default function CampaignsPage() {
    const [data, setData] = useState<Campaign[]>([])
    const [totalElements, setTotalElements] = useState(0)
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [isLoading, setIsLoading] = useState(false);
    const [campaignsAnalytics, setCampaignsAnalytics] = useState<CampaignsAnalytics>();

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
        api.get(`/api/analytics/campaigns`, {
            headers: {
                "X-Project-ID": projectId
            }
        }).then((response) => {
            setCampaignsAnalytics(response.data)
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
                    title={campaignsAnalytics?.total != null ? String(campaignsAnalytics.total) : "—"}
                    description="Total Campaigns"
                />
                <InfoBox
                    title={campaignsAnalytics?.active != null ? String(campaignsAnalytics.active) : "—"}
                    description="Active Campaigns"
                    titleClassName="text-green-600"
                />
                <InfoBox
                    title={campaignsAnalytics?.totalSent != null ? String(campaignsAnalytics.totalSent) : "—"}
                    description="Messages Sent"
                    titleClassName="text-green-600"
                />
                <InfoBox
                    title={campaignsAnalytics?.openRate != null ? String(campaignsAnalytics.openRate) + "%" : "—"}
                    description="Average Open Rate"
                    titleClassName="text-green-600"
                />
                <InfoBox
                    title={campaignsAnalytics?.clickRate != null ? String(campaignsAnalytics.clickRate) + "%" : "—"}
                    description="Average Click Rate"
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