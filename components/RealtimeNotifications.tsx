"use client"

import { useEffect, useRef } from "react"
import { useAuroraSync } from "@/hooks/use-sync"
import { useToast } from "@/hooks/use-toast"

export function RealtimeNotifications() {
  const { atividades } = useAuroraSync()
  const { toast } = useToast()
  const prevCountRef = useRef(0)
  
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Evita disparar no primeiro carregamento
    if (prevCountRef.current === 0 && atividades.length > 0) {
      prevCountRef.current = atividades.length
      return
    }

    if (atividades.length > prevCountRef.current) {
      const novaAtividade = atividades[0] 

      // A) Notificação Visual dentro do site (Toast)
      toast({
        title: novaAtividade.usuario,
        description: novaAtividade.acao,
      })

      // B) NOTIFICAÇÃO NATIVA DO SISTEMA (Aparece por cima de tudo)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`Aurora: ${novaAtividade.usuario}`, {
          body: novaAtividade.acao,
          icon: "/icon-logo.png", 
          silent: false, 
        });
      }
    }

    prevCountRef.current = atividades.length
  }, [atividades, toast])

  return null
}