"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  value?: Date
  onChangeAction?: (date: Date | undefined) => void
  className?: string
  disabled?: boolean
}

export function DatePicker({ value, onChangeAction, className, disabled = false }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!value}
          className={`data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal ${className || ""}`}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
        >
          <CalendarIcon />
          {value instanceof Date && !isNaN(value.getTime())
            ? format(value, "PPP")
            : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={value} onSelect={onChangeAction} />
        </PopoverContent>
      )}
    </Popover>
  )
}