import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Keyboard, ActivityIndicator } from 'react-native';
import { styles } from './style';
import { useRouter } from 'expo-router';
import { login } from '@/src/services/api/auth/login';
import Icon from '@expo/vector-icons/MaterialIcons';

export const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      setError('Preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login({ email, senha });
      router.replace('/(tabs)/home');
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Icon name="directions-bus" size={64} color="#1E40AF" />
        </View>
        <Text style={styles.title}>Passagem Ônibus</Text>
        <Text style={styles.subtitle}>Encontre a melhor passagem para sua viagem</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Login</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Icon name="email" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#9CA3AF"
            value={senha}
            onChangeText={(text) => {
              setSenha(text);
              setError('');
            }}
            secureTextEntry
            autoComplete="password"
          />
        </View>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Entrar</Text>
              <Icon name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.registerLink}
          onPress={() => router.push('/auth/register')}
        >
          <Text style={styles.registerText}>
            Não tem uma conta? <Text style={styles.registerTextBold}>Cadastre-se</Text>
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};
