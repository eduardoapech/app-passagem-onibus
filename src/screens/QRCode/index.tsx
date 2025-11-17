import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, StyleSheet, Alert } from 'react-native';
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

export const QRCodeScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const viagemId = params.id as string;
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [codigoReserva, setCodigoReserva] = useState<string>('');
  const [horarioInvalido, setHorarioInvalido] = useState(false);
  const [mensagemHorario, setMensagemHorario] = useState<string>('');

  useEffect(() => {
    const carregarQRCode = async () => {
      try {
        if (!viagemId) {
          router.back();
          return;
        }

        // Buscar viagem primeiro para validar horário
        const viagem = await ViagemService.obterViagemPorId(viagemId);
        
        // Validar horário de embarque
        const validacao = validarHorarioEmbarque(viagem.dataViagem, viagem.passagem.horarioPartida);
        
        if (!validacao.valido) {
          setHorarioInvalido(true);
          setMensagemHorario(validacao.mensagem || 'O QR code não está disponível no momento.');
          setLoading(false);
          return;
        }

        // Se o horário for válido, buscar QR code
        const qrCode = await ViagemService.obterQRCode(viagemId);
        
        setQrCodeUrl(qrCode);
        setCodigoReserva(viagem.codigoReserva);
      } catch (error) {
        console.error('Erro ao carregar QR Code:', error);
        Alert.alert('Erro', 'Não foi possível carregar o QR Code');
      } finally {
        setLoading(false);
      }
    };

    carregarQRCode();
  }, [viagemId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  if (horarioInvalido) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1E40AF" />
          </Pressable>
          <Text style={styles.title}>QR Code da Passagem</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.content}>
          <View style={styles.horarioInvalidoContainer}>
            <Icon name="schedule" size={64} color="#F59E0B" />
            <Text style={styles.horarioInvalidoTitle}>QR Code não disponível</Text>
            <Text style={styles.horarioInvalidoText}>{mensagemHorario}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1E40AF" />
        </Pressable>
        <Text style={styles.title}>QR Code da Passagem</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Mostre este QR Code ao motorista</Text>

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

        <Text style={styles.infoText}>
          O motorista irá escanear este código para validar sua passagem
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  codigoReserva: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    fontWeight: '500',
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
    width: 250,
    height: 250,
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
  codigoReserva: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    fontWeight: '500',
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
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
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
  },
});

