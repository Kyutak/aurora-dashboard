"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Trash2, Users, Loader2, CreditCard, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogPortal } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { useSearchParams, useRouter } from 'next/navigation';

// --- ESTADO GLOBAL REATIVO ---
import { useAuroraSync } from "@/hooks/use-sync"
import { sharedState } from "@/lib/shared-state"

// --- SERVICES ---
import { elderService } from "@/service/elder.service"
import { authCollaboratorService } from "@/service/collaborator.service"
import { paymentService } from '@/service/payment.service'
import { authService } from "@/service/auth.service"

export function AdminPainel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast()

  // 1. DADOS REATIVOS (Sincronizados com o app todo)
  const { idosos, colaboradores } = useAuroraSync();

  // 2. ESTADOS LOCAIS DE UI
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showCadastroDialog, setShowCadastroDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPagamentoDialog, setShowPagamentoDialog] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    elderCredits: number;
    collaboratorCredits: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", cpf: "", age: "", birthData: "", emergencyContact: ""
  })

  // 3. CARREGAMENTO DE DADOS (Alimenta o SharedState)
  const loadData = async () => {
    try {
      setIsLoadingData(true)
      const [resElders, resCollabs, resMe] = await Promise.all([
        elderService.getMyElders().catch(() => ({ data: [] })),
        authCollaboratorService.getMyCollaborators().catch(() => ({ data: [] })),
        authService.getMe().catch(() => ({ data: null }))
      ])
      
      // Sincroniza com o estado global para atualizar outros componentes (ex: SharedDashboard)
      sharedState.setIdosos(resElders.data || [])
      sharedState.setColaboradores(resCollabs.data || [])
      
      if (resMe.data) setUserProfile(resMe.data)
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({ title: "Erro ao atualizar dados", variant: "destructive" })
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const status = searchParams.get('success');
    if (status === 'true') {
      toast({ title: "💳 Pagamento Realizado!" });
      loadData(); 
      router.replace('/admin/painel-admin'); 
    }
  }, [searchParams]);

  // 4. AÇÕES
  const handleCadastrarIdoso = async () => {
    try {
      setLoading(true)
      await elderService.create({ ...formData, age: Number(formData.age), createLogin: true })
      toast({ title: "✅ Idoso Cadastrado!" })
      setShowCadastroDialog(false)
      loadData() // Recarrega tudo para sincronizar o global
    } catch (error: any) {
      toast({ title: "❌ Erro ao cadastrar", variant: "destructive" })
    } finally { setLoading(false) }
  }

  const handleBuyCredits = async (type: 'COLLABORATOR' | 'ELDER_EXTRA') => {
    try {
      setIsPaying(true);
      const { checkoutUrl } = await paymentService.createCheckoutSession(type);
      if (checkoutUrl) window.location.href = checkoutUrl;
    } catch (error: any) {
      toast({ title: "❌ Erro no checkout", variant: "destructive" });
      setIsPaying(false);
    }
  };

  const handleExcluirIdoso = async (id: string) => {
    if(confirm("Deseja realmente remover este idoso?")) {
        // Exclusão lógica/física aqui
        toast({ title: "Idoso removido" })
        loadData()
    }
  }

  return (
    <>
      <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="absolute top-0 left-0 w-full h-[320px] bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-400 z-0" />

        <div className="relative z-10 pt-16 px-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Gestão Aurora</h1>
              <p className="text-blue-50 opacity-90 font-medium">Painel de Controle Administrativo</p>
            </div>
            
            <Button 
              onClick={() => setShowPagamentoDialog(true)}
              size="lg" 
              className="rounded-full px-6 bg-white text-blue-600 hover:bg-blue-50 shadow-2xl font-bold gap-2 z-20 border-2 border-white/20"
            >
              <CreditCard className="w-5 h-5" />
              <span>Loja de Créditos</span>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* SEÇÃO: COLABORADORES */}
            <Card className="p-6 shadow-2xl border-none bg-white/95 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600">
                <Users className="w-6 h-6" /> Colaboradores
                <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-700 font-bold">
                  Créditos: {userProfile?.collaboratorCredits || 0}
                </Badge>
              </h2>
              
              <div className="space-y-3 min-h-[120px] max-h-[300px] overflow-y-auto pr-2">
                {isLoadingData ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : colaboradores.length > 0 ? (
                  colaboradores.map((c: any) => (
                    <div key={c.id || c._id} className="p-4 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100 shadow-sm">
                      <p className="font-semibold text-gray-700">{c.user?.name || "Colaborador"}</p>
                      <Badge className="bg-blue-500">Ativo</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-10">Nenhum colaborador.</p>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-6 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold" 
                onClick={() => {
                  if ((userProfile?.collaboratorCredits || 0) <= colaboradores.length) {
                    setShowPagamentoDialog(true);
                  } else {
                    navigator.clipboard.writeText(window.location.origin + "/register")
                    toast({title: "Link de convite copiado!"})
                  }
                }}
              > 
                {(userProfile?.collaboratorCredits || 0) <= colaboradores.length ? "+ Comprar Slots Colaborador" : "+ Convidar via Link"} 
              </Button>
            </Card>

            {/* SEÇÃO: IDOSOS */}
            <Card className="p-6 shadow-2xl border-none bg-white/95 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-600">
                <Activity className="w-6 h-6" /> Meus Idosos
                <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 font-bold">
                  Slots: {userProfile?.elderCredits || 0}
                </Badge>
              </h2>
              
              <div className="space-y-3 min-h-[120px] max-h-[300px] overflow-y-auto pr-2">
                {isLoadingData ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
                ) : idosos.length > 0 ? (
                  idosos.map((i: any) => (
                    <div key={i.id || i._id} className="p-4 bg-emerald-50/50 rounded-xl flex justify-between items-center border border-emerald-100 shadow-sm">
                      <div>
                        <p className="font-bold text-emerald-900">{i.name}</p>
                        <p className="text-xs text-emerald-600 font-mono">CPF: {i.cpf}</p>
                      </div>
                      <Trash2 
                        onClick={() => handleExcluirIdoso(i.id || i._id)}
                        className="w-5 h-5 text-red-300 cursor-pointer hover:text-red-500 transition-colors" 
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-10">Nenhum idoso cadastrado.</p>
                )}
              </div>

              <Button 
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 shadow-lg font-bold" 
                  onClick={() => {
                    if (idosos.length >= (userProfile?.elderCredits || 0)) {
                      setShowPagamentoDialog(true);
                    } else {
                      setShowCadastroDialog(true);
                    }
                  }}
              >
                {idosos.length >= (userProfile?.elderCredits || 0) ? "Comprar mais Slots" : "Adicionar Idoso"}
              </Button>
            </Card>
          </div>
        </div>

        {/* MODAL DE PAGAMENTO */}
        <Dialog open={showPagamentoDialog} onOpenChange={setShowPagamentoDialog}>
          <DialogPortal>
            <DialogContent className="max-w-md z-[9999]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-indigo-600">Planos e Créditos</DialogTitle>
                <DialogDescription>Adquira mais recursos para expandir sua rede de cuidados.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold text-emerald-900 text-lg">Slot de Idoso</p>
                      <p className="text-sm text-emerald-600">Permite monitorar +1 pessoa</p>
                    </div>
                    <Badge className="bg-emerald-600 text-white px-3 py-1">R$ 30,00</Badge>
                  </div>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg shadow-md font-bold" 
                    onClick={() => handleBuyCredits('ELDER_EXTRA')} 
                    disabled={isPaying}
                  >
                    {isPaying ? <Loader2 className="animate-spin" /> : "Comprar Slot Idoso"}
                  </Button>
                </div>

                <div className="p-4 rounded-xl border-2 border-blue-100 bg-blue-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold text-blue-900 text-lg">Slot Colaborador</p>
                      <p className="text-sm text-blue-600">Permite +1 acompanhante</p>
                    </div>
                    <Badge className="bg-blue-600 text-white px-3 py-1">R$ 30,00</Badge>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-md font-bold" 
                    onClick={() => handleBuyCredits('COLLABORATOR')} 
                    disabled={isPaying}
                  >
                    {isPaying ? <Loader2 className="animate-spin" /> : "Comprar Slot Colab"}
                  </Button>
                </div>

                <Button variant="ghost" className="w-full text-gray-500 gap-2 hover:bg-gray-100" onClick={loadData}>
                  <RefreshCw className="w-4 h-4" /> Atualizar saldos
                </Button>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* MODAL DE CADASTRO */}
        <Dialog open={showCadastroDialog} onOpenChange={setShowCadastroDialog}>
          <DialogPortal>
            <DialogContent className="max-w-lg z-[9999]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Cadastrar Novo Idoso</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input placeholder="Nome Completo" className="h-12" onChange={e => setFormData({...formData, name: e.target.value})} />
                  <Input placeholder="CPF" className="h-12" onChange={e => setFormData({...formData, cpf: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="number" placeholder="Idade" className="h-12" onChange={e => setFormData({...formData, age: e.target.value})} />
                    <Input type="date" className="h-12" onChange={e => setFormData({...formData, birthData: e.target.value})} />
                  </div>
                  <Input type="email" placeholder="Email de Login" className="h-12" onChange={e => setFormData({...formData, email: e.target.value})} />
                  <Input type="password" placeholder="Senha Temporária" className="h-12" onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCadastroDialog(false)}>Cancelar</Button>
                  <Button onClick={handleCadastrarIdoso} disabled={loading} className="bg-emerald-600 px-8">
                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Confirmar"}
                  </Button>
                </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>
    </>
  );
}