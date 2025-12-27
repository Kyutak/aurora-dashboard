"use client"

import { useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminPersonalizacao } from "@/components/admin-personalizacao"

export default function PersonalizacaoPage() {
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
        <AdminPersonalizacao />
      </main>
    </div>
  )
}
