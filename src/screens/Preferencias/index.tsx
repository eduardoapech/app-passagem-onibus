import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { TemaPreferencia } from '@/src/services/api/tema';
import { CoresType } from '@/src/constants/colors';

export const PreferenciasScreen = () => {
  const router = useRouter();
  const { tema, setTema, isLoading, cores, temaAtual } = useTema();
  const { tamanhoFonte, setTamanhoFonte, tamanhos } = useTamanhoFonte();
  const [receberPromocoes, setReceberPromocoes] = useState(true);
  const [notificacoes, setNotificacoes] = useState(true);

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  useEffect(() => {
    // Carregar outras preferências se necessário
  }, []);

  const handleSalvar = async () => {
    try {
      // O tema já é salvo automaticamente quando muda
      Alert.alert('Sucesso', 'Preferências salvas com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as preferências');
    }
  };

  const handleTemaChange = async (novoTema: TemaPreferencia) => {
    await setTema(novoTema);
  };

  const tamanhosFonte = [
    { value: 'SMALL', label: 'Pequeno' },
    { value: 'MEDIUM', label: 'Médio' },
    { value: 'LARGE', label: 'Grande' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-back" size={tamanhos.iconMd} color={cores.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Preferências</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>

          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <Icon name="palette" size={tamanhos.iconMd} color={cores.primary} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Tema</Text>
                <Text style={styles.optionSubtitle}>Escolha entre tema claro, escuro ou automático</Text>
              </View>
            </View>
            <View style={styles.temaContainer}>
              <Pressable
                style={[styles.temaButton, tema === 'LIGHT' && styles.temaButtonActive]}
                onPress={() => handleTemaChange('LIGHT')}
                disabled={isLoading}
              >
                <Icon name="light-mode" size={tamanhos.iconSm} color={tema === 'LIGHT' ? '#FFFFFF' : cores.textSecondary} />
                <Text style={[styles.temaText, tema === 'LIGHT' && styles.temaTextActive]}>
                  Claro
                </Text>
              </Pressable>
              <Pressable
                style={[styles.temaButton, tema === 'DARK' && styles.temaButtonActive]}
                onPress={() => handleTemaChange('DARK')}
                disabled={isLoading}
              >
                <Icon name="dark-mode" size={tamanhos.iconSm} color={tema === 'DARK' ? '#FFFFFF' : cores.textSecondary} />
                <Text style={[styles.temaText, tema === 'DARK' && styles.temaTextActive]}>
                  Escuro
                </Text>
              </Pressable>
              <Pressable
                style={[styles.temaButton, tema === 'AUTO' && styles.temaButtonActive]}
                onPress={() => handleTemaChange('AUTO')}
                disabled={isLoading}
              >
                <Icon name="brightness-auto" size={tamanhos.iconSm} color={tema === 'AUTO' ? '#FFFFFF' : cores.textSecondary} />
                <Text style={[styles.temaText, tema === 'AUTO' && styles.temaTextActive]}>
                  Automático
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.option}>
            <View style={styles.optionLeft}>
              <Icon name="text-fields" size={tamanhos.iconMd} color={cores.primary} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Tamanho da Fonte</Text>
                <Text style={styles.optionSubtitle}>Ajuste o tamanho do texto</Text>
              </View>
            </View>
            <View style={styles.fonteContainer}>
              {tamanhosFonte.map((tamanho) => (
                <Pressable
                  key={tamanho.value}
                  style={[
                    styles.fonteButton,
                    tamanhoFonte === tamanho.value && styles.fonteButtonActive,
                  ]}
                  onPress={() => setTamanhoFonte(tamanho.value as 'SMALL' | 'MEDIUM' | 'LARGE')}
                >
                  <Text
                    style={[
                      styles.fonteText,
                      tamanhoFonte === tamanho.value && styles.fonteTextActive,
                    ]}
                  >
                    {tamanho.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>

          <View style={styles.switchOption}>
            <View style={styles.switchOptionLeft}>
              <Icon name="notifications" size={tamanhos.iconMd} color={cores.primary} />
              <View style={styles.switchOptionText}>
                <Text style={styles.optionTitle}>Notificações</Text>
                <Text style={styles.optionSubtitle}>Receber notificações do app</Text>
              </View>
            </View>
            <View style={styles.switchContainer}>
              <Switch
                value={notificacoes}
                onValueChange={setNotificacoes}
                trackColor={{ false: cores.border, true: cores.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.switchOption}>
            <View style={styles.switchOptionLeft}>
              <Icon name="local-offer" size={tamanhos.iconMd} color={cores.primary} />
              <View style={styles.switchOptionText}>
                <Text style={styles.optionTitle}>Promoções</Text>
                <Text style={styles.optionSubtitle}>Receber ofertas e promoções</Text>
              </View>
            </View>
            <View style={styles.switchContainer}>
              <Switch
                value={receberPromocoes}
                onValueChange={setReceberPromocoes}
                trackColor={{ false: cores.border, true: cores.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <Pressable style={styles.saveButton} onPress={handleSalvar}>
          <Text style={styles.saveButtonText}>Salvar Preferências</Text>
        </Pressable>
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
    },
    section: {
      marginBottom: tamanhos.spacingXl * 1.6,
    },
    sectionTitle: {
      fontSize: tamanhos.lg,
      fontWeight: '700',
      color: cores.text,
      marginBottom: tamanhos.spacingLg,
    },
    option: {
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      marginBottom: tamanhos.spacingMd,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: cores.border,
    },
    optionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tamanhos.spacingMd,
      marginBottom: tamanhos.spacingLg,
    },
    optionText: {
      flex: 1,
    },
    optionTitle: {
      fontSize: tamanhos.md,
      fontWeight: '600',
      color: cores.text,
      marginBottom: tamanhos.spacingXs,
    },
    optionSubtitle: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
    },
    temaContainer: {
      flexDirection: 'row',
      gap: tamanhos.spacingMd,
    },
    temaButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: tamanhos.spacingMd,
      borderRadius: 8,
      backgroundColor: cores.border,
      gap: tamanhos.spacingSm,
    },
    temaButtonActive: {
      backgroundColor: cores.primary,
    },
    temaText: {
      fontSize: tamanhos.sm,
      fontWeight: '600',
      color: cores.textSecondary,
    },
    temaTextActive: {
      color: '#FFFFFF',
    },
    fonteContainer: {
      flexDirection: 'row',
      gap: tamanhos.spacingSm,
    },
    fonteButton: {
      flex: 1,
      paddingVertical: tamanhos.spacingSm + 2,
      borderRadius: 8,
      backgroundColor: cores.border,
      alignItems: 'center',
    },
    fonteButtonActive: {
      backgroundColor: cores.primary,
    },
    fonteText: {
      fontSize: tamanhos.sm,
      fontWeight: '600',
      color: cores.textSecondary,
    },
    fonteTextActive: {
      color: '#FFFFFF',
    },
    switchOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      marginBottom: tamanhos.spacingMd,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: cores.border,
      overflow: 'hidden',
    },
    switchOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tamanhos.spacingMd,
      flex: 1,
      minWidth: 0,
      marginRight: tamanhos.spacingMd,
    },
    switchOptionText: {
      flex: 1,
      minWidth: 0,
    },
    switchContainer: {
      flexShrink: 0,
    },
    saveButton: {
      backgroundColor: cores.primary,
      borderRadius: 12,
      paddingVertical: tamanhos.spacingLg,
      alignItems: 'center',
      marginTop: tamanhos.spacingLg,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: tamanhos.lg,
      fontWeight: '700',
    },
  });
}

