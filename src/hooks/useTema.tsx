import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { TemaService, TemaPreferencia } from '@/src/services/api/tema';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { cores, CoresType } from '@/src/constants/colors';

interface TemaContextType {
  tema: TemaPreferencia;
  temaAtual: 'light' | 'dark';
  setTema: (tema: TemaPreferencia) => Promise<void>;
  isLoading: boolean;
  cores: CoresType;
}

const TemaContext = createContext<TemaContextType | undefined>(undefined);

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<TemaPreferencia>('AUTO');
  const [isLoading, setIsLoading] = useState(true);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    const carregarTema = async () => {
      try {
        const temaSalvo = await TemaService.obterTema();
        setTemaState(temaSalvo);
        await TemaService.aplicarTema(temaSalvo, systemColorScheme || undefined);
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarTema();
  }, []);

  // Atualizar tema quando o sistema mudar e o tema for AUTO
  useEffect(() => {
    if (!isLoading && tema === 'AUTO') {
      TemaService.aplicarTema(tema, systemColorScheme || undefined);
    }
  }, [systemColorScheme, tema, isLoading]);

  const setTema = async (novoTema: TemaPreferencia) => {
    try {
      await TemaService.salvarTema(novoTema, systemColorScheme || undefined);
      setTemaState(novoTema);
    } catch (error) {
      console.error('Erro ao definir tema:', error);
    }
  };

  // Determinar o tema atual baseado na preferência
  const temaAtual: 'light' | 'dark' = useMemo(() => 
    tema === 'AUTO' 
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : (tema === 'DARK' ? 'dark' : 'light'),
    [tema, systemColorScheme]
  );

  const coresAtuais = useMemo(() => cores[temaAtual], [temaAtual]);

  return (
    <TemaContext.Provider value={{ tema, temaAtual, setTema, isLoading, cores: coresAtuais }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const context = useContext(TemaContext);
  if (context === undefined) {
    throw new Error('useTema deve ser usado dentro de um TemaProvider');
  }
  return context;
}

