import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { ViagemService } from '@/src/services/api/viagens';
import Icon from '@expo/vector-icons/MaterialIcons';

export const ScannerQRCodeScreen = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (permission === null) {
      // Ainda não carregou, aguardar
      return;
    }
    if (!permission.granted && requestPermission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async (result: { data: string; type: string }) => {
    if (scanned || processing) return;

    setScanned(true);
    setProcessing(true);

    try {
      // O QR Code contém o código de reserva
      // Extrair o código de reserva do QR Code
      // O formato do QR Code é uma URL que contém o código de reserva
      let codigoReserva = result.data;
      
      // Se for uma URL, tentar extrair o código
      if (result.data.includes('data=')) {
        const match = result.data.match(/data=([^&]+)/);
        if (match) {
          codigoReserva = decodeURIComponent(match[1]);
        }
      }

      // Validar e marcar viagem como utilizada
      const resultado = await ViagemService.marcarViagemComoUtilizada(codigoReserva);

      if (resultado.sucesso) {
        Alert.alert(
          'Sucesso!',
          resultado.mensagem,
          [
            {
              text: 'OK',
              onPress: () => {
                setScanned(false);
                setProcessing(false);
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Erro',
          resultado.mensagem,
          [
            {
              text: 'OK',
              onPress: () => {
                setScanned(false);
                setProcessing(false);
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Erro ao processar QR Code:', error);
      Alert.alert(
        'Erro',
        'Erro ao processar QR Code. Tente novamente.',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            }
          }
        ]
      );
    }
  };

  if (permission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.message}>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Icon name="camera-alt" size={64} color="#6B7280" />
        <Text style={styles.message}>Acesso à câmera negado</Text>
        <Text style={styles.subMessage}>
          É necessário permitir o acesso à câmera para escanear QR Codes
        </Text>
        <Pressable
          style={styles.button}
          onPress={async () => {
            if (requestPermission) {
              await requestPermission();
            }
          }}
        >
          <Text style={styles.buttonText}>Solicitar Permissão</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { marginTop: 12, backgroundColor: '#6B7280' }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Escanear QR Code</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing={CameraType.back}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {processing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.processingText}>Processando...</Text>
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Posicione o QR Code dentro da área destacada
          </Text>
        </View>
      </View>

      {scanned && !processing && (
        <Pressable
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainButtonText}>Escanear novamente</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#1E40AF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  processingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  processingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
