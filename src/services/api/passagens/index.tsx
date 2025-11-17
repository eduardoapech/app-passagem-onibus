import { BuscaPassagem, Passagem, PassagemResumo, Cidade } from '@/src/interfaces/passagem';
import { PassagemDatabaseService } from '@/src/services/database/passagens';
import { CidadeService } from '@/src/services/cidades';
import { GeocodificacaoService as GeoService } from '@/src/services/api/geocodificacao';

/**
 * Função auxiliar para buscar cidades (usada internamente)
 */
async function buscarCidadesInterno(termo: string): Promise<Cidade[]> {
  const resultados = await CidadeService.buscarCidadesOnline(termo);
  return resultados.map((c) => ({
    id: c.id,
    nome: c.nome,
    estado: c.estado,
    sigla: c.sigla,
    latitude: c.latitude,
    longitude: c.longitude,
    terminal: c.terminal,
  }));
}

/**
 * Função auxiliar para buscar cidades com coordenadas (usada internamente)
 */
async function buscarCidadesComCoordenadasInterno(termo: string): Promise<Cidade[]> {
  // Buscar cidades primeiro
  const cidades = await buscarCidadesInterno(termo);
  
  // Enriquecer primeiras 10 cidades com coordenadas (para não sobrecarregar a API)
  const cidadesLimitadas = cidades.slice(0, 10);
  const cidadesComCoordenadas = await Promise.all(
    cidadesLimitadas.map(async (cidade) => {
      if (!cidade.latitude || !cidade.longitude) {
        try {
          return await GeoService.enriquecerCidadeComCoordenadas(cidade);
        } catch (error) {
          console.warn(`Erro ao obter coordenadas para ${cidade.nome}:`, error);
          return cidade;
        }
      }
      return cidade;
    })
  );

  // Retornar cidades enriquecidas + restantes sem coordenadas
  return [...cidadesComCoordenadas, ...cidades.slice(10)];
}

export const PassagemService = {
  buscarPassagens: async (busca: BuscaPassagem): Promise<PassagemResumo[]> => {
    // Enriquecer cidades com coordenadas se necessário
    if (busca.origem && (!busca.origem.latitude || !busca.origem.longitude)) {
      try {
        busca.origem = await GeoService.enriquecerCidadeComCoordenadas(busca.origem);
      } catch (error) {
        console.warn('Erro ao obter coordenadas da origem:', error);
      }
    }

    if (busca.destino && (!busca.destino.latitude || !busca.destino.longitude)) {
      try {
        busca.destino = await GeoService.enriquecerCidadeComCoordenadas(busca.destino);
      } catch (error) {
        console.warn('Erro ao obter coordenadas do destino:', error);
      }
    }

    return await PassagemDatabaseService.buscarPassagens(busca);
  },

  obterDetalhes: async (
    passagemId: string, 
    origem?: Cidade | null, 
    destino?: Cidade | null,
    passagemResumo?: Partial<PassagemResumo>
  ): Promise<Passagem> => {
    // Enriquecer cidades com coordenadas se necessário
    if (origem && (!origem.latitude || !origem.longitude)) {
      try {
        origem = await GeoService.enriquecerCidadeComCoordenadas(origem);
      } catch (error) {
        console.warn('Erro ao obter coordenadas da origem:', error);
      }
    }

    if (destino && (!destino.latitude || !destino.longitude)) {
      try {
        destino = await GeoService.enriquecerCidadeComCoordenadas(destino);
      } catch (error) {
        console.warn('Erro ao obter coordenadas do destino:', error);
      }
    }

    return await PassagemDatabaseService.obterDetalhes(passagemId, origem, destino, passagemResumo);
  },

  obterCidades: async (): Promise<Cidade[]> => {
    // Buscar todas as cidades via IBGE (com cache interno)
    const lista = await CidadeService.listarTodasOnline();
    return lista.map((c) => ({
      id: c.id,
      nome: c.nome,
      estado: c.estado,
      sigla: c.sigla,
      latitude: c.latitude,
      longitude: c.longitude,
      terminal: c.terminal,
    }));
  },

  buscarCidades: async (termo: string): Promise<Cidade[]> => {
    return await buscarCidadesInterno(termo);
  },

  /**
   * Busca cidade e enriquece com coordenadas
   * @param termo Termo de busca
   * @returns Lista de cidades com coordenadas
   */
  buscarCidadesComCoordenadas: async (termo: string): Promise<Cidade[]> => {
    return await buscarCidadesComCoordenadasInterno(termo);
  },

  obterPoltronas: async (passagemId: string): Promise<any> => {
    // Implementar se necessário
    return [];
  },
};
