import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ViagemService } from '@/src/services/api/viagens';
import { MinhaViagem } from '@/src/interfaces/usuario';
import Icon from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCallback } from 'react';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

export const MinhasViagensScreen = () => {
  const router = useRouter();
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const [viagens, setViagens] = useState<MinhaViagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'confirmadas' | 'canceladas'>('todas');

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  const carregarViagens = useCallback(async () => {
    try {
      setLoading(true);
      const resultado = await ViagemService.obterMinhasViagens();
      console.log('Viagens carregadas:', resultado.length);
      setViagens(resultado);
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarViagens();
    }, [carregarViagens])
  );

  const viagensFiltradas = viagens.filter(viagem => {
    if (filtro === 'todas') return true;
    if (filtro === 'confirmadas') return viagem.status === 'CONFIRMADA';
    if (filtro === 'canceladas') return viagem.status === 'CANCELADA';
    return true;
  });

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADA':
        return cores.success;
      case 'CANCELADA':
        return cores.error;
      case 'UTILIZADA':
        return cores.textSecondary;
      default:
        return cores.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'CANCELADA':
        return 'Cancelada';
      case 'UTILIZADA':
        return 'Utilizada';
      default:
        return status;
    }
  };

  const formatCidade = (cidade?: any) => {
    if (!cidade) return '';
    const nome = cidade.nome || '';
    const sigla = cidade.sigla || '';
    const estado = cidade.estado || '';
    const sufixo = sigla ? ` - ${sigla}` : estado ? ` - ${estado}` : '';
    return `${nome}${sufixo}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Viagens</Text>
        <Pressable
          style={styles.historicoButton}
          onPress={() => router.push('/(tabs)/HistoricoViagens' as any)}
        >
          <Icon name="history" size={tamanhos.iconMd} color={cores.primary} />
        </Pressable>
      </View>

      <View style={styles.filtros}>
        <Pressable
          style={[styles.filtroButton, filtro === 'todas' && styles.filtroButtonActive]}
          onPress={() => setFiltro('todas')}
        >
          <Text style={[styles.filtroText, filtro === 'todas' && styles.filtroTextActive]}>
            Todas
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filtroButton, filtro === 'confirmadas' && styles.filtroButtonActive]}
          onPress={() => setFiltro('confirmadas')}
        >
          <Text style={[styles.filtroText, filtro === 'confirmadas' && styles.filtroTextActive]}>
            Confirmadas
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filtroButton, filtro === 'canceladas' && styles.filtroButtonActive]}
          onPress={() => setFiltro('canceladas')}
        >
          <Text style={[styles.filtroText, filtro === 'canceladas' && styles.filtroTextActive]}>
            Canceladas
          </Text>
        </Pressable>
      </View>

      {viagensFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="card-travel" size={tamanhos.icon2xl + 16} color={cores.textTertiary} />
          <Text style={styles.emptyText}>Nenhuma viagem encontrada</Text>
        </View>
      ) : (
        <FlatList
          data={viagensFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.viagemCard}
              onPress={() => {
                if (item.status === 'CONFIRMADA') {
                  // Abrir tela de QR Code que será exibido por 5 segundos
                  router.push(`/ExibirQRCodeViagem?id=${item.id}` as any);
                } else {
                  // Para outras viagens, mostrar detalhes
                  router.push(`/DetalhesViagem?id=${item.id}` as any);
                }
              }}
            >
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
                    {formatCidade(item.passagem.origem)} → {formatCidade(item.passagem.destino)}
                  </Text>
                  <Text style={styles.viagemData}>
                    {format(new Date(item.dataViagem), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {getStatusLabel(item.status)}
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
                {item.status === 'CONFIRMADA' && (
                  <Pressable
                    style={styles.qrCodeButton}
                    onPress={() => router.push(`/QRCode?id=${item.id}` as any)}
                  >
                    <Icon name="qr-code" size={tamanhos.iconSm} color={cores.primary} />
                  </Pressable>
                )}
              </View>
            </Pressable>
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    historicoButton: {
      padding: tamanhos.spacingSm,
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
      backgroundColor: cores.background,
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
    },
    qrCodeButton: {
      padding: tamanhos.spacingXs,
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
  });
}

