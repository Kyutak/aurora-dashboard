"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Card } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function AdminConfiguracoesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <Card className="p-8 text-center">
          <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Admin - Configurações</h2>
          <p className="text-muted-foreground">Esta página será implementada quando você integrar o backend</p>
        </Card>
      </main>
    </div>
  )
}
