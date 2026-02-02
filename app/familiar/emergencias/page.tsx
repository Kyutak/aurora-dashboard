"use client"

import { useEffect } from "react"
import { FamiliarSidebar } from "@/components/layout/familiar-sidebar"
import { SharedEmergencias } from "@/components/emergencias"

export default function EmergenciasPage() {
  useEffect(() => {
    window.scrollTo({
      top: 52,
      behavior: "auto",
    })
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <FamiliarSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <SharedEmergencias />
      </main>
    </div>
  )
}
