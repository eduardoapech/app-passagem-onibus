import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, Animated, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ViagemService } from '@/src/services/api/viagens';
import Icon from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para validar se já é o momento de exibir o QR code
const validarHorarioEmbarque = (dataViagem: Date, horarioPartida: string): { valido: boolean; mensagem?: string } => {
  const agora = new Date();
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const dataViagemFormatada = new Date(dataViagem.getFullYear(), dataViagem.getMonth(), dataViagem.getDate());
  
  // Verificar se a data da viagem é no futuro
  if (dataViagemFormatada > hoje) {
    const diasRestantes = Math.ceil((dataViagemFormatada.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return {
      valido: false,
      mensagem: `O QR code estará disponível no dia ${format(dataViagem, "dd 'de' MMM 'de' yyyy", { locale: ptBR })} às ${horarioPartida}. Faltam ${diasRestantes} dia(s).`
    };
  }
  
  // Se for hoje, verificar o horário (permitir 30 minutos antes do horário de partida)
  if (dataViagemFormatada.getTime() === hoje.getTime()) {
    const [horas, minutos] = horarioPartida.split(':').map(Number);
    const horarioEmbarque = new Date(agora);
    horarioEmbarque.setHours(horas, minutos, 0, 0);
    
    // Permitir 30 minutos antes do horário de partida
    const horarioMinimo = new Date(horarioEmbarque.getTime() - 30 * 60 * 1000);
    
    if (agora < horarioMinimo) {
      const minutosRestantes = Math.ceil((horarioMinimo.getTime() - agora.getTime()) / (1000 * 60));
      return {
        valido: false,
        mensagem: `O QR code estará disponível às ${horarioPartida}. Faltam aproximadamente ${minutosRestantes} minuto(s).`
      };
    }
  }
  
  return { valido: true };
};

export const ExibirQRCodeViagemScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const viagemId = params.id as string;
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [codigoReserva, setCodigoReserva] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAgradecimento, setShowAgradecimento] = useState(false);
  const [horarioInvalido, setHorarioInvalido] = useState(false);
  const [mensagemHorario, setMensagemHorario] = useState<string>('');
  const [timer, setTimer] = useState(5);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const agradecimentoFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let returnTimeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const carregarQRCode = async () => {
      try {
        if (!viagemId) {
          router.back();
          return;
        }

        // Buscar viagem primeiro para validar horário
        const viagem = await ViagemService.obterViagemPorId(viagemId).catch(() => null);
        
        if (!isMounted) return;
        
        if (!viagem) {
          setLoading(false);
          Alert.alert('Erro', 'Viagem não encontrada');
          return;
        }

        // Validar horário de embarque
        const validacao = validarHorarioEmbarque(viagem.dataViagem, viagem.passagem.horarioPartida);
        
        if (!validacao.valido) {
          if (!isMounted) return;
          setHorarioInvalido(true);
          setMensagemHorario(validacao.mensagem || 'O QR code não está disponível no momento.');
          setLoading(false);
          return;
        }

        // Se o horário for válido, buscar QR code
        const qrCode = await ViagemService.obterQRCode(viagemId);
        
        if (!isMounted) return;
        
        setQrCodeUrl(qrCode);
        if (viagem.codigoReserva) {
          setCodigoReserva(viagem.codigoReserva);
        }
        setLoading(false);

        // Animação de fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        // Timer de 5 segundos
        intervalId = setInterval(() => {
          if (!isMounted) return;
          setTimer((prev) => {
            if (prev <= 1) {
              if (intervalId) clearInterval(intervalId);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Após 5 segundos, mostrar mensagem de agradecimento
        timeoutId = setTimeout(async () => {
          if (!isMounted) return;
          
          try {
            // Mover viagem para histórico
            await ViagemService.moverViagemParaHistorico(viagemId);
            
            if (!isMounted) return;
            
            // Fade out do QR Code
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              if (!isMounted) return;
              setShowAgradecimento(true);
              // Fade in da mensagem de agradecimento
              Animated.timing(agradecimentoFadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }).start();
            });

            // Após 3 segundos, voltar para Minhas Viagens
            returnTimeoutId = setTimeout(() => {
              if (isMounted) {
                router.replace('/(tabs)/MinhasViagens');
              }
            }, 3000);
          } catch (error) {
            console.error('Erro ao mover viagem para histórico:', error);
            if (!isMounted) return;
            // Mesmo com erro, mostrar mensagem e voltar
            setShowAgradecimento(true);
            returnTimeoutId = setTimeout(() => {
              if (isMounted) {
                router.replace('/(tabs)/MinhasViagens');
              }
            }, 3000);
          }
        }, 5000);
      } catch (error) {
        console.error('Erro ao carregar QR Code:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarQRCode();

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      if (returnTimeoutId) clearTimeout(returnTimeoutId);
    };
  }, [viagemId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Carregando QR Code...</Text>
      </View>
    );
  }

  if (horarioInvalido) {
    return (
      <View style={styles.container}>
        <View style={styles.horarioInvalidoContainer}>
          <Icon name="schedule" size={64} color="#F59E0B" />
          <Text style={styles.horarioInvalidoTitle}>QR Code não disponível</Text>
          <Text style={styles.horarioInvalidoText}>{mensagemHorario}</Text>
          <Pressable
            style={styles.voltarButton}
            onPress={() => router.back()}
          >
            <Text style={styles.voltarButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (showAgradecimento) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.agradecimentoContainer, { opacity: agradecimentoFadeAnim }]}>
          <Icon name="check-circle" size={80} color="#10B981" />
          <Text style={styles.agradecimentoTitle}>Obrigado pela viagem!</Text>
          <Text style={styles.agradecimentoText}>
            Sua passagem foi utilizada com sucesso.{'\n'}
            Esperamos vê-lo novamente em breve!
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>QR Code de Embarque</Text>
        <Text style={styles.subtitle}>Mostre este código ao motorista</Text>

        {qrCodeUrl ? (
          <View style={styles.qrCodeContainer}>
            <Image source={{ uri: qrCodeUrl }} style={styles.qrCodeImage} />
            {codigoReserva ? (
              <View style={styles.codigoContainer}>
                <Text style={styles.codigoLabel}>Código de Reserva</Text>
                <Text style={styles.codigoValue}>{codigoReserva}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>Erro ao carregar QR Code</Text>
          </View>
        )}

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timer} segundos</Text>
        </View>

        <Text style={styles.infoText}>
          Aguarde enquanto o motorista escaneia seu código
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  qrCodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  qrCodeImage: {
    width: 300,
    height: 300,
    marginBottom: 16,
  },
  codigoContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: '100%',
    alignItems: 'center',
  },
  codigoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  codigoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E40AF',
    letterSpacing: 2,
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 16,
  },
  timerContainer: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  agradecimentoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  agradecimentoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  agradecimentoText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 28,
  },
  horarioInvalidoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    maxWidth: 400,
  },
  horarioInvalidoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  horarioInvalidoText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  voltarButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  voltarButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

