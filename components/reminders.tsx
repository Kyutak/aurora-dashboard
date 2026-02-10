"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Trash2, Pill, Utensils, Repeat, CalendarDays } from "lucide-react"
import { LembreteModal } from "@/features/reminder-modal"
import { useToast } from "@/hooks/use-toast"
import { elderService } from "@/service/elder.service"
import { getSessionUser } from "@/lib/auth-state"
import { getDailyReminders, deleteReminder, createReminder } from "@/service/remiders.service"


export function SharedLembretes({ userType }: { userType: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [elders, setElders] = useState<any[]>([])
  const [lembretes, setLembretes] = useState<any[]>([])
  const [selectedElderId, setSelectedElderId] = useState<string>("")

  const buscarLembretes = useCallback(async (id: string) => {
    if (!id) return
    try {
      const data = await getDailyReminders(id)
      setLembretes(data || [])
    } catch (e) {
      toast({ title: "Erro ao carregar lista", variant: "destructive" })
    }
  }, [toast])

  useEffect(() => {
    const carregarInicial = async () => {
      setLoading(true)
      const user = getSessionUser()
      
      if (user?.role === "IDOSO" && user.elderId) {
        setSelectedElderId(user.elderId)
        await buscarLembretes(user.elderId)
      } else {
        try {
          const res = await elderService.getMyElders()
          const lista = res.data || []
          setElders(lista)
          if (lista.length > 0) {
            setSelectedElderId(lista[0].id || lista[0]._id)
            await buscarLembretes(lista[0].id || lista[0]._id)
          }
        } catch (error) { console.error(error) }
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
      buscarLembretes(selectedElderId); // Recarrega a lista
    } catch (e) {
      toast({ title: "Erro ao salvar lembrete", variant: "destructive" });
    }
  };

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Lembretes</h2>
          {elders.length > 0 && (
            <select 
              value={selectedElderId}
              onChange={(e) => {
                setSelectedElderId(e.target.value)
                buscarLembretes(e.target.value)
              }}
              className="mt-2 p-1 px-2 bg-emerald-50 rounded-lg text-sm font-bold text-emerald-700 outline-none"
            >
              {elders.map(e => <option key={e.id || e._id} value={e.id || e._id}>{e.name}</option>)}
            </select>
          )}
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-emerald-600 rounded-full"><Plus className="mr-2" /> Novo</Button>
      </div>

      <div className="grid gap-4">
        {lembretes.map((l) => (
          <div key={l.id || l._id} className="p-5 bg-white border rounded-2xl flex justify-between items-center shadow-sm border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                {l.type === 'Medicamento' && <Pill />}
                {l.type === 'Refeição' && <Utensils />}
                {l.type === 'Rotina' && <Repeat />}
                {l.type === 'Evento' && <CalendarDays />}
              </div>
              <div>
                <p className="font-bold text-lg">{l.title}</p>
                <p className="text-sm text-gray-500">{l.time} — {l.type}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => handleDeletar(l.id || l._id)} className="text-red-400 hover:text-red-600">
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        ))}
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