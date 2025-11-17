export interface Passagem {
  id: string;
  companhia: Companhia;
  origem: Cidade;
  destino: Cidade;
  dataPartida: Date;
  dataChegada: Date;
  horarioPartida: string;
  horarioChegada: string;
  duracao: string;
  preco: number;
  assentosDisponiveis: number;
  tipoAssento: TipoAssento;
  tipoOnibus: TipoOnibus;
  poltronas: Poltrona[];
  servicos: Servico[];
}

export interface Companhia {
  id: string;
  nome: string;
  logo: string;
  avaliacao: number;
  totalAvaliacoes: number;
  urlSite?: string; // URL do site oficial da companhia para compra de passagens
}

export interface Cidade {
  id: string;
  nome: string;
  estado: string;
  sigla: string;
  terminal?: string;
  latitude?: number;
  longitude?: number;
  distanciaKm?: number;
  tempoViagem?: string;
}

export enum TipoAssento {
  CONVENCIONAL = 'CONVENCIONAL',
  SEMI_LEITO = 'SEMI_LEITO',
  LEITO = 'LEITO',
  EXECUTIVO = 'EXECUTIVO',
  SUITE = 'SUITE'
}

export enum TipoOnibus {
  CONVENCIONAL = 'CONVENCIONAL',
  EXECUTIVO = 'EXECUTIVO',
  LEITO = 'LEITO',
  DOUBLE_DECK = 'DOUBLE_DECK'
}

export interface Poltrona {
  numero: number;
  disponivel: boolean;
  tipo: TipoAssento;
  janela: boolean;
  preferencial: boolean;
  precoAdicional?: number;
}

export interface Servico {
  id: string;
  nome: string;
  icone: string;
  disponivel: boolean;
}

export interface BuscaPassagem {
  origem: Cidade | null;
  destino: Cidade | null;
  dataIda: Date | null;
  dataVolta: Date | null;
  tipoViagem: 'IDA' | 'IDA_VOLTA';
  passageiros: number;
  tipoAssento?: TipoAssento;
}

export interface PassagemResumo {
  id: string;
  companhia: string;
  companhiaId?: string | number;
  companhiaUrlSite?: string; // URL do site da companhia para compra direta
  horarioPartida: string;
  horarioChegada: string;
  duracao: string;
  preco: number;
  tipoAssento: TipoAssento;
  assentosDisponiveis: number;
}

