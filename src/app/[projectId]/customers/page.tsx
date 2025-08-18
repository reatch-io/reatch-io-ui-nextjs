'use client'

import { InfoBox } from "@/components/ui/info-box";
import { Customer } from "./customers-columns";
import { CustomerTableClient } from "./customers-list";
import { useEffect, useState } from "react";
import api from "@/api/auth/app-api";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { PaginationState } from "@tanstack/react-table";

export default function CustomersPage() {
    const [data, setData] = useState<Customer[]>([])
    const [totalElements, setTotalElements] = useState(0)
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const pathname = window.location.pathname;
    const projectId = pathname.split("/")[2];

    useEffect(() => {
        setIsLoading(true);
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setIsLoading(false);
        }, 2000);
        return () => {
            clearTimeout(handler);
            setIsLoading(false);
        };
    }, [search]);

    useEffect(() => {
        api.get(`http://localhost:9090/api/customers?page=${page}&size=${pageSize}&search=${search}`, {
            headers: {
                "X-Project-ID": "123456"
            }
        }).then((response) => {
            setData(response.data.content)
            setTotalElements(response.data.totalElements)
        })
    }, [page, pageSize, debouncedSearch]);

    const handlePaginationChange = (pagination: PaginationState) => {
        setPage(pagination.pageIndex);
        setPageSize(pagination.pageSize);
    }

    return (
        <div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Customers</h3>
            <p className="leading-7">Manage your customer database and import new contacts.</p>
            <div className="flex flex-row gap-4 mt-6 w-full">
                <InfoBox title="12,847" description="Total Customers"></InfoBox>
                <InfoBox title="8,923" description="Active Customers" titleClassName="text-green-600"></InfoBox>
                <InfoBox title="2,341" description="New This Month" titleClassName="text-blue-600"></InfoBox>
                <InfoBox title="3,924" description="Inactive Customers" titleClassName="text-purple-600"></InfoBox>
            </div>
            <div className="py-10" style={{ height: "calc(-14.7rem + 100vh)", paddingTop: "1.5rem" }}>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="flex-1 grow text-lg font-semibold">Customers list</h4>
                    {isLoading && (
                            <span className="text-gray-400 animate-spin mr-2">
                                <Loader2 size={18} />
                            </span>
                        )}
                    <Input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search customers..."
                        className="border rounded px-3 py-2 text-sm w-64"
                    />
                    
                </div>
                <div style={{ height: "calc(-21.8rem + 100vh)" }}>
                    <CustomerTableClient
                        data={data}
                        totalElements={totalElements}
                        onPaginationChange={handlePaginationChange}
                    />
                </div>
            </div>
        </div>
    );
}