import { Passagem } from '../passagem';

export interface Pagamento {
  id: string;
  passagemId: string;
  valorTotal: number;
  metodoPagamento: MetodoPagamento;
  status: StatusPagamento;
  dataPagamento: Date;
  dadosPagamento: DadosPagamento;
}

export enum MetodoPagamento {
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  PIX = 'PIX',
  BOLETO = 'BOLETO'
}

export enum StatusPagamento {
  PENDENTE = 'PENDENTE',
  PROCESSANDO = 'PROCESSANDO',
  APROVADO = 'APROVADO',
  RECUSADO = 'RECUSADO',
  CANCELADO = 'CANCELADO'
}

export interface DadosPagamento {
  numeroCartao?: string;
  nomeTitular?: string;
  validade?: string;
  cvv?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  pixChave?: string;
}

export interface Passageiro {
  nome: string;
  cpf: string;
  dataNascimento: Date;
  telefone: string;
  email: string;
  tipo: 'ADULTO' | 'CRIANCA' | 'ESTUDANTE' | 'IDOSO';
  poltrona?: number;
}

export interface Reserva {
  id: string | number;
  passagem?: Passagem;
  passageiros: Passageiro[];
  poltronas: number[];
  valorTotal: number;
  status: 'RESERVADO' | 'CONFIRMADO' | 'CANCELADO';
  dataReserva: Date | string;
  codigoReserva?: string;
  pagamento?: Pagamento;
}

