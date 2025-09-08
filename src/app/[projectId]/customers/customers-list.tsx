'use client'

import { DataTable } from "@/components/ui/data-table"
import { customersColumns } from "./customers-columns"
import { PaginationState } from "@tanstack/react-table"
import { Customer } from "@/models/customer"
import { useEffect, useState } from "react"
import api from "@/api/auth/app-api"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

export function CustomerTableClient({ title = "Customers list", segmentId = "" }: { title?: string, segmentId?: string }) {

  const [data, setData] = useState<Customer[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const { projectId } = params as { projectId: string };
  const router = useRouter();

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
    // if segment id is not null, then call api/segments/customers, otherwise call api/customers
    const url = segmentId ?
      `/api/segments/${segmentId}/customers` :
      `/api/customers`;
    api.get(`${url}?page=${page}&size=${pageSize}&search=${debouncedSearch}`, {
      headers: {
        "X-Project-ID": projectId
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

  function handleRowClick(row: Customer): void {
    router.push(`/${projectId}/customers/${row.systemId}`);
  }

  return (
    <div>
      <div className="py-10" style={{ paddingTop: "1.5rem" }}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="flex-1 grow text-lg font-semibold">{title}</h4>
          {isLoading && (
            <span className="text-gray-400 animate-spin mr-2">
              <Loader2 size={18} />
            </span>
          )}
          {!segmentId && (
            <Input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="border rounded px-3 py-2 text-sm w-64"
            />
          )}
        </div>
        {isLoading ? <DataTableSkeleton /> : (
          <DataTable
            columns={customersColumns}
            data={data}
            totalElements={totalElements}
            onPaginationChange={handlePaginationChange}
            onRowClick={handleRowClick}
          />
        )}
      </div>
    </div>

  );
}