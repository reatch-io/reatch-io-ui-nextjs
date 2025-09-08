'use client'

import { DataTable } from "@/components/ui/data-table"
import { segmentsColumns } from "./segments-columns"
import { PaginationState } from "@tanstack/react-table"
import { Segment } from "@/models/segment"

export function SegmentTableClient({ data, totalElements, onPaginationChangeAction, onRowClickAction }:
  { 
    data: Segment[], 
    totalElements: number, 
    onPaginationChangeAction: (pagination: PaginationState) => void,
    onRowClickAction?: (row: Segment) => void
  }) {
  return <DataTable
    columns={segmentsColumns}
    data={data}
    totalElements={totalElements}
    onPaginationChange={onPaginationChangeAction}
    onRowClick={onRowClickAction} />
}