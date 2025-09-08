"use client"

import { Badge } from "@/components/ui/badge"
import { Segment } from "@/models/segment"
import { ColumnDef } from "@tanstack/react-table"
import { Users } from "lucide-react"


export const segmentsColumns: ColumnDef<Segment>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-semibold text-base">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("description")}</span>
    ),
  },
  {
    accessorKey: "customersCount",
    header: "Customers",
    cell: ({ row }) => (
      <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
        <Users size={14} className="mr-1" />
        {row.getValue("customersCount")}
      </Badge>
    ),
  },
  {
    accessorKey: "growth",
    header: "Growth",
    cell: ({ row }) => {
      const growth = row.getValue("growth") as number
      if (growth === undefined || growth === null) {
        return <span className="text-muted-foreground">-</span>;
      }
      return (
        <span className={growth > 0 ? "text-green-600" : "text-red-600"}>
          {growth > 0 ? `+${growth}%` : `${growth}%`} this month
        </span>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      const value = row.getValue("updatedAt");
      return value
        ? new Date(value as string).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        : <span className="text-muted-foreground">-</span>;
    },
  },
]