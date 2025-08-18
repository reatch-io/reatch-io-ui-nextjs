import { Badge } from "@/components/ui/badge"

type CustomerStatusProps = {
  status: "Active" | "Inactive" | string
}

export function CustomerStatus({ status }: CustomerStatusProps) {
  let colorClass = "bg-gray-200 text-gray-700"

  if (status === "Active") {
    colorClass = "bg-green-100 text-green-700"
  } else if (status === "Inactive") {
    colorClass = "bg-red-100 text-red-700"
  }

  return (
    <Badge className={colorClass}>
      {status}
    </Badge>
  )
}