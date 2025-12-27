"use client"

import  React, { useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SharedEmergencias } from "@/components/shared-emergencias"

export default function AdminEmergenciasPage() {
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
        <SharedEmergencias />
      </main>
    </div>
  )
}
