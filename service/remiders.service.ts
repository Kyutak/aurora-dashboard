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

/**
 * Cria um novo lembrete para o idoso
 */
export const createReminder = async (data: ReminderData) => {
    try {
        const response = await api.post('/create_reminders', data);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao criar lembrete:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Busca os 3 lembretes do dia para a Dash
 * @param elderId ID do idoso selecionado
 */
export const getDailyReminders = async (elderId: string) => {
    try {
        const response = await api.get(`/getDaily-reminders`, {
            params: { elderId }
        });
        return response.data;
    } catch (error: any) {
        console.error("Erro ao buscar lembretes:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Marca um lembrete como concluído (Gatilho para a reciclagem)
 * @param reminderId ID do lembrete clicado
 */
export const markReminderAsDone = async (reminderId: string) => {
    try {
        const response = await api.patch(`/complete-reminder/${reminderId}`);
        return response.data;
    } catch (error: any) {
        console.error("Erro ao concluir lembrete:", error.response?.data || error.message);
        throw error;
    }
};