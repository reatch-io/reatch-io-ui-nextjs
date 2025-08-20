'use client'

import { DataTable } from "@/components/ui/data-table"
import { importsHistoryColumns } from "./imports-history-columns"
import { PaginationState } from "@tanstack/react-table"
import { ImportHistory } from "@/models/import-history"

export function ImportHistoryTableClient({ data, totalElements, onPaginationChangeAction }:
  {
    data: ImportHistory[],
    totalElements: number,
    onPaginationChangeAction: (pagination: PaginationState) => void
  }) {
  return <DataTable
    columns={importsHistoryColumns}
    data={data}
    totalElements={totalElements}
    onPaginationChange={onPaginationChangeAction} />
}