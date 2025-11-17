import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { CardPassagem } from '@/src/components/CardPassagem';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PassagemService } from '@/src/services/api/passagens';
import { PassagemResumo, BuscaPassagem, Cidade } from '@/src/interfaces/passagem';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

export const ResultadosScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const [passagensOriginais, setPassagensOriginais] = useState<PassagemResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroPreco, setFiltroPreco] = useState<'menor' | 'maior'>('menor');
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const hasSearchedRef = useRef(false);
  const currentSearchKeyRef = useRef<string>('');

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  // Criar uma chave única dos parâmetros
  const searchKey = useMemo(() => {
    const origem = params.origem?.toString() || '';
    const destino = params.destino?.toString() || '';
    const dataIda = params.dataIda?.toString() || '';
    const passageiros = params.passageiros?.toString() || '1';
    return `${origem}|${destino}|${dataIda}|${passageiros}`;
  }, [params.origem, params.destino, params.dataIda, params.passageiros]);

  // Buscar passagens apenas uma vez quando os parâmetros mudarem
  useEffect(() => {
    // Evitar execuções duplicadas
    if (currentSearchKeyRef.current === searchKey && hasSearchedRef.current) {
      return;
    }

    // Evitar busca se não houver parâmetros necessários
    if (!params.origem || !params.destino) {
      if (!hasSearchedRef.current) {
        setLoading(false);
      }
      return;
    }

    // Marcar que vamos buscar
    currentSearchKeyRef.current = searchKey;
    hasSearchedRef.current = true;
    let isCancelled = false;

    const buscarPassagens = async () => {
      try {
        setLoading(true);
        
        // Parse das cidades dos parâmetros
        let origem: Cidade | null = null;
        let destino: Cidade | null = null;
        
        try {
          origem = params.origem ? JSON.parse(params.origem as string) : null;
          destino = params.destino ? JSON.parse(params.destino as string) : null;
        } catch (e) {
          console.error('Erro ao parsear cidades:', e);
          if (!isCancelled) {
            setPassagensOriginais([]);
            setLoading(false);
          }
          return;
        }
        
        if (isCancelled || !origem || !destino) {
          if (!isCancelled) {
            setPassagensOriginais([]);
            setLoading(false);
          }
          return;
        }
        
        const busca: BuscaPassagem = {
          origem,
          destino,
          dataIda: params.dataIda ? new Date(params.dataIda as string) : null,
          dataVolta: params.dataVolta ? new Date(params.dataVolta as string) : null,
          tipoViagem: (params.tipoViagem as 'IDA' | 'IDA_VOLTA') || 'IDA',
          passageiros: parseInt(params.passageiros as string) || 1,
        };

        const resultado = await PassagemService.buscarPassagens(busca);
        
        // Verificar se a busca ainda é válida
        if (!isCancelled && currentSearchKeyRef.current === searchKey) {
          setPassagensOriginais(resultado || []);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao buscar passagens:', error);
        if (!isCancelled && currentSearchKeyRef.current === searchKey) {
          setPassagensOriginais([]);
          setLoading(false);
        }
      }
    };

    buscarPassagens();

    return () => {
      isCancelled = true;
    };
  }, [searchKey, params.origem, params.destino, params.dataIda, params.dataVolta, params.tipoViagem, params.passageiros]);

  // Ordenar passagens usando useMemo (evita loops)
  const passagens = useMemo(() => {
    if (!passagensOriginais || passagensOriginais.length === 0) {
      return [];
    }

    // Verificar se a data pesquisada é hoje para filtrar horários passados
    const dataIdaParam = params.dataIda ? new Date(params.dataIda as string) : null;
    const agora = new Date();
    const isMesmoDia =
      !!dataIdaParam &&
      dataIdaParam.getFullYear() === agora.getFullYear() &&
      dataIdaParam.getMonth() === agora.getMonth() &&
      dataIdaParam.getDate() === agora.getDate();

    // Filtrar horários passados se a busca for para hoje
    const filtradas = isMesmoDia
      ? passagensOriginais.filter((p) => {
          // Espera formato HH:mm
          const [hhStr, mmStr] = (p.horarioPartida || '').split(':');
          const hh = Number(hhStr);
          const mm = Number(mmStr);
          if (Number.isNaN(hh) || Number.isNaN(mm)) {
            // Se não conseguir parsear, mantém o item para não esconder indevidamente
            return true;
          }
          const partidaHoje = new Date(
            agora.getFullYear(),
            agora.getMonth(),
            agora.getDate(),
            hh,
            mm,
            0,
            0
          );
          return partidaHoje.getTime() > agora.getTime();
        })
      : [...passagensOriginais];

    // Criar cópia e ordenar por preço
    const ordenadas = [...filtradas];
    ordenadas.sort((a, b) => {
      const precoA = typeof a.preco === 'number' ? a.preco : parseFloat(String(a.preco));
      const precoB = typeof b.preco === 'number' ? b.preco : parseFloat(String(b.preco));
      return filtroPreco === 'menor' ? precoA - precoB : precoB - precoA;
    });
    
    return ordenadas;
  }, [passagensOriginais, filtroPreco, params.dataIda]);

  const handlePassagemPress = useCallback((passagem: PassagemResumo) => {
    // Evitar navegação múltipla
    if (!passagem || !passagem.id) {
      return;
    }
    
    // Passar origem e destino para que os detalhes exibam as cidades corretas
    const origemParam = params.origem as string;
    const destinoParam = params.destino as string;
    
    // Passar informações da passagem resumo para os detalhes
    const passagemInfo = {
      companhia: passagem.companhia,
      companhiaId: passagem.companhiaId || '',
      horarioPartida: passagem.horarioPartida,
      horarioChegada: passagem.horarioChegada,
      duracao: passagem.duracao,
      preco: passagem.preco,
      tipoAssento: passagem.tipoAssento,
      assentosDisponiveis: passagem.assentosDisponiveis,
    };
    
    router.push({
      pathname: '/DetalhesPassagem',
      params: {
        passagemId: String(passagem.id),
        passageiros: (params.passageiros as string) || '1',
        origem: origemParam || '',
        destino: destinoParam || '',
        passagemInfo: JSON.stringify(passagemInfo),
        tipoViagem: (params.tipoViagem as string) || 'IDA',
        dataIda: (params.dataIda as string) || '',
        dataVolta: (params.dataVolta as string) || '',
      }
    } as any);
  }, [router, params.passageiros, params.origem, params.destino]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={cores.primary} />
        <Text style={styles.loadingText}>Buscando passagens...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-back" size={tamanhos.iconMd} color={cores.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Resultados</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filtros}>
        <Pressable
          style={[styles.filtroButton, filtroPreco === 'menor' && styles.filtroButtonActive]}
          onPress={() => setFiltroPreco('menor')}
        >
          <Text style={[styles.filtroText, filtroPreco === 'menor' && styles.filtroTextActive]}>
            Menor Preço
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filtroButton, filtroPreco === 'maior' && styles.filtroButtonActive]}
          onPress={() => setFiltroPreco('maior')}
        >
          <Text style={[styles.filtroText, filtroPreco === 'maior' && styles.filtroTextActive]}>
            Maior Preço
          </Text>
        </Pressable>
      </View>

      {passagens.length > 0 && (
        <View style={styles.infoContainer}>
          <Icon name="info-outline" size={tamanhos.iconSm} color={cores.primary} />
          <Text style={styles.infoText}>
            Verificando passagens de todas as companhias disponíveis
          </Text>
        </View>
      )}

      {passagens.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Icon name="search-off" size={tamanhos.icon2xl + 16} color={cores.textTertiary} />
          <Text style={styles.emptyText}>Nenhuma passagem encontrada</Text>
          <Text style={styles.emptySubtext}>Tente ajustar os filtros ou datas</Text>
        </View>
      ) : (
        <FlatList
          data={passagens}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            // Parse das cidades dos parâmetros
            let origem: Cidade | null = null;
            let destino: Cidade | null = null;
            let dataPartida: Date | null = null;
            
            try {
              origem = params.origem ? JSON.parse(params.origem as string) : null;
              destino = params.destino ? JSON.parse(params.destino as string) : null;
              dataPartida = params.dataIda ? new Date(params.dataIda as string) : null;
            } catch (e) {
              console.error('Erro ao parsear dados:', e);
            }

            return (
              <CardPassagem 
                key={item.id}
                passagem={item} 
                onPress={() => handlePassagemPress(item)}
                dataPartida={dataPartida || undefined}
                origem={origem || undefined}
                destino={destino || undefined}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </View>
  );
};

