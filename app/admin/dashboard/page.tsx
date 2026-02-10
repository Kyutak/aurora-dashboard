"use client"

import React, { useEffect } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { SharedDashboard } from "@/components/dashboard" // Verifique se o nome é este

export default function AdminDashboard() {
  
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
        {/* Usamos o Dashboard completo, passando o tipo admin */}
        <SharedDashboard userType="admin" />
      </main>
    </div>
  )
}