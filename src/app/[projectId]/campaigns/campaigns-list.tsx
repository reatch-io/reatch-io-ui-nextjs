'use client'

import { DataTable } from "@/components/ui/data-table"
import { PaginationState } from "@tanstack/react-table"
import { campaignsColumns } from "./campaigns-columns"
import { Campaign } from "@/models/campaign"

export function CampaignsTableClient({ data, totalElements, onPaginationChangeAction, onRowClickAction }:
  { 
    data: Campaign[], 
    totalElements: number, 
    onPaginationChangeAction: (pagination: PaginationState) => void,
    onRowClickAction?: (row: Campaign) => void
  }) {
  return <DataTable
    columns={campaignsColumns}
    data={data}
    totalElements={totalElements}
    onPaginationChange={onPaginationChangeAction}
    onRowClick={onRowClickAction} />
}