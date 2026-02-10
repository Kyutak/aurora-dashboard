"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserCheck, Activity, LinkIcon, Crown, Trash2, Users, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [showCadastroDialog, setShowCadastroDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", cpf: "", age: "", birthData: "", emergencyContact: ""
  })

  const loadData = async () => {
    try {
      setIsLoadingData(true)
      const [resElders, resCollabs] = await Promise.all([
        elderService.getMyElders(),
        authCollaboratorService.getMyCollaborators()
      ])
      setIdosos(resElders.data || [])
      setColaboradores(resCollabs.data || [])
    } catch (error) {
      toast({ title: "Erro ao carregar dados", variant: "destructive" })
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleCadastrarIdoso = async () => {
    try {
      setLoading(true)
      await elderService.create({ ...formData, age: Number(formData.age), createLogin: true })
      toast({ title: "✅ Idoso Cadastrado" })
      setShowCadastroDialog(false)
      loadData()
    } catch (error: any) {
      toast({ title: "❌ Erro", description: error.response?.data?.message, variant: "destructive" })
    } finally { setLoading(false) }
  }

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 mt-[-28px]">
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-400" />
      <div className="relative z-10 pt-40 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Gestão Aurora</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* COLABORADORES */}
          <Card className="p-6 shadow-xl border-none">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600"><Users /> Colaboradores</h2>
            <div className="space-y-3">
              {isLoadingData ? <Loader2 className="animate-spin" /> : colaboradores.map(c => (
                <div key={c.id || c._id} className="p-3 bg-gray-50 rounded-lg flex justify-between border">
                  <div>
                    <p className="font-bold text-sm">{c.user?.name}</p>
                    <p className="text-xs text-blue-500">Cuida de: {c.elder?.name}</p>
                  </div>
                  <Badge variant="outline">Ativo</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-dashed" onClick={() => {
               navigator.clipboard.writeText("https://aurora.app/register?role=FAMILIAR")
               toast({title: "Link de convite copiado!"})
            }}> + Convidar </Button>
          </Card>

          {/* IDOSOS */}
          <Card className="p-6 shadow-xl border-none">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-600"><Activity /> Meus Idosos</h2>
            <div className="space-y-3">
              {isLoadingData ? <Loader2 className="animate-spin" /> : idosos.map(i => (
                <div key={i.id || i._id} className="p-3 bg-emerald-50 rounded-lg flex justify-between border border-emerald-100">
                  <div>
                    <p className="font-bold text-sm text-emerald-900">{i.name}</p>
                    <p className="text-[10px] text-emerald-600">CPF: {i.cpf}</p>
                  </div>
                  <Trash2 className="w-4 h-4 text-red-300 cursor-pointer hover:text-red-500" />
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-emerald-600" onClick={() => setShowCadastroDialog(true)}>Adicionar Idoso</Button>
          </Card>
        </div>
      </div>

      <Dialog open={showCadastroDialog} onOpenChange={setShowCadastroDialog}>
          {/* O conteúdo do Dialog permanece o mesmo do seu código original, apenas certifique-se de vincular o setFormData */}
          <DialogContent>
             <DialogHeader><DialogTitle>Novo Idoso</DialogTitle></DialogHeader>
             <div className="space-y-4 py-4">
                <Input placeholder="Nome" onChange={e => setFormData({...formData, name: e.target.value})} />
                <Input placeholder="CPF" onChange={e => setFormData({...formData, cpf: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                   <Input type="number" placeholder="Idade" onChange={e => setFormData({...formData, age: e.target.value})} />
                   <Input type="date" onChange={e => setFormData({...formData, birthData: e.target.value})} />
                </div>
                <Input placeholder="Email de Acesso" onChange={e => setFormData({...formData, email: e.target.value})} />
                <Input type="password" placeholder="Senha Temporária" onChange={e => setFormData({...formData, password: e.target.value})} />
             </div>
             <DialogFooter>
                <Button onClick={handleCadastrarIdoso} disabled={loading}>{loading ? "Salvando..." : "Confirmar"}</Button>
             </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  )
}