"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
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

  const [user, setUser] = useState<SessionUser | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState("")
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

    toast({
      title: "Nome atualizado",
      description: "Seu nome foi atualizado com sucesso.",
    })
  }

  const handleLogout = () => {
    sessionStorage.removeItem("user")
    router.push("/")
  }

  const handleDeleteProfile = () => {
    sessionStorage.removeItem("user")
    toast({
      title: "Perfil excluído",
      description: "Seu perfil foi excluído com sucesso.",
    })
    router.push("/")
  }

  const initial = user.name.charAt(0).toUpperCase()

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <div className="relative z-10 pt-56">
        <div className="bg-zinc-50 dark:bg-gray-900 rounded-t-[32px] p-6">
          <h2 className="text-3xl font-bold mb-6">Configurações</h2>

          <Card className="p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl">
                {initial}
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
                    <Button size="icon" onClick={handleSaveName}>
                      <Check />
                    </Button>
                    <Button size="icon" onClick={() => setIsEditing(false)}>
                      <X />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-semibold">{user.name}</h3>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                      <Pencil />
                    </Button>
                  </div>
                )}
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm">{getUserLabel(user.role)}</p>
              </div>
            </div>
          </Card>

          <Button variant="outline" className="w-full mb-3" onClick={handleLogout}>
            <LogOut className="mr-2" /> Sair
          </Button>

          <Button variant="destructive" className="w-full" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2" /> Excluir perfil
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir perfil</DialogTitle>
            <DialogDescription>Essa ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
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
