'use client'

import { InfoBox } from "@/components/ui/info-box";
import { useEffect, useState } from "react";
import api from "@/api/auth/app-api";
import { Input } from "@/components/ui/input";
import { Loader2, PlusIcon, UploadIcon } from "lucide-react";
import { PaginationState } from "@tanstack/react-table";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SegmentTableClient } from "./segments-list";
import { Segment, SegmentsInsights } from "@/models/segment";

export default function SegmentsPage() {
    const [data, setData] = useState<Segment[]>([])
    const [totalElements, setTotalElements] = useState(0)
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [isLoading, setIsLoading] = useState(false);
    const [segmentsInsights, setSegmentsInsights] = useState<SegmentsInsights>();

    const router = useRouter();

    const params = useParams();
    const { projectId } = params as { projectId: string };

    useEffect(() => {
        setIsLoading(true);
        api.get(`/api/segments?page=${page}&size=${pageSize}`, {
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
        api.get(`/api/segments/insights`, {
            headers: {
                "X-Project-ID": projectId
            }
        }).then((response) => {
            setSegmentsInsights(response.data)
        }).catch(() => {
        });
    }, [projectId]);

    const handlePaginationChange = (pagination: PaginationState) => {
        setPage(pagination.pageIndex);
        setPageSize(pagination.pageSize);
    }

    function handleRowClick(row: Segment): void {
        router.push(`segments/${row.id}`);
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Customers Segments</h3>
                    <p className="leading-7">Create and manage dynamic customer segments for targeted campaigns.</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`segments/add`} passHref>
                        <Button className="bg-gradient-primary">
                            <PlusIcon /> Add Segment
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="flex flex-row gap-4 mt-6 w-full">
                <InfoBox
                    title={segmentsInsights?.totalSegments != null ? String(segmentsInsights.totalSegments) : "—"}
                    description="Total Segments"
                />
                <InfoBox
                    title={segmentsInsights?.customersSegmented != null ? String(segmentsInsights.customersSegmented) : "—"}
                    description="Customers Segmented"
                    titleClassName="text-green-600"
                />
                <InfoBox
                    title={
                        segmentsInsights?.coverageRate != null
                            ? `${segmentsInsights.coverageRate}%`
                            : "—"
                    }
                    description="Coverage Rate"
                    titleClassName="text-blue-600"
                />
            </div>
            <div className="py-10" style={{ height: "calc(-14.7rem + 100vh)", paddingTop: "1.5rem" }}>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="flex-1 grow text-lg font-semibold">Segments list</h4>
                </div>
                <div style={{ height: "calc(-21.8rem + 100vh)" }}>
                    {isLoading ? (
                        <DataTableSkeleton />
                    ) : (
                        <SegmentTableClient
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