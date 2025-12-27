"use client"


import { Sender } from "@/models/whatsapp"
import { ColumnDef } from "@tanstack/react-table"


export const sendersColumns: ColumnDef<Sender>[] = [
  {
    accessorKey: "businessDisplayName",
    header: "Business Display Name",
  },
  {
    accessorKey: "wabaId",
    header: "WABA ID",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
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