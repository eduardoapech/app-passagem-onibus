import { Status } from "@/src/enums/status";

export interface EvolucaoMensalResponse{
    periodo:string,
    totalDespesas:number,
    totalReceitas:number,
    saldo:number,
}

export interface ProgressoMetaResponse{
    metaId:number,
    metaNome:string,
    valorAlvo:number,
    valorAtual:number,
    percentualConcluido:number,
    status:Status,
}

export interface ValorTotalResponse{
    categoriaId:number,
    categoriaNome:string,
    valorTotal:number,
    usuarioId:number,
}

export interface ResumoFinanceiroResponse{
    receitas:number,
    despesas:number,
    lucro:number,
}

