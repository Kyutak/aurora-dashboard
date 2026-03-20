"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Trash2, Users, Loader2, CreditCard, UserPlus, FileHeart, Cake } from "lucide-react"
import { useState, useEffect, Suspense, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuroraSync } from "@/hooks/use-sync"
import { sharedState } from "@/lib/shared-state"
import { elderService } from "@/service/elder.service"
import { authCollaboratorService } from "@/service/collaborator.service"
import { paymentService } from '@/service/payment.service'
import { authService } from "@/service/auth.service"

// Modais extraídos
import { ElderRegisterModal } from "@/features/elder-register-modal"
import { CreditsStoreModal } from "@/features/credits-store-modal"
import { MedicalRecordSheet } from "@/features/medical-record"

function AdminPainelContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { idosos, colaboradores } = useAuroraSync()

  const [isLoadingData, setIsLoadingData] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isPaying, setIsPaying] = useState(false)

  const [showCadastroDialog, setShowCadastroDialog]   = useState(false)
  const [showPagamentoDialog, setShowPagamentoDialog] = useState(false)
  const [showFichaDialog, setShowFichaDialog]         = useState(false)
  const [selectedElder, setSelectedElder]             = useState<any>(null)

  const [userProfile, setUserProfile] = useState<{
    elderCredits: number
    collaboratorCredits: number
  } | null>(null)

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

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const status = searchParams.get('success')
    if (status === 'true') {
      toast({ title: "💳 Pagamento Realizado!" })
      loadData()
      router.replace('/admin/painel-admin')
    }
  }, [searchParams, loadData, router, toast])

  const handleCadastrarIdoso = async (formData: any) => {
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
    } finally {
      setLoading(false)
    }
  }

  const handleBuyCredits = async (type: 'COLLABORATOR' | 'ELDER_EXTRA') => {
    try {
      setIsPaying(true)
      const { checkoutUrl } = await paymentService.createCheckoutSession(type)
      if (checkoutUrl) window.location.href = checkoutUrl
    } catch {
      toast({ title: "❌ Erro no checkout", variant: "destructive" })
      setIsPaying(false)
    }
  }

  const handleExcluirIdoso = async (id: string) => {
    if (confirm("Deseja realmente remover este idoso?")) {
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
                  toast({ title: "Link de convite copiado!" })
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
                          {!i.bloodType && (
                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50">Incompleta</Badge>
                          )}
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
                          onClick={() => { setSelectedElder(i); setShowFichaDialog(true) }}
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

        {/* Modais */}
        <ElderRegisterModal
          open={showCadastroDialog}
          onOpenChange={setShowCadastroDialog}
          onConfirm={handleCadastrarIdoso}
          loading={loading}
        />

        <CreditsStoreModal
          open={showPagamentoDialog}
          onOpenChange={setShowPagamentoDialog}
          isPaying={isPaying}
          onBuy={handleBuyCredits}
          onRefresh={loadData}
        />

        {/* Reutiliza o MedicalRecordSheet já existente — sem duplicar código */}
        {showFichaDialog && selectedElder && (
          <MedicalRecordSheet
            open={showFichaDialog}
            onOpenChange={setShowFichaDialog}
            elder={selectedElder}
            onSaved={loadData}
          />
        )}
      </div>
    </>
  )
}

export function AdminPainel() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
      </div>
    }>
      <AdminPainelContent />
    </Suspense>
  )
}