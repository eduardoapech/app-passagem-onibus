import { Status } from "@/src/enums/status";
import { TransacaoBasicaResponse } from "../transacao/response";
import { MetaBasicaResponse } from "../meta/response";

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  dataCriacao: string;
  status: Status;
  transacoes: TransacaoBasicaResponse[];
  metas: MetaBasicaResponse[];
}

export interface UsuarioLoginResponse {
  id: number;
  nome: string;
  email: string;
  dataCriacao: string;
  status: Status;
}