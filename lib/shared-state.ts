// --- INTERFACES ---
export interface Lembrete {
  id: string
  titulo: string
  horario: string
  data: Date
  tipo: "medicamento" | "refeicao" | "lembrete-voz" | "rotina" | "evento"
  criadoPor: "idoso" | "familiar" | "admin"
  diasSemana?: number[]
  repeticao?: string
}

export interface Emergencia {
  observation?: string
  resolvedAt: any
  at: string | Date
  id: string
  timestamp: Date
  resolved: boolean
  idosoId: string
  elderName?: string
}

export interface Preferencias {
  botaoEmergenciaAtivo: boolean
  idosoPodeEditarRotina: boolean
}

export interface Usuario {
  id: string
  nome: string
  tipo: "familiar" | "idoso"
  status: "ativo" | "inativo"
  ultimaAtividade: Date
}

export interface PessoaSimples {
  id?: string
  _id?: string
  name?: string
  user?: { name: string; email?: string }
  cpf?: string
  age?: number
}

export interface Atividade {
  id: string
  usuario: string
  acao: string
  timestamp: Date
  tipo: "idoso" | "familiar" | "admin"
  vinculoId: string 
}

interface SharedState {
  lembretes: Lembrete[]
  emergencias: Emergencia[]
  preferencias: Preferencias
  usuarios: Usuario[]
  idosos: PessoaSimples[]
  colaboradores: PessoaSimples[]
  listeners: Set<() => void>
  lembretesCompletos: Set<string>
  atividades: Atividade[]
}

// --- ESTADO INICIAL ---
const state: SharedState = {
  lembretes: [],
  emergencias: [],
  preferencias: {
    botaoEmergenciaAtivo: true,
    idosoPodeEditarRotina: false,
  },
  usuarios: [],
  idosos: [],
  colaboradores: [],
  listeners: new Set(),
  lembretesCompletos: new Set(),
  atividades: []
}


// --- OBJETO COMPARTILHADO EXPORTADO (VERSÃO CORRIGIDA) ---

export const sharedState = {
  // 1. INFRAESTRUTURA E REATIVIDADE
  subscribe: (callback: () => void) => {
    state.listeners.add(callback)
    return () => state.listeners.delete(callback)
  },

  notify: () => {
    state.listeners.forEach((listener) => listener())
  },

  // 2. GESTÃO ADMINISTRATIVA (Idosos e Colaboradores)
  getIdosos: () => state.idosos,
  setIdosos: (lista: PessoaSimples[]) => {
    state.idosos = lista
    sharedState.notify()
  },

  getColaboradores: () => state.colaboradores,
  setColaboradores: (lista: PessoaSimples[]) => {
    state.colaboradores = lista
    sharedState.notify()
  },

  // FUNÇÕES DE VALIDAÇÃO PARA O DASHBOARD (Sem duplicatas agora!)
  countIdosos: () => state.idosos.length,
  canAddIdoso: (limite: number = 999) => state.idosos.length < limite,
  
  countColaboradores: () => state.colaboradores.length,
  canAddFamiliar: (limite: number = 999) => state.colaboradores.length < limite,

  // 3. LEMBRETES
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

  getLembretesCompletos: () => state.lembretesCompletos,
  isLembreteCompleto: (id: string) => state.lembretesCompletos.has(id),
  toggleLembreteCompleto: (id: string) => {
    if (state.lembretesCompletos.has(id)) {
      state.lembretesCompletos.delete(id)
    } else {
      state.lembretesCompletos.add(id)
    }
    sharedState.notify()
  },

  countLembretesVoz: () => state.lembretes.filter((l) => l.tipo === "lembrete-voz").length,
  canAddLembreteVoz: () => sharedState.countLembretesVoz() < 2,

  // 4. EMERGÊNCIAS
  getEmergencias: () => state.emergencias,
  setEmergencias: (lista: Emergencia[]) => {
    state.emergencias = lista
    sharedState.notify()
  },

  addEmergencia: (data: { id?: string; idosoId: string; elderName?: string; at?: any }) => {
    const nova: Emergencia = {
      id: data.id || Date.now().toString(),
      at: data.at || new Date().toISOString(), 
      timestamp: new Date(),
      resolved: false, 
      idosoId: data.idosoId,
      elderName: data.elderName || "Idoso",
      observation: undefined,
      resolvedAt: undefined
    }
    state.emergencias.unshift(nova)
    sharedState.notify()
    return nova
  },

  resolverEmergencia: (id: string, observacaoTexto?: string) => {
    const index = state.emergencias.findIndex((e) => e.id === id)
    if (index !== -1) {
      state.emergencias[index].resolved = true
      state.emergencias[index].resolvedAt = new Date()
      state.emergencias[index].observation = observacaoTexto 
      sharedState.notify()
    }
  },

  // 5. PREFERÊNCIAS E USUÁRIOS
  getPreferencias: () => state.preferencias,
  updatePreferencias: (updates: Partial<Preferencias>) => {
    state.preferencias = { ...state.preferencias, ...updates }
    sharedState.notify()
  },

  getUsuarios: () => state.usuarios,

  getAtividades: () => state.atividades,
  
  addAtividade: (atv: Atividade) => {
    state.atividades = [atv, ...state.atividades].slice(0, 50)
    sharedState.notify()
  },
}