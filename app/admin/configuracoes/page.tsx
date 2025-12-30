"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { SharedConfiguracoes } from "@/components/shared-configuracoes"

export default function AdminConfiguracoesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1">
        <SharedConfiguracoes userType="admin" />
      </main>
    </div>
  )
}
