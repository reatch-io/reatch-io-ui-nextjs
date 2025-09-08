"use client";

import { useEffect, useState } from "react";
import { InfoBox } from "@/components/ui/info-box";
import { CustomerTableClient } from "./customers-list";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import api from "@/api/auth/app-api";
import { CustomersInsights } from "@/models/customer";
import { useParams } from "next/navigation";

export default function CustomersPage() {
    const [insights, setInsights] = useState<CustomersInsights>();
    const params = useParams();
    const { projectId } = params as { projectId: string };

    useEffect(() => {
        api
            .get("/api/customers/insights", {
                headers: {
                    "X-Project-ID": projectId
                }
            })
            .then((res) => setInsights(res.data))
            .catch(() => { });
    }, []);

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                        Customers
                    </h3>
                    <p className="leading-7">
                        Manage your customer database and import new contacts.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`customers/import`} passHref>
                        <Button variant="outline">
                            <UploadIcon /> Import CSV
                        </Button>
                    </Link>
                    <Link href={`customers/add`} passHref>
                        <Button className="bg-gradient-primary">Add customer</Button>
                    </Link>
                </div>
            </div>
            <div className="flex flex-row gap-4 mt-6 w-full">
                <InfoBox
                    title={insights?.totalCustomers !== undefined ? String(insights.totalCustomers) : "—"}
                    description="Total Customers"
                />
                <InfoBox
                    title={insights?.activeCustomers !== undefined ? String(insights.activeCustomers) : "—"}
                    description="Active Customers"
                    titleClassName="text-green-600"
                />
                <InfoBox
                    title={insights?.newThisMonth !== undefined ? String(insights.newThisMonth) : "—"}
                    description="New This Month"
                    titleClassName="text-blue-600"
                />
                <InfoBox
                    title={insights?.inactiveCustomers !== undefined ? String(insights.inactiveCustomers) : "—"}
                    description="Inactive Customers"
                    titleClassName="text-purple-600"
                />
            </div>
            <CustomerTableClient />
        </div>
    );
}