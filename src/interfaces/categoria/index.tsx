import { CategoriaTipo } from "@/src/enums/categoriaTipo";
import { Status } from "@/src/enums/status";
import { Usuario } from "../usuario";

export interface Categoria{
    id:number,
    nome:string,
    tipo:CategoriaTipo,
    status:Status,
    usuario:Usuario,
}