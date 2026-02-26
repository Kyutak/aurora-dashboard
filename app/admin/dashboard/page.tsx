"use client"

import React, { useEffect, Suspense } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { SharedDashboard } from "@/components/dashboard"
import { Loader2 } from "lucide-react"

export default function AdminDashboardPage() {
  
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
        {/* O Suspense aqui garante que o SharedDashboard não quebre o build se usar hooks de URL */}
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="animate-spin text-primary w-10 h-10" />
          </div>
        }>
          <SharedDashboard userType="admin" />
        </Suspense>
      </main>
    </div>
  )
}