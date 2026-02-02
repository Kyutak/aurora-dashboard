"use client"

import { useEffect } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface AtividadeItem {
  id: string
  usuario: string
  acao: string
  timestamp: Date
  tipo: "idoso" | "familiar"
}

export default function AtividadeRecentePage() {
  useEffect(() => {
    window.scrollTo({
      top: 49,
      behavior: "auto",
    })
  }, [])

  const atividades: AtividadeItem[] = [
    {
      id: "1",
      usuario: "Maria Silva (Idosa)",
      acao: "Acionou botão de emergência",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      tipo: "idoso",
    },
    {
      id: "2",
      usuario: "João Santos (Familiar)",
      acao: "Criou um novo lembrete",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      tipo: "familiar",
    },
    {
      id: "3",
      usuario: "Ana Costa (Idosa)",
      acao: "Enviou mensagem de voz",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      tipo: "idoso",
    },
    {
      id: "4",
      usuario: "Carlos Oliveira (Familiar)",
      acao: "Resolveu uma emergência",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      tipo: "familiar",
    },
    {
      id: "5",
      usuario: "Pedro Souza (Idoso)",
      acao: "Completou lembrete de medicamento",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      tipo: "idoso",
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
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
                <h1 className="md:text-4xl font-bold text-white drop-shadow-lg text-4xl">Atividade Recente</h1>
              </div>

              <div className="bg-zinc-50 dark:bg-gray-900 rounded-t-[32px] shadow-2xl p-6 md:p-8 min-h-[calc(100vh-300px)] py-[35px] mt-[-40px] mb-0">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Histórico de Atividades</h2>
                <div className="h-[3px] mt-2 mb-[37px] bg-gradient-to-r from-teal-500 to-emerald-500"></div>

                <div className="space-y-3">
                  {atividades.map((atividade) => (
                    <div
                      key={atividade.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border shadow-sm hover:shadow-md transition-all"
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          atividade.tipo === "idoso"
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                            : "bg-gradient-to-br from-blue-500 to-blue-600"
                        }`}
                      >
                        {atividade.usuario[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">{atividade.usuario}</p>
                            <p className="text-muted-foreground">{atividade.acao}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              atividade.tipo === "idoso"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400"
                            }
                          >
                            {atividade.tipo === "idoso" ? "Idoso" : "Familiar"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {atividade.timestamp.toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
