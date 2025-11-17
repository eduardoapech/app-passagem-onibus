import { Status } from "@/src/enums/status";
import { TransacaoBasicaResponse } from "../transacao/response";


export interface MetaResponse{
    id:number,
    nome:string,
    valorAlvo:number,
    status:Status,
    data:string,
    usuarioId:number,
    transacoes: TransacaoBasicaResponse[];
}

export interface MetaBasicaResponse{
    id:number,
    nome:string,
    valorAlvo:number,
    data:string,
}

