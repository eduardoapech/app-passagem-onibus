import { Usuario, Endereco } from '../usuario';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
  refreshToken: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf: string;
  dataNascimento: Date;
  endereco?: Endereco;
}

export interface RegisterResponse {
  token: string;
  usuario: Usuario;
  refreshToken: string;
}

