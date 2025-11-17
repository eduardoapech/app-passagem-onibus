/**
 * Base de dados de coordenadas das principais cidades brasileiras
 * Usado como fallback quando a API de geocodificação não está disponível
 */
export interface CoordenadaCidade {
  nome: string;
  estado: string;
  sigla: string;
  latitude: number;
  longitude: number;
}

/**
 * Coordenadas das principais cidades brasileiras
 * Fonte: Baseado em dados públicos do IBGE e OpenStreetMap
 */
export const COORDENADAS_CIDADES_BRASIL: CoordenadaCidade[] = [
  // Capitais
  { nome: 'São Paulo', estado: 'São Paulo', sigla: 'SP', latitude: -23.5505, longitude: -46.6333 },
  { nome: 'Rio de Janeiro', estado: 'Rio de Janeiro', sigla: 'RJ', latitude: -22.9068, longitude: -43.1729 },
  { nome: 'Belo Horizonte', estado: 'Minas Gerais', sigla: 'MG', latitude: -19.9167, longitude: -43.9345 },
  { nome: 'Brasília', estado: 'Distrito Federal', sigla: 'DF', latitude: -15.7942, longitude: -47.8822 },
  { nome: 'Salvador', estado: 'Bahia', sigla: 'BA', latitude: -12.9714, longitude: -38.5014 },
  { nome: 'Curitiba', estado: 'Paraná', sigla: 'PR', latitude: -25.4284, longitude: -49.2733 },
  { nome: 'Porto Alegre', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -30.0346, longitude: -51.2177 },
  { nome: 'Recife', estado: 'Pernambuco', sigla: 'PE', latitude: -8.0476, longitude: -34.8770 },
  { nome: 'Fortaleza', estado: 'Ceará', sigla: 'CE', latitude: -3.7172, longitude: -38.5433 },
  { nome: 'Manaus', estado: 'Amazonas', sigla: 'AM', latitude: -3.1190, longitude: -60.0217 },
  { nome: 'Belém', estado: 'Pará', sigla: 'PA', latitude: -1.4558, longitude: -48.5044 },
  { nome: 'Goiânia', estado: 'Goiás', sigla: 'GO', latitude: -16.6864, longitude: -49.2643 },
  { nome: 'Guarulhos', estado: 'São Paulo', sigla: 'SP', latitude: -23.4538, longitude: -46.5331 },
  { nome: 'Campinas', estado: 'São Paulo', sigla: 'SP', latitude: -22.9056, longitude: -47.0608 },
  { nome: 'São Luís', estado: 'Maranhão', sigla: 'MA', latitude: -2.5387, longitude: -44.2825 },
  { nome: 'São Gonçalo', estado: 'Rio de Janeiro', sigla: 'RJ', latitude: -22.8269, longitude: -43.0539 },
  { nome: 'Maceió', estado: 'Alagoas', sigla: 'AL', latitude: -9.5713, longitude: -36.7820 },
  { nome: 'Duque de Caxias', estado: 'Rio de Janeiro', sigla: 'RJ', latitude: -22.7856, longitude: -43.3117 },
  { nome: 'Natal', estado: 'Rio Grande do Norte', sigla: 'RN', latitude: -5.7945, longitude: -35.2110 },
  { nome: 'Teresina', estado: 'Piauí', sigla: 'PI', latitude: -5.0892, longitude: -42.8019 },
  { nome: 'Campo Grande', estado: 'Mato Grosso do Sul', sigla: 'MS', latitude: -20.4697, longitude: -54.6201 },
  { nome: 'Nova Iguaçu', estado: 'Rio de Janeiro', sigla: 'RJ', latitude: -22.7556, longitude: -43.4603 },
  { nome: 'São Bernardo do Campo', estado: 'São Paulo', sigla: 'SP', latitude: -23.6939, longitude: -46.5650 },
  { nome: 'João Pessoa', estado: 'Paraíba', sigla: 'PB', latitude: -7.1195, longitude: -34.8450 },
  { nome: 'Santo André', estado: 'São Paulo', sigla: 'SP', latitude: -23.6639, longitude: -46.5383 },
  { nome: 'Osasco', estado: 'São Paulo', sigla: 'SP', latitude: -23.5329, longitude: -46.7915 },
  { nome: 'Jaboatão dos Guararapes', estado: 'Pernambuco', sigla: 'PE', latitude: -8.1128, longitude: -35.0147 },
  { nome: 'Ribeirão Preto', estado: 'São Paulo', sigla: 'SP', latitude: -21.1775, longitude: -47.8103 },
  { nome: 'Uberlândia', estado: 'Minas Gerais', sigla: 'MG', latitude: -18.9126, longitude: -48.2755 },
  { nome: 'Sorocaba', estado: 'São Paulo', sigla: 'SP', latitude: -23.5015, longitude: -47.4526 },
  { nome: 'Contagem', estado: 'Minas Gerais', sigla: 'MG', latitude: -19.9320, longitude: -44.0539 },
  { nome: 'Aracaju', estado: 'Sergipe', sigla: 'SE', latitude: -10.9091, longitude: -37.0677 },
  { nome: 'Feira de Santana', estado: 'Bahia', sigla: 'BA', latitude: -12.2664, longitude: -38.9661 },
  { nome: 'Cuiabá', estado: 'Mato Grosso', sigla: 'MT', latitude: -15.6014, longitude: -56.0979 },
  { nome: 'Joinville', estado: 'Santa Catarina', sigla: 'SC', latitude: -26.3044, longitude: -48.8467 },
  { nome: 'Juiz de Fora', estado: 'Minas Gerais', sigla: 'MG', latitude: -21.7595, longitude: -43.3398 },
  { nome: 'Londrina', estado: 'Paraná', sigla: 'PR', latitude: -23.3045, longitude: -51.1696 },
  { nome: 'Aparecida de Goiânia', estado: 'Goiás', sigla: 'GO', latitude: -16.8198, longitude: -49.2470 },
  { nome: 'Niterói', estado: 'Rio de Janeiro', sigla: 'RJ', latitude: -22.8834, longitude: -43.1034 },
  { nome: 'Ananindeua', estado: 'Pará', sigla: 'PA', latitude: -1.3639, longitude: -48.3743 },
  { nome: 'Porto Velho', estado: 'Rondônia', sigla: 'RO', latitude: -8.7619, longitude: -63.9039 },
  { nome: 'Serra', estado: 'Espírito Santo', sigla: 'ES', latitude: -20.1286, longitude: -40.3078 },
  { nome: 'Caxias do Sul', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.1680, longitude: -51.1794 },
  { nome: 'Campos dos Goytacazes', estado: 'Rio de Janeiro', sigla: 'RJ', latitude: -21.7523, longitude: -41.3304 },
  { nome: 'Macapá', estado: 'Amapá', sigla: 'AP', latitude: 0.0349, longitude: -51.0694 },
  { nome: 'Vila Velha', estado: 'Espírito Santo', sigla: 'ES', latitude: -20.3297, longitude: -40.2925 },
  { nome: 'Florianópolis', estado: 'Santa Catarina', sigla: 'SC', latitude: -27.5954, longitude: -48.5480 },
  { nome: 'São José dos Campos', estado: 'São Paulo', sigla: 'SP', latitude: -23.1791, longitude: -45.8872 },
  { nome: 'Mauá', estado: 'São Paulo', sigla: 'SP', latitude: -23.6677, longitude: -46.4613 },
  { nome: 'São José dos Pinhais', estado: 'Paraná', sigla: 'PR', latitude: -25.5349, longitude: -49.2056 },
  { nome: 'Santos', estado: 'São Paulo', sigla: 'SP', latitude: -23.9608, longitude: -46.3332 },
  { nome: 'Mogi das Cruzes', estado: 'São Paulo', sigla: 'SP', latitude: -23.5225, longitude: -46.1881 },
  { nome: 'Betim', estado: 'Minas Gerais', sigla: 'MG', latitude: -19.9678, longitude: -44.1977 },
  { nome: 'Diadema', estado: 'São Paulo', sigla: 'SP', latitude: -23.6864, longitude: -46.6228 },
  { nome: 'Campina Grande', estado: 'Paraíba', sigla: 'PB', latitude: -7.2307, longitude: -35.8817 },
  { nome: 'Jundiaí', estado: 'São Paulo', sigla: 'SP', latitude: -23.1864, longitude: -46.8842 },
  { nome: 'Maringá', estado: 'Paraná', sigla: 'PR', latitude: -23.4205, longitude: -51.9333 },
  { nome: 'Montes Claros', estado: 'Minas Gerais', sigla: 'MG', latitude: -16.7281, longitude: -43.8631 },
  { nome: 'Carapicuíba', estado: 'São Paulo', sigla: 'SP', latitude: -23.5235, longitude: -46.8406 },
  { nome: 'Olinda', estado: 'Pernambuco', sigla: 'PE', latitude: -8.0014, longitude: -34.8553 },
  { nome: 'Cariacica', estado: 'Espírito Santo', sigla: 'ES', latitude: -20.2634, longitude: -40.4165 },
  { nome: 'Bauru', estado: 'São Paulo', sigla: 'SP', latitude: -22.3145, longitude: -49.0607 },
  { nome: 'Anápolis', estado: 'Goiás', sigla: 'GO', latitude: -16.3286, longitude: -48.9534 },
  { nome: 'Caucaia', estado: 'Ceará', sigla: 'CE', latitude: -3.7327, longitude: -38.6615 },
  { nome: 'Vitória', estado: 'Espírito Santo', sigla: 'ES', latitude: -20.3155, longitude: -40.3128 },
  { nome: 'Caruaru', estado: 'Pernambuco', sigla: 'PE', latitude: -8.2842, longitude: -35.9699 },
  { nome: 'Blumenau', estado: 'Santa Catarina', sigla: 'SC', latitude: -26.9194, longitude: -49.0661 },
  { nome: 'Franca', estado: 'São Paulo', sigla: 'SP', latitude: -20.5353, longitude: -47.4039 },
  { nome: 'Ponta Grossa', estado: 'Paraná', sigla: 'PR', latitude: -25.0916, longitude: -50.1668 },
  { nome: 'Petrolina', estado: 'Pernambuco', sigla: 'PE', latitude: -9.3887, longitude: -40.5027 },
  { nome: 'Canoas', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.9178, longitude: -51.1836 },
  { nome: 'Piracicaba', estado: 'São Paulo', sigla: 'SP', latitude: -22.7253, longitude: -47.6493 },
  { nome: 'Uberaba', estado: 'Minas Gerais', sigla: 'MG', latitude: -19.7472, longitude: -47.9381 },
  { nome: 'Rio Branco', estado: 'Acre', sigla: 'AC', latitude: -9.9740, longitude: -67.8098 },
  { nome: 'Cascavel', estado: 'Paraná', sigla: 'PR', latitude: -24.9573, longitude: -53.4595 },
  { nome: 'Paulista', estado: 'Pernambuco', sigla: 'PE', latitude: -7.9340, longitude: -34.8684 },
  { nome: 'Vitória da Conquista', estado: 'Bahia', sigla: 'BA', latitude: -14.8661, longitude: -40.8394 },
  { nome: 'Guarujá', estado: 'São Paulo', sigla: 'SP', latitude: -23.9931, longitude: -46.2564 },
  { nome: 'Ribeirão das Neves', estado: 'Minas Gerais', sigla: 'MG', latitude: -19.7669, longitude: -44.0869 },
  { nome: 'Praia Grande', estado: 'São Paulo', sigla: 'SP', latitude: -24.0084, longitude: -46.4120 },
  { nome: 'Taubaté', estado: 'São Paulo', sigla: 'SP', latitude: -23.0264, longitude: -45.5555 },
  { nome: 'São Caetano do Sul', estado: 'São Paulo', sigla: 'SP', latitude: -23.6231, longitude: -46.5512 },
  { nome: 'Volta Redonda', estado: 'Rio de Janeiro', sigla: 'RJ', latitude: -22.5231, longitude: -44.1042 },
  { nome: 'Palmas', estado: 'Tocantins', sigla: 'TO', latitude: -10.1844, longitude: -48.3336 },
  { nome: 'Petrópolis', estado: 'Rio de Janeiro', sigla: 'RJ', latitude: -22.5050, longitude: -43.1786 },
  { nome: 'Barueri', estado: 'São Paulo', sigla: 'SP', latitude: -23.5107, longitude: -46.8760 },
  { nome: 'Várzea Grande', estado: 'Mato Grosso', sigla: 'MT', latitude: -15.6467, longitude: -56.1325 },
  { nome: 'Boa Vista', estado: 'Roraima', sigla: 'RR', latitude: 2.8235, longitude: -60.6758 },
  { nome: 'Foz do Iguaçu', estado: 'Paraná', sigla: 'PR', latitude: -25.5163, longitude: -54.5855 },
  { nome: 'Governador Valadares', estado: 'Minas Gerais', sigla: 'MG', latitude: -18.8546, longitude: -41.9555 },
  { nome: 'Rio Claro', estado: 'São Paulo', sigla: 'SP', latitude: -22.4105, longitude: -47.5604 },
  { nome: 'Araçatuba', estado: 'São Paulo', sigla: 'SP', latitude: -21.2083, longitude: -50.4328 },
  { nome: 'Santa Maria', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.6842, longitude: -53.8069 },
  { nome: 'Camaçari', estado: 'Bahia', sigla: 'BA', latitude: -12.6978, longitude: -38.3244 },
  { nome: 'Itaquaquecetuba', estado: 'São Paulo', sigla: 'SP', latitude: -23.4864, longitude: -46.3486 },
  { nome: 'Suzano', estado: 'São Paulo', sigla: 'SP', latitude: -23.5428, longitude: -46.3108 },
  { nome: 'Cachoeiro de Itapemirim', estado: 'Espírito Santo', sigla: 'ES', latitude: -20.8489, longitude: -41.1128 },
  { nome: 'São João de Meriti', estado: 'Rio de Janeiro', sigla: 'RJ', latitude: -22.8039, longitude: -43.3722 },
  { nome: 'Camaragibe', estado: 'Pernambuco', sigla: 'PE', latitude: -8.0230, longitude: -34.9781 },
  { nome: 'Mossoró', estado: 'Rio Grande do Norte', sigla: 'RN', latitude: -5.1875, longitude: -37.3442 },
  { nome: 'Magé', estado: 'Rio de Janeiro', sigla: 'RJ', latitude: -22.6528, longitude: -43.0406 },
  { nome: 'São Vicente', estado: 'São Paulo', sigla: 'SP', latitude: -23.9629, longitude: -46.3919 },
  { nome: 'Diadema', estado: 'São Paulo', sigla: 'SP', latitude: -23.6864, longitude: -46.6228 },
  { nome: 'Juazeiro do Norte', estado: 'Ceará', sigla: 'CE', latitude: -7.2133, longitude: -39.3153 },
  { nome: 'Cotia', estado: 'São Paulo', sigla: 'SP', latitude: -23.6022, longitude: -46.9192 },
  { nome: 'Americana', estado: 'São Paulo', sigla: 'SP', latitude: -22.7375, longitude: -47.3311 },
  { nome: 'Araraquara', estado: 'São Paulo', sigla: 'SP', latitude: -21.7944, longitude: -48.1756 },
  { nome: 'Itabuna', estado: 'Bahia', sigla: 'BA', latitude: -14.7874, longitude: -39.2781 },
  { nome: 'Horizontina', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -27.6258, longitude: -54.3078 },
  { nome: 'Santa Rosa', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -27.8708, longitude: -54.4814 },
  { nome: 'Três de Maio', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -27.7733, longitude: -54.2389 },
  { nome: 'Ijuí', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -28.3878, longitude: -53.9147 },
  { nome: 'Santa Cruz do Sul', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.7181, longitude: -52.4306 },
  { nome: 'Passo Fundo', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -28.2628, longitude: -52.4067 },
  { nome: 'Pelotas', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -31.7719, longitude: -52.3425 },
  { nome: 'Bagé', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -31.3308, longitude: -54.1069 },
  { nome: 'Erechim', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -27.6344, longitude: -52.2739 },
  { nome: 'Caxias do Sul', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.1680, longitude: -51.1794 },
  { nome: 'Bento Gonçalves', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.1714, longitude: -51.5192 },
  { nome: 'Novo Hamburgo', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.6864, longitude: -51.1306 },
  { nome: 'Gravataí', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.9444, longitude: -50.9919 },
  { nome: 'Viamão', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -30.0811, longitude: -51.0233 },
  { nome: 'Alvorada', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.9911, longitude: -51.0789 },
  { nome: 'Cachoeirinha', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.9508, longitude: -51.0939 },
  { nome: 'Guaíba', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -30.1139, longitude: -51.3250 },
  { nome: 'São Leopoldo', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.7603, longitude: -51.1472 },
  { nome: 'Esteio', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.8522, longitude: -51.1781 },
  { nome: 'Sapucaia do Sul', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.8381, longitude: -51.1458 },
  { nome: 'Canoas', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.9178, longitude: -51.1836 },
  { nome: 'São José do Norte', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -32.0150, longitude: -52.0428 },
  { nome: 'Rio Grande', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -32.0350, longitude: -52.0986 },
  { nome: 'Santana do Livramento', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -30.8778, longitude: -55.5392 },
  { nome: 'Uruguaiana', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.7547, longitude: -57.0878 },
  { nome: 'Alegrete', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.7831, longitude: -55.7919 },
  { nome: 'Rosário do Sul', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -30.2581, longitude: -55.0278 },
  { nome: 'São Gabriel', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -30.3367, longitude: -54.3203 },
  { nome: 'Caçapava do Sul', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -30.5147, longitude: -53.4847 },
  { nome: 'Jaguarão', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -32.5658, longitude: -53.3778 },
  { nome: 'Dom Pedrito', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -30.9831, longitude: -54.6736 },
  { nome: 'Santana do Livramento', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -30.8778, longitude: -55.5392 },
  { nome: 'São Borja', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -28.6611, longitude: -56.0036 },
  { nome: 'Itaqui', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.1311, longitude: -56.5511 },
  { nome: 'Maçambara', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.1447, longitude: -56.0678 },
  { nome: 'Uruguaiana', estado: 'Rio Grande do Sul', sigla: 'RS', latitude: -29.7547, longitude: -57.0878 },
];

