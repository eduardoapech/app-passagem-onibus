import { CategoriaTipo } from "@/src/enums/categoriaTipo";
import { Status } from "@/src/enums/status";
import { TransacaoPorCategoriaResponse } from "../transacao/response";

export interface CategoriaResponse{
    id:number,
    nome:string,
    tipo:CategoriaTipo,
    status:Status,
    usuarioId:number,
    transacoes: TransacaoPorCategoriaResponse[];

}

export interface CategoriaBasicaResponse{
    id:number,
    nome:string,
    tipo:CategoriaTipo,
    status:Status,
    usuarioId:number,
}