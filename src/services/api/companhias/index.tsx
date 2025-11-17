import { BusCompanyApiResponse, busApiService } from './bus-api-service';
import { CompanhiaService } from '@/src/services/companhias';
import { Companhia } from '@/src/interfaces/passagem';

/**
 * Serviço de API para companhias de ônibus
 * Tenta usar API real se disponível, caso contrário usa dados mock
 */
export const CompanhiaApiService = {
  /**
   * Lista todas as companhias de ônibus
   * Tenta usar API real, se não disponível usa dados mock
   */
  async listarCompanhias(): Promise<Companhia[]> {
    try {
      // Tentar usar API real se habilitada
      if (busApiService) {
        const empresas = await busApiService.listarCompanhias();
        return empresas.map((empresa) => ({
          id: empresa.id,
          nome: empresa.nome,
          logo: empresa.logo || '',
          avaliacao: empresa.avaliacao || 4.0,
          totalAvaliacoes: empresa.totalAvaliacoes || 0,
          urlSite: empresa.urlSite,
        }));
      }
    } catch (error) {
      console.warn('API de ônibus não disponível, usando dados mock:', error);
    }

    // Fallback: usar dados mock das companhias brasileiras
    const companhiasMock = CompanhiaService.listarCompanhias();
    return companhiasMock.map((companhia) => ({
      id: companhia.id,
      nome: companhia.nome,
      logo: '',
      avaliacao: 4.0,
      totalAvaliacoes: 100,
      urlSite: companhia.urlSite,
    }));
  },

  /**
   * Busca uma companhia por ID
   */
  async obterCompanhia(companhiaId: string): Promise<Companhia | null> {
    try {
      const companhias = await this.listarCompanhias();
      return companhias.find((c) => c.id === companhiaId) || null;
    } catch (error) {
      console.error('Erro ao buscar companhia:', error);
      return null;
    }
  },

  /**
   * Busca uma companhia por nome
   */
  async obterCompanhiaPorNome(nome: string): Promise<Companhia | null> {
    try {
      const companhias = await this.listarCompanhias();
      return (
        companhias.find(
          (c) => c.nome.toLowerCase() === nome.toLowerCase()
        ) || null
      );
    } catch (error) {
      console.error('Erro ao buscar companhia por nome:', error);
      return null;
    }
  },
};

