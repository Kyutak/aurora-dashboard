"use client"

import { FamiliarSidebar } from "@/components/layout/familiar-sidebar"
import { SharedConfiguracoes } from "@/components/settings"

export default function ConfiguracoesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <FamiliarSidebar />
      <main className="flex-1">
        <SharedConfiguracoes userType="familiar" />
      </main>
    </div>
  )
}