"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserCheck, Activity, LinkIcon, Crown, Trash2, Users, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
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

import { elderService } from "@/service/elder.service"
import { authCollaboratorService } from "@/service/collaborator.service"

export function AdminPainel() {
  const { toast } = useToast()
  
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [idosos, setIdosos] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showCadastroDialog, setShowCadastroDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    age: "",
    birthData: "",
    emergencyContact: "",
    createLogin: true
  })

  // 1. CARREGAR DADOS FILTRADOS DO CHEFE
  const loadData = async () => {
    try {
      setIsLoadingData(true)
      
      const [resElders, resCollabs] = await Promise.all([
        elderService.getMyElders(),            // Service Novo
        authCollaboratorService.getMyCollaborators() // Service Novo
      ])
      
      // O Axios retorna os dados dentro de .data
      setIdosos(resElders.data || [])
      setColaboradores(resCollabs.data || [])

    } catch (error) {
      console.error("Erro ao carregar painel:", error)
      toast({
        title: "Erro de conexão",
        description: "Não foi possível carregar seus dados.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCadastrarIdoso = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.cpf) {
      toast({ title: "❌ Campos obrigatórios", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      const payload = {
        ...formData,
        age: Number(formData.age),
        medicalConditions: [],
        medications: []
      }

      await elderService.create(payload)

      toast({
        title: "✅ Idoso Cadastrado",
        description: `${formData.name} foi adicionado com sucesso!`,
      })

      setShowCadastroDialog(false)
      setFormData({ name: "", email: "", password: "", cpf: "", age: "", birthData: "", emergencyContact: "", createLogin: true })
      
      loadData() // Recarrega a lista
    } catch (error: any) {
      toast({
        title: "❌ Erro no Cadastro",
        description: error.response?.data?.message || "Erro ao conectar ao servidor.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string, tipo: 'idoso' | 'colaborador') => {
    console.log(`Lógica de delete para ${tipo} com ID: ${id}`)
    toast({ title: "Em breve", description: "Lógica de exclusão será implementada." })
  }

  const handleEnviarConvite = (tipo: "familiar" | "colaborador") => {
    const link = `https://aurora.app/register?role=${tipo.toUpperCase()}`
    navigator.clipboard.writeText(link)
    toast({ title: "✅ Link Copiado", description: `Envie o link para o ${tipo}.` })
  }

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 my-[-28px]">
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-400" />

        <div className="relative z-10 pt-56 md:pt-64">
          <div className="flex items-center justify-between mb-8 px-6">
            <h1 className="text-4xl font-bold text-white drop-shadow-md">Gestão Aurora</h1>
            <Button onClick={() => setShowUpgradeDialog(true)} className="bg-white text-teal-700 hover:bg-gray-100">
              <Crown className="w-4 h-4 mr-2 text-yellow-500" /> Plano Pro
            </Button>
          </div>

          <div className="bg-zinc-50 dark:bg-gray-900 rounded-t-[40px] shadow-inner p-6 md:p-10">
            
            {/* SEÇÃO COLABORADORES */}
            <Card className="p-6 mb-8 border-none shadow-lg">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-700 mb-6">
                <Users className="w-6 h-6" /> Colaboradores da Família
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {isLoadingData ? (
                  <Loader2 className="animate-spin text-blue-500" />
                ) : colaboradores.length > 0 ? (
                  colaboradores.map(item => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-xl flex justify-between items-center border">
                      <div className="flex flex-col">
                        {/* AQUI MUDOU: Acessamos item.user.name pois o Prisma traz aninhado */}
                        <span className="font-semibold">{item.user?.name || "Sem Nome"}</span>
                        <span className="text-xs text-gray-500">{item.user?.email}</span>
                        {/* Exibe qual idoso ele cuida, se disponível */}
                        {item.elder?.name && (
                            <span className="text-[10px] text-blue-500 mt-1">Cuida de: {item.elder.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Membro</Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, 'colaborador')}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum colaborador cadastrado.</p>
                )}
              </div>

              <Button 
                variant="outline" 
                className="w-full border-dashed border-2 h-14 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => handleEnviarConvite("colaborador")}
              >
                <LinkIcon className="w-4 h-4 mr-2" /> Gerar Convite para Novo Colaborador
              </Button>
            </Card>

            {/* SEÇÃO IDOSOS */}
            <Card className="p-6 border-none shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-emerald-700">
                <Activity className="w-6 h-6" /> Idosos Sob Cuidado
              </h2>
              
              <div className="space-y-4 mb-6">
                {isLoadingData ? (
                  <Loader2 className="animate-spin text-emerald-500" />
                ) : idosos.length > 0 ? (
                  idosos.map(idoso => (
                    <div key={idoso.id} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                          {idoso.name?.[0] || "?"}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-emerald-900">{idoso.name}</span>
                            <span className="text-xs text-emerald-700">CPF: {idoso.cpf}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-200 text-emerald-800 hover:bg-emerald-200">Ativo</Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(idoso.id, 'idoso')}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhum idoso cadastrado.</p>
                )}
              </div>

              <Button 
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setShowCadastroDialog(true)}
              >
                <UserCheck className="w-5 h-5 mr-2" /> Adicionar Novo Idoso
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* MODAL DE CADASTRO (MANTIDO IGUAL) */}
      <Dialog open={showCadastroDialog} onOpenChange={setShowCadastroDialog}>
         <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Cadastro de Idoso</DialogTitle>
                <DialogDescription>Insira as informações conforme os registros médicos.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
               {/* FORMULÁRIO MANTIDO IGUAL AO SEU ORIGINAL */}
               <div className="col-span-2 space-y-2">
                  <Label>Nome Completo</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label>Idade</Label>
                  <Input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input type="date" value={formData.birthData} onChange={e => setFormData({...formData, birthData: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label>Contato de Emergência</Label>
                  <Input value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} />
               </div>
               <div className="col-span-2 border-t pt-4 mt-2">
                  <p className="text-sm font-bold text-gray-500 mb-4">Dados de Acesso (Login)</p>
               </div>
               <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label>Senha Temporária</Label>
                  <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
               </div>
            </div>
            <DialogFooter>
               <Button variant="ghost" onClick={() => setShowCadastroDialog(false)}>Cancelar</Button>
               <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCadastrarIdoso} disabled={loading}>
                  {loading ? "Cadastrando..." : "Confirmar Cadastro"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </>
  )
}