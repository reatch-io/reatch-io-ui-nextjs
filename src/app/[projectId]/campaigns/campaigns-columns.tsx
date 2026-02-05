"use client"

import { Campaign } from "@/models/campaign"
import { ColumnDef } from "@tanstack/react-table"
import { Mail, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge";
import Link from "next/link";


export const campaignsColumns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "campaign",
    header: "Campaign",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            : "-"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      let color = "bg-gray-200 text-gray-800";
      if (status === "ACTIVE") color = "bg-green-100 text-green-700";
      else if (status === "PAUSED") color = "bg-yellow-100 text-yellow-700";
      else if (status === "DRAFT") color = "bg-blue-100 text-blue-700";
      else if (status === "ARCHIVED") color = "bg-purple-100 text-purple-700";
      return (
        <Badge className={`px-2 py-1 rounded ${color}`} variant="outline">
          {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.deliveryType;
      if (type == null) return <span className="text-muted-foreground">-</span>;
      let color = "bg-gray-200 text-gray-800";
      if (type === "SCHEDULED") color = "bg-pink-100 text-pink-700";
      else if (type === "ACTION_BASED") color = "bg-indigo-100 text-indigo-700";
      else if (type === "API_TRIGGERED") color = "bg-cyan-100 text-cyan-700";
      
      // Remove underscores and format text
      const formattedType = type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      return (
        <Badge className={`px-2 py-1 rounded ${color}`} variant="outline">
          {formattedType}
        </Badge>
      );
    }
  },
  {
    accessorKey: "segmentId",
    header: "Segment",
    cell: ({ row }) => {
      const segment = row.original.segmentId;
      return segment ? (
        <Link href={`segments/${segment}`} className="text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>
          View segment
        </Link>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    }
  },
  {
    accessorKey: "totalSent",
    header: "Sent",
  },
  {
    accessorKey: "totalOpens",
    header: "Opens",
    cell: ({ row }) => (
      <div>
        <div className="font-bold text-blue-700">{row.original.totalOpens ?? "-"}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.openRate != null ? `${row.original.openRate}%` : "-"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "totalClicks",
    header: "Clicks",
    cell: ({ row }) => (
      <div>
        <div className="font-bold text-green-700">{row.original.totalClicks ?? "-"}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.clickRate != null ? `${row.original.clickRate}%` : "-"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "lastSent",
    header: "Last Sent",
  },
]