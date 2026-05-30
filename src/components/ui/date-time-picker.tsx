import * as React from "react"
import { format } from "date-fns"
import { Clock } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"

function currentTime() {
  return format(new Date(), "HH:mm")
}

interface DateTimePickerProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  fromYear?: number
  toYear?: number
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  fromYear = new Date().getFullYear() - 1,
  toYear = new Date().getFullYear() + 1,
}: DateTimePickerProps) {
  const datePart = value ? value.split("T")[0] : ""
  const timePart = value ? (value.split("T")[1] ?? "").substring(0, 5) : ""

  const handleDateChange = (date: string) => {
    onChange(`${date}T${timePart || currentTime()}`)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const base = datePart || format(new Date(), "yyyy-MM-dd")
    onChange(`${base}T${e.target.value}`)
  }

  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 min-w-0">
        <DatePicker
          value={datePart}
          onChange={handleDateChange}
          fromYear={fromYear}
          toYear={toYear}
          disabled={disabled}
        />
      </div>
      <div className="relative w-36 shrink-0">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <input
          type="time"
          value={timePart}
          onChange={handleTimeChange}
          disabled={disabled}
          className="w-full h-11 pl-10 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
    </div>
  )
}
