import { rotaApiService, RotaResponse } from './rotas-api-service';
import { Cidade } from '@/src/interfaces/passagem';

/**
 * Serviço de API para cálculo de rotas
 * Expõe métodos simplificados para uso no aplicativo
 */
export const RotaService = {
  /**
   * Calcula rota entre duas cidades
   * @param origem Cidade de origem
   * @param destino Cidade de destino
   * @returns Informações da rota (distância, tempo)
   */
  async calcularRota(origem: Cidade, destino: Cidade): Promise<RotaResponse> {
    // Verificar se as cidades têm coordenadas
    if (!origem.latitude || !origem.longitude || !destino.latitude || !destino.longitude) {
      throw new Error('Cidades devem ter coordenadas (latitude e longitude) para calcular rota');
    }

    return await rotaApiService.calcularRota(
      origem.latitude,
      origem.longitude,
      destino.latitude,
      destino.longitude
    );
  },

  /**
   * Calcula rota usando coordenadas diretamente
   * @param lat1 Latitude de origem
   * @param lon1 Longitude de origem
   * @param lat2 Latitude de destino
   * @param lon2 Longitude de destino
   * @returns Informações da rota (distância, tempo)
   */
  async calcularRotaPorCoordenadas(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): Promise<RotaResponse> {
    return await rotaApiService.calcularRota(lat1, lon1, lat2, lon2);
  },
};

