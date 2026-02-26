"use client"

import { useEffect, useState, useRef } from "react"
import { socket } from "@/lib/socket" 
import { getSessionUser } from "@/lib/auth-state"
import { sharedState } from "@/lib/shared-state"
import { AlertTriangle, PhoneCall, VolumeX, Volume2 } from "lucide-react"
import { Button } from "./ui/button"

export function EmergencyListener() {
  const [emergencyData, setEmergencyData] = useState<any>(null)
  const [isMuted, setIsMuted] = useState(true) 
  const audioRef = useRef<HTMLAudioElement | null>(null)

 useEffect(() => {

    if (!audioRef.current) {
      audioRef.current = new Audio("/emergency-alarm.mp3");
      audioRef.current.loop = true;
      audioRef.current.preload = "auto"; 
    }

   const user = getSessionUser()
  if (!user) return
    const myId = (user as any).id || (user as any)._id;
      if (!socket.connected) socket.connect();
    socket.emit("join_room", myId);

      const handleEmergency = (data: any) => {
      setEmergencyData(data); 
      
      if (audioRef.current) {
            audioRef.current.currentTime = 0;
            
        audioRef.current.play()
        .then(() => setIsMuted(false))
        .catch((err) => {
                console.error("Autoplay bloqueado ou arquivo não encontrado:", err);
                setIsMuted(true);
              });
          }

    sharedState.addEmergencia({
    id: data.id || Date.now().toString(),
    idosoId: data.userId || data.idosoId,
    elderName: data.elderName || "Idoso",
    at: new Date().toISOString(), 
    resolved: false 
    } as any); 
    };

    socket.on("emergency_received", handleEmergency);
      return () => { 
          socket.off("emergency_received", handleEmergency); 
          audioRef.current?.pause();
        };
    }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsMuted(false))
        .catch(err => console.error("Erro ao carregar fonte de áudio:", err));
    }
  };

  if (!emergencyData) return null

  return (
    <div className="fixed inset-0 z-[999999] bg-red-600/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white">
      {/* Botão flutuante para destravar som se estiver mudo */}
      {isMuted && (
        <Button 
          onClick={toggleAudio}
          className="absolute top-10 right-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-4 animate-bounce"
        >
          <VolumeX className="w-6 h-6 mr-2" /> Ativar Som do Alarme
        </Button>
      )}

      <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-[0_0_100px_rgba(220,38,38,0.5)] max-w-lg w-full text-center">
        <div className="relative mb-6">
          <AlertTriangle className="w-24 h-24 text-red-600 mx-auto animate-pulse" />
        </div>
        
        <h1 className="text-4xl font-black text-red-600 mb-2">ALERTA DE SOS</h1>
        <p className="text-xl text-gray-600 mb-8">
          <span className="font-bold text-gray-900">{emergencyData.elderName || "O idoso"}</span> precisa de ajuda!
        </p>
        
        <div className="space-y-3">
          <Button 
            className="w-full h-20 text-2xl bg-red-600 hover:bg-red-700 rounded-2xl font-bold gap-3"
            onClick={() => window.location.href = `tel:${emergencyData.emergencyContact || '192'}`}
          >
            <PhoneCall className="w-8 h-8" /> Ligar Agora
          </Button>

          <Button 
            variant="ghost" 
            className="w-full h-14 text-gray-400"
            onClick={() => {
              audioRef.current?.pause();
              setEmergencyData(null);
            }}
          >
            Dispensar Alerta
          </Button>
        </div>
      </div>
    </div>
  )
}