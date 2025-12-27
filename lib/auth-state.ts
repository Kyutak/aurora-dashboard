"use client"

interface AdminAccount {
  id: string
  nome: string
  email: string
  senha: string
  tipo: "admin"
  dataCriacao: Date
}

interface FamiliarAccount {
  id: string
  nome: string
  email: string
  senha: string
  cpfIdoso: string
  tipo: "familiar"
  dataCriacao: Date
}

interface IdosoAccount {
  id: string
  nome: string
  codigo: string
  cpf: string
  tipo: "idoso"
  dataCriacao: Date
  cadastradoPor: string // admin id
}

type Account = AdminAccount | FamiliarAccount | IdosoAccount

interface AuthState {
  currentUser: Account | null
  accounts: Account[]
  listeners: Set<() => void>
}

const state: AuthState = {
  currentUser: null,
  accounts: [],
  listeners: new Set(),
}

// Load from localStorage on initialization
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("aurora-auth")
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      state.accounts = parsed.accounts || []
      state.currentUser = parsed.currentUser || null
    } catch (e) {
      console.error("Failed to parse auth state")
    }
  }
}

const saveToStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "aurora-auth",
      JSON.stringify({
        accounts: state.accounts,
        currentUser: state.currentUser,
      }),
    )
  }
}

export const authState = {
  // Registration
  registerAdmin: (nome: string, email: string, senha: string) => {
    const newAccount: AdminAccount = {
      id: Date.now().toString(),
      nome,
      email,
      senha,
      tipo: "admin",
      dataCriacao: new Date(),
    }
    state.accounts.push(newAccount)
    saveToStorage()
    authState.notify()
    return newAccount
  },

  registerFamiliar: (nome: string, email: string, senha: string, cpfIdoso: string) => {
    const newAccount: FamiliarAccount = {
      id: Date.now().toString(),
      nome,
      email,
      senha,
      cpfIdoso,
      tipo: "familiar",
      dataCriacao: new Date(),
    }
    state.accounts.push(newAccount)
    saveToStorage()
    authState.notify()
    return newAccount
  },

  registerIdoso: (nome: string, cpf: string, adminId: string) => {
    // Generate a 6-digit code
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    const newAccount: IdosoAccount = {
      id: Date.now().toString(),
      nome,
      codigo,
      cpf,
      tipo: "idoso",
      dataCriacao: new Date(),
      cadastradoPor: adminId,
    }
    state.accounts.push(newAccount)
    saveToStorage()
    authState.notify()
    return newAccount
  },

  // Login
  loginWithEmail: (email: string, senha: string) => {
    const account = state.accounts.find(
      (acc) => (acc.tipo === "admin" || acc.tipo === "familiar") && acc.email === email && acc.senha === senha,
    ) as AdminAccount | FamiliarAccount | undefined

    if (account) {
      state.currentUser = account
      saveToStorage()
      authState.notify()
      return account
    }
    return null
  },

  loginWithCode: (codigo: string) => {
    const account = state.accounts.find((acc) => acc.tipo === "idoso" && acc.codigo === codigo) as
      | IdosoAccount
      | undefined

    if (account) {
      state.currentUser = account
      saveToStorage()
      authState.notify()
      return account
    }
    return null
  },

  loginWithGoogle: () => {
    // Mock Google login - in future, integrate with real OAuth
    const mockAccount: AdminAccount = {
      id: "google-" + Date.now().toString(),
      nome: "Usuário Google",
      email: "usuario@gmail.com",
      senha: "",
      tipo: "admin",
      dataCriacao: new Date(),
    }
    state.currentUser = mockAccount
    state.accounts.push(mockAccount)
    saveToStorage()
    authState.notify()
    return mockAccount
  },

  // Logout
  logout: () => {
    state.currentUser = null
    saveToStorage()
    authState.notify()
  },

  // Get current user
  getCurrentUser: () => state.currentUser,

  // Check if email exists
  emailExists: (email: string) => {
    return state.accounts.some((acc) => (acc.tipo === "admin" || acc.tipo === "familiar") && acc.email === email)
  },

  // Get idoso by CPF
  getIdosoByCpf: (cpf: string) => {
    return state.accounts.find((acc) => acc.tipo === "idoso" && acc.cpf === cpf) as IdosoAccount | undefined
  },

  // Subscribe/notify pattern
  subscribe: (callback: () => void) => {
    state.listeners.add(callback)
    return () => state.listeners.delete(callback)
  },

  notify: () => {
    state.listeners.forEach((listener) => listener())
  },
}
