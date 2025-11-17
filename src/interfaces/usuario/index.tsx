import { Passagem } from '../passagem';
import { Passageiro } from '../pagamento';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: Date;
  foto?: string;
  endereco?: Endereco;
  preferencias?: PreferenciasUsuario;
}

export interface Endereco {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface PreferenciasUsuario {
  tipoAssentoPreferido?: string;
  companhiaPreferida?: string;
  receberPromocoes: boolean;
  notificacoes: boolean;
}

export interface MinhaViagem {
  id: string;
  passagem: Passagem;
  passageiros: Passageiro[];
  status: 'CONFIRMADA' | 'CANCELADA' | 'UTILIZADA';
  dataViagem: Date;
  codigoReserva: string;
  tipoViagem?: 'IDA' | 'VOLTA';
  qrCode?: string;
}
