import { useState, useEffect } from 'react';

export const useApi = <T>(
  serviceCall: () => Promise<T>, 
  initialData: T | null = null,
  deps: any[] = []
) => {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const buscarDados = async () => {
      try {
        setLoading(true);
        const resultado = await serviceCall();
        
        // Só atualiza se o componente ainda estiver montado
        if (mounted) {
          setData(resultado);
        }
      } catch (error) {
        console.error('Erro:', error);
        if (mounted) {
          setData(initialData);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    buscarDados();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [serviceCall, initialData, ...deps]);

  return { data, loading };
};

