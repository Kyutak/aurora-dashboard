"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Clock,
  Bell,
  MicIcon,
  Pill,
  Utensils,
  Repeat,
  Mic,
  CalendarDays,
  CheckCircle,
  Circle,
  LogOut,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmergencyButton } from "@/features/emergency-button"
import { VoiceRecorderModal } from "@/features/voice-recorder"
import { sharedState } from "@/lib/shared-state"
import { getSessionUser } from "@/lib/auth-state"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export default function IdosoDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  
  const [userName, setUserName] = useState("...")
  const [isRecorderOpen, setIsRecorderOpen] = useState(false)
  const [lembretes, setLembretes] = useState(sharedState.getLembretes())
  const [botaoEmergenciaAtivo, setBotaoEmergenciaAtivo] = useState(true)
  const [lembretesCompletos, setLembretesCompletos] = useState<Set<string>>(new Set())
  const [dataAtual, setDataAtual] = useState("")

  useEffect(() => {
    // 1. Pega a sessão
    const session = getSessionUser()
    
    const seveName = localStorage.getItem("userName");
      if (seveName) {
      setUserName(seveName);
    } else {
      // 2. CASO NÃO TENHA, TENTA PEGAR DA SESSÃO
      const session = getSessionUser();
      const sessionName = session?.user?.name || session?.user?.name;
      if (sessionName) setUserName(sessionName);
    }
    
    if (session?.user?.name) {
    setUserName(session.user.name);
    }
    // 2. Data Atual
    const hoje = new Date()
    const dataFormatada = hoje.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    setDataAtual(dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1))

    // 3. Sync com Shared State
    const unsubscribe = sharedState.subscribe(() => {
      setLembretes(sharedState.getLembretes())
      const prefs = sharedState.getPreferencias()
      setBotaoEmergenciaAtivo(prefs.botaoEmergenciaAtivo)
      setLembretesCompletos(new Set(sharedState.getLembretesCompletos()))
    })

    // Cleanup corrigido (Sintaxe OK agora)
    return () => {
      unsubscribe()
    }
  }, [router])

  const handleLogout = () => {
    // Importante: Limpar o cookie que o seu middleware checa!
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    sessionStorage.removeItem("authToken")
    router.push("/auth/login")
  }

  // --- Funções de Apoio ---
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "medicamento": return <Pill className="w-10 h-10 text-pink-500" />
      case "refeicao": return <Utensils className="w-10 h-10 text-orange-500" />
      case "rotina": return <Repeat className="w-10 h-10 text-blue-500" />
      case "lembrete-voz": return <Mic className="w-10 h-10 text-emerald-500" />
      case "evento": return <CalendarDays className="w-10 h-10 text-green-600" />
      default: return <Bell className="w-10 h-10 text-blue-600" />
    }
  }

  const handleToggleCompleto = (id: string) => {
    sharedState.toggleLembreteCompleto(id)
    toast({
      title: sharedState.isLembreteCompleto(id) ? "✅ Tarefa feita!" : "Lembrete reativado",
    })
  }

  const lembretesHoje = lembretes.filter((l) => {
    const hoje = new Date().getDate()
    const dataLembrete = new Date(l.data).getDate()
    return l.repeticao === "Diária" || hoje === dataLembrete
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="text-left">
            <h1 className="text-4xl md:text-6xl font-black text-emerald-600">Aurora</h1>
            <p className="text-gray-500 text-xl font-medium">Olá, {userName}!</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-emerald-100">
               <Image src="/images/aurora-logo.png" alt="Logo" width={50} height={50} />
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 font-bold hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full" />
        <p className="text-2xl font-bold text-center text-gray-700">{dataAtual}</p>

        {/* Botão de Emergência */}
        {botaoEmergenciaAtivo && (
          <div className="py-4">
             <EmergencyButton onEmergency={() => toast({ title: "🚨 Ajuda chamada!", variant: "destructive" })} />
          </div>
        )}

        {/* Lembretes */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <Clock className="w-6 h-6 text-emerald-600" /> Lembretes de Hoje
          </h2>

          {lembretesHoje.length > 0 ? (
            lembretesHoje.map((lembrete) => {
              const concluido = lembretesCompletos.has(lembrete.id)
              return (
                <Card 
                  key={lembrete.id} 
                  className={`p-5 border-2 transition-all ${concluido ? "bg-gray-50 border-gray-200" : "bg-white border-emerald-100 shadow-lg"}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-full">{getTipoIcon(lembrete.tipo)}</div>
                    <div className="flex-1">
                      <p className={`text-xl font-bold ${concluido ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {lembrete.titulo}
                      </p>
                      <Badge variant="outline" className="text-md mt-1 border-emerald-200">{lembrete.horario}</Badge>
                    </div>
                    <button onClick={() => handleToggleCompleto(lembrete.id)} className="p-2">
                      {concluido ? <CheckCircle className="w-14 h-14 text-emerald-500" /> : <Circle className="w-14 h-14 text-gray-300" />}
                    </button>
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-3xl">
              Nenhum lembrete para agora.
            </div>
          )}
        </div>

        {/* Botão de Voz */}
        <div className="pt-6">
          <Button
            onClick={() => setIsRecorderOpen(true)}
            className="w-full h-32 text-2xl font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-[40px] shadow-2xl flex flex-col gap-2"
          >
            <MicIcon size={44} />
            Gravar Lembrete
          </Button>
        </div>
      </div>

      <VoiceRecorderModal 
        isOpen={isRecorderOpen} 
        onClose={() => setIsRecorderOpen(false)} 
        onSaveReminder={() => {}} 
      />
    </div>
  )
}