"use client"

import { ImportStatus } from "@/components/ui/import-status"
import { ImportHistory } from "@/models/import-history"
import { ColumnDef } from "@tanstack/react-table"

export const importsHistoryColumns: ColumnDef<ImportHistory>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <ImportStatus status={row.original.status}></ImportStatus>
    ),
  },
  {
    accessorKey: "fileUrl",
    header: "File URL",
    cell: ({ row }) => (
      <a href={row.original.fileUrl} target="_blank" rel="noopener noreferrer">
        Download file
      </a>
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
]