import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialIcons';
import Constants from 'expo-constants';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';
import version from '@/app.json'

export const SobreScreen = () => {
  const router = useRouter();
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const appName = Constants.expoConfig?.name || 'Passagem Ônibus';

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-back" size={tamanhos.iconMd} color={cores.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Sobre o App</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Icon name="directions-bus" size={tamanhos.icon2xl + 16} color={cores.primary} />
        </View>

        <Text style={styles.appName}>{appName}</Text>
        <Text style={styles.version}>Versão {version.expo.version}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>
            Aplicativo inovador para comparação e venda de passagens de ônibus. 
            Encontre a melhor opção de viagem com preços competitivos e horários 
            convenientes das principais companhias de ônibus do Brasil.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funcionalidades</Text>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={tamanhos.iconSm} color={cores.success} />
            <Text style={styles.featureText}>Busca inteligente de passagens</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={tamanhos.iconSm} color={cores.success} />
            <Text style={styles.featureText}>Comparação de preços</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={tamanhos.iconSm} color={cores.success} />
            <Text style={styles.featureText}>Pagamento seguro</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={tamanhos.iconSm} color={cores.success} />
            <Text style={styles.featureText}>Gestão de viagens</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check-circle" size={tamanhos.iconSm} color={cores.success} />
            <Text style={styles.featureText}>QR Code para embarque</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desenvolvido com</Text>
          <Text style={styles.techText}>React Native</Text>
          <Text style={styles.techText}>Expo</Text>
          <Text style={styles.techText}>TypeScript</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Passagem Ônibus</Text>
          <Text style={styles.footerText}>Todos os direitos reservados</Text>
        </View>
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
    content: {
      padding: tamanhos.spacingLg,
      alignItems: 'center',
    },
    logoContainer: {
      width: tamanhos.icon2xl + 40,
      height: tamanhos.icon2xl + 40,
      borderRadius: (tamanhos.icon2xl + 40) / 2,
      backgroundColor: cores.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: tamanhos.spacingLg,
    },
    appName: {
      fontSize: tamanhos['2xl'],
      fontWeight: '700',
      color: cores.text,
      marginBottom: tamanhos.spacingSm - 2,
    },
    version: {
      fontSize: tamanhos.md,
      color: cores.textSecondary,
      marginBottom: tamanhos.spacingXl,
      minWidth: "100%"
    },
    section: {
      width: '100%',
      marginBottom: tamanhos.spacingLg + tamanhos.spacingSm,
    },
    sectionTitle: {
      fontSize: tamanhos.lg,
      fontWeight: '700',
      color: cores.text,
      marginBottom: tamanhos.spacingMd,
    },
    description: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      lineHeight: tamanhos.sm * 1.57,
      textAlign: 'justify',
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tamanhos.spacingMd,
      marginBottom: tamanhos.spacingMd,
    },
    featureText: {
      fontSize: tamanhos.sm,
      color: cores.text,
      flex: 1,
    },
    techText: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      marginBottom: tamanhos.spacingXs,
    },
    footer: {
      marginTop: tamanhos.spacingXl,
      alignItems: 'center',
    },
    footerText: {
      fontSize: tamanhos.xs,
      color: cores.textTertiary,
      marginBottom: tamanhos.spacingXs,
    },
  });
}

