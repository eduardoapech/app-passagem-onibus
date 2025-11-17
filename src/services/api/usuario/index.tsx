import { api } from "../index";
import { UsuarioLoginResponse } from "@/src/interfaces/usuario/response";
import { AlterarSenhaRequest, UsuarioRequest } from "@/src/interfaces/usuario/request";

export const UsuarioService ={

    listarUsuarioLogado: async(): Promise<UsuarioLoginResponse> =>{
        try{
            const response = await api.get<UsuarioLoginResponse>('/usuario/listarUsuarioLogado');
            return response.data;

        } catch (error) {
            console.error('Erro ao listar usuário:', error);
            throw error;
        }
    },

    alterarSenhaUsuario: async(senhaAtual:string,novaSenha:string): Promise<void> =>{
        try{
            const senha: AlterarSenhaRequest = { senhaAtual, novaSenha };
            const response = await api.patch<void>('/usuario/alterarSenha', senha);
            return response.data;
        }catch(error){
            throw error;

        }
    },

    editarPorUsuarioId: async(usuarioId:number,nome:string, email:string): Promise<UsuarioRequest> =>{
        try{
            const dados: UsuarioRequest = { nome, email };
            const response = await api.put<UsuarioRequest>(`/usuario/editarPorUsuarioId/${usuarioId}`, dados);
            return response.data;
        }catch(error){
            throw error;
        }
    }

};