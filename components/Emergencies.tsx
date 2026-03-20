"use client"

import { emergencyService } from "@/service/emergency.service"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, AlertTriangle, Clock, ClipboardList } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sharedState } from "@/lib/shared-state"
import { useAuroraSync } from "@/hooks/use-sync"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export function SharedEmergencias() {
  const { emergencias } = useAuroraSync()
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [emergenciaParaResolver, setEmergenciaParaResolver] = useState<string | null>(null)
  const [observacao, setObservacao] = useState("")
  const [resolvendo, setResolvendo] = useState(false)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const data = await emergencyService.getEmergencies()
        const formatadas = data.map((e: any) => ({
          id: e._id || e.id,
          at: e.createdAt || e.at || e.timestamp,
          timestamp: new Date(e.createdAt || e.at || e.timestamp),
          resolved: !!(e.resolved || e.resolvido),
          idosoId: e.elderId || e.idosoId,
          elderName: e.elder?.name || e.elderName || "Idoso",
          resolvedAt: e.resolvedAt ? new Date(e.resolvedAt) : null,
          observation: e.observation || null,
        }))
        sharedState.setEmergencias(formatadas)
      } catch (err) {
        console.error("Erro ao sincronizar:", err)
      } finally {
        setLoading(false)
      }
    }
    carregarDados()
  }, [])

  const handleResolver = async () => {
    if (!emergenciaParaResolver) return
    setResolvendo(true)
    try {
      await emergencyService.resolveEmergency(emergenciaParaResolver, observacao)
      sharedState.resolverEmergencia(emergenciaParaResolver, observacao)
      toast({ title: "Emergência resolvida!" })
      setDialogOpen(false)
      setEmergenciaParaResolver(null)
      setObservacao("")
    } catch (error: any) {
      console.error("Erro ao resolver:", error)
      toast({ title: "Erro ao resolver", variant: "destructive" })
    } finally {
      setResolvendo(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
    </div>
  )

  const pendentes  = emergencias.filter(e => !e.resolved)
  const resolvidas = emergencias.filter(e => e.resolved).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Emergências
            </h1>
            {pendentes.length > 0 && (
              <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-bold">
                {pendentes.length}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Conteúdo ─────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Emergências ativas */}
        {pendentes.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm px-5 py-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <h2 className="text-sm font-bold text-red-500 uppercase tracking-wider">Ativas</h2>
            </div>

            <div className="space-y-2.5">
              {pendentes.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-red-100 dark:border-red-950/40 border-l-4 border-l-red-400 bg-red-50/50 dark:bg-red-950/20"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-red-100 dark:bg-red-950/40">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                      {e.elderName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {e.timestamp.toLocaleString()}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => { setEmergenciaParaResolver(e.id); setDialogOpen(true) }}
                    className="shrink-0 bg-red-500 hover:bg-red-600 text-white rounded-full px-4 shadow-sm"
                  >
                    Resolver
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-slate-400 shrink-0" />
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Histórico</h2>
          </div>

          {resolvidas.length === 0 && pendentes.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">Nenhum registro encontrado.</p>
          ) : resolvidas.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">Nenhuma emergência resolvida ainda.</p>
          ) : (
            <div className="space-y-2.5 pb-2">
              {resolvidas.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-zinc-700 border-l-4 border-l-emerald-400 bg-slate-50 dark:bg-zinc-800/40 opacity-80"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/40">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                      {e.elderName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Chamado: {e.timestamp.toLocaleString()}
                    </p>
                    {e.resolvedAt && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        Resolvido: {e.resolvedAt.toLocaleString()}
                      </p>
                    )}
                    {e.observation && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 italic mt-2 bg-slate-100 dark:bg-zinc-700 rounded-lg px-3 py-2">
                        "{e.observation}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Dialog ───────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Resolver emergência
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Adicione uma observação antes de arquivar este chamado.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Observação / Conclusão <span className="normal-case text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              className="w-full border border-slate-200 dark:border-zinc-700 rounded-xl p-3 min-h-[120px] text-sm bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none"
              placeholder="Ex: Fui até o quarto e o idoso havia apenas deixado o relógio cair..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResolver}
              disabled={resolvendo}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full gap-1.5"
            >
              {resolvendo
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                : <><CheckCircle2 className="w-4 h-4" /> Gravar e resolver</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}