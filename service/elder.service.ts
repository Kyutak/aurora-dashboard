import { api } from './api';

export const elderService = {
  create(data: any) {
    return api.post('/elders', data);
  },

  ALLeldelist() {
    return api.get('/auth/all-elders');
  }
};
