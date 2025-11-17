// Modelo de dados para cidade brasileira (fonte: APIs públicas)
export interface CidadeBrasil {
  id: string;
  nome: string;
  estado: string;
  sigla: string;
  latitude?: number;
  longitude?: number;
  terminal?: string;
}

// Cache em memória para todas as cidades
let CIDADES_CACHE: CidadeBrasil[] = [];
let CACHE_CARREGADO = false;

// Carrega todas as cidades do IBGE (API oficial), com cache em memória
async function carregarTodasCidadesOnline(): Promise<CidadeBrasil[]> {
  if (CACHE_CARREGADO && CIDADES_CACHE.length > 0) {
    return CIDADES_CACHE;
  }

  try {
    const resp = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado');
    if (!resp.ok) {
      throw new Error(`Falha ao carregar municípios do IBGE: ${resp.status}`);
    }
    const dados: any[] = await resp.json();

    CIDADES_CACHE = (dados || []).map((item: any) => {
      const uf = item?.UF || {};
      const sigla = String(uf?.sigla || item?.['UF-sigla'] || '');
      const estadoNome = String(uf?.nome || item?.['UF-nome'] || sigla || '');
      return {
        id: String(item?.id || item?.['municipio-id'] || ''),
        nome: String(item?.nome || item?.['municipio-nome'] || ''),
        estado: estadoNome,
        sigla,
        // Coordenadas serão buscadas quando necessário via geocodificação
        latitude: undefined,
        longitude: undefined,
      } as CidadeBrasil;
    });
    CACHE_CARREGADO = true;
    return CIDADES_CACHE;
  } catch (error) {
    console.error('Erro ao carregar cidades do IBGE:', error);
    // Retornar cache existente ou array vazio
    return CIDADES_CACHE.length > 0 ? CIDADES_CACHE : [];
  }
}

export const CidadeService = {
  // Busca online via IBGE (com cache), filtra por termo e limita resultados
  buscarCidadesOnline: async (termo: string): Promise<CidadeBrasil[]> => {
    if (!termo || termo.trim().length < 2) {
      return [];
    }
    const lista = await carregarTodasCidadesOnline();
    const busca = termo.trim().toLowerCase();
    return lista
      .filter((c) => {
        const nome = c.nome?.toLowerCase() || '';
        const estado = c.estado?.toLowerCase() || '';
        const sigla = c.sigla?.toLowerCase() || '';
        return (
          nome.includes(busca) ||
          estado.includes(busca) ||
          sigla.includes(busca) ||
          `${nome}, ${sigla}`.includes(busca) ||
          `${nome} ${estado}`.includes(busca)
        );
      })
      .slice(0, 50);
  },

  // Lista todas as cidades (online, com cache)
  listarTodasOnline: async (): Promise<CidadeBrasil[]> => {
    const lista = await carregarTodasCidadesOnline();
    return [...lista];
  },

  // Utilitários baseados em cache
  obterCidadePorId: async (id: string): Promise<CidadeBrasil | undefined> => {
    const lista = await carregarTodasCidadesOnline();
    return lista.find((c) => c.id === id);
  },

  obterCidadePorNome: async (nome: string, estado?: string): Promise<CidadeBrasil | undefined> => {
    const lista = await carregarTodasCidadesOnline();
    const nomeLower = nome.toLowerCase();
    const estadoLower = estado?.toLowerCase();
    return lista.find((c) => {
      const matchNome = c.nome.toLowerCase() === nomeLower;
      if (!estadoLower) return matchNome;
      return matchNome && (c.estado.toLowerCase() === estadoLower || c.sigla.toLowerCase() === estadoLower);
    });
  },
};