"use client"

export type UserRole = "FAMILIAR" | "FAMILIAR_COLABORADOR" | "IDOSO"

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: string
}

const STORAGE_KEY = "login_context"

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null

  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)

    // 👇 EXTRAÇÃO CORRETA
    return parsed?.data?.user ?? null
  } catch {
    return null
  }
}

export function setSessionUser(user: SessionUser) {
  if (typeof window === "undefined") return

  sessionStorage.setItem("user", JSON.stringify(user))
  window.dispatchEvent(new Event("session-user-changed"))
}

export function getUserLabel(role?: UserRole) {
  if (role === "FAMILIAR") return "Administrador"
  if (role === "FAMILIAR_COLABORADOR") return "Colaborador"
  if (role === "IDOSO") return "Idoso"
  return "Usuário"
}
