import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Modal, TextInput, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

interface Cartao {
  id: string;
  tipo: 'CREDITO' | 'DEBITO' | 'PIX';
  ultimosDigitos?: string;
  nomeTitular?: string;
  bandeira?: string;
  chavePix?: string;
  principal: boolean;
}

export const PagamentosScreen = () => {
  const router = useRouter();
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoPagamento, setTipoPagamento] = useState<'CARTAO' | 'PIX'>('CARTAO');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [nomeTitular, setNomeTitular] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [chavePix, setChavePix] = useState('');

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  useEffect(() => {
    // TODO: Carregar cartões da API
    setCartoes([]);
  }, []);

  const handleAdicionarCartao = () => {
    if (tipoPagamento === 'CARTAO') {
      if (!numeroCartao || !nomeTitular || !validade || !cvv) {
        Alert.alert('Atenção', 'Preencha todos os campos do cartão');
        return;
      }
      // TODO: Salvar cartão na API
      const novoCartao: Cartao = {
        id: Date.now().toString(),
        tipo: 'CREDITO',
        ultimosDigitos: numeroCartao.slice(-4),
        nomeTitular,
        bandeira: 'VISA',
        principal: cartoes.length === 0,
      };
      setCartoes([...cartoes, novoCartao]);
    } else {
      if (!chavePix) {
        Alert.alert('Atenção', 'Digite a chave PIX');
        return;
      }
      // TODO: Salvar PIX na API
      const novoPix: Cartao = {
        id: Date.now().toString(),
        tipo: 'PIX',
        chavePix,
        principal: cartoes.length === 0,
      };
      setCartoes([...cartoes, novoPix]);
    }
    setShowModal(false);
    setNumeroCartao('');
    setNomeTitular('');
    setValidade('');
    setCvv('');
    setChavePix('');
  };

  const handleRemover = (id: string) => {
    Alert.alert(
      'Remover',
      'Deseja remover esta forma de pagamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => setCartoes(cartoes.filter(c => c.id !== id)),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-back" size={tamanhos.iconMd} color={cores.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Formas de Pagamento</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cartoes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="payment" size={tamanhos.icon2xl + 16} color={cores.textTertiary} />
            <Text style={styles.emptyText}>Nenhuma forma de pagamento cadastrada</Text>
          </View>
        ) : (
          cartoes.map((cartao) => (
            <View key={cartao.id} style={styles.cartaoCard}>
              <View style={styles.cartaoHeader}>
                <View style={styles.cartaoInfo}>
                  <Icon
                    name={cartao.tipo === 'PIX' ? 'account-balance-wallet' : 'credit-card'}
                    size={tamanhos.iconMd}
                    color={cores.primary}
                  />
                  <View style={styles.cartaoDetails}>
                    <Text style={styles.cartaoTipo}>
                      {cartao.tipo === 'PIX' ? 'PIX' : `Cartão ${cartao.tipo}`}
                    </Text>
                    {cartao.ultimosDigitos && (
                      <Text style={styles.cartaoNumero}>**** {cartao.ultimosDigitos}</Text>
                    )}
                    {cartao.chavePix && (
                      <Text style={styles.cartaoNumero}>{cartao.chavePix}</Text>
                    )}
                    {cartao.principal && (
                      <View style={styles.principalBadge}>
                        <Text style={styles.principalText}>Principal</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable onPress={() => handleRemover(cartao.id)}>
                  <Icon name="delete" size={tamanhos.iconMd} color={cores.error} />
                </Pressable>
              </View>
            </View>
          ))
        )}

        <Pressable style={styles.addButton} onPress={() => setShowModal(true)}>
          <Icon name="add" size={tamanhos.iconMd} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Adicionar Forma de Pagamento</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Pagamento</Text>
              <Pressable onPress={() => setShowModal(false)}>
                <Icon name="close" size={tamanhos.iconMd} color={cores.text} />
              </Pressable>
            </View>

            <View style={styles.tipoContainer}>
              <Pressable
                style={[styles.tipoButton, tipoPagamento === 'CARTAO' && styles.tipoButtonActive]}
                onPress={() => setTipoPagamento('CARTAO')}
              >
                <Text style={[styles.tipoText, tipoPagamento === 'CARTAO' && styles.tipoTextActive]}>
                  Cartão
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tipoButton, tipoPagamento === 'PIX' && styles.tipoButtonActive]}
                onPress={() => setTipoPagamento('PIX')}
              >
                <Text style={[styles.tipoText, tipoPagamento === 'PIX' && styles.tipoTextActive]}>
                  PIX
                </Text>
              </Pressable>
            </View>

            {tipoPagamento === 'CARTAO' ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Número do Cartão"
                  placeholderTextColor={cores.textTertiary}
                  value={numeroCartao}
                  onChangeText={setNumeroCartao}
                  keyboardType="numeric"
                  maxLength={16}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Nome do Titular"
                  placeholderTextColor={cores.textTertiary}
                  value={nomeTitular}
                  onChangeText={setNomeTitular}
                />
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="Validade (MM/AA)"
                    placeholderTextColor={cores.textTertiary}
                    value={validade}
                    onChangeText={setValidade}
                    maxLength={5}
                  />
                  <TextInput
                    style={[styles.input, styles.inputHalf]}
                    placeholder="CVV"
                    placeholderTextColor={cores.textTertiary}
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Chave PIX (CPF, Email, Telefone ou Aleatória)"
                placeholderTextColor={cores.textTertiary}
                value={chavePix}
                onChangeText={setChavePix}
              />
            )}

            <Pressable style={styles.saveButton} onPress={handleAdicionarCartao}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
      flex: 1,
      padding: tamanhos.spacingLg,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: tamanhos.spacingXl * 2,
    },
    emptyText: {
      fontSize: tamanhos.md,
      color: cores.textSecondary,
      marginTop: tamanhos.spacingMd,
      textAlign: 'center',
    },
    cartaoCard: {
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      padding: tamanhos.spacingMd,
      marginBottom: tamanhos.spacingMd,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: cores.border,
    },
    cartaoHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cartaoInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tamanhos.spacingMd,
      flex: 1,
    },
    cartaoDetails: {
      flex: 1,
    },
    cartaoTipo: {
      fontSize: tamanhos.md,
      fontWeight: '600',
      color: cores.text,
      marginBottom: tamanhos.spacingXs,
    },
    cartaoNumero: {
      fontSize: tamanhos.sm,
      color: cores.textSecondary,
    },
    principalBadge: {
      backgroundColor: cores.primaryLight,
      paddingHorizontal: tamanhos.spacingSm - 2,
      paddingVertical: tamanhos.spacingXs,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginTop: tamanhos.spacingXs,
    },
    principalText: {
      fontSize: tamanhos.xs,
      fontWeight: '600',
      color: cores.primary,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: cores.primary,
      borderRadius: 12,
      paddingVertical: tamanhos.spacingMd,
      gap: tamanhos.spacingSm - 2,
      marginTop: tamanhos.spacingLg,
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: tamanhos.md,
      fontWeight: '700',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: cores.backgroundCard,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: tamanhos.spacingLg,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tamanhos.spacingLg,
    },
    modalTitle: {
      fontSize: tamanhos.xl,
      fontWeight: '700',
      color: cores.text,
    },
    tipoContainer: {
      flexDirection: 'row',
      gap: tamanhos.spacingMd,
      marginBottom: tamanhos.spacingLg,
    },
    tipoButton: {
      flex: 1,
      paddingVertical: tamanhos.spacingMd,
      borderRadius: 8,
      backgroundColor: cores.background,
      alignItems: 'center',
    },
    tipoButtonActive: {
      backgroundColor: cores.primary,
    },
    tipoText: {
      fontSize: tamanhos.sm,
      fontWeight: '600',
      color: cores.textSecondary,
    },
    tipoTextActive: {
      color: '#FFFFFF',
    },
    input: {
      backgroundColor: cores.background,
      borderRadius: 12,
      paddingHorizontal: tamanhos.spacingMd,
      paddingVertical: tamanhos.spacingSm + 2,
      fontSize: tamanhos.md,
      color: cores.text,
      borderWidth: 1,
      borderColor: cores.border,
      marginBottom: tamanhos.spacingMd,
    },
    row: {
      flexDirection: 'row',
      gap: tamanhos.spacingMd,
    },
    inputHalf: {
      flex: 1,
    },
    saveButton: {
      backgroundColor: cores.primary,
      borderRadius: 12,
      paddingVertical: tamanhos.spacingMd,
      alignItems: 'center',
      marginTop: tamanhos.spacingSm - 2,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: tamanhos.lg,
      fontWeight: '700',
    },
  });
}

