"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { 
  CircleDashedIcon, 
  Pill, 
  Utensils, 
  Repeat, 
  Loader2, 
  Users, 
  CalendarDays,
  CheckCircle2,
  FileHeart, // Ícone da Ficha
  ShieldCheck,
  User,
  Cake
} from "lucide-react"
import { LembreteModal } from "@/features/reminder-modal"
import { useToast } from "@/hooks/use-toast"
import { CalendarTimeline } from "@/components/ui/calendar-timeline"
import { getSessionUser, getUserLabel, SessionUser } from "@/lib/auth-state"
import { getDailyReminders, createReminder, markReminderAsDone } from "@/service/remiders.service"
import { elderService } from "@/service/elder.service"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogPortal } from "@/components/ui/dialog"

export function SharedDashboard({ userType }: { userType: string }) {
  const { toast } = useToast()
  const [lembretes, setLembretes] = useState<any[]>([])
  const [elders, setElders] = useState<any[]>([])
  const [selectedElderId, setSelectedElderId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // --- ESTADOS DA FICHA MÉDICA ---
  const [showFichaDialog, setShowFichaDialog] = useState(false)
  const [fichaLoading, setFichaLoading] = useState(false)
  const [fichaData, setFichaData] = useState({
    bloodType: "", 
    typePlanetLife: "", 
    allergies: "", 
    medications: "", 
    medicalConditions: "",
    observations: "", 
    emergencyContact: "", 
    address: "", 
    phone: ""
  })

  const carregarLembretes = useCallback(async (id: string) => {
    if (!id) return
    try {
      setLoading(true)
      const data = await getDailyReminders(id)
      setLembretes(data || [])
    } catch (error) {
      setLembretes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const currentUser = getSessionUser()
      setUser(currentUser)

      if (currentUser?.role === "IDOSO" && currentUser.elderId) {
        setSelectedElderId(currentUser.elderId)
        carregarLembretes(currentUser.elderId)
      } else {
        try {
          const response = await elderService.getMyElders()
          const lista = response.data || []
          setElders(lista)
          if (lista.length > 0) {
            const idInicial = lista[0].id || lista[0]._id
            setSelectedElderId(idInicial)
            carregarLembretes(idInicial)
          }
        } catch (e) {
          console.error("Erro ao carregar idosos:", e)
        }
      }
    }
    init()
  }, [carregarLembretes])

  // --- LOGICA DA FICHA ---
  const handleOpenFicha = () => {
    const idoso = elders.find(e => (e.id || e._id) === selectedElderId);
    if (!idoso) return;

    setFichaData({
      bloodType: idoso.bloodType || "",
      typePlanetLife: idoso.typePlanetLife || "",
      allergies: Array.isArray(idoso.allergies) ? idoso.allergies.join(", ") : idoso.allergies || "",
      medications: Array.isArray(idoso.medications) ? idoso.medications.join(", ") : idoso.medications || "",
      medicalConditions: Array.isArray(idoso.medicalConditions) ? idoso.medicalConditions.join(", ") : idoso.medicalConditions || "",
      observations: idoso.observations || "",
      emergencyContact: idoso.emergencyContact || "",
      address: idoso.address || "",
      phone: idoso.phone || ""
    });
    setShowFichaDialog(true);
  }

  const handleSalvarFicha = async () => {
    try {
      setFichaLoading(true);
      const payload = {
        ...fichaData,
        allergies: fichaData.allergies.split(",").map(s => s.trim()).filter(Boolean),
        medications: fichaData.medications.split(",").map(s => s.trim()).filter(Boolean),
        medicalConditions: fichaData.medicalConditions.split(",").map(s => s.trim()).filter(Boolean),
      };
      await elderService.updateMedicalRecord(selectedElderId, payload);
      toast({ title: "✅ Ficha médica atualizada!" });
      setShowFichaDialog(false);
      // Opcional: recarregar lista de idosos para manter estado local novo
      const res = await elderService.getMyElders();
      setElders(res.data || []);
    } catch (error) {
      toast({ title: "Erro ao salvar ficha", variant: "destructive" });
    } finally {
      setFichaLoading(false);
    }
  }

  const handleSalvarLembrete = async (dados: any) => {
    try {
      await createReminder(dados);
      toast({ title: "Lembrete agendado!" });
      setModalOpen(false);
      carregarLembretes(selectedElderId);
    } catch (error) {
      toast({ title: "Erro ao criar", variant: "destructive" });
    }
  };

  const handleConcluir = async (id: string) => {
    try {
      setLembretes(prev => prev.map(l => 
        (l.id || l._id) === id ? { ...l, done: true } : l
      ))
      await markReminderAsDone(id)
      toast({ title: "Tarefa concluída!" })
    } catch (error) {
      carregarLembretes(selectedElderId)
      toast({ title: "Erro ao concluir", variant: "destructive" })
    }
  }

  const currentElder = elders.find(e => (e.id || e._id) === selectedElderId);

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-br from-blue-600 to-emerald-400" />
      <div className="relative z-10 pt-20 pb-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl backdrop-blur-md border border-white/30">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Olá, {user?.name}</h1>
                <p className="text-sm opacity-80">{user?.role ? getUserLabel(user.role) : "Gestor"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               {/* BOTÃO DA FICHA MÉDICA INJETADO AQUI */}
               {selectedElderId && (
                 <Button 
                   onClick={handleOpenFicha}
                   className="bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 rounded-xl p-2 px-3 flex gap-2 items-center text-white"
                 >
                   <FileHeart className="w-5 h-5 text-rose-300" />
                   <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Ficha</span>
                 </Button>
               )}

              {user?.role !== "IDOSO" && elders.length > 0 && (
                <div className="flex items-center gap-2 bg-black/20 p-2 px-4 rounded-xl backdrop-blur-md border border-white/10">
                  <Users className="w-4 h-4" />
                  <select 
                    value={selectedElderId} 
                    onChange={(e) => {
                      setSelectedElderId(e.target.value)
                      carregarLembretes(e.target.value)
                    }}
                    className="bg-transparent text-sm font-bold outline-none cursor-pointer appearance-none"
                  >
                    {elders.map(e => (
                      <option key={e.id || e._id} value={e.id || e._id} className="text-black">
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-[32px] shadow-xl p-6 min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Painel Diário</h2>
                {user?.role !== "IDOSO" && (
                  <Button onClick={() => setModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 rounded-full">
                    + Novo Lembrete
                  </Button>
                )}
              </div>

              <CalendarTimeline />

              <div className="mt-8 space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
                ) : lembretes.length > 0 ? (
                  lembretes.map((l) => {
                    const isCompleted = l.done || l.concluido;
                    return (
                      <div 
                        key={l.id || l._id} 
                        className={`flex items-center gap-4 p-4 rounded-2xl border-l-4 transition-all duration-300 ${
                          isCompleted 
                            ? "bg-gray-100/50 dark:bg-zinc-900/40 border-gray-300 opacity-70" 
                            : "bg-gray-50 dark:bg-zinc-900 border-emerald-500 shadow-sm"
                        }`}
                      >
                        <div className={isCompleted ? "text-gray-400" : "text-emerald-500"}>
                          {l.type === 'Medicamento' && <Pill className="w-6 h-6" />}
                          {l.type === 'Refeição' && <Utensils className="w-6 h-6" />}
                          {l.type === 'Rotina' && <Repeat className="w-6 h-6" />}
                          {l.type === 'Evento' && <CalendarDays className="w-6 h-6" />}
                        </div>

                        <div className="flex-1">
                          <p className={`font-bold transition-all ${isCompleted ? "line-through text-gray-400" : "text-gray-900 dark:text-white"}`}>
                            {l.title}
                          </p>
                          <p className="text-xs text-gray-400 font-bold uppercase">{l.time} • {l.type}</p>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={isCompleted}
                          onClick={() => handleConcluir(l.id || l._id)}
                          className="rounded-full"
                        >
                          {isCompleted ? (
                            <div className="bg-emerald-500 rounded-full p-1">
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                          ) : (
                            <CircleDashedIcon className="w-7 h-7 text-gray-300 hover:text-emerald-500 transition-colors" />
                          )}
                        </Button>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-gray-400 py-10">Nenhum lembrete para hoje.</p>
                )}
              </div>
          </div>
        </div>
      </div>

      <LembreteModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        onSave={handleSalvarLembrete} 
        elders={elders} 
        defaultElderId={selectedElderId} 
      />

      {/* --- MODAL DA FICHA MÉDICA INJETADO --- */}
      <Dialog open={showFichaDialog} onOpenChange={setShowFichaDialog}>
        <DialogPortal>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <FileHeart className="w-6 h-6 text-rose-500" /> Prontuário de Saúde
              </DialogTitle>
              <DialogDescription>
                Paciente: <span className="font-bold text-gray-900">{currentElder?.name}</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
                  <User className="w-3 h-3" /> Dados de Registro (Somente Leitura)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Nome Completo</p>
                    <p className="text-sm font-semibold text-gray-800">{currentElder?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Nascimento</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                      <Cake className="w-3 h-3" />
                      {currentElder?.birthData ? new Date(currentElder.birthData).toLocaleDateString('pt-BR') : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Informações Médicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Plano de Saúde</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={fichaData.typePlanetLife}
                      onChange={(e) => setFichaData({...fichaData, typePlanetLife: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      <option value="SUS">SUS</option>
                      <option value="Unimed">Unimed</option>
                      <option value="Amil">Amil</option>
                      <option value="Hapvida">Hapvida</option>
                      <option value="Particular">Particular/Outros</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Tipo Sanguíneo</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={fichaData.bloodType}
                      onChange={(e) => setFichaData({...fichaData, bloodType: e.target.value})}
                    >
                      <option value="">...</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Contato Emergência</label>
                    <Input value={fichaData.emergencyContact} onChange={e => setFichaData({...fichaData, emergencyContact: e.target.value})} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">Telefone</label>
                    <Input value={fichaData.phone} onChange={e => setFichaData({...fichaData, phone: e.target.value})} />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Alergias</label>
                    <Input placeholder="Separadas por vírgula" value={fichaData.allergies} onChange={e => setFichaData({...fichaData, allergies: e.target.value})} />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Medicamentos e Observações</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      value={fichaData.observations}
                      onChange={e => setFichaData({...fichaData, observations: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="bg-gray-50 -mx-6 -mb-6 p-6 mt-4">
              <Button variant="ghost" onClick={() => setShowFichaDialog(false)}>Cancelar</Button>
              <Button onClick={handleSalvarFicha} disabled={fichaLoading} className="bg-blue-600 hover:bg-blue-700 px-10 font-bold">
                {fichaLoading ? <Loader2 className="animate-spin mr-2" /> : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  )
}