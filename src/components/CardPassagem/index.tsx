import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, Linking, Alert, StyleSheet } from 'react-native';
import { PassagemResumo, Cidade } from '@/src/interfaces/passagem';
import { CompanhiaService } from '@/src/services/companhias';
import { FavoritosService } from '@/src/services/api/favoritos';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

interface CardPassagemProps {
  passagem: PassagemResumo;
  onPress: () => void;
  dataPartida?: Date;
  origem?: Cidade;
  destino?: Cidade;
}

export function CardPassagem({ passagem, onPress, dataPartida, origem, destino }: CardPassagemProps) {
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const isNavigatingRef = useRef(false);
  const [isFavorito, setIsFavorito] = useState(false);

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  useEffect(() => {
    const verificarFavorito = async () => {
      const favorito = await FavoritosService.isFavorito(passagem.id);
      setIsFavorito(favorito);
    };
    verificarFavorito();
  }, [passagem.id]);

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const formatarTipoAssento = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      CONVENCIONAL: 'Convencional',
      SEMI_LEITO: 'Semi-leito',
      LEITO: 'Leito',
      EXECUTIVO: 'Executivo',
      SUITE: 'Suíte'
    };
    return tipos[tipo] || tipo;
  };

  const handleComprarNoSite = async (e: any) => {
    if (e) {
      e.stopPropagation();
    }
    
    // Obter URL do site da companhia
    const urlSite = passagem.companhiaUrlSite || CompanhiaService.obterUrlSite(passagem.companhia);
    
    if (!urlSite) {
      Alert.alert('Aviso', 'Site da companhia não disponível');
      return;
    }

    // Verificar se o link pode ser aberto
    const canOpen = await Linking.canOpenURL(urlSite);
    
    if (canOpen) {
      try {
        await Linking.openURL(urlSite);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível abrir o site da companhia');
      }
    } else {
      Alert.alert('Erro', 'URL inválida');
    }
  };

  const handleCardPress = () => {
    // Evitar múltiplos cliques
    if (isNavigatingRef.current) {
      return;
    }
    
    isNavigatingRef.current = true;
    onPress();
    
    // Resetar após um tempo
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };

  const handleToggleFavorito = async (e: any) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      if (isFavorito) {
        await FavoritosService.removerFavorito(passagem.id);
        setIsFavorito(false);
        Alert.alert('Sucesso', 'Passagem removida dos favoritos');
      } else {
        await FavoritosService.adicionarFavorito(passagem, dataPartida, origem, destino);
        setIsFavorito(true);
        Alert.alert('Sucesso', 'Passagem adicionada aos favoritos!');
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      Alert.alert('Erro', 'Não foi possível adicionar aos favoritos');
    }
  };

  return (
    <Pressable 
      style={styles.card} 
      onPress={handleCardPress}
      disabled={isNavigatingRef.current}
    >
      <View style={styles.header}>
        <Text style={styles.companhia} numberOfLines={2}>{passagem.companhia}</Text>
        <View style={styles.headerRight}>
          <Pressable
            onPress={handleToggleFavorito}
            style={styles.favoritoButton}
          >
            <Icon 
              name={isFavorito ? "favorite" : "favorite-border"} 
              size={tamanhos.iconMd} 
              color={isFavorito ? cores.error : cores.textSecondary} 
            />
          </Pressable>
          <View style={styles.precoContainer}>
            <Text style={styles.preco}>{formatarPreco(passagem.preco)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.horariosContainer}>
        <View style={styles.horarioItem}>
          <Text style={styles.horario}>{passagem.horarioPartida}</Text>
          <Text style={styles.label}>Saída</Text>
        </View>

        <View style={styles.duracaoContainer}>
          <Icon name="schedule" size={tamanhos.iconSm} color={cores.textSecondary} />
          <Text style={styles.duracao}>{passagem.duracao}</Text>
        </View>

        <View style={styles.horarioItem}>
          <Text style={styles.horario}>{passagem.horarioChegada}</Text>
          <Text style={styles.label}>Chegada</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.tipoAssentoContainer}>
          <Icon name="event-seat" size={tamanhos.iconSm} color={cores.primary} />
          <Text style={styles.tipoAssentoText} numberOfLines={1}>{formatarTipoAssento(passagem.tipoAssento)}</Text>
        </View>
        <View style={styles.assentosContainer}>
          <Icon name="airline-seat-recline-normal" size={tamanhos.iconSm} color={cores.success} />
          <Text style={styles.assentosText}>{passagem.assentosDisponiveis} disponíveis</Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <Pressable 
          style={styles.comprarButton}
          onPress={handleComprarNoSite}
        >
          <Icon name="open-in-new" size={tamanhos.iconSm} color={cores.primary} />
          <Text style={styles.comprarButtonText}>Comprar no site</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function getStyles(cores: CoresType, tamanhos: any) {
  return StyleSheet.create({
    card: {
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      marginVertical: tamanhos.spacingSm,
      marginHorizontal: tamanhos.spacingLg,
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: tamanhos.spacingLg,
    },
    companhia: {
      fontSize: tamanhos.lg,
      fontWeight: "600",
      color: cores.text,
      flex: 1,
      flexShrink: 1,
      marginRight: tamanhos.spacingSm,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: tamanhos.spacingSm,
    },
    favoritoButton: {
      padding: tamanhos.spacingXs,
    },
    precoContainer: {
      backgroundColor: cores.primary,
      paddingHorizontal: tamanhos.spacingMd,
      paddingVertical: tamanhos.spacingSm - 2,
      borderRadius: 8,
    },
    preco: {
      fontSize: tamanhos.lg,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    horariosContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: tamanhos.spacingLg,
    },
    horarioItem: {
      alignItems: "center",
      flex: 1,
      minWidth: 0,
      paddingHorizontal: tamanhos.spacingXs,
    },
    horario: {
      fontSize: tamanhos['3xl'],
      fontWeight: "700",
      color: cores.text,
      marginBottom: tamanhos.spacingXs,
    },
    label: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
      textTransform: "uppercase",
      textAlign: "center",
      flexShrink: 1,
      minWidth: "100%",
    },
    duracaoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: tamanhos.spacingXs,
      paddingHorizontal: tamanhos.spacingSm,
      flexShrink: 1,
      minWidth: 0,
    },
    duracao: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
      flexShrink: 1,
      minWidth: 0,
    },
    infoSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: tamanhos.spacingMd,
      paddingTop: tamanhos.spacingMd,
      borderTopWidth: 1,
      borderTopColor: cores.border,
    },
    tipoAssentoContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: tamanhos.spacingSm - 2,
      backgroundColor: cores.primaryLight,
      paddingHorizontal: tamanhos.spacingMd,
      paddingVertical: tamanhos.spacingSm - 2,
      borderRadius: 8,
      flex: 1,
      marginRight: tamanhos.spacingSm,
    },
    tipoAssentoText: {
      fontSize: tamanhos.base,
      color: cores.primary,
      fontWeight: "600",
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
    },
    assentosContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: tamanhos.spacingSm - 2,
      backgroundColor: cores.successLight,
      paddingHorizontal: tamanhos.spacingMd,
      paddingVertical: tamanhos.spacingSm - 2,
      borderRadius: 8,
    },
    assentosText: {
      fontSize: tamanhos.base,
      color: cores.success,
      fontWeight: "600",
      flexShrink: 1,
      minWidth: 0,
    },
    actionsSection: {
      marginTop: tamanhos.spacingMd,
      paddingTop: tamanhos.spacingMd,
      borderTopWidth: 1,
      borderTopColor: cores.border,
    },
    comprarButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tamanhos.spacingSm - 2,
      backgroundColor: cores.primaryLight,
      paddingVertical: tamanhos.spacingSm + 2,
      paddingHorizontal: tamanhos.spacingLg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: cores.primary,
    },
    comprarButtonText: {
      fontSize: tamanhos.sm,
      color: cores.primary,
      fontWeight: "600",
    },
  });
}

