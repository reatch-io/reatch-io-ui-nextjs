'use client'

import { DataTable } from "@/components/ui/data-table"
import { customersColumns, Customer } from "./customers-columns"
import { PaginationState } from "@tanstack/react-table"

export function CustomerTableClient({ data, totalElements, onPaginationChange }: { data: Customer[], totalElements: number, onPaginationChange: (pagination: PaginationState) => void }) {
  return <DataTable columns={customersColumns} data={data} totalElements={totalElements} onPaginationChange={onPaginationChange} />
}