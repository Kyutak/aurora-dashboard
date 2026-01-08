"use client"

export type UserRole = "FAMILIAR" | "FAMILIAR_COLABORADOR" | "IDOSO"

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: string
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null

  const stored = sessionStorage.getItem("user")
  if (!stored) return null

  try {
    return JSON.parse(stored) as SessionUser
  } catch {
    return null
  }
}

export function getUserLabel(role?: UserRole) {
  if (role === "FAMILIAR") return "Administrador"
  if (role === "FAMILIAR_COLABORADOR") return "Colaborador"
  if (role === "IDOSO") return "Idoso"
  return "Usuário"
}
