"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { CircleDashedIcon, Pill, Utensils, Repeat, Loader2, Users, CalendarDays, CheckCircle2, FileHeart, Plus } from "lucide-react"
import { LembreteModal } from "@/features/reminder-modal"
import { useToast } from "@/hooks/use-toast"
import { CalendarTimeline } from "@/components/ui/calendar-timeline"
import { getSessionUser, getUserLabel, SessionUser } from "@/lib/auth-state"
import { getDailyReminders, createReminder, markReminderAsDone } from "@/service/remiders.service"
import { elderService } from "@/service/elder.service"
import { MedicalRecordSheet } from "@/features/medical-record"

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Medicamento: { icon: Pill,        color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40" },
  Refeição:    { icon: Utensils,    color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/40"  },
  Rotina:      { icon: Repeat,      color: "text-sky-500",    bg: "bg-sky-50 dark:bg-sky-950/40"      },
  Evento:      { icon: CalendarDays,color: "text-rose-500",   bg: "bg-rose-50 dark:bg-rose-950/40"    },
}

export function SharedDashboard({ userType }: { userType: string }) {
  const { toast } = useToast()
  const [lembretes, setLembretes]       = useState<any[]>([])
  const [elders, setElders]             = useState<any[]>([])
  const [selectedElderId, setSelectedElderId] = useState<string>("")
  const [loading, setLoading]           = useState(true)
  const [user, setUser]                 = useState<SessionUser | null>(null)
  const [modalOpen, setModalOpen]       = useState(false)
  const [showFicha, setShowFicha]       = useState(false)

  const carregarLembretes = useCallback(async (id: string) => {
    if (!id) return
    try {
      setLoading(true)
      const data = await getDailyReminders(id)
      setLembretes(data || [])
    } catch {
      setLembretes([])
    } finally {
      setLoading(false)
    }
  }, [])

  const recarregarIdosos = useCallback(async () => {
    const res = await elderService.getMyElders()
    setElders(res.data || [])
  }, [])

  useEffect(() => {
    const init = async () => {
      const currentUser = getSessionUser()
      setUser(currentUser)

      const idDoIdoso =
        currentUser?.elderProfileId ||
        currentUser?.elderId ||
        (currentUser as any)?.id ||
        (currentUser as any)?._id

      if (currentUser?.role === "IDOSO" && idDoIdoso) {
        setSelectedElderId(idDoIdoso)
        carregarLembretes(idDoIdoso)
      } else {
        try {
          const response = await elderService.getMyElders()
          const lista = response.data || []
          setElders(lista)
          if (lista.length > 0) {
            const idInicial = lista[0].id || lista[0]._id
            setSelectedElderId(idInicial)
            carregarLembretes(idInicial)
          }
        } catch (e) {
          console.error("Erro ao carregar idosos:", e)
        }
      }
    }
    init()
  }, [carregarLembretes])

  const handleSalvarLembrete = async (dados: any) => {
    try {
      await createReminder(dados)
      toast({ title: "Lembrete agendado!" })
      setModalOpen(false)
      carregarLembretes(selectedElderId)
    } catch {
      toast({ title: "Erro ao criar lembrete", variant: "destructive" })
    }
  }

  const handleConcluir = async (id: string) => {
    try {
      setLembretes((prev) =>
        prev.map((l) =>
          (l.id || l._id) === id ? { ...l, done: true, isCompleted: true, concluido: true } : l
        )
      )
      await markReminderAsDone(id)
      toast({ title: "Tarefa concluída!" })
    } catch {
      carregarLembretes(selectedElderId)
      toast({ title: "Erro ao concluir", variant: "destructive" })
    }
  }

  const lembretesOrdenados = [...lembretes].sort((a, b) => {
    const aConcluido = a.isCompleted || a.done || a.concluido ? 1 : 0
    const bConcluido = b.isCompleted || b.done || b.concluido ? 1 : 0
    return aConcluido - bConcluido
  })

  const pendentes  = lembretesOrdenados.filter((l) => !(l.done || l.concluido || l.isCompleted))
  const concluidos = lembretesOrdenados.filter((l) =>   l.done || l.concluido || l.isCompleted)

  const currentElder = elders.find((e) => (e.id || e._id) === selectedElderId)
  const isIdoso      = user?.role === "IDOSO"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between gap-4">

          {/* Avatar + nome */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 shrink-0 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-md">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base text-slate-900 dark:text-white truncate leading-tight">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400 leading-tight mt-0.5">
                {user?.role ? getUserLabel(user.role) : "Gestor"}
              </p>
            </div>
          </div>

          {/* Controles direita */}
          <div className="flex items-center gap-2.5 shrink-0">
            {!isIdoso && selectedElderId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFicha(true)}
                className="h-9 gap-1.5 text-sm font-medium border-slate-200 dark:border-zinc-700"
              >
                <FileHeart className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Ficha</span>
              </Button>
            )}

            {!isIdoso && elders.length > 0 && (
              <div className="flex items-center gap-2 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 h-9 bg-white dark:bg-zinc-800">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedElderId}
                  onChange={(e) => {
                    setSelectedElderId(e.target.value)
                    carregarLembretes(e.target.value)
                  }}
                  className="bg-transparent font-semibold outline-none cursor-pointer text-slate-700 dark:text-slate-200 text-sm max-w-[140px]"
                >
                  {elders.map((e) => (
                    <option key={e.id || e._id} value={e.id || e._id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Conteúdo ─────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Calendário — fora do card */}
        <div className="px-1">
          <CalendarTimeline />
        </div>

        {/* Card branco — Painel Diário + lembretes */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm px-5 py-5">

          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Painel Diário</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {pendentes.length > 0
                  ? `${pendentes.length} tarefa${pendentes.length > 1 ? "s" : ""} pendente${pendentes.length > 1 ? "s" : ""}`
                  : "Tudo em dia 🎉"}
              </p>
            </div>
            {!isIdoso && (
              <Button
                onClick={() => setModalOpen(true)}
                size="sm"
                className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-sm px-4"
              >
                <Plus className="w-4 h-4" />
                Novo lembrete
              </Button>
            )}
          </div>

          {/* Lista de lembretes */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-emerald-500 w-6 h-6" />
            </div>
          ) : lembretesOrdenados.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">Nenhum lembrete para hoje.</p>
          ) : (
            <div className="space-y-2.5 pb-2">
              {lembretesOrdenados.map((l) => {
                const isCompleted = l.done || l.concluido || l.isCompleted
                const cfg  = TYPE_CONFIG[l.type] ?? TYPE_CONFIG["Rotina"]
                const Icon = cfg.icon

                return (
                  <div
                    key={l.id || l._id}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                      ${isCompleted
                        ? "bg-slate-50 dark:bg-zinc-800/50 border-slate-100 dark:border-zinc-700 opacity-55"
                        : "bg-slate-50 dark:bg-zinc-800/40 border-slate-100 dark:border-zinc-700 hover:shadow-sm hover:-translate-y-px"
                      }
                    `}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? "bg-slate-100 dark:bg-zinc-700" : cfg.bg}`}>
                      <Icon className={`w-5 h-5 ${isCompleted ? "text-slate-400" : cfg.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isCompleted ? "line-through text-slate-400" : "text-slate-800 dark:text-white"}`}>
                        {l.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {l.time} · {l.type}
                      </p>
                    </div>

                    <button
                      disabled={isCompleted}
                      onClick={() => handleConcluir(l.id || l._id)}
                      className="shrink-0 rounded-full focus:outline-none disabled:cursor-default"
                      aria-label={isCompleted ? "Concluído" : "Marcar como concluído"}
                    >
                      {isCompleted
                        ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        : <CircleDashedIcon className="w-6 h-6 text-slate-300 hover:text-emerald-500 transition-colors" />
                      }
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </main>

      {/* Modais */}
      <LembreteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSalvarLembrete}
        elders={elders}
        defaultElderId={selectedElderId}
      />

      {showFicha && currentElder && (
        <MedicalRecordSheet
          open={showFicha}
          onOpenChange={setShowFicha}
          elder={currentElder}
          onSaved={recarregarIdosos}
        />
      )}
    </div>
  )
}