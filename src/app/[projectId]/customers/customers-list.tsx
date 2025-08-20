'use client'

import { DataTable } from "@/components/ui/data-table"
import { customersColumns } from "./customers-columns"
import { PaginationState } from "@tanstack/react-table"
import { Customer } from "@/models/customer"

export function CustomerTableClient({ data, totalElements, onPaginationChangeAction, onRowClickAction }:
  { 
    data: Customer[], 
    totalElements: number, 
    onPaginationChangeAction: (pagination: PaginationState) => void,
    onRowClickAction?: (row: Customer) => void
  }) {
  return <DataTable
    columns={customersColumns}
    data={data}
    totalElements={totalElements}
    onPaginationChange={onPaginationChangeAction}
    onRowClick={onRowClickAction} />
}