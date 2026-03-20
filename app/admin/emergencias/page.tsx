"use client"

import  React, { useEffect } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { SharedEmergencias } from "@/components/Emergencies"

export default function AdminEmergenciasPage() {
  
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <SharedEmergencias />
      </main>
    </div>
  )
}
