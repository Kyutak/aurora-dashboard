"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export function LembreteModal({ open, onOpenChange, onSave, elders, lembrete, defaultElderId }: any) {
  const [title, setTitle] = useState("") 
  const [time, setTime] = useState("")
  const [type, setType] = useState("Medicamento")
  const [elderId, setElderId] = useState<string | undefined>(undefined) // undefined evita o erro do Radix Select
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(lembrete?.title || "")
      setTime(lembrete?.time || "")
      setType(lembrete?.type || "Medicamento")
      
      // Validação segura para evitar quebra se 'elders' for undefined
      const validElders = Array.isArray(elders) ? elders : []
      const fallbackId = validElders.length > 0 ? (validElders[0]._id || validElders[0].id) : undefined
      
      setElderId(lembrete?.elderId || defaultElderId || fallbackId)
    } else {
      // Limpa os campos quando o modal fecha (evita "efeito fantasma")
      setTitle("")
      setTime("")
      setType("Medicamento")
      setIsSubmitting(false)
    }
  }, [open, lembrete, defaultElderId, elders])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!elderId) {
      alert("Por favor, selecione um idoso.")
      return
    }

    setIsSubmitting(true)

    const payload = {
      title,
      time,
      type,
      elderId,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      isCompleted: false,
      concluido: false // Garante dupla cobertura para a sua API
    }

    try {
      // Usando await para garantir que o loading respeite o tempo do servidor
      await onSave(payload)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Lista segura de idosos para o map não quebrar
  const safeElders = Array.isArray(elders) ? elders : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[24px] bg-white border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {lembrete ? "Editar Lembrete" : "Novo Lembrete"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label className="text-gray-500 font-medium">Para qual idoso?</Label>
            {/* O "value={elderId || undefined}" previne crashes se não houver idoso */}
            <Select value={elderId || undefined} onValueChange={setElderId}>
              <SelectTrigger className="w-full bg-gray-50 h-12 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-500 transition-all">
                <SelectValue placeholder="Selecione o idoso" />
              </SelectTrigger>
              <SelectContent>
                {safeElders.map((e: any) => (
                  <SelectItem key={e._id || e.id} value={e._id || e.id}>
                    {e.name || e.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-500 font-medium">O que ele deve fazer?</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="Ex: Tomar remédio de pressão"
              className="bg-gray-50 h-12 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-500 font-medium">Horário</Label>
              <Input 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                required 
                className="bg-gray-50 h-12 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-500 font-medium">Categoria</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-gray-50 h-12 rounded-xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicamento">Medicamento</SelectItem>
                  <SelectItem value="Refeição">Refeição</SelectItem>
                  <SelectItem value="Rotina">Rotina</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> 
                  Salvando...
                </>
              ) : (
                "Salvar Lembrete"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}