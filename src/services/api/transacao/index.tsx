import { TransacaoRequest, TransacaoUpdateRequest } from "@/src/interfaces/transacao/request";
import { api } from "../index";
import { TransacaoBasicaResponse, TransacaoResponse } from "@/src/interfaces/transacao/response";
import { Status } from "@/src/enums/status";
import { CategoriaBasicaResponse } from "@/src/interfaces/categoria/response";


export const TransacaoService ={

    listarTransacao: async(): Promise<TransacaoResponse[]> =>{
        try{
            const response = await api.get<TransacaoResponse[]>('/transacao/listar');
            return response.data;
        }catch(error){
            throw error;
        }
    },

    listarPorTransacaoId: async(transacaoId:number): Promise<TransacaoResponse> =>{
        try{
            const response = await api.get<TransacaoResponse>(`/transacao/listarPorTransacaoId/${transacaoId}`);
            return response.data;
        }catch(error){
            throw error;
        }

    },

    criarTransacao: async(valor:number,descricao:string,data:string,categoriaId:number,metaId:number[]): Promise<void>=>{
        try{
            const dados: TransacaoRequest = {valor, descricao, data, categoriaId, metaId};
            const response = await api.post<void>('/transacao/criar',dados);
            return response.data;
        }catch(error){
            throw error;
        }
    },

    editarPorTransacaoId: async(transacaoId:number,valor:number,descricao:string,data:string, status: Status,categoriaId:number,metaId:number[]): Promise<TransacaoUpdateRequest>=>{
        try{
            const dados: TransacaoUpdateRequest = {valor, descricao, data, status, categoriaId, metaId};
            const response = await api.put<TransacaoUpdateRequest>(`/transacao/editarPorTransacaoId/${transacaoId}`,dados);
            return response.data;
        }catch(error){
            throw error;
        }
    },

    obterCategoriaPorTransacaoId: async(transacaoId: number): Promise<CategoriaBasicaResponse> => {
        try {
            const response = await api.get<CategoriaBasicaResponse>(`/transacao/${transacaoId}/categoria`);
            return response.data;
        } catch(error) {
            throw error;
        }
    },

    buscarTransacaoPorIdECategoriaId: async(transacaoId: number, categoriaId: number): Promise<TransacaoBasicaResponse> => {
        try {
            const response = await api.get<TransacaoBasicaResponse>(`/transacao/${transacaoId}/categoria/${categoriaId}`);
            return response.data;
        } catch(error) {
            throw error;
        }
    },

    listarTransacoesPorMetaId: async(metaId: number): Promise<TransacaoBasicaResponse[]> => {
        try {
            const response = await api.get<TransacaoBasicaResponse[]>(`/transacao/meta/${metaId}/transacao`);
            return response.data;
        } catch(error) {
            throw error;
        }
    },

    obterTransacaoPorMetaId: async(metaId: number, transacaoId: number): Promise<TransacaoResponse> => {
        try {
            const response = await api.get<TransacaoResponse>(`/transacao/meta/${metaId}/transacao/${transacaoId}`);
            return response.data;
        } catch(error) {
            throw error;
        }
    },

    deletarPorTransacaoId: async(transacaoId: number): Promise<void> => {
        try{
            await api.delete(`/transacao/deletarPorTransacaoId/${transacaoId}`);
        }catch(error){
            throw error;
        }
    }
};