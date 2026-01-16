"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import { LembreteModal } from "@/components/lembrete-modal"
import { useToast } from "@/hooks/use-toast"
import { sharedState } from "@/lib/shared-state"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SharedLembretes } from "@/components/shared-lembretes"

export default function AdminLembretesPage() {
  const { toast } = useToast()
  const [lembretes, setLembretes] = useState(sharedState.getLembretes())
  const [modalOpen, setModalOpen] = useState(false)
  const [lembreteParaEditar, setLembreteParaEditar] = useState<any>()
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({
      top: 49,
      behavior: "auto",
    })
    const unsubscribe = sharedState.subscribe(() => {
      setLembretes(sharedState.getLembretes())
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const handleCriarLembrete = (lembrete: any) => {
    if (lembreteParaEditar) {
      sharedState.updateLembrete(lembreteParaEditar.id, lembrete)
      toast({
        title: "✅ Lembrete Atualizado",
        description: "O lembrete foi atualizado com sucesso.",
      })
    } else {
      sharedState.addLembrete({
        ...lembrete,
        data: new Date(),
        criadoPor: "admin",
      })
      toast({
        title: "✅ Lembrete Criado",
        description: "O lembrete foi criado e o idoso será notificado.",
      })
    }
    setModalOpen(false)
    setLembreteParaEditar(undefined)
  }

  const handleDeletar = (id: string) => {
    sharedState.deleteLembrete(id)
    toast({
      title: "🗑️ Lembrete Excluído",
      description: "O lembrete foi removido com sucesso.",
    })
  }

  const getDiasSemanaLabel = (dias?: number[]) => {
    if (!dias || dias.length === 0) return ""
    const labels = ["D", "S", "T", "Q", "Q", "S", "S"]
    return dias.map((d) => labels[d]).join(", ")
  }

  const lembretesVoz = lembretes.filter((l) => l.tipo === "lembrete-voz")
  const limiteAtingido = lembretesVoz.length >= 2

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <SharedLembretes userType="admin" />
      </main>

      <LembreteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleCriarLembrete}
        lembrete={lembreteParaEditar}
        canEdit={lembreteParaEditar?.tipo === "lembrete-voz"}
      />

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
