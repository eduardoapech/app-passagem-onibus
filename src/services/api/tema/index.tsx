import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'react-native';
import { Platform } from 'react-native';

const TEMA_KEY = '@passagem_onibus:tema';

export type TemaPreferencia = 'LIGHT' | 'DARK' | 'AUTO';

export const TemaService = {
  async obterTema(): Promise<TemaPreferencia> {
    try {
      const tema = await AsyncStorage.getItem(TEMA_KEY);
      return (tema as TemaPreferencia) || 'AUTO';
    } catch (error) {
      console.error('Erro ao obter tema:', error);
      return 'AUTO';
    }
  },

  async salvarTema(tema: TemaPreferencia, systemColorScheme?: 'light' | 'dark' | null): Promise<void> {
    try {
      await AsyncStorage.setItem(TEMA_KEY, tema);
      await this.aplicarTema(tema, systemColorScheme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      throw error;
    }
  },

  async aplicarTema(tema: TemaPreferencia, systemColorScheme?: 'light' | 'dark' | null): Promise<void> {
    try {
      let temaAplicado: 'light' | 'dark' = 'light';

      if (tema === 'AUTO') {
        // Usar o tema do sistema
        temaAplicado = systemColorScheme === 'dark' ? 'dark' : 'light';
      } else {
        temaAplicado = tema === 'DARK' ? 'dark' : 'light';
      }

      // Aplicar no StatusBar (React Native)
      if (Platform.OS === 'ios') {
        StatusBar.setBarStyle(temaAplicado === 'dark' ? 'light-content' : 'dark-content', true);
      }

      // Aplicar na NavigationBar (Android)
      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync(
          temaAplicado === 'dark' ? '#1F2937' : '#FFFFFF'
        );
        await NavigationBar.setButtonStyleAsync(
          temaAplicado === 'dark' ? 'light' : 'dark'
        );
      }
    } catch (error) {
      console.error('Erro ao aplicar tema:', error);
    }
  },

  async inicializarTema(systemColorScheme?: 'light' | 'dark' | null): Promise<void> {
    try {
      const tema = await this.obterTema();
      await this.aplicarTema(tema, systemColorScheme);
    } catch (error) {
      console.error('Erro ao inicializar tema:', error);
    }
  },
};

