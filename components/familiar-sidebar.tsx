"use client"

import {
  Home,
  Clock,
  AlertTriangle,
  Settings,
  ArrowLeft,
  Menu,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { sharedState } from "@/lib/shared-state"
import { getSessionUser, getUserLabel } from ".././lib/auth-state"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function FamiliarSidebar() {
  const pathname = usePathname()
  const user = getSessionUser()

  const [botaoEmergenciaAtivo, setBotaoEmergenciaAtivo] = useState(true)

  useEffect(() => {
  const prefs = sharedState.getPreferencias()
  setBotaoEmergenciaAtivo(prefs.botaoEmergenciaAtivo)

  const result = sharedState.subscribe(() => {
    const prefs = sharedState.getPreferencias()
    setBotaoEmergenciaAtivo(prefs.botaoEmergenciaAtivo)
  })

  if (typeof result === "function") {
    return () => {
      result()
    }
  }

}, [])

  const allLinks = [
    { href: "/familiar/dashboard", label: "Home", icon: Home },
    { href: "/familiar/lembretes", label: "Lembretes", icon: Clock },
    { href: "/familiar/emergencias", label: "Emergências", icon: AlertTriangle },
  ]

  const links = botaoEmergenciaAtivo
    ? allLinks
    : allLinks.filter((l) => l.label !== "Emergências")

  return (
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
                "flex items-center gap-3 px-4 py-3 rounded-lg",
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

        <Link
          href="/familiar/configuracoes"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg",
            pathname === "/familiar/configuracoes"
              ? "bg-primary text-primary-foreground font-medium"
              : "hover:bg-muted text-muted-foreground"
          )}
        >
          <Settings className="w-5 h-5" />
          Configurações
        </Link>
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
  )
}
