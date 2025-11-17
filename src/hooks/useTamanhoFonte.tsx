import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { TamanhoFonteService, TamanhoFontePreferencia } from '@/src/services/api/tamanhoFonte';
import { TamanhosFonte, getTamanhosFonte } from '@/src/constants/fontSizes';

interface TamanhoFonteContextType {
  tamanhoFonte: TamanhoFontePreferencia;
  setTamanhoFonte: (tamanho: TamanhoFontePreferencia) => Promise<void>;
  isLoading: boolean;
  tamanhos: TamanhosFonte;
}

const TamanhoFonteContext = createContext<TamanhoFonteContextType | undefined>(undefined);

export function TamanhoFonteProvider({ children }: { children: ReactNode }) {
  const [tamanhoFonte, setTamanhoFonteState] = useState<TamanhoFontePreferencia>('MEDIUM');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarTamanhoFonte = async () => {
      try {
        const tamanho = await TamanhoFonteService.obterTamanhoFonte();
        setTamanhoFonteState(tamanho);
      } catch (error) {
        console.error('Erro ao carregar tamanho de fonte:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarTamanhoFonte();
  }, []);

  const setTamanhoFonte = async (novoTamanho: TamanhoFontePreferencia) => {
    try {
      await TamanhoFonteService.salvarTamanhoFonte(novoTamanho);
      setTamanhoFonteState(novoTamanho);
    } catch (error) {
      console.error('Erro ao definir tamanho de fonte:', error);
    }
  };

  const tamanhos = useMemo(() => getTamanhosFonte(tamanhoFonte), [tamanhoFonte]);

  return (
    <TamanhoFonteContext.Provider value={{ tamanhoFonte, setTamanhoFonte, isLoading, tamanhos }}>
      {children}
    </TamanhoFonteContext.Provider>
  );
}

export function useTamanhoFonte() {
  const context = useContext(TamanhoFonteContext);
  if (context === undefined) {
    throw new Error('useTamanhoFonte deve ser usado dentro de um TamanhoFonteProvider');
  }
  return context;
}

