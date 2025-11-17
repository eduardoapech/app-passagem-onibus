import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '@/src/services/api/storage';
import { Usuario } from '@/src/interfaces/usuario';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

export const EditarPerfilScreen = () => {
  const router = useRouter();
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  useEffect(() => {
    const loadUser = async () => {
      const user = await AuthService.getUser();
      if (user) {
        setUsuario(user);
        setNome(user.nome || '');
        setEmail(user.email || '');
        setTelefone(user.telefone || '');
        setCpf(user.cpf || '');
      }
    };
    loadUser();
  }, []);

  const handleSalvar = async () => {
    if (!nome.trim() || !email.trim() || !telefone.trim() || !cpf.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      // TODO: Chamar API para atualizar usuário
      const usuarioAtualizado: Usuario = {
        ...usuario!,
        nome,
        email,
        telefone,
        cpf,
      };
      await AuthService.login({
        token: await AuthService.getToken() || '',
        refreshToken: await AuthService.getRefreshToken() || '',
        usuario: usuarioAtualizado,
      });
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Icon name="arrow-back" size={tamanhos.iconMd} color={cores.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Meus Dados</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Digite seu nome"
            placeholderTextColor={cores.textTertiary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Digite seu email"
            placeholderTextColor={cores.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={setTelefone}
            placeholder="(00) 00000-0000"
            placeholderTextColor={cores.textTertiary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={setCpf}
            placeholder="000.000.000-00"
            placeholderTextColor={cores.textTertiary}
            keyboardType="numeric"
          />
        </View>

        <Pressable
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSalvar}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Text>
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
    form: {
      padding: tamanhos.spacingLg,
    },
    inputContainer: {
      marginBottom: tamanhos.spacingLg,
    },
    label: {
      fontSize: tamanhos.sm,
      fontWeight: '600',
      color: cores.text,
      marginBottom: tamanhos.spacingSm - 2,
    },
    input: {
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      paddingHorizontal: tamanhos.spacingMd,
      paddingVertical: tamanhos.spacingSm + 2,
      fontSize: tamanhos.md,
      color: cores.text,
      borderWidth: 1,
      borderColor: cores.border,
    },
    saveButton: {
      backgroundColor: cores.primary,
      borderRadius: 12,
      paddingVertical: tamanhos.spacingMd,
      alignItems: 'center',
      marginTop: tamanhos.spacingSm - 2,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: tamanhos.lg,
      fontWeight: '700',
    },
  });
}

