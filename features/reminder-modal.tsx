"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { pt } from "date-fns/locale"

interface Lembrete {
  id: string
  titulo: string
  horario: string
  tipo: "medicamento" | "refeicao" | "lembrete-voz" | "rotina" | "evento"
  repeticao?: string
  diasSemana?: number[]
  data?: Date
}

//pop-up de definição de lembretes padrão

interface LembreteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (lembrete: any) => void
  lembrete?: any
  canEdit?: boolean
}

export function LembreteModal({ open, onOpenChange, onSave, lembrete, canEdit = false }: LembreteModalProps) {
  const [titulo, setTitulo] = useState("")
  const [horario, setHorario] = useState("09:00")
  const [tipo, setTipo] = useState<"medicamento" | "refeicao" | "rotina" | "evento">("medicamento")
  const [repeticao, setRepeticao] = useState("Diária")
  const [diasSemana, setDiasSemana] = useState<number[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (lembrete) {
      setTitulo(lembrete.titulo)
      setHorario(lembrete.horario)
      if (lembrete.tipo !== "lembrete-voz") {
        setTipo(lembrete.tipo)
      }
      setRepeticao(lembrete.repeticao || "Diária")
      setDiasSemana(lembrete.diasSemana || [])
      setSelectedDate(lembrete.data ? new Date(lembrete.data) : undefined)
    } else {
      setTitulo("")
      setHorario("09:00")
      setTipo("medicamento")
      setRepeticao("Diária")
      setDiasSemana([])
      setSelectedDate(undefined)
    }
  }, [lembrete, open])

  useEffect(() => {
    if (tipo === "evento") {
      setRepeticao("Única")
    }
  }, [tipo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let finalDate = new Date()
    if ((tipo === "evento" || lembrete?.tipo === "lembrete-voz") && selectedDate) {
      const [hours, minutes] = horario.split(":").map(Number)
      finalDate = new Date(selectedDate)
      finalDate.setHours(hours, minutes, 0, 0)
    }

    onSave({
      titulo,
      horario,
      tipo: lembrete?.tipo === "lembrete-voz" ? "lembrete-voz" : tipo,
      repeticao: tipo === "evento" || lembrete?.tipo === "lembrete-voz" ? "Única" : repeticao,
      diasSemana: repeticao === "Semanal" ? diasSemana : undefined,
      data: finalDate,
    })
  }

  const toggleDia = (dia: number) => {
    if (diasSemana.includes(dia)) {
      setDiasSemana(diasSemana.filter((d) => d !== dia))
    } else {
      setDiasSemana([...diasSemana, dia].sort())
    }
  }

  const isLembreteVoz = lembrete?.tipo === "lembrete-voz"
  const isEvento = tipo === "evento"
  // Show calendar for both evento and lembrete-voz types
  const showCalendar = isEvento || isLembreteVoz

  const diasDaSemana = [
    { label: "D", value: 0 },
    { label: "S", value: 1 },
    { label: "T", value: 2 },
    { label: "Q", value: 3 },
    { label: "Q", value: 4 },
    { label: "S", value: 5 },
    { label: "S", value: 6 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLembreteVoz ? "Editar Lembrete de Voz" : lembrete ? "Editar Lembrete" : "Criar Novo Lembrete"}
          </DialogTitle>
          <DialogDescription>
            {isLembreteVoz
              ? "Você pode editar o texto e horário deste lembrete de voz"
              : "Configure o lembrete que será enviado para o idoso"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Tomar remédio da pressão"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario">Horário</Label>
            <Input id="horario" type="time" value={horario} onChange={(e) => setHorario(e.target.value)} required />
          </div>

          {!isLembreteVoz && (
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(v) => setTipo(v as "medicamento" | "refeicao" | "rotina" | "evento")}
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medicamento">Medicamento</SelectItem>
                  <SelectItem value="refeicao">Refeição</SelectItem>
                  <SelectItem value="rotina">Rotina</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showCalendar ? (
            <div className="space-y-2">
              <Label>{isLembreteVoz ? "Data do Lembrete" : "Data do Evento"}</Label>
              <div className="flex justify-center border rounded-md p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={pt}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md"
                  classNames={{
                    day_selected: "bg-emerald-600 text-white hover:bg-emerald-700",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">Repetição: Única</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="repeticao">Repetição</Label>
                <Select value={repeticao} onValueChange={setRepeticao}>
                  <SelectTrigger id="repeticao">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diária">Diária</SelectItem>
                    <SelectItem value="Semanal">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {repeticao === "Semanal" && (
                <div className="space-y-2">
                  <Label>Dias da Semana</Label>
                  <div className="flex gap-2 justify-center">
                    {diasDaSemana.map((dia) => (
                      <button
                        key={dia.value}
                        type="button"
                        onClick={() => toggleDia(dia.value)}
                        className={`w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                          diasSemana.includes(dia.value)
                            ? "bg-emerald-600 text-white shadow-lg scale-110"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {dia.label}
                      </button>
                    ))}
                  </div>
                  {diasSemana.length === 0 && repeticao === "Semanal" && (
                    <p className="text-xs text-destructive text-center">Selecione pelo menos um dia</p>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={(repeticao === "Semanal" && diasSemana.length === 0) || (showCalendar && !selectedDate)}
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
