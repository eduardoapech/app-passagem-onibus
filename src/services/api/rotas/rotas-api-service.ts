import axios from 'axios';

/**
 * Interface para configuração de API de rotas
 */
export interface RotaApiConfig {
  provider: 'openrouteservice' | 'google' | 'haversine';
  apiKey?: string;
  enabled: boolean;
}

/**
 * Interface para resposta de cálculo de rota
 */
export interface RotaResponse {
  distanciaKm: number;
  tempoHoras: number;
  tempoMinutos: number;
  tempoTotalMinutos: number;
  distanciaEmRota: boolean; // true se calculado por API de rotas, false se Haversine
  provider: string;
}

/**
 * Serviço para calcular rotas usando APIs externas
 */
export class RotaApiService {
  private config: RotaApiConfig;

  constructor(config: RotaApiConfig) {
    this.config = config;
  }

  /**
   * Calcula velocidade média do ônibus baseado na distância
   * Velocidades realistas para ônibus no Brasil
   * @param distanciaKm Distância em quilômetros
   * @returns Velocidade média em km/h
   */
  private calcularVelocidadeOnibus(distanciaKm: number): number {
    // Velocidades realistas de ônibus no Brasil
    if (distanciaKm < 30) {
      // Rotas muito curtas (urbanas): 35-45 km/h (considera trânsito, semáforos, paradas)
      return 40;
    } else if (distanciaKm < 80) {
      // Rotas curtas (urbanas/mistas): 45-55 km/h
      return 50;
    } else if (distanciaKm < 150) {
      // Rotas médias (rodovias estaduais): 65-75 km/h
      return 70;
    } else if (distanciaKm < 400) {
      // Rotas longas (rodovias federais): 75-85 km/h
      return 80;
    } else {
      // Rotas muito longas (rodovias principais): 80-90 km/h
      return 85;
    }
  }

  /**
   * Calcula tempo de paradas intermediárias
   * Ônibus fazem paradas para embarque/desembarque
   * @param distanciaKm Distância em quilômetros
   * @returns Tempo adicional em minutos
   */
  private calcularTempoParadas(distanciaKm: number): number {
    // Paradas intermediárias variam conforme distância
    if (distanciaKm < 50) {
      // Rotas curtas: 2-5 minutos (paradas urbanas frequentes)
      return Math.max(Math.floor(distanciaKm / 15) * 2, 2);
    } else if (distanciaKm < 150) {
      // Rotas médias: 8-15 minutos (paradas em terminais e cidades)
      return Math.floor(distanciaKm / 30) * 3;
    } else if (distanciaKm < 400) {
      // Rotas longas: 15-25 minutos (paradas em terminais principais)
      return Math.floor(distanciaKm / 50) * 4;
    } else {
      // Rotas muito longas: 25-40 minutos (paradas em terminais e descanso)
      return Math.min(Math.floor(distanciaKm / 60) * 5, 40);
    }
  }