/**
 * Busca coordenadas de uma cidade na base de dados local
 * @param nomeCidade Nome da cidade
 * @param estado Estado ou sigla
 * @returns Coordenadas da cidade ou null se não encontrada
 */
export function buscarCoordenadasLocal(
  nomeCidade: string,
  estado?: string
): CoordenadaCidade | null {
  const cidadeLimpa = nomeCidade.trim().toLowerCase();
  const estadoLimpo = estado?.replace(/,?\s*Brasil\s*/gi, '').trim().toLowerCase() || '';
  
  // Buscar exata
  let cidade = COORDENADAS_CIDADES_BRASIL.find(
    (c) =>
      c.nome.toLowerCase() === cidadeLimpa &&
      (estadoLimpo === '' || c.sigla.toLowerCase() === estadoLimpo || c.estado.toLowerCase() === estadoLimpo)
  );

  if (cidade) {
    return cidade;
  }

  // Buscar por nome parcial (case insensitive)
  cidade = COORDENADAS_CIDADES_BRASIL.find(
    (c) =>
      c.nome.toLowerCase().includes(cidadeLimpa) &&
      (estadoLimpo === '' || c.sigla.toLowerCase() === estadoLimpo || c.estado.toLowerCase().includes(estadoLimpo))
  );

  if (cidade) {
    return cidade;
  }

  // Buscar apenas por nome (sem estado)
  cidade = COORDENADAS_CIDADES_BRASIL.find(
    (c) => c.nome.toLowerCase() === cidadeLimpa
  );

  return cidade || null;
}

