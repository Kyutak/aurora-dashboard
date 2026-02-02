"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Shield, Edit } from "lucide-react"
import { useState, useEffect } from "react"
import { sharedState } from "@/lib/shared-state"
import { useToast } from "@/hooks/use-toast"

export function AdminPersonalizacao() {
  const { toast } = useToast()
  const [botaoEmergenciaAtivo, setBotaoEmergenciaAtivo] = useState(true)
  const [idosoPodeEditarRotina, setIdosoPodeEditarRotina] = useState(false)

  useEffect(() => {
    const prefs = sharedState.getPreferencias()
    setBotaoEmergenciaAtivo(prefs.botaoEmergenciaAtivo)
    setIdosoPodeEditarRotina(prefs.idosoPodeEditarRotina)

    const unsubscribe = sharedState.subscribe(() => {
      const prefs = sharedState.getPreferencias()
      setBotaoEmergenciaAtivo(prefs.botaoEmergenciaAtivo)
      setIdosoPodeEditarRotina(prefs.idosoPodeEditarRotina)
    })

    return () => {
      unsubscribe();
    }
  }, [])

  const handleEmergenciaToggle = (checked: boolean) => {
    setBotaoEmergenciaAtivo(checked)
    sharedState.updatePreferencias({ botaoEmergenciaAtivo: checked })
    toast({
      title: checked ? "✅ Botão de Emergência Ativado" : "❌ Botão de Emergência Desativado",
      description: checked
        ? "O idoso agora pode acionar emergências"
        : "O botão de emergência foi removido da interface do idoso",
    })
  }

  const handleEditarRotinaToggle = (checked: boolean) => {
    setIdosoPodeEditarRotina(checked)
    sharedState.updatePreferencias({ idosoPodeEditarRotina: checked })
    toast({
      title: checked ? "✅ Edição de Rotina Permitida" : "❌ Edição de Rotina Bloqueada",
      description: checked
        ? "O idoso pode agora editar sua própria rotina"
        : "Apenas familiares podem editar a rotina do idoso",
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 my-[-25px]">
      <div
        aria-hidden
        className="pointer-events-none
          absolute top-0 left-1/2 -translate-x-1/2
          w-[130%] h-[230px] md:h-[320px]
          bg-gradient-to-br from-blue-500 via-teal-500 to-emerald-500
          rounded-b-[50%]"
      />

      <div className="relative z-10 pt-56 md:pt-64 mx-0">
        <div className="w-full px-4 md:px-6">
          <div className="flex items-center justify-between mt-[-105px] mb-[108px]">
            <h1 className="md:text-4xl font-bold text-white drop-shadow-lg text-4xl">Personalização</h1>
          </div>

          <div className="space-y-4">
            {/* Botão de Emergência */}
            <Card className="p-6 bg-white dark:bg-gray-900">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    <Label htmlFor="botao-emergencia" className="text-lg font-semibold cursor-pointer">
                      Botão de Emergência
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Permite que o idoso possa acionar alertas de emergência. Quando desativado, a opção de emergências
                    não aparecerá no painel de familiares e administradores.
                  </p>
                </div>
                <Switch
                  id="botao-emergencia"
                  checked={botaoEmergenciaAtivo}
                  onCheckedChange={handleEmergenciaToggle}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
            </Card>

            {/* Edição de Rotina */}
            <Card className="p-6 bg-white dark:bg-gray-900">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit className="w-5 h-5 text-blue-600" />
                    <Label htmlFor="editar-rotina" className="text-lg font-semibold cursor-pointer">
                      Idoso Pode Editar Rotina
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Permite que o idoso possa editar seus próprios lembretes e rotinas. Quando desativado, apenas
                    familiares e administradores podem fazer alterações.
                  </p>
                </div>
                <Switch
                  id="editar-rotina"
                  checked={idosoPodeEditarRotina}
                  onCheckedChange={handleEditarRotinaToggle}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
            </Card>

            {/* Informação */}
            <Card className="p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Dica:</strong> As alterações são aplicadas imediatamente em todas as interfaces. O idoso verá
                ou não o botão de emergência conforme sua escolha.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
