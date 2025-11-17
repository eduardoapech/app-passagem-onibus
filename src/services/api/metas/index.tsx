import { MetaRequest, MetaUpdateRequest } from "@/src/interfaces/meta/request";
import { api } from "../index";
import { MetaResponse } from "@/src/interfaces/meta/response";


export const MetaService = {

    listarMetas: async(): Promise<MetaResponse[]> =>{
        try{

            const response = await api.get<MetaResponse[]>('/meta/listar');
            return response.data;

        }catch(error){
            throw error;
        }
    },

    listarPorMetaId: async(metaId:number): Promise<MetaResponse> =>{
        try{
            const response = await api.get<MetaResponse>(`/usuario/editarPorUsuarioId/${metaId}`);
            return response.data;
        }catch(error){
            throw error;
        }
    },

    criarMeta: async(nome:string,valorAlvo:number,data:string): Promise<MetaRequest>=>{
        try{
            const dados: MetaRequest = {nome,valorAlvo,data};
            const response = await api.post<MetaRequest>('/meta/criar',dados);
            return response.data;
        }catch(error){
            throw error;
        }
    },

    editarPorMetaId: async(metaId:number,nome:string, valorAlvo:number,data:string): Promise<MetaUpdateRequest> =>{
        try{
            const dados: MetaUpdateRequest = { nome, valorAlvo, data };
            const response = await api.put<MetaUpdateRequest>(`/meta/editarPorMetaId/${metaId}`, dados);
            return response.data;
        }catch(error){
            throw error;
        }
    },

    deletarMeta: async(metaId:number): Promise<void> =>{
        try{
            await api.delete(`/meta/deletarPorMetaId/${metaId}`);
        } catch(error){
            throw error;
        }
    }

};


