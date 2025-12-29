'use client'

import { DataTable } from "@/components/ui/data-table"
import { PaginationState } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import api from "@/api/auth/app-api"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"
import { Loader2 } from "lucide-react"
import { Sender, WhatsAppTemplate } from "@/models/whatsapp"
import { whatsappTemplatesColumns } from "./whatsapp-templates-columns"

export function WhatsAppTemplatesTableClient({ title = "Templates list" }: { title?: string }) {

  const [data, setData] = useState<WhatsAppTemplate[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const { projectId } = params as { projectId: string };
  const router = useRouter();

  useEffect(() => {
    api.get(`/api/whatsapp/templates?page=${page}&size=${pageSize}`, {
      headers: {
        "X-Project-ID": projectId
      }
    }).then((response) => {
      setData(response.data.content)
      setTotalElements(response.data.totalElements)
    })
  }, [page, pageSize]);

  const handlePaginationChange = (pagination: PaginationState) => {
    setPage(pagination.pageIndex);
    setPageSize(pagination.pageSize);
  }

  function handleRowClick(row: WhatsAppTemplate): void {
    router.push(`/${projectId}/whatsapp-templates/${row.id}`);
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
        </div>
        {isLoading ? <DataTableSkeleton /> : (
          <DataTable
            columns={whatsappTemplatesColumns}
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