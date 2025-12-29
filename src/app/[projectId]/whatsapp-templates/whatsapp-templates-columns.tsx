"use client"


import { Badge } from "@/components/ui/badge";
import { WhatsAppTemplate } from "@/models/whatsapp"
import { ColumnDef } from "@tanstack/react-table"


export const whatsappTemplatesColumns: ColumnDef<WhatsAppTemplate>[] = [
  {
    accessorKey: "name",
    header: "Template Name",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge className="px-2 py-1 rounded bg-blue-100 text-blue-700" variant="outline">
          {type?.charAt(0).toUpperCase() + type?.slice(1).toLowerCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: "language",
    header: "Language",
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