import { api } from "../index";
import { EvolucaoMensalResponse, ProgressoMetaResponse, ResumoFinanceiroResponse, ValorTotalResponse } from "@/src/interfaces/estatistica/response";


export const EstatisticaService = {

    listarProgressoDaMeta: async(): Promise<ProgressoMetaResponse[]> =>{
        try{
            const response = await api.get<ProgressoMetaResponse[]>('/estatistica/progressoDaMeta');
            return response.data;
        }catch (error){
            throw error;        
        }
    },

    listarValorTotalCategoria: async(): Promise<ValorTotalResponse> =>{
        try{
            const response = await api.get<ValorTotalResponse>('/estatistica/listarValorTotal/categoria');
            return response.data;
        }catch(error){
            throw error;

        }
    },

    listarLucro: async(): Promise<ResumoFinanceiroResponse> =>{
        try{
            const response = await api.get<ResumoFinanceiroResponse>('/estatistica/listarLucro');
            return response.data;
        } catch(error){
            throw error;
        }
    },

    listarGastosPorCategoria: async(): Promise<ValorTotalResponse[]> =>{
        try{
            const response = await api.get<ValorTotalResponse[]>('/estatistica/analisePorCategoria');
            return response.data;
        }catch(error){
            throw error;
        }
    },

    listarAnaliseEvolucaoMensal: async(): Promise<EvolucaoMensalResponse[]> =>{
        try{
            const response = await api.get<EvolucaoMensalResponse[]>('/estatistica/analiseEvolucaoMensal');
            return response.data;
        }catch(error){
            throw error;
        }
    }

};