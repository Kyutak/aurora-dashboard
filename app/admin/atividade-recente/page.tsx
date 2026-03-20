"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Activity, Loader2, RefreshCw, FileText, HeartPulse, ShieldCheck, Users } from "lucide-react"
import { useAuroraSync } from "@/hooks/use-sync"
import { sharedState, Atividade } from "@/lib/shared-state"
import { elderService } from "@/service/elder.service"
import { authService } from "@/service/auth.service"
import { authCollaboratorService } from "@/service/collaborator.service"
import { gerarRelatorioPDF } from "@/lib/pdf/relatorio"

// Função auxiliar apenas para a interface visual do site
const formatarPerfil = (tipo: string) => {
  if (tipo === 'admin') return 'Gestor'
  if (tipo === 'idoso') return 'Paciente'
  if (tipo === 'colaborador') return 'Cuidador'
  if (tipo === 'atividade') return 'Sistema'
  return tipo || 'Sistema'
}

export default function AtividadeRecentePage() {
  const { atividades } = useAuroraSync()
  const [loading, setLoading] = useState(true)

  const [equipe, setEquipe] = useState({
    admin: null as any,
    idosos: [] as any[],
    colaboradores: [] as any[]
  })

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true)

      const [logsRes, meRes, eldersRes, collabsRes] = await Promise.all([
        elderService.getLogs().catch(() => []),
        authService.getMe().catch(() => ({ data: null })),
        elderService.getMyElders().catch(() => ({ data: [] })),
        authCollaboratorService.getMyCollaborators().catch(() => ({ data: [] }))
      ])

      if (Array.isArray(logsRes)) {
        sharedState.setAtividades(logsRes)
      }

      setEquipe({
        admin: meRes.data,
        idosos: eldersRes.data || [],
        colaboradores: collabsRes.data || []
      })

    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">

          <div className="absolute top-0 left-0 w-full h-[380px] bg-gradient-to-br from-teal-600 via-emerald-500 to-cyan-400 z-0" />

          <div className="relative z-10 pt-16 px-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Histórico</h1>
                <p className="text-teal-50 opacity-90 font-medium">Monitoramento em tempo real</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => gerarRelatorioPDF(atividades, equipe)}
                  disabled={loading || atividades.length === 0}
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 text-teal-700 bg-white hover:bg-gray-100 gap-2 font-bold shadow-lg"
                >
                  <FileText className="w-4 h-4" />
                  Baixar Relatório PDF
                </button>

                <button
                  onClick={carregarDados}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50 text-white hover:bg-white/20 gap-2 border border-white/30 backdrop-blur-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Sincronizar
                </button>
              </div>
            </div>

            {/* Cards da equipe */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4 text-white">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2 opacity-80">
                  <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Gestor administrativo</span>
                </div>
                <p className="font-bold text-base md:text-lg">
                  {equipe.admin?.name || <Loader2 className="w-4 h-4 animate-spin" />}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4 text-white">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2 opacity-80">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Rede de Cuidadores</span>
                </div>
                <p className="font-bold text-base md:text-lg leading-tight">
                  {equipe.colaboradores.length > 0
                    ? equipe.colaboradores.map(c => c.user?.name || "Colaborador").join(', ')
                    : "Sem cuidadores"}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4 text-white col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-1.5 md:mb-2 opacity-80">
                  <HeartPulse className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Pacientes (Idosos)</span>
                </div>
                <p className="font-bold text-base md:text-lg leading-tight">
                  {equipe.idosos.length > 0
                    ? equipe.idosos.map(i => i.name).join(', ')
                    : "Nenhum cadastrado"}
                </p>
              </div>
            </div>

            {/* Lista de atividades */}
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl p-6 md:p-8 min-h-[calc(100vh-400px)] border border-white/20">

              {/* A TELA CONTINUA MOSTRANDO TUDO PARA FINS DE AUDITORIA DO GESTOR */}
              <div className="space-y-4">
                {loading && atividades.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-teal-600">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-medium animate-pulse">Buscando registros no servidor...</p>
                  </div>
                ) : atividades && atividades.length > 0 ? (
                  atividades.map((atv: Atividade, index: number) => {
                    const perfilFormatado = formatarPerfil(atv.tipo)
                    return (
                      <div
                        key={atv.id || `atv-${index}`}
                        className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-start gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700 hover:border-teal-200 transition-colors shadow-sm"
                      >
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
                              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 leading-relaxed">{atv.acao}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                atv.tipo === 'idoso'
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                  : 'bg-blue-100 text-blue-700 border-blue-200'
                              }
                            >
                              {perfilFormatado}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 mt-3 text-xs font-medium text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            {atv.timestamp ? new Date(atv.timestamp).toLocaleString('pt-BR') : 'Agora'}
                          </div>
                        </div>
                      </div>
                    )
                  })
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