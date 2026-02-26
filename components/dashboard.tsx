"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { 
  CircleDashedIcon, 
  Pill, 
  Utensils, 
  Repeat, 
  Loader2, 
  Users, 
  CalendarDays,
  CheckCircle2 // Novo ícone para concluído
} from "lucide-react"
import { LembreteModal } from "@/features/reminder-modal"
import { useToast } from "@/hooks/use-toast"
import { CalendarTimeline } from "@/components/ui/calendar-timeline"
import { getSessionUser, getUserLabel, SessionUser } from "@/lib/auth-state"
import { getDailyReminders, createReminder, markReminderAsDone } from "@/service/remiders.service"
import { elderService } from "@/service/elder.service"

export function SharedDashboard({ userType }: { userType: string }) {
  const { toast } = useToast()
  const [lembretes, setLembretes] = useState<any[]>([])
  const [elders, setElders] = useState<any[]>([])
  const [selectedElderId, setSelectedElderId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const carregarLembretes = useCallback(async (id: string) => {
    if (!id) return
    try {
      setLoading(true)
      const data = await getDailyReminders(id)
      setLembretes(data || [])
    } catch (error) {
      setLembretes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const currentUser = getSessionUser()
      setUser(currentUser)

      if (currentUser?.role === "IDOSO" && currentUser.elderId) {
        setSelectedElderId(currentUser.elderId)
        carregarLembretes(currentUser.elderId)
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
      await createReminder(dados);
      toast({ title: "Lembrete agendado!" });
      setModalOpen(false);
      carregarLembretes(selectedElderId);
    } catch (error) {
      toast({ title: "Erro ao criar", variant: "destructive" });
    }
  };

  const handleConcluir = async (id: string) => {
    try {
      // LÓGICA DE UX: Atualiza localmente para 'done' sem remover do array
      setLembretes(prev => prev.map(l => 
        (l.id || l._id) === id ? { ...l, done: true } : l
      ))
      
      await markReminderAsDone(id)
      toast({ title: "Tarefa concluída!" })
    } catch (error) {
      carregarLembretes(selectedElderId)
      toast({ title: "Erro ao concluir", variant: "destructive" })
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-br from-blue-600 to-emerald-400" />
      <div className="relative z-10 pt-20 pb-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl backdrop-blur-md border border-white/30">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Olá, {user?.name}</h1>
                <p className="text-sm opacity-80">{user?.role ? getUserLabel(user.role) : "Gestor"}</p>
              </div>
            </div>
            
            {user?.role !== "IDOSO" && elders.length > 0 && (
              <div className="flex items-center gap-2 bg-black/20 p-2 px-4 rounded-xl backdrop-blur-md border border-white/10">
                <Users className="w-4 h-4" />
                <select 
                  value={selectedElderId} 
                  onChange={(e) => {
                    setSelectedElderId(e.target.value)
                    carregarLembretes(e.target.value)
                  }}
                  className="bg-transparent text-sm font-bold outline-none cursor-pointer appearance-none"
                >
                  {elders.map(e => (
                    <option key={e.id || e._id} value={e.id || e._id} className="text-black">
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-[32px] shadow-xl p-6 min-h-[500px]">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold">Painel Diário</h2>
               {user?.role !== "IDOSO" && (
                 <Button onClick={() => setModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 rounded-full">
                   + Novo Lembrete
                 </Button>
               )}
             </div>

             <CalendarTimeline />

             <div className="mt-8 space-y-4">
               {loading ? (
                 <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
               ) : lembretes.length > 0 ? (
                 lembretes.map((l) => {
                   // Verifica se está concluído (checa 'done' local ou 'concluido' vindo do banco)
                   const isCompleted = l.done || l.concluido;

                   return (
                    <div 
                      key={l.id || l._id} 
                      className={`flex items-center gap-4 p-4 rounded-2xl border-l-4 transition-all duration-300 ${
                        isCompleted 
                          ? "bg-gray-100/50 dark:bg-zinc-900/40 border-gray-300 opacity-70" 
                          : "bg-gray-50 dark:bg-zinc-900 border-emerald-500 shadow-sm"
                      }`}
                    >
                      <div className={isCompleted ? "text-gray-400" : "text-emerald-500"}>
                        {l.type === 'Medicamento' && <Pill className="w-6 h-6" />}
                        {l.type === 'Refeição' && <Utensils className="w-6 h-6" />}
                        {l.type === 'Rotina' && <Repeat className="w-6 h-6" />}
                        {l.type === 'Evento' && <CalendarDays className="w-6 h-6" />}
                      </div>

                      <div className="flex-1">
                        <p className={`font-bold transition-all ${isCompleted ? "line-through text-gray-400" : "text-gray-900 dark:text-white"}`}>
                          {l.title}
                        </p>
                        <p className="text-xs text-gray-400 font-bold uppercase">{l.time} • {l.type}</p>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={isCompleted}
                        onClick={() => handleConcluir(l.id || l._id)}
                        className="rounded-full"
                      >
                        {isCompleted ? (
                          <div className="bg-emerald-500 rounded-full p-1">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <CircleDashedIcon className="w-7 h-7 text-gray-300 hover:text-emerald-500 transition-colors" />
                        )}
                      </Button>
                    </div>
                   )
                 })
               ) : (
                 <p className="text-center text-gray-400 py-10">Nenhum lembrete para hoje.</p>
               )}
             </div>
          </div>
        </div>
      </div>

      <LembreteModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        onSave={handleSalvarLembrete} 
        elders={elders} 
        defaultElderId={selectedElderId} 
      />
    </div>
  )
}