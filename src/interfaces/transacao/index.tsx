import { Status } from "@/src/enums/status";
import { Usuario } from "../usuario";
import { Meta } from "../meta";
import { Categoria } from "../categoria";

export interface Transacao {
  id: number;
  valor: number;
  descricao: string;
  data: string;
  status: Status;
  usuario: Usuario;
  categoria: Categoria;
  metas: Meta[];
}