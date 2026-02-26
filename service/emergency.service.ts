// services/emergencyService.ts
import { api } from './api'

export interface Emergency {
  id: string;
  timestamp: string | Date;
  resolvido: boolean;
  idosoId: string;
  elderName?: string;
}

export const emergencyService = {
    async getEmergencies(): Promise<Emergency[]> {
        const { data } = await api.get<Emergency[]>('/emergencies');
        return data;
    },

    async triggerSOS() {
        const { data } = await api.post('/emergencies/trigger');
        return data;
    },

    async resolveEmergency(id: string, observation?: string) {
    if (!id) throw new Error("ID da emergência é obrigatório");
    const res = await api.patch(`/emergencies/${id}/resolve`, { observation });
    return res.data;
  }
};