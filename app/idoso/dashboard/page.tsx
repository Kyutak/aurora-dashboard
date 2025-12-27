"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Clock,
  Bell,
  MicIcon,
  Edit2,
  Pill,
  Utensils,
  Repeat,
  Mic,
  CalendarDays,
  CheckCircle,
  Circle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EmergencyButton } from "@/components/emergency-button"
import { VoiceRecorderModal } from "@/components/voice-recorder-modal"
import { LembreteModal } from "@/components/lembrete-modal"
import { sharedState } from "@/lib/shared-state"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Lembrete {
  id: string
  titulo: string
  horario: string
  data: Date
  tipo: "medicamento" | "refeicao" | "lembrete-voz" | "rotina" | "evento"
  criadoPor: string
  repeticao?: string
  diasSemana?: number[]
}

interface Transcricao {
  id: string
  texto: string
  timestamp: Date
}

export default function IdosoDashboard() {
  const { toast } = useToast()
  const [isRecorderOpen, setIsRecorderOpen] = useState(false)
  const [lembretes, setLembretes] = useState(sharedState.getLembretes())
  const [botaoEmergenciaAtivo, setBotaoEmergenciaAtivo] = useState(true)
  const [idosoPodeEditar, setIdosoPodeEditar] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [lembreteParaEditar, setLembreteParaEditar] = useState<any>()
  const [lembretesCompletos, setLembretesCompletos] = useState<Set<string>>(sharedState.getLembretesCompletos())
  const [dataAtual, setDataAtual] = useState("")

  useEffect(() => {
    const hoje = new Date()
    const opcoes: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
    const dataFormatada = hoje.toLocaleDateString("pt-BR", opcoes)
    setDataAtual(dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1))

    const unsubscribe = sharedState.subscribe(() => {
      setLembretes(sharedState.getLembretes())
      const prefs = sharedState.getPreferencias()
      setBotaoEmergenciaAtivo(prefs.botaoEmergenciaAtivo)
      setIdosoPodeEditar(prefs.idosoPodeEditarRotina)
      setLembretesCompletos(new Set(sharedState.getLembretesCompletos()))
    })

    const prefs = sharedState.getPreferencias()
    setBotaoEmergenciaAtivo(prefs.botaoEmergenciaAtivo)
    setIdosoPodeEditar(prefs.idosoPodeEditarRotina)

    return () => {
      unsubscribe();
    }
  }, [])

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "medicamento":
        return <Pill className="w-10 h-10 text-pink-500" />
      case "refeicao":
        return <Utensils className="w-10 h-10 text-orange-500" />
      case "rotina":
        return <Repeat className="w-10 h-10 text-blue-500" />
      case "lembrete-voz":
        return <Mic className="w-10 h-10 text-emerald-500" />
      case "evento":
        return <CalendarDays className="w-10 h-10 text-green-600" />
      default:
        return <Bell className="w-10 h-10 text-blue-600" />
    }
  }

  const handleToggleCompleto = (id: string) => {
    sharedState.toggleLembreteCompleto(id)
    toast({
      title: sharedState.isLembreteCompleto(id) ? "✅ Marcado como feito" : "Desmarcado",
      description: sharedState.isLembreteCompleto(id)
        ? "Seus familiares serão notificados."
        : "O lembrete foi desmarcado.",
    })
  }

  const handleEmergencia = () => {
    sharedState.addEmergencia("idoso-1")

    toast({
      title: "🚨 Emergência Acionada",
      description: "Seus familiares foram notificados imediatamente.",
      variant: "destructive",
    })
  }

  const handleSaveReminder = (text: string, date: Date) => {
    if (!sharedState.canAddLembreteVoz()) {
      toast({
        title: "⚠️ Limite Atingido",
        description: "Você atingiu o limite de 2 lembretes de voz gratuitos. Peça para sua família fazer o upgrade!",
        variant: "destructive",
      })
      return
    }

    sharedState.addLembrete({
      titulo: text,
      horario: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      data: date,
      tipo: "lembrete-voz",
      criadoPor: "idoso",
      repeticao: "Única",
    })

    toast({
      title: "✅ Lembrete Salvo",
      description: `Você será lembrado em ${date.toLocaleDateString("pt-BR")}`,
    })
  }

  const handleEditarLembrete = (lembrete: any) => {
    if (lembreteParaEditar) {
      sharedState.updateLembrete(lembreteParaEditar.id, lembrete)
      toast({
        title: "✅ Lembrete Atualizado",
        description: "O lembrete foi atualizado com sucesso.",
      })
    }
    setEditModalOpen(false)
    setLembreteParaEditar(undefined)
  }

  const lembretesHoje = lembretes.filter((l) => {
    const hoje = new Date()
    const lembreteData = l.data instanceof Date ? l.data : new Date(l.data)

    if (l.repeticao === "Única") {
      return (
        lembreteData.getDate() === hoje.getDate() &&
        lembreteData.getMonth() === hoje.getMonth() &&
        lembreteData.getFullYear() === hoje.getFullYear()
      )
    }

    if (l.repeticao === "Semanal" && l.diasSemana) {
      return l.diasSemana.includes(hoje.getDay())
    }

    return true
  })

  const getDiasSemanaLabel = (dias?: number[]) => {
    if (!dias || dias.length === 0) return ""
    const labels = ["D", "S", "T", "Q", "Q", "S", "S"]
    return dias.map((d) => labels[d]).join(", ")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-blue-50 dark:from-emerald-950 dark:via-background dark:to-blue-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="md:text-6xl font-bold mb-2 text-foreground text-3xl text-left">Aurora</h1>
            <p className="text-muted-foreground text-xl text-left my-[-4px]">Olá, Marina!</p>
          </div>
          <Image src="/images/aurora-logo.png" alt="Aurora Logo" width={80} height={80} className="rounded-xl" />
        </div>

        <div className="h-[3px] mt-2 mb-[37px] bg-gradient-to-r from-blue-500 to-green-500"></div>

        <div className="text-center py-4">
          <p className="text-2xl font-semibold text-foreground my-[-30px]">{dataAtual}</p>
        </div>

        {botaoEmergenciaAtivo && (
          <Card className="p-8 bg-gradient-to-br from-red-500 to-red-600 border-none shadow-2xl border-0 rounded-4xl opacity-100 px-[13px] py-4 my-[45px]">
            <EmergencyButton onEmergency={handleEmergencia} />
          </Card>
        )}

        {/* Lembretes do Dia - Fora dos Cards */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 mt-[50px]">
            <Clock className="w-6 h-6 text-blue-600" />
            Lembretes de Hoje
          </h2>
          {lembretesHoje.length > 0 ? (
            lembretesHoje.map((lembrete) => {
              const isCompleto = lembretesCompletos.has(lembrete.id)

              return (
                <div
                  key={lembrete.id}
                  className={`p-6 border-2 transition-all rounded-xl py-[15px] ${
                    isCompleto
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
                      : "bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950 dark:to-emerald-950 border-blue-300 dark:border-blue-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center bg-white dark:bg-gray-900 px-0 mx-[-10px] gap-0">
                      {getTipoIcon(lembrete.tipo)}
                    </div>
                    <div className="flex-1 mx-2">
                      <p
                        className={`font-bold leading-relaxed text-xl ${
                          isCompleto ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {lembrete.titulo}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap items-center">
                        <Badge variant="outline" className="text-lg">
                          {lembrete.horario}
                        </Badge>
                        {idosoPodeEditar && (
                          <>
                            {lembrete.repeticao === "Diária" && <Badge variant="outline">Diária</Badge>}
                            {lembrete.repeticao === "Semanal" && lembrete.diasSemana && (
                              <Badge variant="outline">{getDiasSemanaLabel(lembrete.diasSemana)}</Badge>
                            )}
                            {lembrete.repeticao === "Única" && <Badge variant="outline">Única</Badge>}
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleCompleto(lembrete.id)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mx-[-15px]"
                    >
                      {isCompleto ? (
                        <CheckCircle className="w-12 h-12 text-chart-3" />
                      ) : (
                        <Circle className="w-12 h-12 text-gray-400" />
                      )}
                    </button>
                    {idosoPodeEditar && (
                      <Button
                        onClick={() => {
                          setLembreteParaEditar(lembrete)
                          setEditModalOpen(true)
                        }}
                        size="lg"
                        variant="outline"
                      >
                        <Edit2 className="w-6 h-6" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-xl text-muted-foreground text-center py-4">Nenhum lembrete para hoje</p>
          )}
        </div>

        {/* Lembretes de Voz - Fora dos Cards */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-muted-foreground mb-3 text-center">
            {"Grave um lembrete e selecione a data"}
          </h3>
          <Button
            onClick={() => setIsRecorderOpen(true)}
            size="lg"
            className="w-full text-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex flex-col items-center justify-center h-[142px]"
          >
            <MicIcon style={{ width: "48px", height: "48px" }} className="mb-2" />
            <span>Gravar Lembrete de Voz</span>
          </Button>
        </div>
      </div>

      <VoiceRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onSaveReminder={handleSaveReminder}
      />

      <LembreteModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleEditarLembrete}
        lembrete={lembreteParaEditar}
        canEdit={true}
      />
    </div>
  )
}