function getStyles(cores: CoresType, tamanhos: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: cores.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: cores.background,
    },
    loadingText: {
      marginTop: tamanhos.spacingLg,
      fontSize: tamanhos.md,
      color: cores.textSecondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: tamanhos.spacingLg,
      paddingTop: 60,
      paddingBottom: tamanhos.spacingLg,
      backgroundColor: cores.header,
      borderBottomWidth: 1,
      borderBottomColor: cores.border,
    },
    headerTitle: {
      fontSize: tamanhos.xl,
      fontWeight: '700',
      color: cores.text,
    },
    filtros: {
      flexDirection: 'row',
      paddingHorizontal: tamanhos.spacingLg,
      paddingVertical: tamanhos.spacingLg,
      backgroundColor: cores.header,
      borderBottomWidth: 1,
      borderBottomColor: cores.border,
      gap: tamanhos.spacingMd,
    },
    filtroButton: {
      paddingHorizontal: tamanhos.spacingLg,
      paddingVertical: tamanhos.spacingSm,
      borderRadius: 8,
      backgroundColor: cores.backgroundCard,
    },
    filtroButtonActive: {
      backgroundColor: cores.primary,
    },
    filtroText: {
      fontSize: tamanhos.sm,
      fontWeight: '600',
      color: cores.textSecondary,
    },
    filtroTextActive: {
      color: '#FFFFFF',
    },
    listContent: {
      paddingVertical: tamanhos.spacingLg,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: tamanhos.spacingXl * 2,
    },
    emptyText: {
      fontSize: tamanhos.lg,
      fontWeight: '600',
      color: cores.text,
      marginTop: tamanhos.spacingLg,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      marginTop: tamanhos.spacingSm,
      textAlign: 'center',
    },
    infoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tamanhos.spacingSm,
      paddingHorizontal: tamanhos.spacingLg,
      paddingVertical: tamanhos.spacingMd,
      backgroundColor: cores.primaryLight,
      borderBottomWidth: 1,
      borderBottomColor: cores.border,
    },
    infoText: {
      fontSize: tamanhos.xs,
      color: cores.primary,
      flex: 1,
    },
  });
}
