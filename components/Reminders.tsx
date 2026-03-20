"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Trash2, Pill, Utensils, Repeat, CalendarDays, CheckCircle2, CircleDashedIcon, Users, Pencil, X, Check } from "lucide-react"
import { LembreteModal } from "@/features/reminder-modal"
import { useToast } from "@/hooks/use-toast"
import { elderService } from "@/service/elder.service"
import { getSessionUser } from "@/lib/auth-state"
import { getDailyReminders, deleteReminder, createReminder, markReminderAsDone, updateReminder } from "@/service/remiders.service"

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  Medicamento: { icon: Pill,         color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-l-violet-400" },
  Refeição:    { icon: Utensils,     color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/40",   border: "border-l-amber-400"  },
  Rotina:      { icon: Repeat,       color: "text-sky-500",    bg: "bg-sky-50 dark:bg-sky-950/40",       border: "border-l-sky-400"    },
  Evento:      { icon: CalendarDays, color: "text-rose-500",   bg: "bg-rose-50 dark:bg-rose-950/40",     border: "border-l-rose-400"   },
}

export function SharedLembretes({ userType }: { userType: string }) {
  const { toast } = useToast()
  const [loading, setLoading]                 = useState(true)
  const [isSwitching, setIsSwitching]         = useState(false)
  const [modalOpen, setModalOpen]             = useState(false)
  const [elders, setElders]                   = useState<any[]>([])
  const [lembretes, setLembretes]             = useState<any[]>([])
  const [selectedElderId, setSelectedElderId] = useState<string>("")
  const [isIdosoRole, setIsIdosoRole]         = useState(false)
  const [editingId, setEditingId]             = useState<string | null>(null)
  const [editTitle, setEditTitle]             = useState("")
  const [editTime, setEditTime]               = useState("")
  const [savingId, setSavingId]               = useState<string | null>(null)

  const buscarLembretes = useCallback(async (id: string, silencioso = false) => {
    if (!id) return
    try {
      if (!silencioso) setIsSwitching(true)
      const data = await getDailyReminders(id)
      setLembretes(data || [])
    } catch {
      toast({ title: "Erro ao carregar lista", variant: "destructive" })
    } finally {
      if (!silencioso) setIsSwitching(false)
    }
  }, [toast])

  useEffect(() => {
    const carregarInicial = async () => {
      setLoading(true)
      const user = getSessionUser()
      const idDoIdoso = user?.elderProfileId || user?.elderId || (user as any)?.id || (user as any)?._id
      const isIdoso = user?.role === "IDOSO"
      setIsIdosoRole(isIdoso)

      if (isIdoso && idDoIdoso) {
        setSelectedElderId(idDoIdoso)
        await buscarLembretes(idDoIdoso)
      } else {
        try {
          const res = await elderService.getMyElders()
          const lista = res.data || []
          setElders(lista)
          if (lista.length > 0) {
            const idInicial = lista[0].id || lista[0]._id
            setSelectedElderId(idInicial)
            await buscarLembretes(idInicial)
          }
        } catch (error) {
          console.error(error)
        }
      }
      setLoading(false)
    }
    carregarInicial()
  }, [buscarLembretes])

  const handleSalvar = async (dados: any) => {
    try {
      await createReminder(dados)
      toast({ title: "Lembrete criado com sucesso!" })
      setModalOpen(false)
      buscarLembretes(selectedElderId, true)
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" })
    }
  }

  const handleIniciarEdicao = (l: any) => {
    setEditingId(l.id || l._id)
    setEditTitle(l.title)
    setEditTime(l.time)
  }

  const handleCancelarEdicao = () => {
    setEditingId(null)
    setEditTitle("")
    setEditTime("")
  }

  const handleSalvarEdicao = async (l: any) => {
    const id = l.id || l._id
    setSavingId(id)
    try {
      await updateReminder(id, {
        title: editTitle,
        time: editTime,
        type: l.type,
        daysOfWeek: l.daysOfWeek ?? [],
        elderId: l.elderId ?? selectedElderId,
      })
      setLembretes(prev => prev.map(item =>
        (item.id || item._id) === id ? { ...item, title: editTitle, time: editTime } : item
      ))
      toast({ title: "Lembrete atualizado!" })
      handleCancelarEdicao()
    } catch {
      toast({ title: "Erro ao atualizar", variant: "destructive" })
    } finally {
      setSavingId(null)
    }
  }

  const handleConcluir = async (id: string) => {
    try {
      setLembretes(prev => prev.map(l => (l.id || l._id) === id ? { ...l, isCompleted: true, concluido: true, done: true } : l))
      await markReminderAsDone(id)
      toast({ title: "Tarefa concluída!" })
    } catch {
      buscarLembretes(selectedElderId, true)
      toast({ title: "Erro ao concluir", variant: "destructive" })
    }
  }

  const handleDeletar = async (id: string) => {
    try {
      await deleteReminder(id)
      setLembretes(prev => prev.filter(l => (l.id || l._id) !== id))
      toast({ title: "Lembrete removido" })
    } catch {
      toast({ title: "Erro ao deletar", variant: "destructive" })
    }
  }

  const lembretesOrdenados = [...lembretes].sort((a, b) => {
    const aConcluido = a.isCompleted || a.done || a.concluido ? 1 : 0
    const bConcluido = b.isCompleted || b.done || b.concluido ? 1 : 0
    return aConcluido - bConcluido
  })

  const pendentes = lembretesOrdenados.filter(l => !(l.done || l.concluido || l.isCompleted))

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Lembretes</h1>
            {pendentes.length > 0 && (
              <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                {pendentes.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {!isIdosoRole && elders.length > 0 && (
              <div className="flex items-center gap-2 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 h-9 bg-white dark:bg-zinc-800">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedElderId}
                  onChange={(e) => { setSelectedElderId(e.target.value); buscarLembretes(e.target.value) }}
                  className="bg-transparent font-semibold outline-none cursor-pointer text-slate-700 dark:text-slate-200 text-sm max-w-[140px]"
                >
                  {elders.map(e => (
                    <option key={e.id || e._id} value={e.id || e._id}>{e.name}</option>
                  ))}
                </select>
              </div>
            )}

            {!isIdosoRole && (
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
        </div>
      </header>

      {/* ── Conteúdo ─────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm px-5 py-5">

          {isSwitching ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin h-6 w-6 text-emerald-500" />
            </div>
          ) : lembretesOrdenados.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">Nenhum lembrete cadastrado.</p>
          ) : (
            <div className="space-y-2.5 pb-2">
              {lembretesOrdenados.map((l) => {
                const isCompleted = l.isCompleted || l.done || l.concluido
                const isEditing   = editingId === (l.id || l._id)
                const isSaving    = savingId  === (l.id || l._id)
                const cfg         = TYPE_CONFIG[l.type] ?? TYPE_CONFIG["Rotina"]
                const Icon        = cfg.icon

                return (
                  <div
                    key={l.id || l._id}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-zinc-700
                      border-l-4 transition-all duration-200
                      ${isEditing
                        ? `bg-white dark:bg-zinc-800 ${cfg.border} shadow-md ring-1 ring-slate-200 dark:ring-zinc-600`
                        : isCompleted
                          ? "bg-slate-50 dark:bg-zinc-800/50 border-l-slate-200 dark:border-l-zinc-600 opacity-55"
                          : `bg-slate-50 dark:bg-zinc-800/40 ${cfg.border} hover:shadow-sm hover:-translate-y-px`
                      }
                    `}
                  >
                    {/* Ícone */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? "bg-slate-100 dark:bg-zinc-700" : cfg.bg}`}>
                      <Icon className={`w-5 h-5 ${isCompleted ? "text-slate-400" : cfg.color}`} />
                    </div>

                    {/* Texto / Edição inline */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex flex-col gap-1.5">
                          <input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSalvarEdicao(l); if (e.key === "Escape") handleCancelarEdicao() }}
                            className="w-full text-sm font-semibold bg-slate-100 dark:bg-zinc-700 text-slate-800 dark:text-white rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                            placeholder="Título do lembrete"
                          />
                          <input
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            type="time"
                            className="w-28 text-xs bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className={`font-semibold text-sm truncate ${isCompleted ? "line-through text-slate-400" : "text-slate-800 dark:text-white"}`}>
                            {l.title}
                          </p>
                          {!isCompleted && !isIdosoRole && (
                            <button
                              onClick={() => handleIniciarEdicao(l)}
                              className="shrink-0 p-0.5 rounded text-slate-300 hover:text-sky-500 transition-colors focus:outline-none"
                              aria-label="Editar lembrete"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                      {!isEditing && (
                        <p className="text-xs text-slate-400 mt-0.5">{l.time} · {l.type}</p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSalvarEdicao(l)}
                            disabled={isSaving}
                            className="p-1.5 rounded-full text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors focus:outline-none disabled:opacity-50"
                            aria-label="Salvar"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={handleCancelarEdicao}
                            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors focus:outline-none"
                            aria-label="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            disabled={isCompleted}
                            onClick={() => handleConcluir(l.id || l._id)}
                            className="p-1.5 rounded-full focus:outline-none disabled:cursor-default"
                            aria-label={isCompleted ? "Concluído" : "Marcar como concluído"}
                          >
                            {isCompleted
                              ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                              : <CircleDashedIcon className="w-6 h-6 text-slate-300 hover:text-emerald-500 transition-colors" />
                            }
                          </button>

                          {!isIdosoRole && (
                            <button
                              onClick={() => handleDeletar(l.id || l._id)}
                              className="p-1.5 rounded-full text-red-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors focus:outline-none"
                              aria-label="Remover lembrete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <LembreteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSalvar}
        elders={elders}
        defaultElderId={selectedElderId}
      />
    </div>
  )
}