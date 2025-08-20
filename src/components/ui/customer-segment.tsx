import { Badge } from "@/components/ui/badge"

type CustomerSegmentProps = {
  segment: "HIGH_VALUE" | "NEW_USER" | "INACTIVE" | string
}

const segmentLabels: Record<string, string> = {
  HIGH_VALUE: "High Value",
  NEW_USER: "New User",
  INACTIVE: "Inactive",
}

export function CustomerSegment({ segment }: CustomerSegmentProps) {
  let colorClass = "bg-gray-200 text-gray-700"

  if (segment === "HIGH_VALUE") {
    colorClass = "bg-purple-100 text-purple-700"
  } else if (segment === "NEW_USER") {
    colorClass = "bg-blue-100 text-blue-700"
  } else if (segment === "INACTIVE") {
    colorClass = "bg-gray-200 text-gray-700"
  }

  const label = segmentLabels[segment] || segment || <span className="text-muted-foreground">-</span>

  return (
    <Badge className={colorClass}>
      {label}
    </Badge>
  )
}