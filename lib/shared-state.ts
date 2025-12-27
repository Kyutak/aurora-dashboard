interface Lembrete {
  id: string
  titulo: string
  horario: string
  data: Date
  tipo: "medicamento" | "refeicao" | "lembrete-voz" | "rotina" | "evento"
  criadoPor: "idoso" | "familiar" | "admin"
  diasSemana?: number[] // 0 = Sunday, 1 = Monday, etc.
  repeticao?: string
}

interface Emergencia {
  id: string
  timestamp: Date
  resolvido: boolean
  idosoId: string
  observacao?: string
}

interface Preferencias {
  botaoEmergenciaAtivo: boolean
  idosoPodeEditarRotina: boolean
}

interface Usuario {
  id: string
  nome: string
  tipo: "familiar" | "idoso"
  status: "ativo" | "inativo"
  ultimaAtividade: Date
}

interface SharedState {
  lembretes: Lembrete[]
  emergencias: Emergencia[]
  preferencias: Preferencias
  usuarios: Usuario[]
  listeners: Set<() => void>
  lembretesCompletos: Set<string>
}

const state: SharedState = {
  lembretes: [
    {
      id: "1",
      titulo: "Tomar remédio da pressão",
      horario: "08:00",
      data: new Date(),
      tipo: "medicamento",
      criadoPor: "familiar",
      repeticao: "Diária",
    },
    {
      id: "2",
      titulo: "Almoço",
      horario: "12:00",
      data: new Date(),
      tipo: "refeicao",
      criadoPor: "familiar",
      repeticao: "Diária",
    },
  ],
  emergencias: [],
  preferencias: {
    botaoEmergenciaAtivo: true,
    idosoPodeEditarRotina: false,
  },
  usuarios: [
    {
      id: "1",
      nome: "Admin (Você)",
      tipo: "familiar",
      status: "ativo",
      ultimaAtividade: new Date(),
    },
    {
      id: "2",
      nome: "João Santos",
      tipo: "familiar",
      status: "ativo",
      ultimaAtividade: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: "3",
      nome: "Maria Silva",
      tipo: "idoso",
      status: "ativo",
      ultimaAtividade: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "4",
      nome: "Ana Costa",
      tipo: "idoso",
      status: "ativo",
      ultimaAtividade: new Date(Date.now() - 1000 * 60 * 30),
    },
  ],
  listeners: new Set(),
  lembretesCompletos: new Set(),
}

export const sharedState = {
  // Lembretes
  getLembretes: () => state.lembretes,

  addLembrete: (lembrete: Omit<Lembrete, "id">) => {
    const novo: Lembrete = {
      id: Date.now().toString(),
      ...lembrete,
      data: lembrete.data instanceof Date ? lembrete.data : new Date(lembrete.data),
    }
    state.lembretes.push(novo)
    sharedState.notify()
    return novo
  },

  updateLembrete: (id: string, updates: Partial<Lembrete>) => {
    const index = state.lembretes.findIndex((l) => l.id === id)
    if (index !== -1) {
      state.lembretes[index] = { ...state.lembretes[index], ...updates }
      sharedState.notify()
    }
  },

  deleteLembrete: (id: string) => {
    state.lembretes = state.lembretes.filter((l) => l.id !== id)
    state.lembretesCompletos.delete(id)
    sharedState.notify()
  },

  // Methods for tracking completed reminders
  getLembretesCompletos: () => state.lembretesCompletos,

  toggleLembreteCompleto: (id: string) => {
    if (state.lembretesCompletos.has(id)) {
      state.lembretesCompletos.delete(id)
    } else {
      state.lembretesCompletos.add(id)
    }
    sharedState.notify()
  },

  isLembreteCompleto: (id: string) => state.lembretesCompletos.has(id),

  // Emergências
  getEmergencias: () => state.emergencias,

  addEmergencia: (idosoId: string) => {
    const nova: Emergencia = {
      id: Date.now().toString(),
      timestamp: new Date(),
      resolvido: false,
      idosoId,
    }
    state.emergencias.push(nova)
    sharedState.notify()
    return nova
  },

  resolverEmergencia: (id: string, observacao?: string) => {
    const index = state.emergencias.findIndex((e) => e.id === id)
    if (index !== -1) {
      state.emergencias[index].resolvido = true
      if (observacao) {
        state.emergencias[index].observacao = observacao
      }
      sharedState.notify()
    }
  },

  // Preferences
  getPreferencias: () => state.preferencias,

  updatePreferencias: (updates: Partial<Preferencias>) => {
    state.preferencias = { ...state.preferencias, ...updates }
    sharedState.notify()
  },

  // User Management
  getUsuarios: () => state.usuarios,

  deleteUsuario: (id: string) => {
    // Don't allow deleting the admin (first familiar user)
    if (id === "1") return
    state.usuarios = state.usuarios.filter((u) => u.id !== id)
    sharedState.notify()
  },

  canAddFamiliar: () => {
    return state.usuarios.filter((u) => u.tipo === "familiar").length < 2
  },

  canAddIdoso: () => {
    return state.usuarios.filter((u) => u.tipo === "idoso").length < 1
  },

  // Subscribe/notify pattern
  subscribe: (callback: () => void) => {
    state.listeners.add(callback)
    return () => state.listeners.delete(callback)
  },

  notify: () => {
    state.listeners.forEach((listener) => listener())
  },

  countLembretesVoz: () => {
    return state.lembretes.filter((l) => l.tipo === "lembrete-voz").length
  },

  canAddLembreteVoz: () => {
    return sharedState.countLembretesVoz() < 2
  },
}
