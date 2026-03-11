"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Trash2, Users, Loader2, CreditCard, RefreshCw, UserPlus, FileHeart, User, ShieldCheck, Cake } from "lucide-react"
import { useState, useEffect, Suspense, useCallback } from "react"
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

function AdminPainelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast()

  const { idosos, colaboradores } = useAuroraSync();

  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showCadastroDialog, setShowCadastroDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Estados para a Ficha Médica
  const [showFichaDialog, setShowFichaDialog] = useState(false)
  const [selectedElder, setSelectedElder] = useState<any>(null)
  const [fichaData, setFichaData] = useState({
    bloodType: "", 
    typePlanetLife: "", // Sincronizado com o Back-end
    allergies: "", 
    medications: "", 
    medicalConditions: "",
    observations: "", 
    emergencyContact: "", 
    address: "", 
    phone: ""
  })

  // Estados da Loja
  const [showPagamentoDialog, setShowPagamentoDialog] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    elderCredits: number;
    collaboratorCredits: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", cpf: "", age: "", birthData: "", emergencyContact: ""
  })

  const loadData = useCallback(async () => {
    try {
      setIsLoadingData(true)
      const [resElders, resCollabs, resMe] = await Promise.all([
        elderService.getMyElders().catch(() => ({ data: [] })),
        authCollaboratorService.getMyCollaborators().catch(() => ({ data: [] })),
        authService.getMe().catch(() => ({ data: null }))
      ])
      
      sharedState.setIdosos(resElders.data || [])
      sharedState.setColaboradores(resCollabs.data || [])
      if (resMe.data) setUserProfile(resMe.data)
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setIsLoadingData(false)
    }
  }, [])

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const status = searchParams.get('success');
    if (status === 'true') {
      toast({ title: "💳 Pagamento Realizado!" });
      loadData(); 
      router.replace('/admin/painel-admin'); 
    }
  }, [searchParams, loadData, router, toast]);

  // --- AÇÕES ---

  const handleCadastrarIdoso = async () => {
    try {
      setLoading(true)
      await elderService.create({ ...formData, age: Number(formData.age), createLogin: true })
      toast({ title: "✅ Idoso Cadastrado!" })
      setShowCadastroDialog(false)
      loadData()
    } catch (error: any) {
      if (error.response?.status === 402 || error.code === "PLAN_REQUIRED") {
        toast({ 
          title: "Limite Atingido", 
          description: "Você não possui slots disponíveis. Adquira mais na Loja.",
          variant: "destructive" 
        })
        setShowPagamentoDialog(true)
      } else {
        toast({ title: "❌ Erro ao cadastrar", variant: "destructive" })
      }
    } finally { setLoading(false) }
  }

  const handleOpenFicha = (idoso: any) => {
    setSelectedElder(idoso);
    setFichaData({
      bloodType: idoso.bloodType || "",
      typePlanetLife: idoso.typePlanetLife || "", 
      allergies: Array.isArray(idoso.allergies) ? idoso.allergies.join(", ") : idoso.allergies || "",
      medications: Array.isArray(idoso.medications) ? idoso.medications.join(", ") : idoso.medications || "",
      medicalConditions: Array.isArray(idoso.medicalConditions) ? idoso.medicalConditions.join(", ") : idoso.medicalConditions || "",
      observations: idoso.observations || "",
      emergencyContact: idoso.emergencyContact || "",
      address: idoso.address || "",
      phone: idoso.phone || ""
    });
    setShowFichaDialog(true);
  }

  const handleSalvarFicha = async () => {
    if (!selectedElder) return;
    try {
      setLoading(true);
      
      const payload = {
        bloodType: fichaData.bloodType,
        typePlanetLife: fichaData.typePlanetLife, 
        emergencyContact: fichaData.emergencyContact,
        address: fichaData.address,
        phone: fichaData.phone,
        observations: fichaData.observations,
        allergies: fichaData.allergies.split(",").map(s => s.trim()).filter(Boolean),
        medications: fichaData.medications.split(",").map(s => s.trim()).filter(Boolean),
        medicalConditions: fichaData.medicalConditions.split(",").map(s => s.trim()).filter(Boolean),
      };

      const elderId = selectedElder.id || selectedElder._id;
      await elderService.updateMedicalRecord(elderId, payload);
      
      toast({ title: "✅ Ficha Médica salva com sucesso!" });
      setShowFichaDialog(false);
      loadData(); 
    } catch (error) {
      toast({ title: "❌ Erro ao salvar ficha", variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
        toast({ title: "Solicitação enviada" })
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
                  navigator.clipboard.writeText(window.location.origin + "/register")
                  toast({title: "Link de convite copiado!"})
                }}
              > 
                + Convidar via Link
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
                    <div key={i.id || i._id} className="p-4 bg-emerald-50/50 rounded-xl flex justify-between items-center border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-emerald-900">{i.name}</p>
                          {!i.bloodType && <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50">Incompleta</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 mt-1">
                          <Cake className="w-3.5 h-3.5" />
                          <p className="text-xs font-semibold">
                            {i.birthData ? new Date(i.birthData).toLocaleDateString('pt-BR') : "Data não cadastrada"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 items-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenFicha(i)}
                          className="text-blue-500 hover:bg-blue-100 hover:text-blue-700 h-8 w-8"
                        >
                          <FileHeart className="w-5 h-5" />
                        </Button>
                        <Trash2 
                          onClick={() => handleExcluirIdoso(i.id || i._id)}
                          className="w-5 h-5 text-red-300 cursor-pointer hover:text-red-500 transition-colors" 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-10">Nenhum idoso cadastrado.</p>
                )}
              </div>

              <Button 
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 shadow-lg font-bold gap-2" 
                  onClick={() => setShowCadastroDialog(true)}
              >
                <UserPlus className="w-5 h-5" /> Adicionar Novo Idoso
              </Button>
            </Card>
          </div>
        </div>

        {/* --- MODAL DE FICHA MÉDICA --- */}
        <Dialog open={showFichaDialog} onOpenChange={setShowFichaDialog}>
          <DialogPortal>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999] border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                  <FileHeart className="w-6 h-6 text-rose-500" /> Prontuário de Saúde
                </DialogTitle>
                <DialogDescription>
                  Paciente: <span className="font-bold text-gray-900">{selectedElder?.name}</span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* ABA NÃO EDITÁVEL */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <User className="w-3 h-3" /> Dados de Registro (Não Editável)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-500">Nome Completo</p>
                      <p className="text-sm font-semibold text-gray-800">{selectedElder?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Data de Nascimento</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedElder?.birthData ? new Date(selectedElder.birthData).toLocaleDateString('pt-BR') : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Informações Médicas Atualizáveis
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Tipo Sanguíneo</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:visible:outline-none focus:visible:ring-2 focus:visible:ring-blue-500"
                        value={fichaData.bloodType}
                        onChange={(e) => setFichaData({...fichaData, bloodType: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Plano de Saúde</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:visible:outline-none focus:ring-2 focus:ring-blue-500"
                        value={fichaData.typePlanetLife}
                        onChange={(e) => setFichaData({...fichaData, typePlanetLife: e.target.value})}
                      >
                        <option value="">Selecione o plano...</option>
                        <option value="SUS">SUS</option>
                        <option value="Unimed">Unimed</option>
                        <option value="Amil">Amil</option>
                        <option value="Bradesco Saude">Bradesco Saúde</option>
                        <option value="SulAmerica">SulAmérica</option>
                        <option value="Hapvida">Hapvida</option>
                        <option value="Particular">Outro / Particular</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Contato Emergência</label>
                      <Input placeholder="(00) 00000-0000" value={fichaData.emergencyContact} onChange={e => setFichaData({...fichaData, emergencyContact: e.target.value})} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-700">Telefone do Idoso</label>
                      <Input placeholder="(00) 00000-0000" value={fichaData.phone} onChange={e => setFichaData({...fichaData, phone: e.target.value})} />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Alergias (separadas por vírgula)</label>
                      <Input placeholder="Ex: Pólen, Dipirona..." value={fichaData.allergies} onChange={e => setFichaData({...fichaData, allergies: e.target.value})} />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Medicamentos / Condições</label>
                      <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Medicamentos de uso contínuo..."
                        value={fichaData.medications}
                        onChange={e => setFichaData({...fichaData, medications: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700">Observações Gerais</label>
                      <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={fichaData.observations}
                        onChange={e => setFichaData({...fichaData, observations: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="bg-gray-50 -mx-6 -mb-6 p-6 mt-4">
                <Button variant="ghost" onClick={() => setShowFichaDialog(false)}>Cancelar</Button>
                <Button onClick={handleSalvarFicha} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-10 shadow-lg font-bold">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* --- MODAL DE PAGAMENTO (RESTAURADO) --- */}
        <Dialog open={showPagamentoDialog} onOpenChange={setShowPagamentoDialog}>
          <DialogPortal>
            <DialogContent className="max-w-md z-[9999]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-indigo-600">Loja de Créditos</DialogTitle>
                <DialogDescription>Aumente a sua capacidade de monitoramento.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold text-emerald-900 text-lg">Slot de Idoso</p>
                      <p className="text-sm text-emerald-600">Monitorar +1 pessoa</p>
                    </div>
                    <Badge className="bg-emerald-600 text-white px-3 py-1">R$ 30,00</Badge>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg shadow-md font-bold" onClick={() => handleBuyCredits('ELDER_EXTRA')} disabled={isPaying}>
                    {isPaying ? <Loader2 className="animate-spin" /> : "Adquirir Slot"}
                  </Button>
                </div>
                <div className="p-4 rounded-xl border-2 border-blue-100 bg-blue-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold text-blue-900 text-lg">Slot Colaborador</p>
                      <p className="text-sm text-blue-600">+1 acompanhante</p>
                    </div>
                    <Badge className="bg-blue-600 text-white px-3 py-1">R$ 30,00</Badge>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-md font-bold" onClick={() => handleBuyCredits('COLLABORATOR')} disabled={isPaying}>
                    {isPaying ? <Loader2 className="animate-spin" /> : "Adquirir Slot"}
                  </Button>
                </div>
                <Button variant="ghost" className="w-full text-gray-500 gap-2 hover:bg-gray-100" onClick={loadData}>
                  <RefreshCw className="w-4 h-4" /> Atualizar saldos
                </Button>
              </div>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* --- MODAL DE CADASTRO (RESTAURADO) --- */}
        <Dialog open={showCadastroDialog} onOpenChange={setShowCadastroDialog}>
          <DialogPortal>
            <DialogContent className="max-w-lg z-[9999]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Cadastrar Novo Idoso</DialogTitle>
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
                <Button onClick={handleCadastrarIdoso} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 px-8 font-bold">
                  {loading ? <Loader2 className="animate-spin mr-2" /> : "Confirmar Cadastro"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>

      </div>
    </>
  );
}

export function AdminPainel() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>}>
      <AdminPainelContent />
    </Suspense>
  )
}