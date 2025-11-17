import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

export default function AjudaTab() {
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  const faqItems = [
    {
      id: 1,
      pergunta: 'Como comprar uma passagem?',
      resposta: 'Na tela inicial, preencha origem, destino, data e número de passageiros. Clique em "Buscar Passagens" e escolha a melhor opção.',
    },
    {
      id: 2,
      pergunta: 'Quais formas de pagamento são aceitas?',
      resposta: 'Aceitamos cartão de crédito, débito, PIX e boleto bancário.',
    },
    {
      id: 3,
      pergunta: 'Posso cancelar minha viagem?',
      resposta: 'Sim, você pode cancelar sua viagem através da tela "Minhas Viagens". As políticas de reembolso variam conforme a companhia.',
    },
    {
      id: 4,
      pergunta: 'Como visualizo meu QR Code de embarque?',
      resposta: 'Após a confirmação do pagamento, acesse "Minhas Viagens" e clique no ícone de QR Code da sua viagem confirmada.',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Central de Ajuda</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          {faqItems.map((item) => (
            <View key={item.id} style={styles.faqItem}>
              <View style={styles.faqHeader}>
                <Icon name="help-outline" size={tamanhos.iconSm} color={cores.primary} />
                <Text style={styles.faqPergunta}>{item.pergunta}</Text>
              </View>
              <Text style={styles.faqResposta}>{item.resposta}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato</Text>
          <View style={styles.contactItem}>
            <Icon name="email" size={tamanhos.iconSm} color={cores.primary} />
            <Text style={styles.contactText}>suporte@passagemonibus.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="phone" size={tamanhos.iconSm} color={cores.primary} />
            <Text style={styles.contactText}>(21) 3000-0000</Text>
          </View>
          <View style={styles.contactItem}>
            <Icon name="schedule" size={tamanhos.iconSm} color={cores.primary} />
            <Text style={styles.contactText}>Segunda a Sexta, 8h às 18h</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    content: {
      padding: tamanhos.spacingLg,
    },
    section: {
      marginBottom: tamanhos.spacingXl,
    },
    sectionTitle: {
      fontSize: tamanhos.xl,
      fontWeight: '700',
      color: cores.text,
      marginBottom: tamanhos.spacingMd,
    },
    faqItem: {
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      padding: tamanhos.spacingMd,
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
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tamanhos.spacingSm - 2,
      marginBottom: tamanhos.spacingSm - 2,
    },
    faqPergunta: {
      fontSize: tamanhos.md,
      fontWeight: '600',
      color: cores.text,
      flex: 1,
    },
    faqResposta: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
      lineHeight: tamanhos.sm * 1.43,
      marginLeft: tamanhos.iconSm + tamanhos.spacingSm - 2,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      padding: tamanhos.spacingMd,
      marginBottom: tamanhos.spacingMd,
      gap: tamanhos.spacingMd,
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
    contactText: {
      fontSize: tamanhos.sm,
      color: cores.text,
      fontWeight: '500',
    },
  });
}

