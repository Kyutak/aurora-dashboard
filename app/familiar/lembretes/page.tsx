"use client"

import { useEffect } from "react"
import { FamiliarSidebar } from "@/components/familiar-sidebar"
import { SharedLembretes } from "@/components/shared-lembretes"

export default function LembretesPage() {
  useEffect(() => {
    window.scrollTo({
      top: 49,
      behavior: "auto",
    })
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <FamiliarSidebar />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
        <SharedLembretes userType="familiar" />
      </main>
    </div>
  )
}
