import React from "react"

type InfoBoxProps = {
  title: string
  description: string
  className?: string
  titleClassName?: string
}

export function InfoBox({ title, description, className, titleClassName }: InfoBoxProps) {
  return (
    <div className={`border rounded-lg p-4 flex-1 ${className ?? ""}`}>
      <div className={`text-2xl font-bold mb-1 ${titleClassName ?? ""}`}>{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
  )
}