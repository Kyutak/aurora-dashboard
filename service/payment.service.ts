import { api } from './api';

export type PlanType = 'ELDER_EXTRA' | 'COLLABORATOR';

interface CheckoutResponse{
  checkoutUrl: string;
}

export const paymentService = {
  async createCheckoutSession(type:PlanType): Promise<CheckoutResponse>{
    try{
      const { data } = await api.post<CheckoutResponse>('/payment/checkout',{
        type
      });
      return data;
    }catch(error){
      console.error("Erro ao criar checkout:", error);
      throw error;
    }
  }
}