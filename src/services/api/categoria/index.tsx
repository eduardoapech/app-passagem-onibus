import { CategoriaTipo } from "@/src/enums/categoriaTipo";
import { CategoriaRequest } from "@/src/interfaces/categoria/request";
import { api } from "../index";
import { CategoriaBasicaResponse, CategoriaResponse } from "@/src/interfaces/categoria/response";


export const CategoriaService = {

    editarPorCategoriaId: async(categoriaId:number,nome:string,tipo:CategoriaTipo): Promise<CategoriaRequest>=>{
        try{
            const dados: CategoriaRequest = {nome, tipo};
            const response = await api.put<CategoriaRequest>(`/categoria/editarPorCategoriaId/${categoriaId}`,dados);
            return response.data;
        }catch(error){
            throw error;
        }
    },

    criarCategoria: async(nome:string,tipo:CategoriaTipo): Promise<void>=>{
        try{
            const dados: CategoriaRequest = {nome, tipo};
            const response = await api.post<void>('/categoria/criar',dados);
            return response.data;
        }catch(error){
            throw error;
        }
    },

    listarCategoria: async(): Promise<CategoriaResponse[]> =>{
        try{
            const response = await api.get<CategoriaResponse[]>('/categoria/listar');
            return response.data;
        }catch(error){
            throw error;
        }
    },

    listarPorCategoriaId: async(categoriaId:number): Promise<CategoriaResponse> =>{
        try{
            const response = await api.get<CategoriaResponse>(`/categoria/listarPorCategoriaId/${categoriaId}`);
            return response.data;
        }catch(error){
            throw error;
        }

    },

    listarPorCategoriaTipo: async(tipo: CategoriaTipo): Promise<CategoriaResponse[]> => {
        try {
            const response = await api.get<CategoriaResponse[]>(`/categoria/listarPorCategoriaTipo/${tipo}`);
            return response.data;
        } catch(error) {
            throw error;
        }
    },

    listarPorCategoriaNome: async(nome?: string): Promise<CategoriaBasicaResponse[]> => {
        try {
            const params = nome ? { nome } : {};
            const response = await api.get<CategoriaBasicaResponse[]>('/categoria/listarPorCategoriaNome',{params});
            return response.data;
        } catch(error) {
            throw error;
        }
    },

    deletarPorCategoriaId: async(categoriaId: number): Promise<void> => {
        try{
            await api.delete(`/categoria/deletarPorCategoriaId/${categoriaId}`);
        }catch(error){
            throw error;
        }
    }

};