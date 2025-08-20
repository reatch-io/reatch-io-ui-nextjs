import { Badge } from "@/components/ui/badge"

type CustomerStatusProps = {
  status: "ACTIVE" | "INACTIVE" | string
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
}

export function CustomerStatus({ status }: CustomerStatusProps) {
  let colorClass = "bg-gray-200 text-gray-700"

  if (status === "ACTIVE") {
    colorClass = "bg-green-100 text-green-700"
  } else if (status === "INACTIVE") {
    colorClass = "bg-red-100 text-red-700"
  }

  const label = statusLabels[status] || status || <span className="text-muted-foreground">-</span>

  return (
    <Badge className={colorClass}>
      {label}
    </Badge>
  )
}