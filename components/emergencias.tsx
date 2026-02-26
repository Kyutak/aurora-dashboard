"use client"

import { emergencyService } from "@/service/emergency.service"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
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

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const data = await emergencyService.getEmergencies(); 
        const formatadas = data.map((e: any) => ({
          id: e._id || e.id,
          at: e.createdAt || e.at || e.timestamp, 
          timestamp: new Date(e.createdAt || e.at || e.timestamp),
          resolved: !!(e.resolved || e.resolvido), 
          idosoId: e.elderId || e.idosoId,
          elderName: e.elder?.name || e.elderName || "Idoso",
          resolvedAt: e.resolvedAt ? new Date(e.resolvedAt) : null,
          observation: e.observation || null,
        }));
        sharedState.setEmergencias(formatadas);
      } catch (err) {
        console.error("Erro ao sincronizar:", err);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  const handleResolver = async () => {
    if (!emergenciaParaResolver) return;
    try {
      await emergencyService.resolveEmergency(emergenciaParaResolver, observacao);
      
      sharedState.resolverEmergencia(emergenciaParaResolver, observacao);

      toast({ title: "✅ Emergência resolvida!" });
      
      setDialogOpen(false);
      setEmergenciaParaResolver(null);
      setObservacao("");
      
    } catch (error: any) {
      console.error("Erro ao resolver:", error);
      toast({ title: "❌ Erro ao resolver", variant: "destructive" });
    }
  };

  if (loading) return <div className="p-10 text-center text-teal-600 font-bold flex justify-center gap-2"><Loader2 className="animate-spin"/> Sincronizando...</div>

  const pendentes = emergencias.filter(e => !e.resolved);
  const resolvidas = emergencias.filter(e => e.resolved).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="relative z-10 pt-56 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-t-[32px] p-6 shadow-xl min-h-screen">
          
          {/* SEÇÃO ATIVAS */}
          {pendentes.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-red-600 mb-4">🚨 Emergências Ativas</h2>
              {pendentes.map(e => (
                <Card key={e.id} className="p-4 border-l-4 border-l-red-500 mb-3">
                   <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{e.elderName}</p>
                        <p className="text-sm text-gray-500">{e.timestamp.toLocaleString()}</p>
                      </div>
                      <Button variant="destructive" onClick={() => {
                        setEmergenciaParaResolver(e.id);
                        setDialogOpen(true);
                      }}>Resolver</Button>
                   </div>
                </Card>
              ))}
            </div>
          )}

          {/* SEÇÃO HISTÓRICO COM OS NOVOS DADOS */}
          <h2 className="text-2xl font-bold mb-4">Histórico</h2>
          {resolvidas.length === 0 && pendentes.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Nenhum registro encontrado.</div>
          ) : (
            resolvidas.map(e => (
              <Card key={e.id} className="p-4 mb-3 opacity-80 border-l-4 border-l-green-500">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-lg">{e.elderName} - Resolvida</p>
                      <p className="text-xs text-gray-500">Chamado: {e.timestamp.toLocaleString()}</p>
                      {e.resolvedAt && (
                        <p className="text-xs text-emerald-600 font-medium mt-1">
                          Solucionado: {e.resolvedAt.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {e.observation && (
                    <div className="ml-9 mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm text-gray-700 italic border border-gray-100 dark:border-gray-700">
                      "{e.observation}"
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir Emergência</DialogTitle>
            <DialogDescription>Preencha os detalhes para arquivar este chamado.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Observação / Conclusão (Opcional)</label>
              <textarea 
                className="w-full border rounded-md p-3 min-h-[120px] text-sm"
                placeholder="Ex: Fui até o quarto e o idoso havia apenas deixado o relógio cair..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleResolver} className="bg-green-600 hover:bg-green-700">Gravar e Resolver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}