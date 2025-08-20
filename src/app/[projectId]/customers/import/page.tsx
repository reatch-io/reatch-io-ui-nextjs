'use client'

import api from "@/api/auth/app-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { ArrowLeft, RefreshCw, UploadIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner"
import { ImportHistoryTableClient } from "./imports-history-list";
import { PaginationState } from "@tanstack/react-table";
import Link from "next/link";
import { ImportHistory } from "@/models/import-history";
import { useParams } from "next/navigation";


export default function ImportCustomersPage() {

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [data, setData] = useState<ImportHistory[]>([])
    const [totalElements, setTotalElements] = useState(0)
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    const params = useParams();
    const { projectId } = params as { projectId: string };
    
    const handleClear = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            toast.error("Please select a CSV file to upload.")
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setIsUploading(true);
        try {
            await api.post("http://localhost:9090/api/customers/import", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-Project-ID": projectId,
                },
            });
            toast.success("File uploaded successfully!");
            handleClear();
            fetchHistory();
        } catch (error) {
            alert("Failed to upload file.");
        } finally {
            setIsUploading(false);
        }
    };

    const handlePaginationChange = (pagination: PaginationState) => {
        setPage(pagination.pageIndex);
        setPageSize(pagination.pageSize);
    }

    const fetchHistory = useCallback(() => {
        api.get(`http://localhost:9090/api/customers/imports?page=${page}&size=${pageSize}`, {
            headers: {
                "X-Project-ID": projectId
            }
        }).then((response) => {
            setData(response.data.content)
            setTotalElements(response.data.totalElements)
        })
    }, [page, pageSize]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return (
        <div>
            <div className="mb-6">
                <Link href={`.`}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to Customers
                    </Button>
                </Link>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Import CSV</h3>
                    <p className="leading-7">Upload and import customer data from CSV files</p>
                </div>
            </div>
            <div className="grid w-full items-center gap-3 border rounded-lg p-6 mt-6 mb-6">
                <Label htmlFor="customersCsv">CSV file</Label>
                <Input id="customersCsv" type="file" ref={fileInputRef} />
                <div className="flex gap-2 mt-2">
                    <Button className="bg-gradient-primary" onClick={handleUpload} disabled={isUploading}>
                        <UploadIcon /> Upload file
                    </Button>
                    <Button variant="outline" type="button" onClick={handleClear}>Clear</Button>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <div className="flex gap-2 mt-2">
                            <Button variant="ghost">Check CSV requirements</Button>
                        </div>
                    </SheetTrigger>
                    <SheetContent side="bottom">
                        <SheetHeader>
                            <SheetTitle>CSV Requirements</SheetTitle>
                            <SheetDescription>
                                <ul className="list-disc pl-5 space-y-2 mt-4 text-sm">
                                    <li>The file must be in CSV format (.csv)</li>
                                    <li>First row should contain column headers</li>
                                    <li>Each row should represent a single customer.</li>
                                    <li>Maximum file size: 5MB.</li>
                                    <li>Example:
                                        <pre className="bg-gray-100 rounded p-2 mt-2 text-xs">
                                            {`customerId,firstName,lastName,email,phoneNumber,country,att1,att2
1001,John,Doe,john@example.com,+1234567890,USA,Premium,Gold
1002,Jane,Smith,jane@example.com,+0987654321,Canada,Standard,Silver`}
                                        </pre>
                                    </li>
                                </ul>
                            </SheetDescription>
                        </SheetHeader>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant="outline">Close</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="py-10" style={{ height: "calc(-28.3rem + 100vh)", paddingTop: "1.5rem" }}>
                <div className="mb-4">
                    <div className="mb-4 flex items-center gap-2">
                        <h4 className="scroll-m-20 text-2xl font-semibold tracking-tight">Imports History</h4>
                        <RefreshCw size={20} className="text-muted-foreground cursor-pointer" onClick={fetchHistory} />
                    </div>
                    <p className="leading-7">Track the status of your CSV imports</p>
                </div>
                <div style={{ height: "calc(-39rem + 100vh)" }}>
                    <ImportHistoryTableClient
                        data={data}
                        totalElements={totalElements}
                        onPaginationChangeAction={handlePaginationChange}
                    />
                </div>
            </div>
        </div>
    );
}