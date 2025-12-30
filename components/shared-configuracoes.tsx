"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { authState } from "@/lib/auth-state"
import { Pencil, Trash2, LogOut, Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SharedConfiguracoesProps {
  userType: "familiar" | "admin"
}

export function SharedConfiguracoes({ userType }: SharedConfiguracoesProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState(authState.getCurrentUser())
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = authState.subscribe(() => {
      setUser(authState.getCurrentUser())
    })
    return () => {
      unsubscribe();
    }
  }, [])

  useEffect(() => {
    if (user) {
      setNewName(user.nome)
    }
  }, [user])

  const handleSaveName = () => {
    if (newName.trim().length < 2) {
      toast({
        title: "Nome inválido",
        description: "O nome deve ter pelo menos 2 caracteres.",
        variant: "destructive",
      })
      return
    }

    authState.updateUserName(newName.trim())
    setIsEditing(false)
    toast({
      title: "Nome atualizado",
      description: "Seu nome foi atualizado com sucesso.",
    })
  }

  const handleCancelEdit = () => {
    setNewName(user?.nome || "")
    setIsEditing(false)
  }

  const handleDeleteProfile = () => {
    authState.deleteProfile()
    toast({
      title: "Perfil excluído",
      description: "Seu perfil foi excluído com sucesso.",
    })
    router.push("/")
  }

  const handleLogout = () => {
    authState.logout()
    router.push("/")
  }

  // Mock data for demo mode
  const displayName = user?.nome || (userType === "admin" ? "Admin" : "Familiar")
  const displayEmail = (user && "email" in user ? user.email : "") || "usuario@exemplo.com"
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 w-full h-[400px] md:h-[450px] bg-gradient-to-br from-blue-500 via-teal-500 to-teal-400"
      />

      {/* Content */}
      <div className="relative z-10 pt-56 md:pt-64">
        <div className="w-full">
          <div className="flex items-center justify-between mb-0 mt-[-105px] px-[23px]">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">Configurações</h1>
          </div>

          <div className="bg-zinc-50 dark:bg-gray-900 rounded-t-[32px] shadow-2xl p-6 md:p-8 min-h-[calc(100vh-300px)] py-[35px] mt-6 mb-[45px]">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Meu Perfil</h2>
            <div className="h-[3px] mt-2 mb-8 bg-gradient-to-r from-teal-500 to-emerald-500 w-32"></div>

            {/* Profile Card */}
            <Card className="p-6 mb-6">
              <div className="flex items-center gap-6 mb-8">
                {/* Initial Icon - Not editable */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg flex-shrink-0">
                  {initial}
                </div>

                <div className="flex-1">
                  {/* Name - Editable */}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="text-xl font-semibold max-w-xs"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleSaveName}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      >
                        <Check className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-semibold">{displayName}</h3>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Email - Not editable */}
                  <p className="text-muted-foreground mt-1">{displayEmail}</p>
                </div>
              </div>

              {/* Info Section */}
              <div className="space-y-4 border-t pt-6">
                <div>
                  <Label className="text-sm text-muted-foreground">Nome</Label>
                  <p className="text-lg font-medium">{displayName}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">E-mail</Label>
                  <p className="text-lg font-medium">{displayEmail}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Tipo de conta</Label>
                  <p className="text-lg font-medium capitalize">{userType}</p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-14 text-base bg-transparent"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                Sair da conta
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-14 text-base text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-5 h-5" />
                Excluir perfil
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Perfil</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir seu perfil? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteProfile}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
