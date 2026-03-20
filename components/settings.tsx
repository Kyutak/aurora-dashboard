"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2, LogOut, Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getSessionUser, getUserLabel, SessionUser } from "@/lib/auth-state"

interface SharedConfiguracoesProps {
  userType: "familiar" | "admin"
}

export function SharedConfiguracoes({ userType }: SharedConfiguracoesProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [user, setUser]                   = useState<SessionUser | null>(null)
  const [isEditing, setIsEditing]         = useState(false)
  const [newName, setNewName]             = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const sessionUser = getSessionUser()
    setUser(sessionUser)
    if (sessionUser) setNewName(sessionUser.name)
  }, [])

  if (!user) return null

  const handleSaveName = () => {
    if (newName.trim().length < 2) {
      toast({
        title: "Nome inválido",
        description: "O nome deve ter pelo menos 2 caracteres.",
        variant: "destructive",
      })
      return
    }
    const updatedUser = { ...user, name: newName.trim() }
    sessionStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
    setIsEditing(false)
    toast({ title: "Nome atualizado", description: "Seu nome foi atualizado com sucesso." })
  }

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    router.push("/")
  }

  const handleDeleteProfile = () => {
    sessionStorage.removeItem("user")
    toast({ title: "Perfil excluído", description: "Seu perfil foi excluído com sucesso." })
    router.push("/")
  }

  const initial = user.name.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-24 md:pb-0">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Configurações
          </h1>
        </div>
      </header>

      {/* ── Conteúdo ─────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Perfil */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm px-5 py-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Perfil</p>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              {initial}
            </div>

            {/* Nome + email */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setIsEditing(false) }}
                    className="h-9 text-sm"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-full text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors focus:outline-none"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="shrink-0 p-0.5 rounded text-slate-300 hover:text-sky-500 transition-colors focus:outline-none"
                    aria-label="Editar nome"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</p>
              <p className="text-xs text-slate-400 truncate">{getUserLabel(user.role)}</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm divide-y divide-slate-100 dark:divide-zinc-800">

          {/* Sair */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors rounded-t-2xl"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-zinc-800">
              <LogOut className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sair da conta</span>
          </button>

          {/* Excluir perfil */}
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-b-2xl"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-red-50 dark:bg-red-950/40">
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm font-semibold text-red-500">Excluir perfil</span>
          </button>

        </div>
      </main>

      {/* ── Dialog de confirmação ─────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Excluir perfil
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteProfile}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}