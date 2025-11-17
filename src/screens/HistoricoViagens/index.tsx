import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ViagemService } from '@/src/services/api/viagens';
import { MinhaViagem } from '@/src/interfaces/usuario';
import Icon from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

export const HistoricoViagensScreen = () => {
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const [viagens, setViagens] = useState<MinhaViagem[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  const carregarHistorico = useCallback(async () => {
    try {
      setLoading(true);
      const resultado = await ViagemService.obterHistoricoViagens();
      console.log('Histórico de viagens carregado:', resultado.length);
      setViagens(resultado);
    } catch (error) {
      console.error('Erro ao carregar histórico de viagens:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [carregarHistorico])
  );

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico de Viagens</Text>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Carregando...</Text>
        </View>
      ) : viagens.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="history" size={tamanhos.icon2xl + 16} color={cores.textTertiary} />
          <Text style={styles.emptyText}>Nenhuma viagem no histórico</Text>
          <Text style={styles.emptySubtext}>
            Viagens utilizadas aparecerão aqui
          </Text>
        </View>
      ) : (
        <FlatList
          data={viagens}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.viagemCard}>
              <View style={styles.viagemHeader}>
                <View style={{ flex: 1 }}>
                  {item.tipoViagem && (
                    <View style={styles.tipoViagemBadge}>
                      <Text style={styles.tipoViagemText}>
                        {item.tipoViagem === 'IDA' ? 'Ida' : 'Volta'}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.viagemRota}>
                    {item.passagem.origem.nome} → {item.passagem.destino.nome}
                  </Text>
                  <Text style={styles.viagemData}>
                    {format(new Date(item.dataViagem), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cores.textSecondary + '20' }]}>
                  <Text style={[styles.statusText, { color: cores.textSecondary }]}>
                    Utilizada
                  </Text>
                </View>
              </View>

              <View style={styles.viagemInfo}>
                <View style={styles.infoItem}>
                  <Icon name="schedule" size={tamanhos.iconSm} color={cores.textSecondary} />
                  <Text style={styles.infoText}>
                    {item.passagem.horarioPartida} - {item.passagem.horarioChegada}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="people" size={tamanhos.iconSm} color={cores.textSecondary} />
                  <Text style={styles.infoText}>{item.passageiros.length} passageiro(s)</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="attach-money" size={tamanhos.iconSm} color={cores.textSecondary} />
                  <Text style={styles.infoText}>{formatarPreco(item.passagem.preco * item.passageiros.length)}</Text>
                </View>
              </View>

              <View style={styles.viagemFooter}>
                <Text style={styles.codigoReserva}>Código: {item.codigoReserva}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    header: {
      paddingHorizontal: tamanhos.spacingLg,
      paddingTop: 60,
      paddingBottom: tamanhos.spacingLg,
      backgroundColor: cores.header,
      borderBottomWidth: 1,
      borderBottomColor: cores.border,
    },
    headerTitle: {
      fontSize: tamanhos['4xl'],
      fontWeight: '700',
      color: cores.text,
    },
    listContent: {
      padding: tamanhos.spacingLg,
    },
    viagemCard: {
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      marginBottom: tamanhos.spacingMd,
      shadowColor: cores.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: cores.border,
    },
    viagemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: tamanhos.spacingMd,
    },
    tipoViagemBadge: {
      alignSelf: 'flex-start',
      backgroundColor: cores.primary,
      paddingHorizontal: tamanhos.spacingSm,
      paddingVertical: tamanhos.spacingXs,
      borderRadius: 4,
      marginBottom: tamanhos.spacingXs,
    },
    tipoViagemText: {
      fontSize: tamanhos.xs,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    viagemRota: {
      fontSize: tamanhos.lg,
      fontWeight: '700',
      color: cores.text,
      marginBottom: tamanhos.spacingXs,
    },
    viagemData: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
    },
    statusBadge: {
      paddingHorizontal: tamanhos.spacingMd,
      paddingVertical: tamanhos.spacingSm - 2,
      borderRadius: 8,
    },
    statusText: {
      fontSize: tamanhos.xs,
      fontWeight: '600',
    },
    viagemInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tamanhos.spacingLg,
      marginTop: tamanhos.spacingMd,
      paddingTop: tamanhos.spacingMd,
      borderTopWidth: 1,
      borderTopColor: cores.border,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tamanhos.spacingSm - 2,
    },
    infoText: {
      fontSize: tamanhos.base,
      color: cores.textSecondary,
    },
    viagemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: tamanhos.spacingMd,
      paddingTop: tamanhos.spacingMd,
      borderTopWidth: 1,
      borderTopColor: cores.border,
    },
    codigoReserva: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
      fontWeight: '500',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: tamanhos.spacingXl * 2,
    },
    emptyText: {
      marginTop: tamanhos.spacingLg,
      fontSize: tamanhos.lg,
      fontWeight: '600',
      color: cores.text,
      textAlign: 'center',
    },
    emptySubtext: {
      marginTop: tamanhos.spacingSm,
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      textAlign: 'center',
    },
  });
}

