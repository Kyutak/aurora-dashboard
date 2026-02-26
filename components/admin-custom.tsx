"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Shield, Edit } from "lucide-react"
import { sharedState } from "@/lib/shared-state"
import { useAuroraSync } from "@/hooks/use-sync" // O nosso "rádio"
import { useToast } from "@/hooks/use-toast"

export function AdminPersonalizacao() {
  const { toast } = useToast()
  
  // Pegamos as preferências direto do estado global
  // Se outro admin mudar isso em outra aba, sua tela atualiza sozinha!
  const { preferencias } = useAuroraSync()

  const handleEmergenciaToggle = (checked: boolean) => {
    // 1. Atualiza o estado global (isso avisa todo mundo)
    sharedState.updatePreferencias({ botaoEmergenciaAtivo: checked })
    
    // 2. Feedback visual
    toast({
      title: checked ? "✅ Emergência Ativada" : "❌ Emergência Desativada",
      description: "A interface do idoso foi atualizada.",
      variant: checked ? "default" : "destructive"
    })
  }

  const handleEditarRotinaToggle = (checked: boolean) => {
    sharedState.updatePreferencias({ idosoPodeEditarRotina: checked })
    toast({ title: "Configuração de rotina salva!" })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Configurações do Sistema</h1>

      {/* Card do Botão de Emergência */}
      <Card className="p-6 flex items-center justify-between">
        <div className="flex gap-4">
          <Shield className="text-red-500 w-6 h-6" />
          <div>
            <Label className="text-lg font-bold">Botão de Emergência</Label>
            <p className="text-sm text-gray-500">Ativa ou remove o SOS do tablet do idoso.</p>
          </div>
        </div>
        <Switch 
          checked={preferencias.botaoEmergenciaAtivo} 
          onCheckedChange={handleEmergenciaToggle} 
        />
      </Card>

      {/* Card de Permissão de Edição */}
      <Card className="p-6 flex items-center justify-between">
        <div className="flex gap-4">
          <Edit className="text-blue-500 w-6 h-6" />
          <div>
            <Label className="text-lg font-bold">Idoso edita rotina?</Label>
            <p className="text-sm text-gray-500">Se desligado, apenas você pode criar lembretes.</p>
          </div>
        </div>
        <Switch 
          checked={preferencias.idosoPodeEditarRotina} 
          onCheckedChange={handleEditarRotinaToggle} 
        />
      </Card>
    </div>
  )
}