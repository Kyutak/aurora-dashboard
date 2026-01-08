"use client"

import {
  Home,
  Clock,
  AlertTriangle,
  Settings,
  ArrowLeft,
  Activity,
  Shield,
  Palette,
  Menu,
  MessageSquare,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getSessionUser, getUserLabel } from ".././lib/auth-state"
import { sharedState } from "@/lib/shared-state"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AdminSidebar() {
  const pathname = usePathname()
  const user = getSessionUser()

  const [botaoEmergenciaAtivo, setBotaoEmergenciaAtivo] = useState(true)

  useEffect(() => {
    const prefs = sharedState.getPreferencias()
    setBotaoEmergenciaAtivo(prefs.botaoEmergenciaAtivo)

    const unsubscribe = sharedState.subscribe(() => {
      const prefs = sharedState.getPreferencias()
      setBotaoEmergenciaAtivo(prefs.botaoEmergenciaAtivo)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const allLinks = [
    { href: "/admin/dashboard", label: "Home", icon: Home },
    { href: "/admin/lembretes", label: "Lembretes", icon: Clock },
    { href: "/admin/emergencias", label: "Emergências", icon: AlertTriangle },
    { href: "/admin/atividade-recente", label: "Atividade Recente", icon: Activity },
  ]

  const links = botaoEmergenciaAtivo
    ? allLinks
    : allLinks.filter((l) => l.label !== "Emergências")

  return (
    <>
      {/* Desktop */}
      <aside className="w-64 bg-card border-r border-border p-6 hidden md:flex flex-col shadow-lg">
        <div className="mb-8">
          <Link href="/">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Aurora
            </h2>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.name} • {getUserLabel(user?.role)}
          </p>
        </div>

        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg w-full hover:bg-muted text-muted-foreground">
                <Menu className="w-5 h-5" />
                Menu
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem asChild>
                <Link href="/admin/painel-admin" className="flex items-center gap-3">
                  <Shield className="w-5 h-5" /> Painel do Admin
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/personalizacao" className="flex items-center gap-3">
                  <Palette className="w-5 h-5" /> Personalização
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/configuracoes" className="flex items-center gap-3">
                  <Settings className="w-5 h-5" /> Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/feedback" className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" /> Feedback
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/meu-plano" className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" /> Meu Plano
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="mt-auto pt-8">
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </aside>
    </>
  )
}
