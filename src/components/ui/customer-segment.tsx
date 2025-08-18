import { Badge } from "@/components/ui/badge"

type CustomerSegmentProps = {
  segment: "High Value" | "New User" | "Inactive" | string
}

export function CustomerSegment({ segment }: CustomerSegmentProps) {
  let colorClass = "bg-gray-200 text-gray-700"

  if (segment === "High Value") {
    colorClass = "bg-purple-100 text-purple-700"
  } else if (segment === "New User") {
    colorClass = "bg-blue-100 text-blue-700"
  } else if (segment === "Inactive") {
    colorClass = "bg-gray-200 text-gray-700"
  }

  return (
    <Badge className={colorClass}>
      {segment}
    </Badge>
  )
}