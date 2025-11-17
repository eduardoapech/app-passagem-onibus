import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { BuscaPassagem } from '@/src/components/BuscaPassagem';
import { useRouter } from 'expo-router';
import { BuscaPassagem as IBuscaPassagem } from '@/src/interfaces/passagem';
import Icon from '@expo/vector-icons/MaterialIcons';
import { AuthService } from '@/src/services/api/storage';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

export const HomeScreen = () => {
  const router = useRouter();
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const [usuario, setUsuario] = useState<any>(null);

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  React.useEffect(() => {
    const loadUser = async () => {
      const user = await AuthService.getUser();
      setUsuario(user);
    };
    loadUser();
  }, []);

  const handleBuscar = (busca: IBuscaPassagem) => {
    if (!busca.origem || !busca.destino) {
      return;
    }
    
    router.push({
      pathname: '/(tabs)/Resultados',
      params: {
        origem: JSON.stringify(busca.origem),
        destino: JSON.stringify(busca.destino),
        dataIda: busca.dataIda?.toISOString() || new Date().toISOString(),
        dataVolta: busca.dataVolta?.toISOString() || '',
        tipoViagem: busca.tipoViagem || 'IDA',
        passageiros: busca.passageiros?.toString() || '1',
      }
    } as any);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {usuario?.nome || 'Usuário'}!</Text>
          <Text style={styles.subtitle}>Encontre a melhor passagem para sua viagem</Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <BuscaPassagem onBuscar={handleBuscar} />
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.actionsGrid}>
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/MinhasViagens')}
          >
            <View style={[styles.actionIcon, { backgroundColor: cores.primaryLight }]}>
              <Icon name="card-travel" size={tamanhos.iconLg} color={cores.primary} />
            </View>
            <Text style={styles.actionLabel}>Minhas Viagens</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/Favoritos')}
          >
            <View style={[styles.actionIcon, { backgroundColor: cores.errorLight }]}>
              <Icon name="favorite" size={tamanhos.iconLg} color={cores.error} />
            </View>
            <Text style={styles.actionLabel}>Favoritos</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/Promocoes')}
          >
            <View style={[styles.actionIcon, { backgroundColor: cores.warningLight }]}>
              <Icon name="local-offer" size={tamanhos.iconLg} color={cores.warning} />
            </View>
            <Text style={styles.actionLabel}>Promoções</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/Ajuda')}
          >
            <View style={[styles.actionIcon, { backgroundColor: cores.successLight }]}>
              <Icon name="help" size={tamanhos.iconLg} color={cores.success} />
            </View>
            <Text style={styles.actionLabel}>Ajuda</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.companhiasSection}>
        <Text style={styles.sectionTitle}>Companhias Parceiras</Text>
        <Text style={styles.companhiasSubtitle}>
          Buscamos passagens em todas as principais companhias do Brasil
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companhiasList}>
          {['Cometa', 'Gontijo', 'Itapemirim', 'Kaissara', 'Planalto', 'Rapido Federal', 'São Geraldo', 'Viação Garcia'].map((companhia, index) => (
            <View key={index} style={styles.companhiaCard}>
              <View style={styles.companhiaLogo}>
                <Text style={styles.companhiaInitial}>{companhia[0]}</Text>
              </View>
              <Text style={styles.companhiaName}>{companhia}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

function getStyles(cores: CoresType, tamanhos: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: cores.background,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: tamanhos.spacingLg,
      paddingTop: 60,
      paddingBottom: tamanhos.spacingLg,
      backgroundColor: cores.header,
    },
    greeting: {
      fontSize: tamanhos['3xl'],
      fontWeight: '700',
      color: cores.text,
      marginBottom: tamanhos.spacingXs,
    },
    subtitle: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      minWidth: "100%"
    },
    searchSection: {
      marginTop: tamanhos.spacingLg,
    },
    quickActions: {
      paddingHorizontal: tamanhos.spacingLg,
      marginTop: tamanhos.spacingXl * 1.6,
    },
    sectionTitle: {
      fontSize: tamanhos.xl,
      fontWeight: '700',
      color: cores.text,
      marginBottom: tamanhos.spacingLg,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tamanhos.spacingMd,
    },
    actionCard: {
      width: '47%',
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      alignItems: 'center',
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
    actionIcon: {
      width: tamanhos.icon2xl + 8,
      height: tamanhos.icon2xl + 8,
      borderRadius: (tamanhos.icon2xl + 8) / 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: tamanhos.spacingSm,
    },
    actionLabel: {
      fontSize: tamanhos.sm,
      fontWeight: '600',
      color: cores.text,
      textAlign: 'center',
    },
    companhiasSection: {
      paddingHorizontal: tamanhos.spacingLg,
      marginTop: tamanhos.spacingXl * 1.6,
    },
    companhiasSubtitle: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      marginBottom: tamanhos.spacingMd,
    },
    companhiasList: {
      marginTop: tamanhos.spacingSm,
    },
    companhiaCard: {
      alignItems: 'center',
      marginRight: tamanhos.spacingLg,
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      minWidth: 100,
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
    companhiaLogo: {
      width: tamanhos.icon2xl,
      height: tamanhos.icon2xl,
      borderRadius: tamanhos.icon2xl / 2,
      backgroundColor: cores.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: tamanhos.spacingSm,
    },
    companhiaInitial: {
      fontSize: tamanhos['3xl'],
      fontWeight: '700',
      color: '#FFFFFF',
    },
    companhiaName: {
      fontSize: tamanhos.xs,
      fontWeight: '600',
      color: cores.text,
      textAlign: 'center',
    },
  });
}
