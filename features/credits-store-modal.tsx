"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogPortal } from "@/components/ui/dialog"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  isPaying: boolean
  onBuy: (type: 'COLLABORATOR' | 'ELDER_EXTRA') => Promise<void>
  onRefresh: () => void
}

export function CreditsStoreModal({ open, onOpenChange, isPaying, onBuy, onRefresh }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-md z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-indigo-600">Loja de Créditos</DialogTitle>
            <DialogDescription>Aumente a sua capacidade de monitoramento.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Slot de Idoso */}
            <div className="p-4 rounded-xl border-2 border-emerald-100 bg-emerald-50/50">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-bold text-emerald-900 text-lg">Slot de Idoso</p>
                  <p className="text-sm text-emerald-600">Monitorar +1 pessoa</p>
                </div>
                <Badge className="bg-emerald-600 text-white px-3 py-1">R$ 30,00</Badge>
              </div>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg shadow-md font-bold"
                onClick={() => onBuy('ELDER_EXTRA')}
                disabled={isPaying}
              >
                {isPaying ? <Loader2 className="animate-spin" /> : "Adquirir Slot"}
              </Button>
            </div>

            {/* Slot de Colaborador */}
            <div className="p-4 rounded-xl border-2 border-blue-100 bg-blue-50/50">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-bold text-blue-900 text-lg">Slot Colaborador</p>
                  <p className="text-sm text-blue-600">+1 acompanhante</p>
                </div>
                <Badge className="bg-blue-600 text-white px-3 py-1">R$ 30,00</Badge>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-md font-bold"
                onClick={() => onBuy('COLLABORATOR')}
                disabled={isPaying}
              >
                {isPaying ? <Loader2 className="animate-spin" /> : "Adquirir Slot"}
              </Button>
            </div>

            <Button variant="ghost" className="w-full text-gray-500 gap-2 hover:bg-gray-100" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" /> Atualizar saldos
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}