  /**
   * Calcula rota usando OpenRouteService
   * Requer API key válida (obtenha em https://openrouteservice.org/)
   * Recalcula tempo considerando velocidade de ônibus (80-100 km/h)
   */
  private async calcularRotaOpenRouteService(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): Promise<RotaResponse> {
    // Verificar se tem API key
    if (!this.config.apiKey || this.config.apiKey.trim() === '') {
      throw new Error('OpenRouteService requer API key. Use Haversine ou configure uma API key.');
    }

    try {
      // Usar perfil driving-car (mais preciso e disponível)
      // O perfil driving-hgv pode não estar disponível em todas as instâncias
      // Vamos usar driving-car e ajustar o tempo para ônibus
      const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
      const params: any = {
        start: `${lon1},${lat1}`, // OpenRouteService usa lon,lat
        end: `${lon2},${lat2}`,
        // Usar fastest para obter o tempo mais preciso
        preference: 'fastest', // fastest, recommended, shortest
      };

      // OpenRouteService aceita API key como header Authorization ou como parâmetro api_key
      const headers: any = {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      };
      
      // Tentar usar como header Authorization (formato Bearer ou direto)
      if (this.config.apiKey) {
        // Se a chave já começa com "Bearer", usar como está, senão adicionar
        if (this.config.apiKey.startsWith('Bearer ')) {
          headers['Authorization'] = this.config.apiKey;
        } else {
          // Tentar com Bearer primeiro (formato mais comum)
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        // Também adicionar como parâmetro para compatibilidade
        params.api_key = this.config.apiKey;
      }

      // Fazer requisição direta com driving-car (mais confiável)
      const response = await axios.get(url, { 
        params,
        headers,
        timeout: 10000, // 10 segundos de timeout
      });

      if (!response.data || !response.data.routes || response.data.routes.length === 0) {
        throw new Error('Resposta inválida do OpenRouteService');
      }

      const route = response.data.routes[0];
      const distancia = route.summary.distance / 1000; // Converter metros para km
      
      // A API retorna tempo em segundos - usar como base e ajustar para ônibus
      const tempoApiSegundos = route.summary.duration || 0;
      const tempoApiMinutos = tempoApiSegundos / 60;
      
      // Para ônibus, o tempo é geralmente 10-20% maior que carros devido a:
      // - Velocidades mais baixas em alguns trechos
      // - Paradas intermediárias
      // - Manobras em terminais
      // Mas para rotas longas, a diferença é menor
      
      let fatorAjusteOnibus = 1.15; // 15% a mais por padrão
      if (distancia < 50) {
        // Rotas curtas: mais paradas, mais tempo
        fatorAjusteOnibus = 1.20; // 20% a mais
      } else if (distancia < 150) {
        // Rotas médias
        fatorAjusteOnibus = 1.15; // 15% a mais
      } else {
        // Rotas longas: menos paradas relativas, diferença menor
        fatorAjusteOnibus = 1.10; // 10% a mais
      }
      
      // Calcular tempo ajustado para ônibus
      const tempoAjustadoMinutos = tempoApiMinutos * fatorAjusteOnibus;
      
      // Adicionar tempo de paradas intermediárias (apenas para rotas médias/longas)
      let tempoParadas = 0;
      if (distancia >= 50 && distancia < 150) {
        // 1-2 paradas intermediárias: 3-5 minutos
        tempoParadas = Math.floor(distancia / 50) * 3;
      } else if (distancia >= 150) {
        // Paradas em terminais: 5-10 minutos
        tempoParadas = Math.min(Math.floor(distancia / 100) * 5, 15);
      }
      
      // Tempo total em minutos (arredondado)
      const tempoTotalMinutos = Math.round(tempoAjustadoMinutos + tempoParadas);
      
      const tempoHoras = Math.floor(tempoTotalMinutos / 60);
      const tempoMinutos = tempoTotalMinutos % 60;

      return {
        distanciaKm: Math.round(distancia * 10) / 10,
        tempoHoras,
        tempoMinutos,
        tempoTotalMinutos,
        distanciaEmRota: true,
        provider: 'openrouteservice',
      };
    } catch (error: any) {
      // Se for erro 401 (não autorizado), não logar como erro crítico
      if (error.response?.status === 401) {
        throw new Error('API key do OpenRouteService inválida ou não configurada');
      }
      // Outros erros
      throw error;
    }
  }

  /**
   * Calcula rota usando Google Maps Distance Matrix API
   * Recalcula tempo considerando velocidade de ônibus (80-100 km/h)
   */
  private async calcularRotaGoogle(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): Promise<RotaResponse> {
    if (!this.config.apiKey) {
      throw new Error('API Key do Google Maps é necessária');
    }

    try {
      const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
      const response = await axios.get(url, {
        params: {
          origins: `${lat1},${lon1}`,
          destinations: `${lat2},${lon2}`,
          key: this.config.apiKey,
          mode: 'driving',
          language: 'pt-BR',
          units: 'metric',
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      const element = response.data.rows[0].elements[0];
      if (element.status !== 'OK') {
        throw new Error(`Google Maps API error: ${element.status}`);
      }

      const distancia = element.distance.value / 1000; // Converter metros para km
      
      // Calcular velocidade média do ônibus baseado na distância
      const velocidadeOnibus = this.calcularVelocidadeOnibus(distancia);
      
      // Recalcular tempo baseado na distância real e velocidade de ônibus
      const tempoHorasCalculado = distancia / velocidadeOnibus;
      
      // Adicionar tempo de paradas intermediárias
      const tempoParadas = this.calcularTempoParadas(distancia);
      const tempoTotalMinutos = Math.round(tempoHorasCalculado * 60 + tempoParadas);
      
      const tempoHoras = Math.floor(tempoTotalMinutos / 60);
      const tempoMinutos = tempoTotalMinutos % 60;

      return {
        distanciaKm: Math.round(distancia * 10) / 10,
        tempoHoras,
        tempoMinutos,
        tempoTotalMinutos,
        distanciaEmRota: true,
        provider: 'google',
      };
    } catch (error: any) {
      console.error('Erro ao calcular rota com Google Maps:', error.message);
      throw error;
    }
  }

  /**
   * Calcula distância usando fórmula de Haversine (fallback)
   * Recalcula tempo considerando velocidade de ônibus (80-100 km/h)
   */
  private calcularRotaHaversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): RotaResponse {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    // Para distância em linha reta, adicionar fator para simular distância rodoviária
    // Fator varia conforme distância (rotas curtas têm mais desvios)
    let fatorDistancia = 1.25; // Padrão: 25% a mais
    if (distancia < 50) {
      fatorDistancia = 1.35; // Rotas curtas: 35% a mais (mais desvios urbanos)
    } else if (distancia < 100) {
      fatorDistancia = 1.30; // Rotas médias: 30% a mais
    } else if (distancia > 500) {
      fatorDistancia = 1.20; // Rotas longas: 20% a mais (rodovias mais diretas)
    }
    
    const distanciaRodoviaria = distancia * fatorDistancia;
    
    // Calcular velocidade média do ônibus baseado na distância
    const velocidadeOnibus = this.calcularVelocidadeOnibus(distanciaRodoviaria);
    
    // Calcular tempo baseado na distância rodoviária e velocidade de ônibus
    const tempoHorasCalculado = distanciaRodoviaria / velocidadeOnibus;
    
    // Adicionar tempo de paradas intermediárias
    const tempoParadas = this.calcularTempoParadas(distanciaRodoviaria);
    const tempoTotalMinutos = Math.round(tempoHorasCalculado * 60 + tempoParadas);
    
    const tempoHoras = Math.floor(tempoTotalMinutos / 60);
    const tempoMinutos = tempoTotalMinutos % 60;

    return {
      distanciaKm: Math.round(distanciaRodoviaria * 10) / 10,
      tempoHoras,
      tempoMinutos,
      tempoTotalMinutos,
      distanciaEmRota: false,
      provider: 'haversine',
    };
  }

  /**
   * Converte graus para radianos
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calcula rota entre dois pontos
   * Tenta usar API configurada, com fallback para Haversine
   */
  async calcularRota(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): Promise<RotaResponse> {
    // Se desabilitado ou provider é Haversine, usar Haversine diretamente
    if (!this.config.enabled || this.config.provider === 'haversine') {
      return this.calcularRotaHaversine(lat1, lon1, lat2, lon2);
    }

    // Verificar se tem API key quando necessário
    if (this.config.provider === 'openrouteservice' && (!this.config.apiKey || this.config.apiKey.trim() === '')) {
      // Sem API key, usar Haversine diretamente (sem tentar API)
      return this.calcularRotaHaversine(lat1, lon1, lat2, lon2);
    }

    if (this.config.provider === 'google' && (!this.config.apiKey || this.config.apiKey.trim() === '')) {
      // Sem API key, usar Haversine diretamente (sem tentar API)
      return this.calcularRotaHaversine(lat1, lon1, lat2, lon2);
    }

    // Tentar usar API configurada
    try {
      if (this.config.provider === 'openrouteservice') {
        return await this.calcularRotaOpenRouteService(lat1, lon1, lat2, lon2);
      } else if (this.config.provider === 'google') {
        return await this.calcularRotaGoogle(lat1, lon1, lat2, lon2);
      }
    } catch (error: any) {
      // Log apenas se não for erro esperado (401, sem API key, etc)
      if (!error.message?.includes('API key') && !error.message?.includes('inválida')) {
        console.warn('Erro ao calcular rota com API, usando fallback Haversine:', error.message || error);
      }
      // Fallback para Haversine em caso de erro
      return this.calcularRotaHaversine(lat1, lon1, lat2, lon2);
    }

    // Fallback padrão
    return this.calcularRotaHaversine(lat1, lon1, lat2, lon2);
  }
}

/**
 * Configuração padrão (OpenRouteService com API key)
 * Para usar APIs externas, configure:
 * - provider: 'openrouteservice' ou 'google'
 * - apiKey: sua chave da API escolhida
 * - enabled: true
 * 
 * OpenRouteService: https://openrouteservice.org/ (requer API key)
 * Google Maps: https://developers.google.com/maps (requer API key)
 */
export const defaultRotaApiConfig: RotaApiConfig = {
  provider: 'openrouteservice', // Usar OpenRouteService com API key configurada
  apiKey: process.env.EXPO_PUBLIC_OPENROUTESERVICE_API_KEY || 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImFhZWRiN2ZhOGUxYjQ1YTBiZGRiNTcwZmZhZWZkYmJjIiwiaCI6Im11cm11cjY0In0=',
  enabled: true, // Habilitado para usar OpenRouteService
};

/**
 * Instância do serviço de API de rotas
 */
export const rotaApiService = new RotaApiService(defaultRotaApiConfig);

