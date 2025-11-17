import { Status } from "@/src/enums/status";
import { Usuario } from "../usuario";

export interface Meta{
    id:number,
    nome:string,
    valorAlvo: number; 
    status: Status;
    data: string;
    usuario: Usuario;
}