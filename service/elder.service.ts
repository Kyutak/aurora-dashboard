import { api } from './api';

export const elderService = {
  create(data: any) {
    return api.post('/elders', data);
  },

  list() {
    return api.get('/elders');
  }
};
