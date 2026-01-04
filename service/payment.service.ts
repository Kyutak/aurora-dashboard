import { api } from './api';

export const paymentService = {
  createCheckout() {
    return api.post('/payment/checkout');
  }
};
