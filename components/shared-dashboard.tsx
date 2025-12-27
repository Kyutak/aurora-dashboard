"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Settings, CheckCircle, CircleDashedIcon, Pill, Utensils, Repeat, Mic, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LembreteModal } from "@/components/lembrete-modal"
import { useToast } from "@/hooks/use-toast"
import { sharedState } from "@/lib/shared-state"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CalendarTimeline } from "@/components/calendar-timeline"

interface SharedDashboardProps {
  userType: "familiar" | "admin"
}

export function SharedDashboard({ userType }: SharedDashboardProps) {
  const { toast } = useToast()

  const [emergencias, setEmergencias] = useState(sharedState.getEmergencias())
  const [lembretes, setLembretes] = useState(sharedState.getLembretes())
  const [modalOpen, setModalOpen] = useState(false)
  const [lembreteParaEditar, setLembreteParaEditar] = useState<any>()
  const [botaoEmergenciaAtivo, setBotaoEmergenciaAtivo] = useState(true)
  const [observacaoDialogOpen, setObservacaoDialogOpen] = useState(false)
  const [observacao, setObservacao] = useState("")
  const [emergenciaParaResolver, setEmergenciaParaResolver] = useState<string | null>(null)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [lembretesCompletos, setLembretesCompletos] = useState<Set<string>>(sharedState.getLembretesCompletos())

  useEffect(() => {
    const unsubscribe = sharedState.subscribe(() => {
      setEmergencias(sharedState.getEmergencias())
      setLembretes(sharedState.getLembretes())
      setBotaoEmergenciaAtivo(sharedState.getPreferencias().botaoEmergenciaAtivo)
      setLembretesCompletos(new Set(sharedState.getLembretesCompletos()))
    })

    setBotaoEmergenciaAtivo(sharedState.getPreferencias().botaoEmergenciaAtivo)
    return unsubscribe
  }, [])

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "medicamento":
        return <Pill className="w-6 h-6 text-pink-500" />
      case "refeicao":
        return <Utensils className="w-6 h-6 text-orange-500" />
      case "rotina":
        return <Repeat className="w-6 h-6 text-blue-500" />
      case "lembrete-voz":
        return <Mic className="w-6 h-6 text-emerald-500" />
      case "evento":
        return <CalendarDays className="w-6 h-6 text-green-600" />
      default:
        return null
    }
  }

  const getDiasSemanaLabel = (dias?: number[]) => {
    if (!dias || dias.length === 0) return ""
    const labels = ["D", "S", "T", "Q", "Q", "S", "S"]
    return dias.map((d) => labels[d]).join(", ")
  }

  const filterLembretesParaHoje = (lembretes: any[]) => {
    const hoje = new Date()
    return lembretes.filter((l) => {
      const lembreteData = l.data instanceof Date ? l.data : new Date(l.data)

      // For "Única" repetition (including lembrete-voz), only show on the exact date
      if (l.repeticao === "Única" || l.tipo === "lembrete-voz") {
        return (
          lembreteData.getDate() === hoje.getDate() &&
          lembreteData.getMonth() === hoje.getMonth() &&
          lembreteData.getFullYear() === hoje.getFullYear()
        )
      }

      // For "Semanal", show on matching days of the week
      if (l.repeticao === "Semanal" && l.diasSemana) {
        return l.diasSemana.includes(hoje.getDay())
      }

      // For "Diária" or no repeticao, always show
      return true
    })
  }

  const handleResolverEmergencia = (id: string) => {
    setEmergenciaParaResolver(id)
    setObservacaoDialogOpen(true)
  }

  const confirmarResolucao = () => {
    if (!emergenciaParaResolver) return

    sharedState.resolverEmergencia(emergenciaParaResolver, observacao)
    toast({
      title: "Emergência Resolvida",
      description: "A emergência foi marcada como resolvida.",
    })

    setObservacaoDialogOpen(false)
    setObservacao("")
    setEmergenciaParaResolver(null)
  }

  const handleCriarLembrete = (lembrete: any) => {
    if (lembreteParaEditar) {
      sharedState.updateLembrete(lembreteParaEditar.id, lembrete)
    } else {
      sharedState.addLembrete({
        ...lembrete,
        data: lembrete.data || new Date(),
        criadoPor: userType,
      })
    }
    setModalOpen(false)
    setLembreteParaEditar(undefined)
  }

  // They can only VIEW the completion status set by the elderly

  const emergenciaAtiva = emergencias.find((e) => !e.resolvido)
  const lembretesVozHoje = filterLembretesParaHoje(lembretes.filter((l) => l.tipo === "lembrete-voz"))
  const lembretesRegularesHoje = filterLembretesParaHoje(lembretes.filter((l) => l.tipo !== "lembrete-voz"))
  const limiteVozAtingido = lembretes.filter((l) => l.tipo === "lembrete-voz").length >= 2
  const nomeUsuario = userType === "admin" ? "Admin" : "Familiar"

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 my-[-28px]">
        {/* Background */}
        <div
          aria-hidden
          className="pointer-events-none
            absolute top-0 left-0
            w-full h-[400px] md:h-[450px]
            bg-gradient-to-br from-blue-500 via-teal-500 to-teal-400"
        />

        {/* CONTEÚDO */}
        <div className="relative z-10 pt-56 md:pt-64">
          <div className="w-full px-0 md:px-0">
            <div className="flex items-center justify-between mb-25 mt-[-105px] px-[23px] mb-0">
              <div className="flex items-center gap-3">
                <div className="md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-white font-bold text-2xl w-[55px] h-[55px]">
                  {nomeUsuario.charAt(0)}
                </div>
                <div>
                  <h1 className="md:text-3xl font-bold text-white drop-shadow-lg text-3xl">Olá, {nomeUsuario}</h1>
                  <p className="text-white/90 md:text-base drop-shadow text-base">Boa tarde!</p>
                </div>
              </div>

              <Link href={userType === "admin" ? "/admin/configuracoes" : "/familiar/configuracoes"}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/20 hover:bg-white/30 text-white px-6 py-6"
                >
                  <Settings className="w-8 h-8" />
                </Button>
              </Link>
            </div>

            <div className="bg-zinc-50 dark:bg-gray-900 rounded-t-[32px] shadow-2xl p-6 md:p-8 min-h-[calc(100vh-300px)] py-[35px] mt-[-40px] mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Home</h2>

              <div className="h-[3px] mt-2 mb-[37px] bg-gradient-to-r from-teal-500 to-esmerald-500"></div>

              <CalendarTimeline />

              {botaoEmergenciaAtivo && emergenciaAtiva && (
                <div className="flex items-center justify-between p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-800 shadow-lg my-[38px]">
                  <div>
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Emergência Acionada</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {emergenciaAtiva.timestamp.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleResolverEmergencia(emergenciaAtiva.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Resolver
                  </Button>
                </div>
              )}

              {lembretesRegularesHoje.length > 0 && (
                <div className="space-y-3 my-[60px]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Lembretes de Hoje</h3>
                    <Button
                      onClick={() => {
                        setLembreteParaEditar(undefined)
                        setModalOpen(true)
                      }}
                      size="sm"
                      className="hover:bg-emerald-700 bg-primary"
                    >
                      + Novo
                    </Button>
                  </div>

                  {lembretesRegularesHoje.map((l) => {
                    const completo = lembretesCompletos.has(l.id)

                    return (
                      <div
                        key={l.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm transition-all ${
                          completo
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
                            : "bg-white dark:bg-gray-900"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full border flex items-center justify-center">
                          {getTipoIcon(l.tipo)}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${completo ? "line-through text-muted-foreground" : ""}`}>
                            {l.titulo}
                          </p>
                          <div className="flex gap-2 mt-1 items-center">
                            <span className="text-sm">{l.horario}</span>
                            {l.repeticao === "Diária" && (
                              <Badge variant="outline" className="text-xs">
                                Diária
                              </Badge>
                            )}
                            {l.repeticao === "Semanal" && l.diasSemana && (
                              <Badge variant="outline" className="text-xs">
                                {getDiasSemanaLabel(l.diasSemana)}
                              </Badge>
                            )}
                            {l.repeticao === "Única" && (
                              <Badge variant="outline" className="text-xs">
                                {new Date(l.data).toLocaleDateString("pt-BR")}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {completo ? (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle className="w-7 h-7 text-chart-3" />
                              <span className="text-sm font-medium">Feito</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-400">
                              <CircleDashedIcon className="h-6 w-6" />
                              <span className="text-sm">Pendente</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {lembretesVozHoje.length > 0 && (
                <div className="space-y-3 my-[37px]">
                  <div className="flex items-center justify-between my-[37px]">
                    <h3 className="text-xl font-semibold">Lembretes de Voz</h3>
                    <Badge>{lembretes.filter((l) => l.tipo === "lembrete-voz").length}/2</Badge>
                  </div>

                  {lembretesVozHoje.map((l) => {
                    const completo = lembretesCompletos.has(l.id)
                    return (
                      <div
                        key={l.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm transition-all my-[-15px] ${
                          completo
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
                            : "bg-white dark:bg-gray-900"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full border flex items-center justify-center">
                          {getTipoIcon(l.tipo)}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${completo ? "line-through text-muted-foreground" : ""}`}>
                            {l.titulo}
                          </p>
                          <div className="flex gap-2 mt-1 items-center">
                            <span className="text-sm">{l.horario}</span>
                            <Badge variant="outline" className="text-xs">
                              {new Date(l.data).toLocaleDateString("pt-BR")}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {completo ? (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle className="w-7 h-7 fill-emerald-600" />
                              <span className="text-sm font-medium">Feito</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-400">
                              <CircleDashedIcon className="w-7 h-7" />
                              <span className="text-sm">Pendente</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {limiteVozAtingido && (
                    <div className="p-3 bg-yellow-50 border rounded-lg text-center text-sm">
                      Limite de lembretes de voz atingido
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAIS */}
      <LembreteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleCriarLembrete}
        lembrete={lembreteParaEditar}
        canEdit={lembreteParaEditar?.tipo === "lembrete-voz"}
      />

      <Dialog open={observacaoDialogOpen} onOpenChange={setObservacaoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Emergência</DialogTitle>
            <DialogDescription>Adicione uma observação sobre como a emergência foi resolvida.</DialogDescription>
          </DialogHeader>

          <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={4} />

          <DialogFooter>
            <Button onClick={confirmarResolucao}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
