"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Trash2, Pill, Utensils, Repeat, CalendarDays, CheckCircle2, CircleDashedIcon } from "lucide-react"
import { LembreteModal } from "@/features/reminder-modal"
import { useToast } from "@/hooks/use-toast"
import { elderService } from "@/service/elder.service"
import { getSessionUser } from "@/lib/auth-state"
// Corrigido para garantir que você tenha a função de concluir
import { getDailyReminders, deleteReminder, createReminder, markReminderAsDone } from "@/service/remiders.service"

export function SharedLembretes({ userType }: { userType: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false) // Novo: Loading suave ao trocar de idoso
  const [modalOpen, setModalOpen] = useState(false)
  const [elders, setElders] = useState<any[]>([])
  const [lembretes, setLembretes] = useState<any[]>([])
  const [selectedElderId, setSelectedElderId] = useState<string>("")
  const [isIdosoRole, setIsIdosoRole] = useState(false)

  const buscarLembretes = useCallback(async (id: string, silencioso = false) => {
    if (!id) return
    try {
      if (!silencioso) setIsSwitching(true)
      const data = await getDailyReminders(id)
      setLembretes(data || [])
    } catch (e) {
      toast({ title: "Erro ao carregar lista", variant: "destructive" })
    } finally {
      if (!silencioso) setIsSwitching(false)
    }
  }, [toast])

  useEffect(() => {
    const carregarInicial = async () => {
      setLoading(true)
      const user = getSessionUser()
      
      // CORREÇÃO 1: Cobertura total de IDs para não travar a tela do Idoso
      const idDoIdoso = user?.elderProfileId || user?.elderId || (user as any)?.id || (user as any)?._id;
      const isIdoso = user?.role === "IDOSO";
      setIsIdosoRole(isIdoso);

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
      await createReminder(dados);
      toast({ title: "Lembrete criado com sucesso!" });
      setModalOpen(false);
      buscarLembretes(selectedElderId, true); // Recarrega silenciosamente
    } catch (e) {
      toast({ title: "Erro ao salvar lembrete", variant: "destructive" });
    }
  };

  const handleConcluir = async (id: string) => {
    try {
      // Otimismo na UI para ficar rápido
      setLembretes(prev => prev.map(l => (l.id || l._id) === id ? { ...l, isCompleted: true } : l))
      await markReminderAsDone(id)
      toast({ title: "Tarefa concluída!" })
    } catch (e) {
      buscarLembretes(selectedElderId, true)
      toast({ title: "Erro ao concluir", variant: "destructive" })
    }
  }

  const handleDeletar = async (id: string) => {
    try {
      await deleteReminder(id)
      setLembretes(prev => prev.filter(l => (l.id || l._id) !== id))
      toast({ title: "Lembrete removido" })
    } catch (e) {
      toast({ title: "Erro ao deletar", variant: "destructive" })
    }
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-emerald-500" /></div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-emerald-700">Lembretes</h2>
          {!isIdosoRole && elders.length > 0 && (
            <select 
              value={selectedElderId}
              onChange={(e) => {
                setSelectedElderId(e.target.value)
                buscarLembretes(e.target.value)
              }}
              className="mt-2 p-2 px-3 bg-emerald-50 rounded-lg text-sm font-bold text-emerald-800 outline-none cursor-pointer border border-emerald-100"
            >
              {elders.map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.name}</option>)}
            </select>
          )}
          {!isIdosoRole && elders.length === 0 && (
            <p className="text-sm text-amber-600 mt-2 font-medium">Cadastre um idoso primeiro.</p>
          )}
        </div>
        
        {/* CORREÇÃO 2: Só exibe o botão se for Admin E tiver idosos cadastrados */}
        {!isIdosoRole && elders.length > 0 && (
          <Button onClick={() => setModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-12 px-6 font-bold shadow-md">
            <Plus className="mr-2 w-5 h-5" /> Criar Novo
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {isSwitching ? (
           <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-emerald-300" /></div>
        ) : lembretes.length > 0 ? (
          lembretes.map((l) => {
            const concluido = l.isCompleted || l.done || l.concluido;
            return (
              <div 
                key={l.id || l._id} 
                className={`p-5 bg-white border rounded-2xl flex justify-between items-center shadow-sm border-l-4 transition-all ${
                  concluido ? "border-l-gray-300 opacity-60 bg-gray-50" : "border-l-emerald-500"
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${concluido ? "bg-gray-200 text-gray-400" : "bg-emerald-50 text-emerald-600"}`}>
                    {l.type === 'Medicamento' && <Pill className="w-6 h-6" />}
                    {l.type === 'Refeição' && <Utensils className="w-6 h-6" />}
                    {l.type === 'Rotina' && <Repeat className="w-6 h-6" />}
                    {l.type === 'Evento' && <CalendarDays className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className={`font-black text-xl ${concluido ? "line-through text-gray-400" : "text-gray-800"}`}>{l.title}</p>
                    <p className="text-sm font-bold text-gray-500 mt-1">{l.time} — <span className="uppercase text-emerald-600/70">{l.type}</span></p>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  {/* CORREÇÃO 3: Botão de concluir adicionado! */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={concluido}
                    onClick={() => handleConcluir(l.id || l._id)}
                  >
                    {concluido ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <CircleDashedIcon className="w-8 h-8 text-gray-300 hover:text-emerald-500 transition-colors" />
                    )}
                  </Button>

                  {!isIdosoRole && (
                    <Button variant="ghost" size="icon" onClick={() => handleDeletar(l.id || l._id)} className="text-red-300 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
            <p className="text-gray-400 font-bold text-lg">Nenhum lembrete encontrado.</p>
          </div>
        )}
      </div>

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