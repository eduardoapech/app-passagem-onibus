import { RotaService } from '@/src/services/api/rotas';
import { Cidade } from '@/src/interfaces/passagem';

/**
 * Calcula a distância entre duas coordenadas
 * Tenta usar API de rotas primeiro, com fallback para Haversine
 * @param lat1 Latitude de origem
 * @param lon1 Longitude de origem
 * @param lat2 Latitude de destino
 * @param lon2 Longitude de destino
 * @param usarApi Se true, tenta usar API de rotas (padrão: true)
 * @returns Distância em quilômetros
 */
export async function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  usarApi: boolean = true
): Promise<number> {
  // Tentar usar API de rotas se habilitado
  if (usarApi) {
    try {
      const rota = await RotaService.calcularRotaPorCoordenadas(lat1, lon1, lat2, lon2);
      return rota.distanciaKm;
    } catch (error) {
      console.warn('Erro ao calcular distância com API, usando Haversine:', error);
      // Continuar para cálculo Haversine
    }
  }

  // Fallback: usar fórmula de Haversine
  return calcularDistanciaHaversine(lat1, lon1, lat2, lon2);
}

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine (fallback)
 * Retorna a distância em quilômetros
 */
export function calcularDistanciaHaversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;
  
  return Math.round(distancia * 10) / 10; // Arredonda para 1 casa decimal
}

/**
 * Converte graus para radianos
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calcula o tempo estimado de viagem em ônibus
 * Tenta usar API de rotas primeiro, com fallback para cálculo estimado
 * @param lat1 Latitude de origem
 * @param lon1 Longitude de origem
 * @param lat2 Latitude de destino
 * @param lon2 Longitude de destino
 * @param usarApi Se true, tenta usar API de rotas (padrão: true)
 * @returns Tempo de viagem em horas e minutos
 */
export async function calcularTempoViagem(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  usarApi: boolean = true
): Promise<{
  horas: number;
  minutos: number;
  totalMinutos: number;
}> {
  // Tentar usar API de rotas se habilitado
  if (usarApi) {
    try {
      const rota = await RotaService.calcularRotaPorCoordenadas(lat1, lon1, lat2, lon2);
      return {
        horas: rota.tempoHoras,
        minutos: rota.tempoMinutos,
        totalMinutos: rota.tempoTotalMinutos,
      };
    } catch (error) {
      console.warn('Erro ao calcular tempo com API, usando cálculo estimado:', error);
      // Continuar para cálculo estimado
    }
  }

  // Fallback: calcular tempo baseado em distância
  const distancia = calcularDistanciaHaversine(lat1, lon1, lat2, lon2);
  return calcularTempoViagemPorDistancia(distancia);
}

/**
 * Calcula velocidade média do ônibus baseado na distância
 * @param distanciaKm Distância em quilômetros
 * @returns Velocidade média em km/h (entre 80-100 km/h)
 */
function calcularVelocidadeOnibus(distanciaKm: number): number {
  // Velocidade varia conforme distância e tipo de estrada
  if (distanciaKm < 50) {
    // Rotas curtas (urbanas): 60-70 km/h (considera trânsito urbano)
    return 65;
  } else if (distanciaKm < 100) {
    // Rotas médias (mistas): 75-85 km/h
    return 80;
  } else if (distanciaKm < 300) {
    // Rotas longas (rodovias): 85-95 km/h
    return 90;
  } else {
    // Rotas muito longas (rodovias principais): 90-100 km/h
    return 95;
  }
}

/**
 * Calcula tempo de paradas intermediárias
 * Ônibus fazem paradas para embarque/desembarque
 * @param distanciaKm Distância em quilômetros
 * @returns Tempo adicional em minutos
 */
function calcularTempoParadas(distanciaKm: number): number {
  // Paradas intermediárias: 5-10 minutos a cada 100km
  const paradas = Math.floor(distanciaKm / 100);
  // Mínimo de 5 minutos, máximo de 30 minutos
  return Math.min(Math.max(paradas * 7, 5), 30);
}

/**
 * Calcula o tempo estimado de viagem baseado na distância
 * Considera velocidade de ônibus (80-100 km/h) e paradas intermediárias
 * @param distanciaKm Distância em quilômetros (já deve ser distância rodoviária)
 * @returns Tempo de viagem em horas e minutos
 */
export function calcularTempoViagemPorDistancia(distanciaKm: number): {
  horas: number;
  minutos: number;
  totalMinutos: number;
} {
  // Calcular velocidade média do ônibus baseado na distância
  const velocidadeOnibus = calcularVelocidadeOnibus(distanciaKm);
  
  // Calcular tempo baseado na distância e velocidade de ônibus
  const tempoHorasCalculado = distanciaKm / velocidadeOnibus;
  
  // Adicionar tempo de paradas intermediárias
  const tempoParadas = calcularTempoParadas(distanciaKm);
  const tempoTotalMinutos = Math.round(tempoHorasCalculado * 60 + tempoParadas);
  
  const horas = Math.floor(tempoTotalMinutos / 60);
  const minutos = tempoTotalMinutos % 60;

  return {
    horas,
    minutos,
    totalMinutos: tempoTotalMinutos,
  };
}

/**
 * Calcula rota completa entre duas cidades
 * Usa API de rotas para obter distância e tempo precisos
 * @param origem Cidade de origem
 * @param destino Cidade de destino
 * @returns Informações completas da rota
 */
export async function calcularRotaCompleta(
  origem: Cidade,
  destino: Cidade
): Promise<{
  distanciaKm: number;
  tempoHoras: number;
  tempoMinutos: number;
  tempoTotalMinutos: number;
  distanciaEmRota: boolean;
  provider: string;
}> {
  if (!origem.latitude || !origem.longitude || !destino.latitude || !destino.longitude) {
    throw new Error('Cidades devem ter coordenadas para calcular rota');
  }

  return await RotaService.calcularRota(origem, destino);
}

/**
 * Formata o tempo de viagem para exibição
 */
export function formatarTempoViagem(horas: number, minutos: number): string {
  if (horas === 0) {
    return `${minutos}min`;
  }
  if (minutos === 0) {
    return `${horas}h`;
  }
  return `${horas}h${minutos}min`;
}

