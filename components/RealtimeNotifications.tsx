"use client"

import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { elderService } from "@/service/elder.service" 

export function RealtimeNotifications() {
  const { toast } = useToast()
  const lastActivityIdRef = useRef<string | null>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const verificarNovidades = async () => {
      try {
        const logs = await elderService.getLogs();
        if (!logs || logs.length === 0) return;

        const novaAtividade = logs[0];
        const currentActivityId = novaAtividade.id || novaAtividade._id || String(novaAtividade.timestamp);

        if (isInitialMount.current) {
          lastActivityIdRef.current = currentActivityId;
          isInitialMount.current = false;
          return;
        }

        if (currentActivityId !== lastActivityIdRef.current) {
          // 1. Toca um "Beep" sonoro para chamar a atenção da clínica!
          try {
            const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
            audio.play();
          } catch (e) {
             // Ignora se o navegador bloquear autoplay de áudio
          }

          // 2. Notificação visual dentro do site
          toast({
            title: `Nova Ação: ${novaAtividade.usuario}`,
            description: novaAtividade.acao,
          })

          // B) NOTIFICAÇÃO NATIVA DO SISTEMA (Aparece fora do navegador)
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              const notification = new Notification(`Aurora: Novo Alerta`, {
                body: `${novaAtividade.usuario}: ${novaAtividade.acao}`,
                requireInteraction: true, 
              });
              notification.onclick = function() {
                window.focus();
                this.close();
              };
            } catch (err) {
              console.error("Erro ao desenhar a notificação nativa:", err);
            }
          }

          lastActivityIdRef.current = currentActivityId;
        }
      } catch (error) {
        console.error("Erro no polling:", error);
      }
    };

    // Roda a cada 5 segundos
    const intervalId = setInterval(verificarNovidades, 5000);

    // O PULO DO GATO: Se o usuário voltar pra aba, força a verificação na mesma hora!
    const aoVoltarParaAba = () => {
      if (document.visibilityState === "visible") {
        verificarNovidades();
      }
    };
    document.addEventListener("visibilitychange", aoVoltarParaAba);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", aoVoltarParaAba);
    };
    
  }, [toast]);

  return null;
}