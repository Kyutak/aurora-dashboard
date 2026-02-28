"use client"

import { useEffect } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Badge } from "@/components/ui/badge"
import { Clock, Activity } from "lucide-react"
import { useAuroraSync } from "@/hooks/use-sync" 

export default function AtividadeRecentePage() {
  const { atividades } = useAuroraSync(); 

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
          {/* ... Cabeçalho degradê igual ao seu ... */}
          
          <div className="relative z-10 pt-56 md:pt-64">
            <div className="bg-zinc-50 dark:bg-gray-900 rounded-t-[32px] p-6 md:p-8 min-h-[calc(100vh-300px)]">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Activity className="text-teal-500" /> Histórico em Tempo Real
              </h2>
              <div className="h-[3px] mt-2 mb-8 bg-gradient-to-r from-teal-500 to-emerald-500 w-full" />

              <div className="space-y-3">
                {atividades.length > 0 ? (
                  atividades.map((atv) => (
                    <div key={atv.id} className="animate-in fade-in slide-in-from-right-4 duration-500 flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800 border shadow-sm">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br ${
                        atv.tipo === 'idoso' ? 'from-emerald-400 to-emerald-600' : 'from-blue-400 to-blue-600'
                      }`}>
                        {atv.usuario[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-semibold">{atv.usuario}</p>
                          <Badge variant="outline">{atv.tipo}</Badge>
                        </div>
                        <p className="text-muted-foreground">{atv.acao}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(atv.timestamp).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhuma atividade registrada nesta sessão.</p>
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