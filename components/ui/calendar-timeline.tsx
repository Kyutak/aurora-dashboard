"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const DAY_NAMES_FULL  = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
]
const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

function isSameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}

function getWeekDays(anchor: Date) {
  const days = []
  const start = new Date(anchor)
  start.setDate(anchor.getDate() - 3)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

export function CalendarTimeline() {
  const today = new Date()
  const [anchor, setAnchor] = useState<Date>(today)
  const weekDays = getWeekDays(anchor)

  const shiftWeek = (dir: number) => {
    const next = new Date(anchor)
    next.setDate(anchor.getDate() + dir * 7)
    setAnchor(next)
  }

  return (
    <div className="px-1 py-1">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">
          Hoje
        </p>
        <p className="text-[19px] font-semibold text-slate-800 dark:text-white leading-tight">
          {DAY_NAMES_FULL[today.getDay()]}, {today.getDate()} de {MONTH_NAMES[today.getMonth()]}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => shiftWeek(-1)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-1 items-center justify-between gap-1">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, today)
            return (
              <div
                key={day.toISOString()}
                className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-2xl ${isToday ? "bg-gradient-to-br from-teal-400 to-teal-600" : ""}`}
              >
                <span className={`text-[11px] font-semibold uppercase tracking-wide ${isToday ? "text-white/80" : "text-slate-400 dark:text-zinc-500"}`}>
                  {DAY_NAMES_SHORT[day.getDay()]}
                </span>
                <span className={`text-[15px] font-semibold leading-none ${isToday ? "text-white" : "text-slate-700 dark:text-zinc-200"}`}>
                  {day.getDate()}
                </span>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => shiftWeek(1)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}