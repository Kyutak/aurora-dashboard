"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogPortal } from "@/components/ui/dialog"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: (formData: any) => Promise<void>
  loading: boolean
}

export function ElderRegisterModal({ open, onOpenChange, onConfirm, loading }: Props) {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", cpf: "", age: "", birthData: "", emergencyContact: ""
  })

  const handleConfirm = async () => {
    await onConfirm(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-lg z-[9999]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Cadastrar Novo Idoso</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Nome Completo" className="h-12" onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <Input
              placeholder="CPF"
              maxLength={11}
              className="h-12"
              onChange={e =>
                setFormData({ ...formData, cpf: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" placeholder="Idade" className="h-12" onChange={e => setFormData({ ...formData, age: e.target.value })} />
              <Input type="date" className="h-12" onChange={e => setFormData({ ...formData, birthData: e.target.value })} />
            </div>
            <Input type="email" placeholder="Email de Login" className="h-12" onChange={e => setFormData({ ...formData, email: e.target.value })} />
            <Input type="password" placeholder="Senha Temporária" className="h-12" onChange={e => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 px-8 font-bold">
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Confirmar Cadastro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}