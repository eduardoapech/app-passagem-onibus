import { TipoAssento } from '@/src/interfaces/passagem';

/**
 * Calcula o preço base de uma passagem baseado na distância
 * @param distanciaKm Distância em quilômetros
 * @param tipoAssento Tipo de assento
 * @returns Preço base calculado
 */
export function calcularPrecoBase(distanciaKm: number, tipoAssento: TipoAssento): number {
  // Preço por km varia conforme o tipo de assento
  const precosPorKm: Record<TipoAssento, number> = {
    CONVENCIONAL: 0.25, // R$ 0,25 por km
    SEMI_LEITO: 0.35,   // R$ 0,35 por km
    LEITO: 0.50,        // R$ 0,50 por km
    EXECUTIVO: 0.45,    // R$ 0,45 por km
    SUITE: 0.65,        // R$ 0,65 por km
  };

  const precoPorKm = precosPorKm[tipoAssento] || 0.30;
  const precoBase = distanciaKm * precoPorKm;

  // Preço mínimo de R$ 15,00
  return Math.max(precoBase, 15.00);
}

/**
 * Calcula preços variados para diferentes companhias na mesma rota
 * Adiciona variação de ±15% no preço base
 * @param precoBase Preço base calculado
 * @param variacao Percentual de variação (padrão: 15%)
 * @returns Preços variados
 */
export function calcularPrecosVariados(precoBase: number, variacao: number = 15): number[] {
  const variacoes = [-variacao, -variacao / 2, 0, variacao / 2, variacao];
  return variacoes.map((v) => {
    const preco = precoBase * (1 + v / 100);
    return Math.round(preco * 100) / 100; // Arredondar para 2 casas decimais
  });
}

/**
 * Gera horários de partida variados para diferentes passagens
 * @param baseHorario Horário base (formato HH:mm)
 * @param quantidade Quantidade de horários a gerar
 * @returns Array de horários
 */
export function gerarHorariosVariados(baseHorario: string, quantidade: number): string[] {
  const [horas, minutos] = baseHorario.split(':').map(Number);
  const horarios: string[] = [];

  for (let i = 0; i < quantidade; i++) {
    const horasAdicionar = i * 2; // Intervalo de 2 horas entre horários
    const novaHora = (horas + horasAdicionar) % 24;
    const horarioFormatado = `${novaHora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    horarios.push(horarioFormatado);
  }

  return horarios;
}

/**
 * Calcula horário de chegada baseado no horário de partida e duração
 * @param horarioPartida Horário de partida (formato HH:mm)
 * @param duracaoHoras Horas de duração
 * @param duracaoMinutos Minutos de duração
 * @returns Horário de chegada (formato HH:mm)
 */
export function calcularHorarioChegada(
  horarioPartida: string,
  duracaoHoras: number,
  duracaoMinutos: number
): string {
  const [horas, minutos] = horarioPartida.split(':').map(Number);
  const totalMinutos = horas * 60 + minutos + duracaoHoras * 60 + duracaoMinutos;
  const novaHora = Math.floor(totalMinutos / 60) % 24;
  const novoMinuto = totalMinutos % 60;
  return `${novaHora.toString().padStart(2, '0')}:${novoMinuto.toString().padStart(2, '0')}`;
}

/**
 * Formata duração para exibição
 * @param horas Horas
 * @param minutos Minutos
 * @returns Duração formatada (ex: "6h30min")
 */
export function formatarDuracao(horas: number, minutos: number): string {
  if (horas === 0) {
    return `${minutos}min`;
  }
  if (minutos === 0) {
    return `${horas}h`;
  }
  return `${horas}h${minutos}min`;
}

/**
 * Determina tipo de assento baseado na distância
 * @param distanciaKm Distância em quilômetros
 * @returns Tipo de assento recomendado
 */
export function determinarTipoAssentoPorDistancia(distanciaKm: number): TipoAssento {
  if (distanciaKm < 100) {
    return TipoAssento.CONVENCIONAL;
  } else if (distanciaKm < 300) {
    return TipoAssento.SEMI_LEITO;
  } else if (distanciaKm < 600) {
    return TipoAssento.LEITO;
  } else {
    return TipoAssento.EXECUTIVO;
  }
}

/**
 * Calcula número de assentos disponíveis baseado na distância e tipo de assento
 * @param distanciaKm Distância em quilômetros
 * @param tipoAssento Tipo de assento
 * @returns Número de assentos disponíveis
 */
export function calcularAssentosDisponiveis(distanciaKm: number, tipoAssento: TipoAssento): number {
  // Assentos executivos e leito têm menos poltronas
  const baseAssentos: Record<TipoAssento, number> = {
    CONVENCIONAL: 44,
    SEMI_LEITO: 40,
    LEITO: 30,
    EXECUTIVO: 28,
    SUITE: 24,
  };

  const base = baseAssentos[tipoAssento] || 40;
  // Variação de ±5 assentos
  const variacao = Math.floor(Math.random() * 10) - 5;
  return Math.max(20, Math.min(base + variacao, 45));
}

