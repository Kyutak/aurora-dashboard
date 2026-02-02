"use client"

import { useEffect } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminPainel } from "@/components/admin-painel"

export default function PainelAdminPage() {
  useEffect(() => {
    window.scrollTo({
      top: 49,
      behavior: "auto",
    })
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <AdminPainel />
      </main>
    </div>
  )
}
