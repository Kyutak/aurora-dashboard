import { api } from './api';

export const authCollaboratorService ={
    register(name:string,email:string,password:string, cpf:string){
        console.log("Dados sendo enviados:", { name, email, password, elderCpf: cpf });
        return api.post('/collaborators/register',{name,email,password,elderCpf:cpf});
    },
    getMyCollaborators(){
        return api.get('/collaborators/my-collaborators');
    }
}
