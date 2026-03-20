"use client"
import { useEffect } from "react"
import { FamiliarSidebar } from "@/components/layout/familiar-sidebar"
import { SharedDashboard } from "@/components/Dashboard"

export default function FamiliarDashboard() {

  return (
    <div className="flex min-h-screen bg-background">
      <FamiliarSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <SharedDashboard userType="familiar" />
      </main>
    </div>
  )
}
