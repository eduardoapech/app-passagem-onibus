import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useRouter, useFocusEffect } from 'expo-router';
import { FavoritosService, FavoritoPassagem } from '@/src/services/api/favoritos';
import { calcularDescontoPromocao } from '@/src/utils/calcularDescontoPromocao';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

export default function FavoritosTab() {
  const router = useRouter();
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const [favoritos, setFavoritos] = useState<FavoritoPassagem[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  const carregarFavoritos = useCallback(async () => {
    try {
      setLoading(true);
      const lista = await FavoritosService.obterFavoritos();
      setFavoritos(lista);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarFavoritos();
    }, [carregarFavoritos])
  );

  const calcularDesconto = (passagem: FavoritoPassagem) => {
    return calcularDescontoPromocao(passagem.dataPartida, passagem.preco);
  };

  const handleRemoverFavorito = async (passagemId: string) => {
    Alert.alert(
      'Remover Favorito',
      'Deseja remover esta passagem dos favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await FavoritosService.removerFavorito(passagemId);
              await carregarFavoritos();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o favorito');
            }
          },
        },
      ]
    );
  };

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  const formatarTipoAssento = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      CONVENCIONAL: 'Convencional',
      SEMI_LEITO: 'Semi-leito',
      LEITO: 'Leito',
      EXECUTIVO: 'Executivo',
      SUITE: 'Suíte',
    };
    return tipos[tipo] || tipo;
  };

  const renderFavorito = ({ item }: { item: FavoritoPassagem }) => {
    const promocao = calcularDesconto(item);
    const precoComDesconto = promocao.temDesconto 
      ? item.preco - promocao.valorDesconto 
      : item.preco;

    return (
      <Pressable
        style={styles.favoritoCard}
        onPress={() => {
          // Navegar para detalhes da passagem
          router.push({
            pathname: '/DetalhesPassagem',
            params: {
              passagemId: item.id,
              passageiros: '1',
              origem: item.origem ? JSON.stringify(item.origem) : '',
              destino: item.destino ? JSON.stringify(item.destino) : '',
            },
          } as any);
        }}
      >
        {promocao.temDesconto && (
          <View style={styles.promocaoBadge}>
            <Icon name="local-offer" size={tamanhos.iconSm} color="#FFFFFF" />
            <Text style={styles.promocaoBadgeText}>
              {promocao.percentual}% OFF - {promocao.diasAntecedencia} dias
            </Text>
          </View>
        )}

        <View style={styles.favoritoHeader}>
          <Text style={styles.favoritoCompanhia} numberOfLines={1}>
            {item.companhia}
          </Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handleRemoverFavorito(item.id);
            }}
            style={styles.favoritoButton}
          >
            <Icon name="favorite" size={tamanhos.iconMd} color={cores.error} />
          </Pressable>
        </View>

        <View style={styles.favoritoHorarios}>
          <View style={styles.horarioItem}>
            <Text style={styles.horario}>{item.horarioPartida}</Text>
            <Text style={styles.horarioLabel}>Saída</Text>
          </View>

          <View style={styles.duracaoContainer}>
            <Icon name="schedule" size={tamanhos.iconXs} color="#6B7280" />
            <Text style={styles.duracao}>{item.duracao}</Text>
          </View>

          <View style={styles.horarioItem}>
            <Text style={styles.horario}>{item.horarioChegada}</Text>
            <Text style={styles.horarioLabel}>Chegada</Text>
          </View>
        </View>

        {item.origem && item.destino && (
          <View style={styles.favoritoRota}>
            <Text style={styles.rotaText} numberOfLines={1}>
              {item.origem.nome} → {item.destino.nome}
            </Text>
          </View>
        )}

        {item.dataPartida && (
          <View style={styles.favoritoData}>
            <Icon name="calendar-today" size={tamanhos.iconXs} color={cores.textSecondary} />
            <Text style={styles.dataText}>
              {format(new Date(item.dataPartida), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
            </Text>
          </View>
        )}

          <View style={styles.favoritoInfo}>
          <View style={styles.infoItem}>
            <Icon name="event-seat" size={tamanhos.iconXs} color={cores.primary} />
            <Text style={styles.infoText}>{formatarTipoAssento(item.tipoAssento)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="airline-seat-recline-normal" size={tamanhos.iconXs} color={cores.success} />
            <Text style={styles.infoText}>{item.assentosDisponiveis} disponíveis</Text>
          </View>
        </View>

        <View style={styles.favoritoPreco}>
          {promocao.temDesconto && (
            <View style={styles.precoOriginal}>
              <Text style={styles.precoOriginalText}>{formatarPreco(item.preco)}</Text>
            </View>
          )}
          <View style={styles.precoContainer}>
            <Text style={styles.precoLabel}>A partir de</Text>
            <Text style={[styles.precoValue, { color: cores.primary }]}>{formatarPreco(precoComDesconto)}</Text>
            {promocao.temDesconto && (
              <Text style={styles.precoDesconto}>
                Economize {formatarPreco(promocao.valorDesconto)}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favoritos</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="favorite" size={tamanhos.icon2xl + 16} color={cores.textTertiary} />
          <Text style={styles.emptyText}>Carregando favoritos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>
        {favoritos.length > 0 && (
          <Text style={styles.headerSubtitle}>{favoritos.length} passagem(ns) salva(s)</Text>
        )}
      </View>

      {favoritos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="favorite-border" size={tamanhos.icon2xl + 16} color={cores.textTertiary} />
          <Text style={styles.emptyText}>Nenhum favorito ainda</Text>
          <Text style={styles.emptySubtext}>Salve suas passagens favoritas aqui</Text>
          <Pressable
            style={styles.buscarButton}
            onPress={() => router.push('/(tabs)/Buscar')}
          >
            <Icon name="search" size={tamanhos.iconSm} color="#FFFFFF" />
            <Text style={styles.buscarButtonText}>Buscar Passagens</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          renderItem={renderFavorito}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

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
    headerSubtitle: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      marginTop: tamanhos.spacingXs,
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
      marginBottom: tamanhos.spacingXl * 1.5,
    },
    buscarButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tamanhos.spacingSm,
      backgroundColor: cores.primary,
      paddingHorizontal: tamanhos.spacingXl * 1.5,
      paddingVertical: tamanhos.spacingMd,
      borderRadius: 8,
      marginTop: tamanhos.spacingLg,
    },
    buscarButtonText: {
      color: '#FFFFFF',
      fontSize: tamanhos.md,
      fontWeight: '600',
    },
    listContainer: {
      padding: tamanhos.spacingLg,
      paddingTop: tamanhos.spacingLg,
    },
    favoritoCard: {
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      marginBottom: tamanhos.spacingLg,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      position: 'relative',
    },
    promocaoBadge: {
      position: 'absolute',
      top: tamanhos.spacingMd,
      right: tamanhos.spacingMd,
      backgroundColor: cores.success,
      flexDirection: 'row',
      alignItems: 'center',
      gap: tamanhos.spacingXs,
      paddingHorizontal: tamanhos.spacingSm,
      paddingVertical: tamanhos.spacingXs,
      borderRadius: 12,
      zIndex: 1,
    },
    promocaoBadgeText: {
      color: '#FFFFFF',
      fontSize: tamanhos.xs,
      fontWeight: '700',
    },
    favoritoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tamanhos.spacingMd,
      paddingRight: tamanhos.spacingXl * 2,
    },
    favoritoCompanhia: {
      fontSize: tamanhos.lg,
      fontWeight: '700',
      color: cores.text,
      flex: 1,
    },
    favoritoButton: {
      padding: tamanhos.spacingXs,
    },
    favoritoHorarios: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tamanhos.spacingMd,
    },
    horarioItem: {
      alignItems: 'center',
      flex: 1,
    },
    horario: {
      fontSize: tamanhos.xl,
      fontWeight: '700',
      color: cores.primary,
      marginBottom: tamanhos.spacingXs,
    },
    horarioLabel: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
      textAlign: 'center',
      minWidth: "100%",
      flexShrink: 1,
    },
    duracaoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tamanhos.spacingXs,
      paddingHorizontal: tamanhos.spacingMd,
    },
    duracao: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
    },
    favoritoRota: {
      marginBottom: tamanhos.spacingSm,
    },
    rotaText: {
      fontSize: tamanhos.sm,
      color: cores.text,
      fontWeight: '600',
    },
    favoritoData: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tamanhos.spacingSm - 2,
      marginBottom: tamanhos.spacingMd,
    },
    dataText: {
      fontSize: tamanhos.base,
      color: cores.textSecondary,
    },
    favoritoInfo: {
      flexDirection: 'row',
      gap: tamanhos.spacingLg,
      marginBottom: tamanhos.spacingMd,
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
    favoritoPreco: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: tamanhos.spacingMd,
      borderTopWidth: 1,
      borderTopColor: cores.border,
    },
    precoOriginal: {
      marginRight: tamanhos.spacingSm,
    },
    precoOriginalText: {
      fontSize: tamanhos.sm,
      color: cores.textTertiary,
      textDecorationLine: 'line-through',
    },
    precoContainer: {
      alignItems: 'flex-end',
    },
    precoLabel: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
      marginBottom: tamanhos.spacingXs / 2,
    },
    precoValue: {
      fontSize: tamanhos.xl,
      fontWeight: '700',
      color: cores.primary,
    },
    precoDesconto: {
      fontSize: tamanhos.xs,
      color: cores.success,
      fontWeight: '600',
      marginTop: tamanhos.spacingXs / 2,
    },
  });
}

