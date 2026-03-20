"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogPortal } from "@/components/ui/dialog"
import { FileHeart, User, ShieldCheck, Cake, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { elderService } from "@/service/elder.service"

interface MedicalRecordSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  elder: any
  onSaved?: () => void
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

const HEALTH_PLANS = [
  { value: "SUS", label: "SUS" },
  { value: "Unimed", label: "Unimed" },
  { value: "Amil", label: "Amil" },
  { value: "Hapvida", label: "Hapvida" },
  { value: "Particular", label: "Particular / Outros" },
]

function toCommaSeparated(value: any): string {
  if (Array.isArray(value)) return value.join(", ")
  return value || ""
}

export function MedicalRecordSheet({ open, onOpenChange, elder, onSaved }: MedicalRecordSheetProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    bloodType: elder?.bloodType || "",
    typePlanetLife: elder?.typePlanetLife || "",
    allergies: toCommaSeparated(elder?.allergies),
    medications: toCommaSeparated(elder?.medications),
    medicalConditions: toCommaSeparated(elder?.medicalConditions),
    observations: elder?.observations || "",
    emergencyContact: elder?.emergencyContact || "",
    address: elder?.address || "",
    phone: elder?.phone || "",
  })

  // Sync form when elder changes
  const syncedElderRef = elder?.id || elder?._id
  useState(() => {
    if (!elder) return
    setForm({
      bloodType: elder.bloodType || "",
      typePlanetLife: elder.typePlanetLife || "",
      allergies: toCommaSeparated(elder.allergies),
      medications: toCommaSeparated(elder.medications),
      medicalConditions: toCommaSeparated(elder.medicalConditions),
      observations: elder.observations || "",
      emergencyContact: elder.emergencyContact || "",
      address: elder.address || "",
      phone: elder.phone || "",
    })
  })

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
  })

  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 10) {
      // Fixo: (XX) XXXX-XXXX
      return digits
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
    }
    // Celular: (XX) XXXXX-XXXX
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
  }

  const phoneField = (key: keyof typeof form) => ({
    value: form[key],
    maxLength: 15,
    placeholder: "(XX) XXXXX-XXXX",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: maskPhone(e.target.value) })),
  })

  const handleSave = async () => {
    if (!elder) return
    const elderId = elder.id || elder._id
    try {
      setLoading(true)
      const payload = {
        ...form,
        allergies: form.allergies.split(",").map((s) => s.trim()).filter(Boolean),
        medications: form.medications.split(",").map((s) => s.trim()).filter(Boolean),
        medicalConditions: form.medicalConditions.split(",").map((s) => s.trim()).filter(Boolean),
      }
      await elderService.updateMedicalRecord(elderId, payload)
      toast({ title: "✅ Ficha médica atualizada!" })
      onOpenChange(false)
      onSaved?.()
    } catch {
      toast({ title: "Erro ao salvar ficha", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <FileHeart className="w-6 h-6 text-rose-500" />
              Ficha do paciente
            </DialogTitle>
            <DialogDescription>
              Paciente:{" "}
              <span className="font-bold text-gray-900">{elder?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Dados de Registro – somente leitura */}
            <section className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
                <User className="w-3 h-3" />
                Dados de Registro (Somente Leitura)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Nome Completo</p>
                  <p className="text-sm font-semibold text-gray-800">{elder?.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Nascimento</p>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                    <Cake className="w-3 h-3" />
                    {elder?.birthData
                      ? new Date(elder.birthData).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </section>

            {/* Informações Médicas */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Informações Médicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Plano de Saúde</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    {...field("typePlanetLife")}
                  >
                    <option value="">Selecione...</option>
                    {HEALTH_PLANS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Tipo Sanguíneo</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    {...field("bloodType")}
                  >
                    <option value="">...</option>
                    {BLOOD_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Contato de Emergência</label>
                  <Input {...phoneField("emergencyContact")} />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Telefone idoso</label>
                  <Input {...phoneField("phone")} />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Alergias</label>
                  <Input placeholder="Separadas por vírgula" {...field("allergies")} />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Condições Médicas</label>
                  <Input placeholder="Separadas por vírgula" {...field("medicalConditions")} />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Medicamentos e Observações</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    {...field("observations")}
                  />
                </div>
              </div>
            </section>
          </div>

          <DialogFooter className="bg-gray-50 -mx-6 -mb-6 p-6 mt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-10 font-bold"
            >
              {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}