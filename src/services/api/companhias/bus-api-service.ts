import axios from 'axios';

/**
 * Interface para configuração de API de ônibus
 * Esta interface permite fácil integração com diferentes APIs quando disponíveis
 */
export interface BusApiConfig {
  baseUrl: string;
  apiKey?: string;
  enabled: boolean;
}

/**
 * Interface para resposta de API de companhias de ônibus
 */
export interface BusCompanyApiResponse {
  id: string;
  nome: string;
  logo?: string;
  avaliacao?: number;
  totalAvaliacoes?: number;
  urlSite?: string;
}

/**
 * Interface para resposta de API de passagens
 */
export interface BusTicketApiResponse {
  id: string;
  companhiaId: string;
  companhia: string;
  origem: string;
  destino: string;
  dataPartida: string;
  horarioPartida: string;
  horarioChegada: string;
  duracao: string;
  preco: number;
  assentosDisponiveis: number;
  tipoAssento: string;
}

/**
 * Serviço para integração com APIs de ônibus
 * Atualmente desabilitado - pode ser habilitado quando houver API disponível
 */
export class BusApiService {
  private config: BusApiConfig;

  constructor(config: BusApiConfig) {
    this.config = config;
  }

  /**
   * Lista companhias de ônibus disponíveis
   * @returns Lista de companhias
   */
  async listarCompanhias(): Promise<BusCompanyApiResponse[]> {
    if (!this.config.enabled) {
      throw new Error('API de ônibus não está habilitada. Use dados mock por enquanto.');
    }

    try {
      const response = await axios.get<BusCompanyApiResponse[]>(
        `${this.config.baseUrl}/companies`,
        {
          headers: this.config.apiKey
            ? { Authorization: `Bearer ${this.config.apiKey}` }
            : {},
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar companhias da API:', error);
      throw new Error('Não foi possível buscar companhias da API');
    }
  }

  /**
   * Busca passagens disponíveis
   * @param origem Cidade de origem
   * @param destino Cidade de destino
   * @param data Data da viagem
   * @returns Lista de passagens disponíveis
   */
  async buscarPassagens(
    origem: string,
    destino: string,
    data: Date
  ): Promise<BusTicketApiResponse[]> {
    if (!this.config.enabled) {
      throw new Error('API de ônibus não está habilitada. Use dados mock por enquanto.');
    }

    try {
      const response = await axios.get<BusTicketApiResponse[]>(
        `${this.config.baseUrl}/tickets/search`,
        {
          params: {
            origem,
            destino,
            data: data.toISOString().split('T')[0],
          },
          headers: this.config.apiKey
            ? { Authorization: `Bearer ${this.config.apiKey}` }
            : {},
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar passagens da API:', error);
      throw new Error('Não foi possível buscar passagens da API');
    }
  }
}

/**
 * Configuração padrão (desabilitada)
 * Para habilitar, configure com uma API real:
 * 
 * Exemplo de configuração para futuras APIs:
 * 
 * // Voyenbus TOL API (quando disponível)
 * export const voyenbusConfig: BusApiConfig = {
 *   baseUrl: 'https://api.voyenbus.com/v1',
 *   apiKey: process.env.EXPO_PUBLIC_VOYENBUS_API_KEY,
 *   enabled: true,
 * };
 * 
 * // Buser API (quando disponível)
 * export const buserConfig: BusApiConfig = {
 *   baseUrl: 'https://api.buser.com.br/v1',
 *   apiKey: process.env.EXPO_PUBLIC_BUSER_API_KEY,
 *   enabled: true,
 * };
 */
export const defaultBusApiConfig: BusApiConfig = {
  baseUrl: '',
  enabled: false,
};

/**
 * Instância do serviço de API de ônibus
 * Por padrão desabilitada - pode ser habilitada quando houver API disponível
 */
export const busApiService = new BusApiService(defaultBusApiConfig);

