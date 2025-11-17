import AsyncStorage from '@react-native-async-storage/async-storage';

const TAMANHO_FONTE_KEY = '@passagem_onibus:tamanho_fonte';

export type TamanhoFontePreferencia = 'SMALL' | 'MEDIUM' | 'LARGE';

export const TamanhoFonteService = {
  async obterTamanhoFonte(): Promise<TamanhoFontePreferencia> {
    try {
      const tamanho = await AsyncStorage.getItem(TAMANHO_FONTE_KEY);
      return (tamanho as TamanhoFontePreferencia) || 'MEDIUM';
    } catch (error) {
      console.error('Erro ao obter tamanho de fonte:', error);
      return 'MEDIUM';
    }
  },

  async salvarTamanhoFonte(tamanho: TamanhoFontePreferencia): Promise<void> {
    try {
      await AsyncStorage.setItem(TAMANHO_FONTE_KEY, tamanho);
    } catch (error) {
      console.error('Erro ao salvar tamanho de fonte:', error);
      throw error;
    }
  },
};

