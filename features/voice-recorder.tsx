"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Mic, Check, Crown } from "lucide-react"
import { pt } from "date-fns/locale"
import { sharedState } from "@/lib/shared-state"

interface VoiceRecorderModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveReminder: (text: string, date: Date) => void
}

export function VoiceRecorderModal({ isOpen, onClose, onSaveReminder }: VoiceRecorderModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedText, setRecordedText] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [step, setStep] = useState<"recording" | "selectDate">("recording")

  const lembretesVoz = sharedState.getLembretes().filter((l) => l.tipo === "lembrete-voz")
  const limiteAtingido = lembretesVoz.length >= 2

  const handleRecord = () => {
    if (limiteAtingido) {
      return
    }

    setIsRecording(true)

    // Simular gravação por 2 segundos
    setTimeout(() => {
      setIsRecording(false)

      // Mock: Simular transcrição
      const textoSimulado = [
        "Preciso comprar remédio amanhã de manhã",
        "Lembrar de ligar para o médico na terça",
        "Ir ao mercado comprar frutas",
        "Tomar o remédio da pressão às 8h",
      ][Math.floor(Math.random() * 4)]

      setRecordedText(textoSimulado)
      setStep("selectDate")
    }, 2000)
  }

  const handleSave = () => {
    if (selectedDate && recordedText) {
      const finalDate = new Date(selectedDate)
      finalDate.setHours(9, 0, 0, 0)
      onSaveReminder(recordedText, finalDate)
      handleClose()
    }
  }

  const handleClose = () => {
    setIsRecording(false)
    setRecordedText("")
    setSelectedDate(undefined)
    setStep("recording")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl">Gravar Lembrete</DialogTitle>
          <DialogDescription className="text-xl">
            {limiteAtingido
              ? "Você atingiu o limite de lembretes de voz"
              : step === "recording"
                ? "Pressione o botão para gravar seu lembrete"
                : "Escolha o dia para ser lembrado"}
          </DialogDescription>
        </DialogHeader>

        {limiteAtingido && (
          <Card className="p-6 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
            <div className="text-center space-y-4">
              <Crown className="w-16 h-16 mx-auto text-yellow-600" />
              <div>
                <p className="text-xl font-semibold mb-2">Limite de Lembretes de Voz Atingido</p>
                <p className="text-lg text-muted-foreground">
                  Você já tem 2 lembretes de voz. Peça para sua família fazer o upgrade para criar mais lembretes.
                </p>
              </div>
            </div>
          </Card>
        )}

        {!limiteAtingido && step === "recording" && (
          <div className="space-y-6 py-6">
            <Button
              onClick={handleRecord}
              disabled={isRecording}
              size="lg"
              className="w-full h-32 text-3xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Mic style={{ width: "38px", height: "38px" }} className={`mr-4 ${isRecording ? "animate-pulse" : ""}`} />
              {isRecording ? "Gravando..." : "Iniciar Gravação"}
            </Button>
          </div>
        )}

        {!limiteAtingido && step === "selectDate" && recordedText && (
          <div className="space-y-6 py-4">
            <Card className="p-4 bg-muted">
              <p className="text-xl leading-relaxed">{recordedText}</p>
            </Card>

            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={pt}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                //disabled={{ before: today }} <- dá uma olhada nisso depois
                className="rounded-md border"
                showOutsideDays={true}
                captionLayout="dropdown"
                classNames={{
                  months: "text-lg",
                  caption: "text-2xl font-bold",
                  day: "text-xl h-12 w-12",
                  day_selected: "bg-emerald-600 text-white hover:bg-emerald-700",
                }}
              />
            </div>

            <p className="text-center text-muted-foreground">Repetição: Única</p>

            <Button
              onClick={handleSave}
              disabled={!selectedDate}
              size="lg"
              className="w-full h-16 text-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="w-8 h-8 mr-2" />
              Salvar Lembrete
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
