import { api } from './api';

export const authCollaboratorService = {
    register(name: string, email: string, password: string, cpf: string) {
        return api.post('/collaborators/register', { name, email, password, elderCpf: cpf });
    },

    getMyCollaborators() {
        return api.get('/collaborators/my-collaborators');
    },

    getAllCollaborators() {
        return api.get('/collaborators/get-all-collaborators');
    },

    deleteCollaborator(id: string) {
        return api.delete(`/collaborators/delete-colaborador/${id}`);
    }
};