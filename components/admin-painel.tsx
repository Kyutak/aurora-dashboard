"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserCheck, Activity, LinkIcon, Crown, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { sharedState } from "@/lib/shared-state"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminPainel() {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState(sharedState.getUsuarios())
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showCadastroDialog, setShowCadastroDialog] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    cpf: "",
  })

  useEffect(() => {
    const unsubscribe = sharedState.subscribe(() => {
      setUsuarios(sharedState.getUsuarios())
    })
    return () => {
      unsubscribe();
    }
  }, [])

  const familiares = usuarios.filter((u) => u.tipo === "familiar")
  const idosos = usuarios.filter((u) => u.tipo === "idoso")

  const handleEnviarConvite = (tipo: "familiar" | "idoso") => {
    const link = `https://aurora.app/convite/${tipo}/${Date.now()}`
    navigator.clipboard.writeText(link)

    toast({
      title: "✅ Link de Convite Copiado",
      description: `O link para convidar um ${tipo === "familiar" ? "familiar" : "idoso"} foi copiado para a área de transferência.`,
    })
  }

  const handleDeleteUsuario = (id: string, nome: string) => {
    if (id === "1") {
      toast({
        title: "❌ Não é possível deletar",
        description: "Você não pode deletar o administrador principal.",
        variant: "destructive",
      })
      return
    }

    sharedState.deleteUsuario(id)
    toast({
      title: "✅ Usuário Removido",
      description: `${nome} foi removido do sistema.`,
    })
  }

  const handleCadastrarIdoso = () => {
    if (!formData.nome || !formData.email || !formData.senha || !formData.cpf) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Preencha todos os campos para cadastrar o idoso.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "✅ Idoso Cadastrado",
      description: `${formData.nome} foi cadastrado com sucesso!`,
    })

    setShowCadastroDialog(false)
    setFormData({ nome: "", email: "", senha: "", cpf: "" })
  }

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
              <h1 className="md:text-4xl font-bold text-white drop-shadow-lg text-4xl">Todos usuários</h1>
              <Button onClick={() => setShowUpgradeDialog(true)} className="hover:bg-yellow-700 bg-sky-900">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </div>

            <div className="bg-zinc-50 dark:bg-gray-900 rounded-t-[32px] shadow-2xl p-6 md:p-8 min-h-[calc(100vh-300px)] py-[35px] mt-[-40px] mb-0">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Gerenciar Usuários</h2>
              <div className="h-[3px] mt-2 mb-[37px] bg-gradient-to-r from-teal-500 to-emerald-500"></div>

              <div className="space-y-6">
                {/* Usuários Familiares */}
                <Card className="p-6 bg-white dark:bg-gray-900">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                    Usuários Familiares ({familiares.length}/2)
                  </h2>
                  <div className="space-y-3">
                    {familiares.map((usuario) => (
                      <div
                        key={usuario.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {usuario.nome[0]}
                          </div>
                          <div>
                            <p className="font-semibold">{usuario.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              Última atividade: {usuario.ultimaAtividade.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                          >
                            {usuario.status}
                          </Badge>
                          {usuario.id !== "1" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteUsuario(usuario.id, usuario.nome)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    {sharedState.canAddFamiliar() ? (
                      <Button
                        onClick={() => handleEnviarConvite("familiar")}
                        variant="outline"
                        className="w-full border-dashed border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-600 h-14"
                      >
                        <LinkIcon className="w-5 h-5 mr-2" />
                        Enviar Link de Convite para Familiar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowUpgradeDialog(true)}
                        variant="outline"
                        className="w-full border-2 border-yellow-400 hover:border-yellow-500 hover:bg-yellow-50 text-yellow-700 h-14"
                      >
                        <Crown className="w-5 h-5 mr-2" />
                        Faça o Upgrade
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Usuários Idosos */}
                <Card className="p-6 bg-white dark:bg-gray-900">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-emerald-600" />
                    Usuários Idosos ({idosos.length}/1)
                  </h2>
                  <div className="space-y-3">
                    {idosos.map((usuario) => (
                      <div
                        key={usuario.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                            {usuario.nome[0]}
                          </div>
                          <div>
                            <p className="font-semibold">{usuario.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              Última atividade: {usuario.ultimaAtividade.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                          >
                            {usuario.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteUsuario(usuario.id, usuario.nome)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {sharedState.canAddIdoso() ? (
                      <Button
                        onClick={() => setShowCadastroDialog(true)}
                        variant="outline"
                        className="w-full border-dashed border-2 border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-600 h-14"
                      >
                        <UserCheck className="w-5 h-5 mr-2" />
                        Cadastrar Novo Idoso
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowUpgradeDialog(true)}
                        variant="outline"
                        className="w-full border-2 border-yellow-400 hover:border-yellow-500 hover:bg-yellow-50 text-yellow-700 h-14"
                      >
                        <Crown className="w-5 h-5 mr-2" />
                        Faça o Upgrade
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cadastro Dialog */}
      <Dialog open={showCadastroDialog} onOpenChange={setShowCadastroDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Idoso</DialogTitle>
            <DialogDescription>Preencha os dados do idoso para cadastrá-lo no sistema.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                placeholder="Ex: Maria Silva"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: maria@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCadastroDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCadastrarIdoso} className="bg-emerald-600 hover:bg-emerald-700">
              Cadastrar Idoso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Crown className="w-6 h-6 text-yellow-600" />
              Faça o Upgrade
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              Você atingiu o limite de usuários do plano gratuito. Faça o upgrade para um plano pago e adicione mais
              usuários ao seu sistema Aurora.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white h-12">
              <Crown className="w-5 h-5 mr-2" />
              Ver Planos Premium
            </Button>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Voltar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
