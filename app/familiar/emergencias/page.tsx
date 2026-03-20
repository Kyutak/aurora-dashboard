"use client"

import { useEffect } from "react"
import { FamiliarSidebar } from "@/components/layout/familiar-sidebar"
import { SharedEmergencias } from "@/components/Emergencias"

export default function EmergenciasPage() {

  return (
    <div className="flex min-h-screen bg-background">
      <FamiliarSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <SharedEmergencias />
      </main>
    </div>
  )
}
