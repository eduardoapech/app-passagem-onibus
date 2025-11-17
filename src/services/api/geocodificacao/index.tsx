import { geocodificacaoService, GeocodificacaoResult } from './geocodificacao-service';
import { Cidade } from '@/src/interfaces/passagem';

/**
 * Serviço de geocodificação
 * Expõe métodos simplificados para uso no aplicativo
 */
export const GeocodificacaoService = {
  /**
   * Busca coordenadas de uma cidade
   * @param cidade Cidade com nome e estado
   * @returns Coordenadas da cidade
   */
  async buscarCoordenadas(cidade: Cidade): Promise<GeocodificacaoResult> {
    return await geocodificacaoService.buscarCoordenadas(
      cidade.nome,
      cidade.sigla || cidade.estado
    );
  },

  /**
   * Busca coordenadas pelo nome da cidade e estado
   * @param nomeCidade Nome da cidade
   * @param estado Estado ou sigla
   * @returns Coordenadas da cidade
   */
  async buscarCoordenadasPorNome(
    nomeCidade: string,
    estado?: string
  ): Promise<GeocodificacaoResult> {
    return await geocodificacaoService.buscarCoordenadas(nomeCidade, estado);
  },

  /**
   * Enriquece uma cidade com coordenadas se não tiver
   * @param cidade Cidade (pode ou não ter coordenadas)
   * @param tentarNominatim Se true, tenta usar Nominatim (padrão: false)
   * @returns Cidade com coordenadas
   */
  async enriquecerCidadeComCoordenadas(cidade: Cidade, tentarNominatim: boolean = false): Promise<Cidade> {
    // Se já tem coordenadas, retornar como está
    if (cidade.latitude && cidade.longitude) {
      return cidade;
    }

    // Buscar coordenadas (prioriza base local, não requer internet)
    try {
      const coordenadas = await geocodificacaoService.buscarCoordenadas(
        cidade.nome,
        cidade.sigla || cidade.estado,
        tentarNominatim
      );
      return {
        ...cidade,
        latitude: coordenadas.latitude,
        longitude: coordenadas.longitude,
      };
    } catch (error: any) {
      console.warn('Erro ao enriquecer cidade com coordenadas, usando estimativa:', error.message);
      // Em caso de erro, tentar obter coordenadas estimadas
      try {
        const coordenadas = await geocodificacaoService.buscarCoordenadas(
          cidade.nome,
          cidade.sigla || cidade.estado,
          false // Não tentar Nominatim novamente
        );
        return {
          ...cidade,
          latitude: coordenadas.latitude,
          longitude: coordenadas.longitude,
        };
      } catch (fallbackError) {
        console.error('Erro ao obter coordenadas estimadas:', fallbackError);
        // Retornar cidade sem coordenadas em último caso
        return cidade;
      }
    }
  },
};

