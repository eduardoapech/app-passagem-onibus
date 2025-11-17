import { Reserva, Pagamento, MetodoPagamento, DadosPagamento, Passageiro } from '@/src/interfaces/pagamento';
import { PagamentoDatabaseService } from '@/src/services/database/pagamento';

export const PagamentoService = {
  criarReserva: async (
    passagemId: string,
    poltronas: number[],
    passageiros: Passageiro[],
    valorTotal?: number,
    usuarioId?: string,
    passagemCompleta?: any
  ): Promise<Reserva> => {
    return await PagamentoDatabaseService.criarReserva(passagemId, poltronas, passageiros, valorTotal, usuarioId, passagemCompleta);
  },

  processarPagamento: async (
    reservaId: string,
    metodoPagamento: MetodoPagamento,
    dadosPagamento: DadosPagamento
  ): Promise<Pagamento> => {
    return await PagamentoDatabaseService.processarPagamento(reservaId, metodoPagamento, dadosPagamento);
  },

  listarReservas: async (): Promise<Reserva[]> => {
    return await PagamentoDatabaseService.listarReservas();
  },

  obterReserva: async (reservaId: string): Promise<Reserva> => {
    const reservas = await PagamentoDatabaseService.listarReservas();
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) {
      throw new Error('Reserva não encontrada');
    }
    return reserva;
  },

  cancelarReserva: async (reservaId: string): Promise<void> => {
    return await PagamentoDatabaseService.cancelarReserva(reservaId);
  },
};

