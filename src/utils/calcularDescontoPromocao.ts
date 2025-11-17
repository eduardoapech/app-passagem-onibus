import { differenceInDays } from 'date-fns';

export interface DescontoPromocao {
  temDesconto: boolean;
  percentual: number;
  valorDesconto: number;
  diasAntecedencia: number;
}

/**
 * Calcula desconto de promoção (5% para compras com 10+ dias de antecedência)
 * @param dataPartida Data de partida da viagem
 * @param valorTotal Valor total da compra
 * @returns Objeto com informações do desconto
 */
export function calcularDescontoPromocao(
  dataPartida: Date | string | null | undefined,
  valorTotal: number
): DescontoPromocao {
  if (!dataPartida) {
    return { temDesconto: false, percentual: 0, valorDesconto: 0, diasAntecedencia: 0 };
  }

  const dataPartidaDate = dataPartida instanceof Date 
    ? dataPartida 
    : new Date(dataPartida);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  dataPartidaDate.setHours(0, 0, 0, 0);
  
  const diasAntecedencia = differenceInDays(dataPartidaDate, hoje);
  
  if (diasAntecedencia >= 10) {
    const percentual = 5; // 5% de desconto
    const valorDesconto = (valorTotal * percentual) / 100;
    return {
      temDesconto: true,
      percentual,
      valorDesconto,
      diasAntecedencia
    };
  }
  
  return { temDesconto: false, percentual: 0, valorDesconto: 0, diasAntecedencia };
}

