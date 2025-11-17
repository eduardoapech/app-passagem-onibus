import { MinhaViagem } from '@/src/interfaces/usuario';
import { ViagemDatabaseService } from '@/src/services/database/viagens';
import { AuthService } from '../storage';

export const ViagemService = {
  obterMinhasViagens: async (): Promise<MinhaViagem[]> => {
    const usuario = await AuthService.getUser();
    return await ViagemDatabaseService.obterMinhasViagens(usuario?.id);
  },

  obterViagemPorId: async (viagemId: string): Promise<MinhaViagem> => {
    const usuario = await AuthService.getUser();
    const viagens = await ViagemDatabaseService.obterMinhasViagens(usuario?.id);
    const viagem = viagens.find(v => v.id === viagemId);
    if (!viagem) {
      throw new Error('Viagem não encontrada');
    }
    return viagem;
  },

  cancelarViagem: async (viagemId: string): Promise<void> => {
    return await ViagemDatabaseService.cancelarViagem(viagemId);
  },

  obterQRCode: async (viagemId: string): Promise<string> => {
    return await ViagemDatabaseService.obterQRCode(viagemId);
  },

  marcarViagemComoUtilizada: async (codigoReserva: string): Promise<{ sucesso: boolean; mensagem: string }> => {
    return await ViagemDatabaseService.marcarViagemComoUtilizada(codigoReserva);
  },

  moverViagemParaHistorico: async (viagemId: string): Promise<void> => {
    return await ViagemDatabaseService.moverViagemParaHistorico(viagemId);
  },

  obterHistoricoViagens: async (): Promise<MinhaViagem[]> => {
    const usuario = await AuthService.getUser();
    return await ViagemDatabaseService.obterHistoricoViagens(usuario?.id);
  },

  criarViagem: async (reservaId: string, dataViagem?: Date, horarioPartida?: string, passagem?: any, tipoViagem?: 'IDA' | 'VOLTA'): Promise<MinhaViagem> => {
    const usuario = await AuthService.getUser();
    return await ViagemDatabaseService.criarViagem(reservaId, usuario?.id || '', dataViagem, horarioPartida, passagem, tipoViagem);
  }
};
