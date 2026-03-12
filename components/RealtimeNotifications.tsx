"use client"

import { useEffect, useRef } from "react"
import { useAuroraSync } from "@/hooks/use-sync"
import { useToast } from "@/hooks/use-toast"

export function RealtimeNotifications() {
  const { atividades } = useAuroraSync()
  const { toast } = useToast()
  
  // Em vez de contar o tamanho, vamos rastrear o ID (ou data) da atividade mais nova
  const lastActivityIdRef = useRef<string | null>(null)
  const isInitialMount = useRef(true)
  
  // Pede permissão nativa logo de cara
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Se a lista estiver vazia, não faz nada
    if (!atividades || atividades.length === 0) return;

    // Pega a atividade que está no topo (a mais recente enviada pelo Back-end)
    const novaAtividade = atividades[0];
    
    // Cria um identificador único para ela (usa ID se tiver, senão usa o timestamp)
    const currentActivityId = novaAtividade.id || novaAtividade._id || String(novaAtividade.timestamp);

    // Se for o primeiro carregamento da tela, a gente só "grava" a última atividade na memória e fica quieto
    if (isInitialMount.current) {
      lastActivityIdRef.current = currentActivityId;
      isInitialMount.current = false;
      return;
    }

    // SE O ID DO TOPO FOR DIFERENTE DO QUE CONHECEMOS... TEMOS ATIVIDADE NOVA!
    if (currentActivityId !== lastActivityIdRef.current) {
      
      // A) Notificação Visual dentro do site (Toast)
      toast({
        title: `Nova Ação: ${novaAtividade.usuario || "Sistema"}`,
        description: novaAtividade.acao,
        duration: 5000,
        className: novaAtividade.tipo === 'idoso' 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
          : 'bg-blue-50 border-blue-200 text-blue-900',
      })

      // B) NOTIFICAÇÃO NATIVA DO SISTEMA (Aparece por cima do YouTube/outras abas)
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`Aurora: ${novaAtividade.usuario}`, {
          body: novaAtividade.acao,
          icon: "/icon-light-32x32.png", // Usando o ícone que já está no seu metadata!
          silent: false, 
        });
      }

      // Atualiza a nossa memória com o novo ID para não apitar repetido
      lastActivityIdRef.current = currentActivityId;
    }

  }, [atividades, toast])

  return null
}