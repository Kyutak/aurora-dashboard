"use client"

import { useEffect, useState } from "react"

export function CalendarTimeline() {
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    // Update date every minute to keep it current
    const interval = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const getDaysArray = () => {
    const days = []
    const today = new Date()

    // Get 2 days before and 2 days after today
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push(date)
    }

    return days
  }

  const formatDayOfWeek = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")
  }

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const days = getDaysArray()

  return (
    <div className="w-full mb-6 mt-[-25px]">
      {/* Full date display */}
      <div className="text-center mb-4">
        <p className="text-lg font-semibold text-foreground capitalize">{formatFullDate(currentDate)}</p>
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-center gap-2 md:gap-4 pb-0">
        {days.map((date, index) => {
          const today = isToday(date)

          return (
            <div
              key={index}
              className={`flex flex-col items-center gap-1 min-w-[60px] transition-all ${
                today ? "scale-110" : "scale-100"
              }`}
            >
              <div
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all my-1 ${
                  today
                    ? "bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-muted-foreground border-2 border-gray-200 dark:border-gray-700"
                }`}
              >
                <span className="text-xs font-medium uppercase">{formatDayOfWeek(date)}</span>
                <span className={`text-lg font-bold ${today ? "text-white" : ""}`}>{date.getDate()}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
