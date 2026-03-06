import { api } from './api';
import { Atividade } from '@/lib/shared-state'; 

export const elderService = {
  create(data: any) {
    return api.post('/elders', data); 
  },

  getLogs: async () => {
    const response = await api.get<Atividade[]>('/elders/logs');
    return response.data; 
  },

  getMyElders() {
    return api.get('/elders/my-elders');
  },

  updateMedicalRecord(id: string, data: any){
    return api.patch(`/elders/${id}`, data);
  }
};