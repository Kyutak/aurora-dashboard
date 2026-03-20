"use client"

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
      title: checked ? "Emergência ativada" : "Emergência desativada",
      description: "A interface do idoso foi atualizada.",
      variant: checked ? "default" : "destructive"
    })
  }

  const handleEditarRotinaToggle = (checked: boolean) => {
    sharedState.updatePreferencias({ idosoPodeEditarRotina: checked })
    toast({ title: "Configuração de rotina salva!" })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-24 md:pb-0">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Personalização
          </h1>
        </div>
      </header>

      {/* ── Conteúdo ─────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm divide-y divide-slate-100 dark:divide-zinc-800">

          {/* Card do Botão de Emergência */}
          <div className="flex items-center justify-between gap-4 px-5 py-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-red-50 dark:bg-red-950/40">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-800 dark:text-white cursor-pointer">
                  Botão de Emergência
                </Label>
                {/* Ativa ou remove o SOS do tablet do idoso. */}
                <p className="text-xs text-slate-400 mt-0.5">
                  Ativa ou remove o SOS do tablet do idoso.
                </p>
              </div>
            </div>
            <Switch
              checked={preferencias.botaoEmergenciaAtivo}
              onCheckedChange={handleEmergenciaToggle}
              className="shrink-0"
            />
          </div>

          {/* Card de Permissão de Edição */}
          <div className="flex items-center justify-between gap-4 px-5 py-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-sky-50 dark:bg-sky-950/40">
                <Edit className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-slate-800 dark:text-white cursor-pointer">
                  Idoso edita rotina?
                </Label>
                {/* Se desligado, apenas você pode criar lembretes. */}
                <p className="text-xs text-slate-400 mt-0.5">
                  Se desligado, apenas você pode criar lembretes.
                </p>
              </div>
            </div>
            <Switch
              checked={preferencias.idosoPodeEditarRotina}
              onCheckedChange={handleEditarRotinaToggle}
              className="shrink-0"
            />
          </div>

        </div>
      </main>
    </div>
  )
}