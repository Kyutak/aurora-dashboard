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
import { useState, useEffect } from "react"
import { sharedState } from "@/lib/shared-state"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function AdminSidebar() {
  const pathname = usePathname()
  const [botaoEmergenciaAtivo, setBotaoEmergenciaAtivo] = useState(true)

  useEffect(() => {
    const prefs = sharedState.getPreferencias()
    setBotaoEmergenciaAtivo(prefs.botaoEmergenciaAtivo)

    const unsubscribe = sharedState.subscribe(() => {
      const prefs = sharedState.getPreferencias()
      setBotaoEmergenciaAtivo(prefs.botaoEmergenciaAtivo)
    })

    return () => {
      unsubscribe();
    }
  }, [])

  const allLinks = [
    { href: "/admin/dashboard", label: "Home", icon: Home },
    { href: "/admin/lembretes", label: "Lembretes", icon: Clock },
    { href: "/admin/emergencias", label: "Emergências", icon: AlertTriangle },
    { href: "/admin/atividade-recente", label: "Atividade Recente", icon: Activity },
  ]

  const links = botaoEmergenciaAtivo ? allLinks : allLinks.filter((link) => link.label !== "Emergências")

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 hidden md:block shadow-lg">
        <div className="mb-8">
          <Link href="/">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Aurora
            </h2>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">Administrador</p>
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
                  isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-muted-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left",
                  [
                    "/admin/painel-admin",
                    "/admin/personalizacao",
                    "/admin/configuracoes",
                    "/admin/feedback",
                    "/admin/meu-plano",
                  ].includes(pathname)
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-muted-foreground",
                )}
              >
                <Menu className="w-5 h-5" />
                Menu
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem asChild className="py-3 px-4">
                <Link href="/admin/painel-admin" className="flex items-center gap-3 cursor-pointer">
                  <Shield className="w-5 h-5" />
                  <span className="text-base">Painel do Admin</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-3 px-4">
                <Link href="/admin/personalizacao" className="flex items-center gap-3 cursor-pointer">
                  <Palette className="w-5 h-5" />
                  <span className="text-base">Personalização</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-3 px-4">
                <Link href="/admin/configuracoes" className="flex items-center gap-3 cursor-pointer">
                  <Settings className="w-5 h-5" />
                  <span className="text-base">Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-3 px-4">
                <Link href="/admin/feedback" className="flex items-center gap-3 cursor-pointer">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-base">Feedback</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-3 px-4">
                <Link href="/admin/meu-plano" className="flex items-center gap-3 cursor-pointer">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-base">Meu Plano</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="mt-auto pt-8">
          <Link href="/">
            <Button variant="outline" className="w-full bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-lg">
        <div className="flex items-center justify-around p-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-[50px]",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium truncate max-w-full text-center">{link.label}</span>
              </Link>
            )
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-[50px] text-muted-foreground",
                )}
              >
                <Menu className="w-5 h-5" />
                <span className="text-[9px] font-medium">Menu</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-64 mb-2">
              <DropdownMenuItem asChild className="py-3 px-4">
                <Link href="/admin/painel-admin" className="flex items-center gap-3 cursor-pointer">
                  <Shield className="w-5 h-5" />
                  <span className="text-base">Painel do Admin</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-3 px-4">
                <Link href="/admin/personalizacao" className="flex items-center gap-3 cursor-pointer">
                  <Palette className="w-5 h-5" />
                  <span className="text-base">Personalização</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-3 px-4">
                <Link href="/admin/configuracoes" className="flex items-center gap-3 cursor-pointer">
                  <Settings className="w-5 h-5" />
                  <span className="text-base">Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-3 px-4">
                <Link href="/admin/feedback" className="flex items-center gap-3 cursor-pointer">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-base">Feedback</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="py-3 px-4">
                <Link href="/admin/meu-plano" className="flex items-center gap-3 cursor-pointer">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-base">Meu Plano</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Spacer */}
      <div className="md:hidden h-20" />
    </>
  )
}