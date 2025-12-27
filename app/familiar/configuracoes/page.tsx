"use client"

import { FamiliarSidebar } from "@/components/familiar-sidebar"
import { Card } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function ConfiguracoesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <FamiliarSidebar />
      <main className="flex-1 p-6 md:p-8">
        <Card className="p-8 text-center">
          <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Configurações</h2>
          <p className="text-muted-foreground">Esta página será implementada quando você integrar o backend</p>
        </Card>
      </main>
    </div>
  )
}
