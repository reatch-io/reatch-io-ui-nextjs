"use client"

import { ApiKey } from "@/models/project"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import api from "@/api/auth/app-api"
import { toast } from "sonner"
import { useParams } from "next/navigation"

export const apiKeysColumns: ColumnDef<ApiKey>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
        const value = row.getValue("createdAt");
        return value
            ? new Date(value as string).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            })
            : null;
        }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
        const params = useParams();
            const { projectId } = params as { projectId: string };
      const apiKey = row.original;

      const handleDelete = async () => {
        try {
          await api.delete(`/api/projects/api-keys/${apiKey.id}`, {
            headers: {
              "X-Project-ID": projectId
            }
          });
          toast.success("API key deleted successfully");
          // Trigger a table reload - you'll need to pass a callback
          window.location.reload();
        } catch (error) {
          console.error("Failed to delete API key:", error);
          toast.error("Failed to delete API key");
        }
      };

      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete API Key</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the API key "{apiKey.name}"? 
                This action cannot be undone and any applications using this key will lose access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
]