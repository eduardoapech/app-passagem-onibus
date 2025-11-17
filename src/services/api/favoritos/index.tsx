import AsyncStorage from '@react-native-async-storage/async-storage';
import { PassagemResumo } from '@/src/interfaces/passagem';

const FAVORITOS_KEY = '@passagem_onibus:favoritos';

export interface FavoritoPassagem extends PassagemResumo {
  dataPartida?: string; // Data de partida em formato string para armazenar
  origem?: { nome: string; estado: string };
  destino?: { nome: string; estado: string };
  dataAdicionado: string;
}

export const FavoritosService = {
  async obterFavoritos(): Promise<FavoritoPassagem[]> {
    try {
      const favoritosJson = await AsyncStorage.getItem(FAVORITOS_KEY);
      if (!favoritosJson) return [];
      return JSON.parse(favoritosJson);
    } catch (error) {
      console.error('Erro ao obter favoritos:', error);
      return [];
    }
  },

  async adicionarFavorito(passagem: PassagemResumo, dataPartida?: Date, origem?: any, destino?: any): Promise<void> {
    try {
      const favoritos = await this.obterFavoritos();
      
      // Verificar se já existe
      const existe = favoritos.find(f => f.id === passagem.id);
      if (existe) {
        return; // Já está nos favoritos
      }

      const favorito: FavoritoPassagem = {
        ...passagem,
        dataPartida: dataPartida ? dataPartida.toISOString() : undefined,
        origem: origem ? { nome: origem.nome, estado: origem.estado } : undefined,
        destino: destino ? { nome: destino.nome, estado: destino.estado } : undefined,
        dataAdicionado: new Date().toISOString(),
      };

      favoritos.push(favorito);
      await AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos));
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      throw error;
    }
  },

  async removerFavorito(passagemId: string): Promise<void> {
    try {
      const favoritos = await this.obterFavoritos();
      const favoritosFiltrados = favoritos.filter(f => f.id !== passagemId);
      await AsyncStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritosFiltrados));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      throw error;
    }
  },

  async isFavorito(passagemId: string): Promise<boolean> {
    try {
      const favoritos = await this.obterFavoritos();
      return favoritos.some(f => f.id === passagemId);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }
  },
};

