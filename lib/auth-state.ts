"use client"

"use client"

export type UserRole = "FAMILIAR" | "FAMILIAR_COLABORADOR" | "IDOSO"

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  elderId?: string;
  elderProfileId?: string; 
  status: string
}

const STORAGE_KEY = "user"

export function setSessionUser(response: any) {
  if (typeof window === "undefined") return

  // Baseado na sua imagem a3ba19.png, os dados estão dentro de response.data.user ou direto em response.user
  const user = response?.data?.user || response?.user

  if (!user) return

  const sessionUser: SessionUser = {
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    elderId: user.elderId, 
    elderProfileId: user.elderProfileId, 
    status: user.status,
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser))
  window.dispatchEvent(new Event("session-user-changed"))
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null

  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as SessionUser
  } catch {
    return null
  }
}

export function clearSessionUser() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event("session-user-changed"))
}

export function getUserLabel(role?: UserRole) {
  if (role === "FAMILIAR") return "Administrador"
  if (role === "FAMILIAR_COLABORADOR") return "Colaborador"
  if (role === "IDOSO") return "Idoso"
  return "Usuário"
}
