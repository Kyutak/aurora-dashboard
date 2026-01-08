"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Crown, Pill, Utensils, Repeat, Mic, CheckCircle, Circle, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LembreteModal } from "@/components/lembrete-modal"
import { useToast } from "@/hooks/use-toast"
import { sharedState } from "@/lib/shared-state"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SharedLembretesProps {
  userType: "familiar" | "admin"
}

export function SharedLembretes({ userType }: SharedLembretesProps) {
  const { toast } = useToast()
  const [lembretes, setLembretes] = useState(sharedState.getLembretes())
  const [modalOpen, setModalOpen] = useState(false)
  const [lembreteParaEditar, setLembreteParaEditar] = useState<any>()
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [lembretesCompletos, setLembretesCompletos] = useState<Set<string>>(sharedState.getLembretesCompletos())

  useEffect(() => {
    const unsubscribe = sharedState.subscribe(() => {
      setLembretes(sharedState.getLembretes())
      setLembretesCompletos(new Set(sharedState.getLembretesCompletos()))
    })
    return () =>{
      unsubscribe()
    }
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

  const handleCriarLembrete = (lembrete: any) => {
    if (lembreteParaEditar) {
      sharedState.updateLembrete(lembreteParaEditar.id, lembrete)
      toast({
        title: "✅ Lembrete Atualizado",
        description: "O lembrete foi atualizado com sucesso.",
      })
    } else {
      sharedState.addLembrete({
        ...lembrete,
        data: lembrete.data || new Date(),
        criadoPor: userType,
      })
      toast({
        title: "✅ Lembrete Criado",
        description: "O lembrete foi criado e o idoso será notificado.",
      })
    }
    setModalOpen(false)
    setLembreteParaEditar(undefined)
  }

  const handleDeletar = (id: string) => {
    sharedState.deleteLembrete(id)
    toast({
      title: "🗑️ Lembrete Excluído",
      description: "O lembrete foi removido com sucesso.",
    })
  }

  const getDiasSemanaLabel = (dias?: number[]) => {
    if (!dias || dias.length === 0) return ""
    const labels = ["D", "S", "T", "Q", "Q", "S", "S"]
    return dias.map((d) => labels[d]).join(", ")
  }

  const lembretesVoz = lembretes.filter((l) => l.tipo === "lembrete-voz")
  const lembretesRegulares = lembretes.filter((l) => l.tipo !== "lembrete-voz")
  const limiteAtingido = lembretesVoz.length >= 2

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 my-[-28px]">
        <div
          aria-hidden
          className="pointer-events-none
            absolute top-0 left-0
            w-full h-[400px] md:h-[450px]
            bg-gradient-to-br from-blue-500 via-teal-500 to-teal-400"
        />

        <div className="relative z-10 pt-56 md:pt-64">
          <div className="w-full px-0 md:px-0">
            <div className="flex items-center justify-between mb-25 mt-[-105px] px-[23px] mb-0">
              <h1 className="md:text-4xl font-bold text-white drop-shadow-lg text-4xl">Lembretes</h1>
            </div>

            <div className="bg-zinc-50 dark:bg-gray-900 rounded-t-[32px] shadow-2xl p-6 md:p-8 min-h-[calc(100vh-220px)] py-[35px] mt-[-40px] mb-0">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Editar lembretes</h2>
                <Button
                  onClick={() => {
                    setLembreteParaEditar(undefined)
                    setModalOpen(true)
                  }}
                  size="lg"
                  className="hover:bg-emerald-700 bg-emerald-500 text-white shadow-lg rounded-full px-6"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              <div className="h-[3px] mt-2 mb-[37px] bg-gradient-to-r from-teal-500 to-emerald-500"></div>

              {limiteAtingido && (
                <Card className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-yellow-600" />
                      <div>
                        <p className="font-semibold">Limite de Lembretes de Voz Atingido</p>
                        <p className="text-sm text-muted-foreground">
                          O idoso atingiu o limite de 2 lembretes de voz gratuitos
                        </p>
                      </div>
                    </div>
                    {userType === "admin" ? (
                      <Button
                        onClick={() => setUpgradeDialogOpen(true)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Faça o Upgrade
                      </Button>
                    ) : (
                      <Button variant="secondary" disabled className="cursor-not-allowed">
                        Seja Pro
                      </Button>
                    )}
                  </div>
                </Card>
              )}

              <div className="space-y-3 my-[35px]">
                {lembretes.length === 0 ? (
                  <Card className="p-12 text-center bg-white dark:bg-gray-900">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Nenhum lembrete criado</h2>
                    <p className="text-muted-foreground mb-4">Comece criando o primeiro lembrete</p>
                    <Button onClick={() => setModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Lembrete
                    </Button>
                  </Card>
                ) : (
                  lembretes.map((lembrete) => {
                    const completo = lembretesCompletos.has(lembrete.id)

                    return (
                      <div
                        key={lembrete.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm hover:shadow-md transition-all ${
                          completo
                            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
                            : "bg-white dark:bg-gray-900"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center">
                          {getTipoIcon(lembrete.tipo)}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${completo ? "line-through text-muted-foreground" : ""}`}>
                            {lembrete.titulo}
                          </p>
                          <div className="flex gap-2 flex-wrap mt-1">
                            <Badge variant="outline" className="text-xs">
                              {lembrete.horario}
                            </Badge>
                            {lembrete.repeticao === "Diária" && (
                              <Badge variant="outline" className="text-xs">
                                Diária
                              </Badge>
                            )}
                            {lembrete.repeticao === "Semanal" && lembrete.diasSemana && (
                              <Badge variant="outline" className="text-xs">
                                {getDiasSemanaLabel(lembrete.diasSemana)}
                              </Badge>
                            )}
                            {lembrete.repeticao === "Única" && (
                              <Badge variant="outline" className="text-xs">
                                {new Date(lembrete.data).toLocaleDateString("pt-BR")}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button
                            onClick={() => {
                              setLembreteParaEditar(lembrete)
                              setModalOpen(true)
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Editar
                          </Button>
                          <Button onClick={() => handleDeletar(lembrete.id)} variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          {completo ? (
                            <CheckCircle className="w-7 h-7 text-chart-3" />
                          ) : (
                            <Circle className="w-7 h-7 text-gray-400" />
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LembreteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleCriarLembrete}
        lembrete={lembreteParaEditar}
        canEdit={lembreteParaEditar?.tipo === "lembrete-voz"}
      />

      {userType === "admin" && (
        <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-600" />
                Faça o Upgrade para Pro
              </DialogTitle>
              <DialogDescription>Desbloqueie recursos premium para sua família</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Recursos Pro incluem:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Lembretes de voz ilimitados</li>
                  <li>Mais usuários familiares e idosos</li>
                  <li>Suporte prioritário</li>
                  <li>Backup automático na nuvem</li>
                </ul>
              </div>
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                <Crown className="w-4 h-4 mr-2" />
                Assinar Plano Pro
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
