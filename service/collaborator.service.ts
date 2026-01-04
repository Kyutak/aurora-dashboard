import { api } from './api';

export const authCollaboratorService ={
    register(name:string,email:string,password:string, cpf:string){ {
        return api.post('/collaborators/register',{name,email,password,cpf});
    }
}
}
