import axios from 'axios';
import { buscarCoordenadasLocal as buscarCoordenadasLocalData, CoordenadaCidade } from '@/src/data/coordenadas-cidades-brasil';

/**
 * Interface para resultado de geocodificação
 */
export interface GeocodificacaoResult {
  latitude: number;
  longitude: number;
  enderecoCompleto: string;
  precisao: 'alta' | 'media' | 'baixa';
}

// Cache de coordenadas em memória
const COORDENADAS_CACHE = new Map<string, GeocodificacaoResult>();

/**
 * Serviço de geocodificação usando múltiplas APIs (Nominatim, BrasilAPI)
 */
export class GeocodificacaoService {
  /**
   * Busca coordenadas usando BrasilAPI (primeira opção - mais confiável para cidades brasileiras)
   */
  private async buscarCoordenadasBrasilAPI(
    cidade: string,
    estado?: string
  ): Promise<GeocodificacaoResult> {
    try {
      // Construir query de busca
      let query = cidade;
      if (estado) {
        // Limpar estado (remover "Brasil" se presente)
        const estadoLimpo = estado.replace(/,?\s*Brasil\s*/gi, '').trim();
        query += `, ${estadoLimpo}`;
      }

      // Usar BrasilAPI - API pública brasileira
      const url = `https://brasilapi.com.br/api/ibge/localidades/v1/municipios`;
      const response = await axios.get(url, {
        params: {
          nome: cidade,
          estado: estado?.replace(/,?\s*Brasil\s*/gi, '').trim().substring(0, 2).toUpperCase(),
        },
      });

      if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
        throw new Error(`Cidade não encontrada: ${query}`);
      }

      const resultado = Array.isArray(response.data) ? response.data[0] : response.data;
      
      // BrasilAPI não retorna coordenadas diretamente, usar Nominatim como fallback
      throw new Error('BrasilAPI não retorna coordenadas, usar Nominatim');
    } catch (error: any) {
      if (!error.message.includes('BrasilAPI não retorna coordenadas')) {
        console.warn('Erro ao buscar coordenadas com BrasilAPI:', error.message);
      }
      throw error;
    }
  }

  /**
   * Busca coordenadas de uma cidade pelo nome usando Nominatim (OpenStreetMap)
   */
  private async buscarCoordenadasPorNominatim(
    cidade: string,
    estado?: string,
    pais: string = 'Brasil'
  ): Promise<GeocodificacaoResult> {
    try {
      // Construir query de busca
      let query = cidade.trim();
      
      // Limpar estado (remover "Brasil" se presente)
      if (estado) {
        const estadoLimpo = estado.replace(/,?\s*Brasil\s*/gi, '').trim();
        query += `, ${estadoLimpo}`;
      }
      query += `, ${pais}`;

      // Construir chave de cache
      const estadoCache = estado?.replace(/,?\s*Brasil\s*/gi, '').trim() || '';
      const cacheKey = `${cidade.trim()}-${estadoCache}`.toLowerCase();
      
      // Verificar cache primeiro
      if (COORDENADAS_CACHE.has(cacheKey)) {
        const cached = COORDENADAS_CACHE.get(cacheKey)!;
        console.log(`Coordenadas encontradas em cache para: ${query}`);
        return cached;
      }

      // Usar Nominatim (OpenStreetMap) - Gratuito
      // Nota: Nominatim pode ter problemas de CORS/Network em React Native
      // Por isso temos fallback robusto para base de dados local
      const url = 'https://nominatim.openstreetmap.org/search';
      
      const response = await axios.get(url, {
        params: {
          q: query,
          format: 'json',
          limit: 1,
          addressdetails: 1,
          countrycodes: 'br', // Limitar ao Brasil
          'accept-language': 'pt-BR',
        },
        headers: {
          'User-Agent': 'PassagemOnibusApp/1.0 (https://passagem-onibus.app)', // Nominatim requer User-Agent identificável
          'Accept': 'application/json',
        },
        timeout: 5000, // 5 segundos de timeout (reduzido para falhar mais rápido)
        validateStatus: (status) => status >= 200 && status < 300,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error(`Cidade não encontrada: ${query}`);
      }

      const resultado = response.data[0];
      const latitude = parseFloat(resultado.lat);
      const longitude = parseFloat(resultado.lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error('Coordenadas inválidas retornadas');
      }

      // Determinar precisão baseado no tipo de resultado
      let precisao: 'alta' | 'media' | 'baixa' = 'media';
      const tipo = resultado.type?.toLowerCase() || '';
      const importancia = parseFloat(resultado.importance) || 0;
      const classType = resultado.class?.toLowerCase() || '';

      if (tipo.includes('city') || tipo.includes('town') || classType.includes('place') || importancia > 0.7) {
        precisao = 'alta';
      } else if (importancia > 0.4) {
        precisao = 'media';
      } else {
        precisao = 'baixa';
      }

      const resultadoCoordenadas: GeocodificacaoResult = {
        latitude,
        longitude,
        enderecoCompleto: resultado.display_name || query,
        precisao,
      };

      // Armazenar em cache
      COORDENADAS_CACHE.set(cacheKey, resultadoCoordenadas);

      return resultadoCoordenadas;
    } catch (error: any) {
      // Se for erro de rede/CORS, re-throw para usar fallback local
      if (
        error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        error.code === 'ERR_CANCELED' ||
        error.message?.includes('Network') ||
        error.message?.includes('timeout') ||
        error.message?.includes('CORS') ||
        !error.response
      ) {
        // Erro de rede - usar fallback local
        throw new Error('Network Error - usando fallback local');
      }
      // Outros erros também re-throw para usar fallback
      throw error;
    }
  }

  /**
   * Busca coordenadas usando base de dados local (fallback rápido)
   * @param cidade Nome da cidade
   * @param estado Estado ou sigla
   * @returns Coordenadas da cidade ou null se não encontrada
   */
  private buscarCoordenadasLocal(
    cidade: string,
    estado?: string
  ): GeocodificacaoResult | null {
    try {
      const coordenada = buscarCoordenadasLocalData(cidade, estado);
      if (coordenada) {
        return {
          latitude: coordenada.latitude,
          longitude: coordenada.longitude,
          enderecoCompleto: `${coordenada.nome}, ${coordenada.sigla}, Brasil`,
          precisao: 'alta', // Base de dados local tem alta precisão
        };
      }
      return null;
    } catch (error) {
      console.warn('Erro ao buscar coordenadas local:', error);
      return null;
    }
  }

  /**
   * Busca coordenadas usando múltiplos provedores (fallback)
   * Prioridade: 1. Cache, 2. Base local, 3. Nominatim (opcional), 4. Estimativa
   * @param cidade Nome da cidade
   * @param estado Estado ou sigla
   * @param tentarNominatim Se true, tenta usar Nominatim (padrão: false para evitar erros de rede)
   * @returns Coordenadas da cidade
   */
  async buscarCoordenadas(
    cidade: string,
    estado?: string,
    tentarNominatim: boolean = false
  ): Promise<GeocodificacaoResult> {
    // Limpar nome da cidade
    const cidadeLimpa = cidade.trim();
    const estadoLimpo = estado?.replace(/,?\s*Brasil\s*/gi, '').trim();
    
    // 1. Verificar cache primeiro
    const cacheKey = `${cidadeLimpa}-${estadoLimpo || ''}`.toLowerCase();
    if (COORDENADAS_CACHE.has(cacheKey)) {
      return COORDENADAS_CACHE.get(cacheKey)!;
    }

    // 2. Tentar base de dados local PRIMEIRO (rápido, confiável e não requer internet)
    const coordenadasLocal = this.buscarCoordenadasLocal(cidadeLimpa, estadoLimpo);
    if (coordenadasLocal) {
      // Armazenar em cache
      COORDENADAS_CACHE.set(cacheKey, coordenadasLocal);
      return coordenadasLocal;
    }

    // 2.1. Tentar com variações do nome na base local (antes de tentar API)
    const variacoes = [
      { cidade: cidadeLimpa, estado: estadoLimpo },
      { cidade: cidadeLimpa.split(',')[0].trim(), estado: estadoLimpo },
      { cidade: cidadeLimpa.split('-')[0].trim(), estado: estadoLimpo },
      { cidade: cidadeLimpa, estado: undefined },
      { cidade: cidadeLimpa.replace(/^São /i, ''), estado: estadoLimpo },
      { cidade: cidadeLimpa.replace(/^Santa /i, ''), estado: estadoLimpo },
    ];

    for (const variacao of variacoes) {
      if (!variacao.cidade || variacao.cidade.length < 3) continue;
      
      const coordenadasVar = this.buscarCoordenadasLocal(variacao.cidade, variacao.estado);
      if (coordenadasVar) {
        // Armazenar em cache
        COORDENADAS_CACHE.set(cacheKey, coordenadasVar);
        return coordenadasVar;
      }
    }

    // 3. Tentar Nominatim APENAS se habilitado (pode falhar com Network Error)
    if (tentarNominatim) {
      try {
        const resultado = await this.buscarCoordenadasPorNominatim(cidadeLimpa, estadoLimpo);
        // Armazenar em cache
        COORDENADAS_CACHE.set(cacheKey, resultado);
        return resultado;
      } catch (error: any) {
        // Ignorar erro de rede - continuar para fallback estimado
        console.warn('Nominatim não disponível, usando coordenadas estimadas:', error.message);
      }
    }

    // 4. Último fallback: usar coordenadas estimadas baseadas no estado (centro do estado)
    // Isso garante que sempre retornamos coordenadas, mesmo sem internet
    console.log(`Usando coordenadas estimadas para ${cidadeLimpa}, ${estadoLimpo || 'Brasil'}`);
    return this.obterCoordenadasEstimadas(cidadeLimpa, estadoLimpo);
  }

  /**
   * Obtém coordenadas estimadas baseadas no centro do estado
   * @param cidade Nome da cidade
   * @param estado Estado ou sigla
   * @returns Coordenadas estimadas
   */
  private obterCoordenadasEstimadas(
    cidade: string,
    estado?: string
  ): GeocodificacaoResult {
    // Coordenadas aproximadas dos centros dos estados brasileiros
    const centrosEstados: { [key: string]: { lat: number; lon: number } } = {
      'SP': { lat: -23.5505, lon: -46.6333 }, // São Paulo (capital)
      'RJ': { lat: -22.9068, lon: -43.1729 }, // Rio de Janeiro
      'MG': { lat: -19.9167, lon: -43.9345 }, // Belo Horizonte
      'RS': { lat: -30.0346, lon: -51.2177 }, // Porto Alegre
      'PR': { lat: -25.4284, lon: -49.2733 }, // Curitiba
      'SC': { lat: -27.5954, lon: -48.5480 }, // Florianópolis
      'BA': { lat: -12.9714, lon: -38.5014 }, // Salvador
      'GO': { lat: -16.6864, lon: -49.2643 }, // Goiânia
      'PE': { lat: -8.0476, lon: -34.8770 }, // Recife
      'CE': { lat: -3.7172, lon: -38.5433 }, // Fortaleza
      'PA': { lat: -1.4558, lon: -48.5044 }, // Belém
      'AM': { lat: -3.1190, lon: -60.0217 }, // Manaus
      'ES': { lat: -20.3155, lon: -40.3128 }, // Vitória
      'PB': { lat: -7.1195, lon: -34.8450 }, // João Pessoa
      'AL': { lat: -9.5713, lon: -36.7820 }, // Maceió
      'RN': { lat: -5.7945, lon: -35.2110 }, // Natal
      'MT': { lat: -15.6014, lon: -56.0979 }, // Cuiabá
      'MS': { lat: -20.4697, lon: -54.6201 }, // Campo Grande
      'DF': { lat: -15.7942, lon: -47.8822 }, // Brasília
      'SE': { lat: -10.9091, lon: -37.0677 }, // Aracaju
      'RO': { lat: -8.7619, lon: -63.9039 }, // Porto Velho
      'TO': { lat: -10.1844, lon: -48.3336 }, // Palmas
      'AC': { lat: -9.9740, lon: -67.8098 }, // Rio Branco
      'AP': { lat: 0.0349, lon: -51.0694 }, // Macapá
      'RR': { lat: 2.8235, lon: -60.6758 }, // Boa Vista
      'PI': { lat: -5.0892, lon: -42.8019 }, // Teresina
      'MA': { lat: -2.5387, lon: -44.2825 }, // São Luís
    };

    const estadoSigla = estado?.toUpperCase().substring(0, 2) || 'SP';
    const centro = centrosEstados[estadoSigla] || centrosEstados['SP'];

    // Adicionar pequena variação aleatória para evitar coordenadas idênticas
    const variacaoLat = (Math.random() - 0.5) * 0.5; // ±0.25 graus
    const variacaoLon = (Math.random() - 0.5) * 0.5; // ±0.25 graus

    const resultado: GeocodificacaoResult = {
      latitude: centro.lat + variacaoLat,
      longitude: centro.lon + variacaoLon,
      enderecoCompleto: `${cidade}, ${estado || estadoSigla}, Brasil (estimado)`,
      precisao: 'baixa', // Coordenadas estimadas têm baixa precisão
    };

    // Armazenar em cache mesmo sendo estimado
    const cacheKey = `${cidade.trim()}-${estado || ''}`.toLowerCase();
    COORDENADAS_CACHE.set(cacheKey, resultado);

    return resultado;
  }
}

/**
 * Instância do serviço de geocodificação
 */
export const geocodificacaoService = new GeocodificacaoService();

