"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sharedState } from "@/lib/shared-state"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function SharedEmergencias() {
  const { toast } = useToast()
  const [emergencias, setEmergencias] = useState(sharedState.getEmergencias())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [emergenciaParaResolver, setEmergenciaParaResolver] = useState<string | null>(null)
  const [observacao, setObservacao] = useState("")

  useEffect(() => {
    const unsubscribe = sharedState.subscribe(() => {
      setEmergencias(sharedState.getEmergencias())
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const handleAbrirDialogResolver = (id: string) => {
    setEmergenciaParaResolver(id)
    setObservacao("")
    setDialogOpen(true)
  }

  const handleResolver = () => {
    if (emergenciaParaResolver) {
      sharedState.resolverEmergencia(emergenciaParaResolver, observacao)
      toast({
        title: "✅ Emergência Resolvida",
        description: "A emergência foi marcada como resolvida.",
      })
      setDialogOpen(false)
      setEmergenciaParaResolver(null)
      setObservacao("")
    }
  }

  const emergenciasPendentes = emergencias.filter((e) => !e.resolvido)
  const emergenciasResolvidas = emergencias.filter((e) => e.resolvido)

  // Ordenar as emergências resolvidas da mais recente para a mais antiga
  const emergenciasResolvidasOrdenadas = emergenciasResolvidas.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  )

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 my-[-28px]">
        {/* Background gradient with same dimensions */}
        <div
          aria-hidden
          className="pointer-events-none
            absolute top-0 left-0
            w-full h-[400px] md:h-[450px]
            bg-gradient-to-br from-blue-500 via-teal-500 to-teal-400"
        />

        {/* CONTEÚDO with same spacing */}
        <div className="relative z-10 pt-56 md:pt-64">
          <div className="w-full px-0 md:px-0">
            {/* Title with same margins */}
            <div className="flex items-center justify-between mb-25 mt-[-105px] px-[23px] mb-0">
              <h1 className="md:text-4xl font-bold text-white drop-shadow-lg text-4xl">Emergências</h1>
            </div>

            {/* White rounded card */}
            <div className="bg-zinc-50 dark:bg-gray-900 rounded-t-[32px] shadow-2xl p-6 md:p-8 min-h-[calc(100vh-220px)] py-[35px] mt-[-40px] mb-0">
              {/* Emergências Pendentes */}
              {emergenciasPendentes.length > 0 && (
                <div className="space-y-4 mb-[60px]">
                  <h2 className="text-3xl md:text-4xl font-bold text-destructive">🚨 Emergências Ativas</h2>
                  <div className="h-[3px] mt-2 mb-[37px] bg-gradient-to-r from-red-500 to-orange-500"></div>

                  {emergenciasPendentes.map((emergencia) => (
                    <Card
                      key={emergencia.id}
                      className="p-6 bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-1">Emergência Acionada</h3>
                          <p className="text-sm text-muted-foreground">
                            {emergencia.timestamp.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <Button onClick={() => handleAbrirDialogResolver(emergencia.id)} variant="destructive">
                          Marcar como Resolvida
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Histórico de Resolvidas */}
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Histórico</h2>
                <div className="h-[3px] mt-2 mb-[37px] bg-gradient-to-r from-teal-500 to-emerald-500"></div>

                {emergenciasResolvidasOrdenadas.length === 0 && emergenciasPendentes.length === 0 ? (
                  <Card className="p-12 text-center bg-white dark:bg-gray-900">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
                    <h2 className="text-2xl font-bold mb-2">Nenhuma emergência registrada</h2>
                    <p className="text-muted-foreground">Tudo está bem!</p>
                  </Card>
                ) : (
                  emergenciasResolvidasOrdenadas.map((emergencia) => (
                    <Card key={emergencia.id} className="p-6 bg-white dark:bg-gray-900">
                      <div className="flex items-center gap-4">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">Emergência Resolvida</h3>
                          <p className="text-sm text-muted-foreground">
                            {emergencia.timestamp.toLocaleString("pt-BR")}
                          </p>
                          {emergencia.observacao && (
                            <p className="mt-2 text-sm p-3 bg-muted rounded-md border">
                              <strong>Observação:</strong> {emergencia.observacao}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dialog para Resolver Emergência */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolver Emergência</DialogTitle>
              <DialogDescription>Adicione uma observação sobre como a emergência foi resolvida.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="observacao">Observação (opcional)</Label>
                <Textarea
                  id="observacao"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Ex: Chamei ambulância, idoso está bem agora..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleResolver}>Marcar como Resolvida</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
