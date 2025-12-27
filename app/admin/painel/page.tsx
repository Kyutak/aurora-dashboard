"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Trash2, Crown, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sharedState } from "@/lib/shared-state"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function PainelAdminPage() {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState(sharedState.getUsuarios())
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({
      top: 49,
      behavior: "auto",
    })
  }, [])

  useEffect(() => {
    const unsubscribe = sharedState.subscribe(() => {
      setUsuarios(sharedState.getUsuarios())
    })
    return () => {
      unsubscribe();
    }
  }, [])

  const handleDeletarUsuario = (id: string, nome: string) => {
    sharedState.deleteUsuario(id)
    toast({
      title: "Usuário Removido",
      description: `${nome} foi removido do sistema.`,
    })
  }

  const familiares = usuarios.filter((u) => u.tipo === "familiar")
  const idosos = usuarios.filter((u) => u.tipo === "idoso")

  const canAddFamiliar = sharedState.canAddFamiliar()
  const canAddIdoso = sharedState.canAddIdoso()

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <div className="relative min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 my-[-28px]">
          {/* SEMICÍRCULO COMO FUNDO */}
          <div
            aria-hidden
            className="pointer-events-none
              absolute top-0 left-1/2 -translate-x-1/2
              w-[130%] h-[230px] md:h-[320px]
              bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500
              rounded-b-[50%]"
          />

          {/* CONTEÚDO */}
          <div className="relative z-10 pt-56 md:pt-64 mx-0">
            <div className="w-full px-4 md:px-6">
              <div className="flex items-center justify-between mt-[-105px] mb-[108px]">
                <h1 className="md:text-4xl font-bold text-white drop-shadow-lg text-4xl">Painel do Admin</h1>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-7 h-7" />
                Gerenciar Usuários
              </h2>
              <div className="h-[3px] mt-2 mb-[37px] bg-gradient-to-r from-blue-500 via-green-400 to-blue-500 animate-slide-right"></div>

              {/* Familiares */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Familiares ({familiares.length}/2)</h3>
                  {canAddFamiliar ? (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setUpgradeDialogOpen(true)}>
                      <Crown className="w-4 h-4 mr-2 text-yellow-600" />
                      Limite Atingido
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {familiares.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {usuario.nome[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{usuario.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Última atividade: {usuario.ultimaAtividade.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Badge
                        variant={usuario.status === "ativo" ? "default" : "secondary"}
                        className={usuario.status === "ativo" ? "bg-emerald-600" : ""}
                      >
                        {usuario.status}
                      </Badge>
                      {usuario.id !== "1" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletarUsuario(usuario.id, usuario.nome)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Idosos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Idosos ({idosos.length}/2)</h3>
                  {canAddIdoso ? (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setUpgradeDialogOpen(true)}>
                      <Crown className="w-4 h-4 mr-2 text-yellow-600" />
                      Limite Atingido
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {idosos.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                        {usuario.nome[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{usuario.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Última atividade: {usuario.ultimaAtividade.toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Badge
                        variant={usuario.status === "ativo" ? "default" : "secondary"}
                        className={usuario.status === "ativo" ? "bg-emerald-600" : ""}
                      >
                        {usuario.status}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletarUsuario(usuario.id, usuario.nome)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade Dialog */}
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
    </div>
  )
}
