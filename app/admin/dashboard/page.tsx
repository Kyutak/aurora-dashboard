"use client"

import React, { useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SharedDashboard } from "@/components/shared-dashboard"

export default function AdminDashboard() {
  
  useEffect(() => {
    window.scrollTo({
      top: 49, // ajuste aqui (px)
      behavior: "auto",
    })
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <SharedDashboard userType="admin" />
      </main>
    </div>
  )
}
