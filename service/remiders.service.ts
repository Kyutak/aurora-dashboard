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
        const response = await api.delete(`/reminders/delete-reminder/${reminderId}`);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao deletar:", error.response?.data);
        throw error;
    }
};

export const updateReminder = async (id: string, data: Partial<ReminderData>) => {
    try {
        if (!id) throw new Error("ID do lembrete é obrigatório para atualização");
        const response = await api.put(`/reminders/update-reminder/${id}`, data);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao atualizar:", error.response?.data);
        throw error;
    }
};