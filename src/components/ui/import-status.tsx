import { Badge } from "@/components/ui/badge"

type ImportStatusProps = {
  status: "READY" | "COMPLETED" | "FAILED" | string
}

export function ImportStatus({ status }: ImportStatusProps) {
  let colorClass = "bg-gray-200 text-gray-700"

  if (status === "READY") {
    colorClass = "bg-green-100 text-green-700"
  } else if (status === "COMPLETED") {
    colorClass = "bg-blue-100 text-blue-700"
  } else if (status === "FAILED") {
    colorClass = "bg-red-100 text-red-700"
  }

  return (
    <Badge className={colorClass}>
      {status}
    </Badge>
  )
}