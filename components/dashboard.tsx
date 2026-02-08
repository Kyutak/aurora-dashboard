"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Crown, Pill, Utensils, Repeat, Mic, CheckCircle, Circle, CalendarDays, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LembreteModal } from "@/features/reminder-modal"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getSessionUser } from "@/lib/auth-state"
// Importando os serviços do MongoDB
import { createReminder, getDailyReminders, markReminderAsDone } from "@/service/remiders.service"

interface SharedLembretesProps {
  userType: "familiar" | "admin"
}

export function SharedLembretes({ userType }: SharedLembretesProps) {
  const { toast } = useToast()
  const [lembretes, setLembretes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [lembreteParaEditar, setLembreteParaEditar] = useState<any>()
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)

  // Pegando o id do idoso de forma segura
  const session = getSessionUser() as any; 
  const elderId = session?.elderId;

  // Função para buscar dados do Banco
  const carregarDados = useCallback(async () => {
    if (!elderId) {
        setLoading(false);
        return;
    }
    try {
      setLoading(true)
      const data = await getDailyReminders(elderId)
      setLembretes(data)
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao conectar com o banco de dados.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [elderId, toast])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // Suas funções auxiliares originais (Mantidas para não dar erro de 'not found')
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "medicamento": return <Pill className="w-6 h-6 text-pink-500" />
      case "refeicao": return <Utensils className="w-6 h-6 text-orange-500" />
      case "rotina": return <Repeat className="w-6 h-6 text-blue-500" />
      case "lembrete-voz": return <Mic className="w-6 h-6 text-emerald-500" />
      case "evento": return <CalendarDays className="w-6 h-6 text-green-600" />
      default: return null
    }
  }

  const getDiasSemanaLabel = (dias?: number[]) => {
    if (!dias || dias.length === 0) return ""
    const labels = ["D", "S", "T", "Q", "Q", "S", "S"]
    return dias.map((d) => labels[d]).join(", ")
  }

  const handleCriarLembrete = async (dados: any) => {
    try {
      if (!elderId) return toast({ title: "Erro", description: "ID do idoso não encontrado." });

      await createReminder({
        title: dados.titulo,
        time: dados.horario,
        type: dados.tipo,
        daysOfWeek: dados.diasSemana || [0,1,2,3,4,5,6],
        elderId: elderId
      })
      
      toast({ title: "✅ Sucesso", description: "Lembrete salvo no MongoDB!" })
      setModalOpen(false)
      carregarDados() // Atualiza a lista
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao salvar.", variant: "destructive" })
    }
  }

  const handleDeletar = async (id: string) => {
    try {
        await markReminderAsDone(id);
        toast({ title: "🗑️ Excluído", description: "Removido do banco de dados." });
        carregarDados();
    } catch (e) {
        toast({ title: "Erro", description: "Erro ao deletar.", variant: "destructive" });
    }
  }

  const lembretesVoz = lembretes.filter((l) => l.type === "lembrete-voz")
  const limiteAtingido = lembretesVoz.length >= 2

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-teal-500" /></div>

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 my-[-28px]">
        <div aria-hidden className="pointer-events-none absolute top-0 left-0 w-full h-[400px] bg-gradient-to-br from-blue-500 via-teal-500 to-teal-400" />

        <div className="relative z-10 pt-56 md:pt-64">
           {/* ... Mantenha o JSX original de Título e Header aqui ... */}
           <div className="bg-zinc-50 dark:bg-gray-900 rounded-t-[32px] p-6 min-h-[calc(100vh-220px)] mt-[-40px]">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Editar lembretes</h2>
                <Button onClick={() => { setLembreteParaEditar(undefined); setModalOpen(true); }} className="rounded-full bg-emerald-500"><Plus /></Button>
              </div>

              <div className="space-y-3 mt-8">
                {lembretes.map((lembrete) => (
                  <div key={lembrete.id} className={`flex items-center gap-4 p-4 rounded-xl border bg-white`}>
                    <div className="w-12 h-12 rounded-full border flex items-center justify-center">
                      {getTipoIcon(lembrete.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{lembrete.title}</p>
                      <Badge variant="outline">{lembrete.time}</Badge>
                    </div>
                    <Button onClick={() => handleDeletar(lembrete.id)} variant="destructive" size="sm">
                       <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      <LembreteModal open={modalOpen} onOpenChange={setModalOpen} onSave={handleCriarLembrete} lembrete={lembreteParaEditar} />
    </>
  )
}