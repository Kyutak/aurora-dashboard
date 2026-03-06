"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Badge } from "@/components/ui/badge"
import { Clock, Activity, Loader2, RefreshCw } from "lucide-react"
import { useAuroraSync } from "@/hooks/use-sync" 
import { sharedState, Atividade } from "@/lib/shared-state"
import { elderService } from "@/service/elder.service" 

export default function AtividadeRecentePage() {
  // Pegamos as atividades do hook de sincronização (Socket/Shared State)
  const { atividades } = useAuroraSync(); 
  const [loading, setLoading] = useState(true);

  // Função para carregar o histórico inicial do banco
  const carregarHistorico = useCallback(async () => {
    try {
      setLoading(true);
      // O service já retorna a data tratada (Atividade[])
      const data = await elderService.getLogs(); 
      
      if (Array.isArray(data)) {
        sharedState.setAtividades(data);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
          
          {/* CABEÇALHO DEGRADÊ */}
          <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-br from-teal-600 via-emerald-500 to-cyan-400 z-0" />
          
          <div className="relative z-10 pt-16 px-6 max-w-5xl mx-auto">
             <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">Atividades</h1>
                  <p className="text-teal-50 opacity-90 font-medium">Monitoramento em tempo real</p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={carregarHistorico}
                  disabled={loading}
                  className="text-white hover:bg-white/20 gap-2 border border-white/30 backdrop-blur-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Sincronizar
                </Button>
             </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl p-6 md:p-8 min-h-[calc(100vh-250px)] border border-white/20">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
                <Activity className="text-teal-500 w-6 h-6" /> Histórico de Eventos
              </h2>
              <div className="h-[2px] mt-4 mb-8 bg-gray-100 dark:bg-gray-800 w-full" />

              <div className="space-y-4">
                {loading && atividades.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-teal-600">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-medium animate-pulse">Buscando registros no servidor...</p>
                  </div>
                ) : atividades && atividades.length > 0 ? (
                  atividades.map((atv: Atividade, index: number) => (
                    <div 
                      key={atv.id || `atv-${index}`} 
                      className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-start gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700 hover:border-teal-200 transition-colors shadow-sm"
                    >
                      {/* Avatar dinâmico baseado no tipo */}
                      <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white font-bold shadow-inner bg-gradient-to-br ${
                        atv.tipo === 'idoso' 
                          ? 'from-emerald-400 to-emerald-600' 
                          : atv.tipo === 'admin' 
                            ? 'from-teal-500 to-teal-700' 
                            : 'from-blue-400 to-blue-600'
                      }`}>
                        {atv.usuario ? atv.usuario[0].toUpperCase() : 'A'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">{atv.usuario || "Sistema"}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                              {atv.acao}
                            </p>
                          </div>
                          <Badge 
                            variant="outline"
                            className={
                              atv.tipo === 'idoso' 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                            } 
                          >
                            {atv.tipo === 'admin' ? 'Gestão' : atv.tipo}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3 text-xs font-medium text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {atv.timestamp ? new Date(atv.timestamp).toLocaleString('pt-BR') : 'Agora'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-24 text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Activity className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium">Nenhuma atividade recente encontrada.</p>
                    <p className="text-sm">As ações realizadas aparecerão aqui automaticamente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Componente de botão interno corrigido
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'default';
}

function Button({ className, children, variant, ...props }: ButtonProps) {
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}