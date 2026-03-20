"use client"

import { useEffect } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { SharedLembretes } from "@/components/Reminders"

export default function AdminLembretesPage() {
  
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <SharedLembretes userType="admin" />
      </main>
    </div>
  )
}