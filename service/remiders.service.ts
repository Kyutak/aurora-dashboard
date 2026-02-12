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

export const createReminder = async (data: ReminderData) => {
    try {
        // Ajustado para bater com o typo do backend: 'crete_remiders'
        const response = await api.post('/reminders/crete_remiders', data); 
        return response.data;
    } catch (error: any) {
        console.error("Erro na API de criação:", error.response?.data);
        throw error;
    }
};

export const getDailyReminders = async (elderId: string) => {
    if (!elderId) return [];
    try {
        // Ajustado para bater com o typo do backend: 'getDaliy-reminders'
        const response = await api.get('/reminders/getDaliy-reminders', {
            params: { elderId }
        });
        return response.data;
    } catch (error: any) {
        console.error("Erro ao buscar lembretes diários:", error.response?.data);
        throw error;
    }
};

export const markReminderAsDone = async (reminderId: string) => {
    try {
        if (!reminderId) throw new Error("ID do lembrete ausente");
        // Rota: /reminders/complete-reminder/{id}
        const response = await api.patch(`/reminders/complete-reminder/${reminderId}`);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao concluir lembrete:", error.response?.data);
        throw error;
    }
};

export const deleteReminder = async (reminderId: string) => {
    try {
        if (!reminderId) throw new Error("ID do lembrete é obrigatório");
        // Rota: /reminders/delete-reminder/{id}
        const response = await api.delete(`/reminders/delete-reminder/${reminderId}`);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao deletar:", error.response?.data);
        throw error;
    }
};

export const updateReminder = async (id: string, data: Partial<ReminderData>) => {
    try {
        // Rota: /reminders/update-reminder/{id}
        const response = await api.put(`/reminders/update-reminder/${id}`, data);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao atualizar:", error.response?.data);
        throw error;
    }
};