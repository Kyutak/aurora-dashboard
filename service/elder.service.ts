import { api } from './api';

export const elderService = {
  create(data: any) {
    return api.post('/elders', data); 
  },

  getMyElders() {
    return api.get('/elders/my-elders');
  }
};