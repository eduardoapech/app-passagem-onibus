import { Status } from "@/src/enums/status";
import { MetaBasicaResponse } from "../meta/response";
import { CategoriaTipo } from "@/src/enums/categoriaTipo";
import { CategoriaBasicaResponse } from "../categoria/response";

export interface TransacaoResponse{
    id: number,
    valor: number,
    descricao: string,
    data: string,
    status: Status,
    usuarioId: number,
    categoria:CategoriaBasicaResponse,
    metas: MetaBasicaResponse[],
}

export interface TransacaoBasicaResponse{
    id: number,
    valor: number,
    descricao: string,
    data: string,
    categoriaId:number,
    categoriaNome:string,
    categoriaTipo:CategoriaTipo,
}

export interface TransacaoPorCategoriaResponse{
    id: number,
    valor: number,
    descricao: string,
    data: string,
    status:Status,
    usuarioId:number,
}