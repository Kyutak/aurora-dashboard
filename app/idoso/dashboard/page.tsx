"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Clock,
  Pill,
  Utensils,
  Repeat,
  CalendarDays,
  CheckCircle,
  Circle,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmergencyButton } from "@/features/emergency-button"
import { getSessionUser, SessionUser } from "@/lib/auth-state"
import { Badge } from "@/components/ui/badge"

import { 
  getDailyReminders, 
  markReminderAsDone, 
  ReminderData 
} from "@/service/remiders.service"
import { emergencyService } from '@/service/emergency.service'

export default function IdosoDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [user, setUser] = useState<SessionUser | null>(null)
  const [lembretes, setLembretes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dataAtual, setDataAtual] = useState("")

  // Usamos um useCallback que não reseta o loading para atualizações silenciosas
  const fetchLembretes = useCallback(async (elderId: string, silent = false) => {
    try {
      if (!silent) setLoading(true)
      const data = await getDailyReminders(elderId)
      setLembretes(data || [])
    } catch (error: any) {
      console.error("Erro na busca de lembretes:", error)
      if (!silent) toast({ title: "Erro ao atualizar lista", variant: "destructive" })
    } finally {
      if (!silent) setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const session = getSessionUser()
    setUser(session)
    const idDoIdoso = session?.elderProfileId || (session as any)?.id;

    const hoje = new Date()
    const dataFormatada = hoje.toLocaleDateString("pt-BR", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    })
    setDataAtual(dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1))

    if (idDoIdoso) {
      fetchLembretes(idDoIdoso)

      const interval = setInterval(() => {
        console.log("Sincronizando dados em segundo plano...")
        fetchLembretes(idDoIdoso, true) 
      }, 10000); 

      // Limpa o intervalo se o usuário sair da tela
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [fetchLembretes])
  
  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    sessionStorage.removeItem("authToken")
    router.push("/auth/login")
  }

  const handleSOS = async () => {
  setLoading(true);
  try {
    await emergencyService.triggerSOS();
    alert("SOCORRO ENVIADO! Os cuidadores foram notificados.");
  } catch (err) {
    alert("ERRO: Não foi possível enviar o alerta. Ligue para 192.");
  } finally {
    setLoading(false);
  }
}

  const handleToggleCompleto = async (reminderId: string) => {
    const idDoIdoso = user?.elderId || (user as any)?.id || (user as any)?._id
    
    try {
      // Otimismo na UI: Suporta tanto .id quanto ._id
      setLembretes(prev => prev.map(l => {
        const currentId = l.id || l._id
        return currentId === reminderId ? { ...l, isCompleted: true } : l
      }))
      
      await markReminderAsDone(reminderId)
      toast({ title: "✅ Concluído!" })
      
      // Recarrega para garantir sincronia com o banco
      if (idDoIdoso) fetchLembretes(idDoIdoso)
    } catch (error) {
      toast({ title: "Erro ao marcar como concluído", variant: "destructive" })
      if (idDoIdoso) fetchLembretes(idDoIdoso)
    }
  }

  const getTipoIcon = (tipo: string) => {
    const t = tipo?.toLowerCase() || ""
    if (t.includes("medicamento") || t.includes("pill")) return <Pill className="w-10 h-10 text-pink-500" />
    if (t.includes("refeicao") || t.includes("refeição") || t.includes("utensils")) return <Utensils className="w-10 h-10 text-orange-500" />
    if (t.includes("rotina") || t.includes("repeat")) return <Repeat className="w-10 h-10 text-blue-500" />
    if (t.includes("evento") || t.includes("calendar")) return <CalendarDays className="w-10 h-10 text-green-600" />
    return <Clock className="w-10 h-10 text-blue-600" />
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-black text-emerald-600 tracking-tighter">Aurora</h1>
            <p className="text-xl text-gray-500 font-medium">Olá, {user?.name}!</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-red-500 font-bold hover:bg-red-50">Sair</Button>
        </div>

        <p className="text-2xl font-bold text-center text-gray-700 bg-white p-6 rounded-3xl shadow-sm border border-emerald-50">
          {dataAtual}
        </p>

        <EmergencyButton onEmergency={handleSOS} />

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 ml-2">O que temos para hoje?</h2>

          {lembretes.length > 0 ? (
            lembretes.map((l) => {
              const currentId = l.id || l._id; // Captura o ID correto do objeto
              return (
                <Card 
                  key={currentId} 
                  onClick={() => !l.isCompleted && currentId && handleToggleCompleto(currentId)}
                  className={`p-6 border-4 transition-all active:scale-95 cursor-pointer rounded-[32px] ${
                    l.isCompleted 
                      ? "opacity-60 bg-gray-100 border-transparent shadow-none" 
                      : "bg-white border-white shadow-xl shadow-emerald-100/50"
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-2xl ${l.isCompleted ? 'bg-gray-200' : 'bg-emerald-50'}`}>
                      {getTipoIcon(l.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-3xl font-black leading-tight ${l.isCompleted ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {l.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-lg px-4 py-1 rounded-full ${l.isCompleted ? "bg-gray-300" : "bg-emerald-500"}`}>
                          {l.time}
                        </Badge>
                      </div>
                    </div>
                    {l.isCompleted ? (
                      <CheckCircle className="w-20 h-20 text-emerald-500" />
                    ) : (
                      <Circle className="w-20 h-20 text-gray-100" />
                    )}
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-24 border-4 border-dashed rounded-[40px] border-gray-100 bg-gray-50/50">
              <p className="text-2xl font-bold text-gray-400">Tudo limpo por aqui!</p>
              <p className="text-gray-400 mt-2">Você não tem lembretes agendados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}