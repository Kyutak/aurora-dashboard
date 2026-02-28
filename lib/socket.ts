import { io } from 'socket.io-client'
// ADICIONE ESTA LINHA ABAIXO:
import { sharedState } from '@/lib/shared-state'

const SOCKET_URL = 'https://aurora-api-095s.onrender.com';

export const socket = io(SOCKET_URL, {
    autoConnect: true, 
    withCredentials: true,
    transports: ['websocket', 'polling'], 
    reconnection: true,
    reconnectionAttempts: 5
})

socket.on("nova_atividade", (dados: any) => {
  sharedState.addAtividade({
    id: dados.id || Date.now().toString(),
    usuario: dados.userName || "Usuário",
    acao: dados.action || "Realizou uma ação",
    tipo: dados.userType || "familiar", 
    timestamp: new Date(),
    vinculoId: dados.vinculoId
  });
});