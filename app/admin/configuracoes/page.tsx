"use client"

import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { SharedConfiguracoes } from "@/components/settings"

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
