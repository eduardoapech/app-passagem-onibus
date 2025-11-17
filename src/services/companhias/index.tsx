// Lista de principais companhias de ônibus brasileiras e seus sites oficiais
export interface CompanhiaInfo {
  id: string;
  nome: string;
  urlSite: string;
  logo?: string;
}

export const COMPANHIAS_BRASILEIRAS: CompanhiaInfo[] = [
  {
    id: '1',
    nome: 'Cometa',
    urlSite: 'https://www.viacaocometa.com.br',
  },
  {
    id: '2',
    nome: 'Gontijo',
    urlSite: 'https://www.gontijo.com.br',
  },
  {
    id: '3',
    nome: 'Itapemirim',
    urlSite: 'https://www.itapemirim.com.br',
  },
  {
    id: '4',
    nome: 'Kaissara',
    urlSite: 'https://www.kaissara.com.br',
  },
  {
    id: '5',
    nome: 'Planalto',
    urlSite: 'https://www.planalto.com.br',
  },
  {
    id: '6',
    nome: 'Rapido Federal',
    urlSite: 'https://www.rapidofederal.com.br',
  },
  {
    id: '7',
    nome: 'São Geraldo',
    urlSite: 'https://www.saogeraldo.com.br',
  },
  {
    id: '8',
    nome: 'Viação Garcia',
    urlSite: 'https://www.viacaogarcia.com.br',
  },
  {
    id: '9',
    nome: 'Viação Nacional',
    urlSite: 'https://www.viacaonacional.com.br',
  },
  {
    id: '10',
    nome: 'Auto Viação 1001',
    urlSite: 'https://www.autoviacao1001.com.br',
  },
  {
    id: '11',
    nome: 'Viação Util',
    urlSite: 'https://www.util.com.br',
  },
  {
    id: '12',
    nome: 'Penha',
    urlSite: 'https://www.penha.com.br',
  },
  {
    id: '13',
    nome: 'Reunidas',
    urlSite: 'https://www.reunidas.com.br',
  },
  {
    id: '14',
    nome: 'Catarinense',
    urlSite: 'https://www.catarinense.net',
  },
  {
    id: '15',
    nome: 'São José',
    urlSite: 'https://www.saojose.com.br',
  },
  {
    id: '16',
    nome: 'Eucatur',
    urlSite: 'https://www.eucatur.com.br',
  },
  {
    id: '17',
    nome: 'Ouro e Prata',
    urlSite: 'https://www.ouroeprata.com.br',
  },
  {
    id: '18',
    nome: 'Unesul',
    urlSite: 'https://www.unesul.com.br',
  },
];

export const CompanhiaService = {
  obterUrlSite: (nomeCompanhia: string): string | undefined => {
    const companhia = COMPANHIAS_BRASILEIRAS.find(
      c => c.nome.toLowerCase() === nomeCompanhia.toLowerCase()
    );
    return companhia?.urlSite;
  },
  
  obterCompanhia: (nomeCompanhia: string): CompanhiaInfo | undefined => {
    return COMPANHIAS_BRASILEIRAS.find(
      c => c.nome.toLowerCase() === nomeCompanhia.toLowerCase()
    );
  },
  
  listarCompanhias: (): CompanhiaInfo[] => {
    return COMPANHIAS_BRASILEIRAS;
  },
  
  construirUrlCompra: (urlSite: string, origem?: string, destino?: string, data?: string): string => {
    // Construir URL de compra com parâmetros quando disponível
    // A maioria das companhias tem estruturas diferentes de URL
    // Por enquanto, retornamos apenas a URL base
    if (origem && destino && data) {
      // Algumas companhias aceitam parâmetros na URL
      // Isso pode ser expandido conforme necessário
      return `${urlSite}?origem=${origem}&destino=${destino}&data=${data}`;
    }
    return urlSite;
  },
};

