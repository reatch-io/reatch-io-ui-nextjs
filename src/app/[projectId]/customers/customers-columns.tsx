"use client"

import { Badge } from "@/components/ui/badge"
import { CustomerInfo } from "@/components/ui/customer-info"
import { CustomerSegment } from "@/components/ui/customer-segment"
import { CustomerStatus } from "@/components/ui/customer-status"
import { ColumnDef } from "@tanstack/react-table"

export type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
  lastActivity: string
  segment: string
  status: "Active" | "Inactive"
  totalSpent: string
}

export const customersColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: "customerId",
    header: "ID",
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <CustomerInfo
        firstName={row.original.firstName}
        lastName={row.original.lastName}
        email={row.original.email}
      />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return (
        <span>
          {date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}{" "}
          {date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
      )
    },
  },
  {
    accessorKey: "lastActivity",
    header: "Last Activity",
  },
  {
    accessorKey: "segment",
    header: "Segment",
    cell: ({ row }) => (
      <CustomerSegment segment={row.original.segment}></CustomerSegment>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <CustomerStatus status={row.original.status}></CustomerStatus>
    ),
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent",
    cell: ({ row }) => (
      <span className="font-bold">{row.original.totalSpent}</span>
    ),
  },
]