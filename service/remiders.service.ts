import { api } from './api';

export interface ReminderData {
    id?: string;
    title: string;
    time: string;
    type: 'Medicamento' | 'Refeição' | 'Rotina' | 'Evento';
    daysOfWeek: number[];
    isCompleted?: boolean;
    elderId: string;
}

// 1. CRIAR: Mude de 'crete_remiders' para 'create-reminder'
export const createReminder = async (data: ReminderData) => {
    try {
        const response = await api.post('/reminders/crete_remiders', data); 
        return response.data;
    } catch (error: any) {
        console.error("Erro na API de criação:", error.response?.data);
        throw error;
    }
};

// 2. BUSCAR: Mude de 'getDaliy-reminders' para 'getDaily-reminders'
export const getDailyReminders = async (elderId: string) => {
    if (!elderId) return [];
    try {
        const response = await api.get('/reminders/getDaily-reminders', {
            params: { elderId }
        });
        return response.data;
    } catch (error: any) {
        // Fallback para a rota do swagger (com erro de digitação)
        const response = await api.get('/reminders/getDaliy-reminders', {
            params: { elderId }
        });
        return response.data;
    }
};

// 3. CONCLUIR (PATCH): Rota no Swagger: PATCH /reminders/complete-reminder/{id}
export const markReminderAsDone = async (reminderId: string) => {
    try {
        // Log para debug: veja se o ID não está vindo 'undefined' aqui
        console.log("Tentando concluir lembrete com ID:", reminderId);
        
        if (!reminderId) throw new Error("ID do lembrete ausente");

        const response = await api.patch(`/reminders/complete-reminder/${reminderId}`);
        return response.data;
    } catch (error: any) {
        // Se error.response for undefined, é erro de rede/CORS
        console.error("Erro ao concluir lembrete:", error.response?.data || "Erro de Conexão/CORS");
        throw error;
    }
};

// 4. DELETAR: Rota no Swagger: DELETE /reminders/delete-reminder/{id}
export const deleteReminder = async (reminderId: string) => {
    try {
        // Certifique-se que o reminderId não está indo nulo ou undefined
        if (!reminderId) throw new Error("ID do lembrete é obrigatório");
        
        const response = await api.delete(`/reminders/delete-reminder/${reminderId}`);
        return response.data;
    } catch (error: any) {
        // Se após ajustar o CORS ainda der erro, verifique se o ID existe no banco
        console.error("Erro ao deletar:", error.response?.data);
        throw error;
    }
};

// 5. ATUALIZAR (PUT): Rota no Swagger: PUT /reminders/update-reminder/{id}
export const updateReminder = async (id: string, data: Partial<ReminderData>) => {
    try {
        const response = await api.put(`/reminders/update-reminder/${id}`, data);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao atualizar:", error.response?.data);
        throw error;
    }
};