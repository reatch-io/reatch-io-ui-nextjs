"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"

type DateTimePickerProps = {
    value?: Date
    onChangeAction?: (isoString: string | undefined) => void
    className?: string
    disabled?: boolean
    step?: number
}

function roundMinutes(minutes: number, step: number) {
    const rounded = Math.round(minutes / step) * step;
    return rounded === 60 ? 0 : rounded;
}

export function DateTimePicker({
    value,
    onChangeAction,
    className,
    disabled = false,
    step = 60,
}: DateTimePickerProps) {
    // Always compute from value prop in 24-hour format
    const hours = value instanceof Date && !isNaN(value.getTime()) ? value.getHours() : 0;
    const minutes = value instanceof Date && !isNaN(value.getTime()) ? value.getMinutes() : 0;
    const timeValue =
        value instanceof Date && !isNaN(value.getTime())
            ? hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0")
            : "";

    const handleDateChange = (date: Date | undefined) => {
        if (!date) {
            onChangeAction?.(undefined)
            return
        }
        if (value instanceof Date && !isNaN(value.getTime())) {
            let hours = value.getHours()
            let minutes = value.getMinutes()
            let seconds = value.getSeconds()
            date.setHours(hours, minutes, seconds)
        }
        onChangeAction?.(date.toISOString())
    }

    const handleTimeChange = (time: string) => {
        if (!(value instanceof Date) || isNaN(value.getTime())) return;
        let [inputHours, inputMinutes] = time.split(":").map(Number)
        // Round minutes to nearest step
        const roundedMinutes = roundMinutes(inputMinutes || 0, Math.floor(step / 60));
        let newHours = inputHours || 0;
        // If rounding up to 60, increment hour and set minutes to 0
        if (roundedMinutes === 0 && (inputMinutes || 0) > 30) {
            newHours = (newHours + 1) % 24;
        }
        const newDate = new Date(value)
        newDate.setHours(newHours, roundedMinutes, 0, 0)
        onChangeAction?.(newDate.toISOString())
    }

    return (
        <div className={`flex gap-4 items-center ${className || ""}`}>
            <DatePicker
                value={value}
                onChangeAction={handleDateChange}
                className="grow"
                disabled={disabled}
            />
            <Input
                type="time"
                id="time-picker"
                step={step}
                value={timeValue}
                onChange={e => handleTimeChange(e.target.value)}
                className="bg-background grow"
                disabled={disabled}
            />
        </div>
    )
}
