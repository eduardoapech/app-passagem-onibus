import { UsuarioLoginResponse } from "../usuario/response";

export interface LoginResponse {
  usuario: UsuarioLoginResponse,
  token: string,

}