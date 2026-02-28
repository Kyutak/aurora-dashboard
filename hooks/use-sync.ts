"use client"
import { useState, useEffect } from "react"
import { sharedState } from "@/lib/shared-state"

export function useAuroraSync() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const unsubscribe = sharedState.subscribe(() => {
      setTick(t => t + 1) 
    })
    return () => {unsubscribe()}
  }, [])
  

  return {
    emergencias: sharedState.getEmergencias(),
    lembretes: sharedState.getLembretes(),
    preferencias: sharedState.getPreferencias(),
    idosos: sharedState.getIdosos(),        
    colaboradores: sharedState.getColaboradores(), 
    atividades: sharedState.getAtividades(),
  }
}