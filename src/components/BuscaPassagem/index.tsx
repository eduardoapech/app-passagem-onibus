import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { BuscaPassagem as IBuscaPassagem, Cidade } from '@/src/interfaces/passagem';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SelecaoCidadeMapa } from '@/src/components/SelecaoCidadeMapa';
import { calcularDistancia, calcularTempoViagem, formatarTempoViagem } from '@/src/services/calculadoraDistancia';
import { useTema } from '@/src/hooks/useTema';
import { useTamanhoFonte } from '@/src/hooks/useTamanhoFonte';
import { CoresType } from '@/src/constants/colors';

interface BuscaPassagemProps {
  onBuscar: (busca: IBuscaPassagem) => void;
  loading?: boolean;
}

export function BuscaPassagem({ onBuscar, loading = false }: BuscaPassagemProps) {
  const { cores, temaAtual } = useTema();
  const { tamanhos, tamanhoFonte } = useTamanhoFonte();
  const [origem, setOrigem] = useState<Cidade | null>(null);
  const [destino, setDestino] = useState<Cidade | null>(null);
  const [dataIda, setDataIda] = useState<Date>(new Date());
  const [dataVolta, setDataVolta] = useState<Date | null>(null);
  const [tipoViagem, setTipoViagem] = useState<'IDA' | 'IDA_VOLTA'>('IDA');
  const [passageiros, setPassageiros] = useState(1);
  const [showDataIda, setShowDataIda] = useState(false);
  const [showDataVolta, setShowDataVolta] = useState(false);
  const [showMapaOrigem, setShowMapaOrigem] = useState(false);
  const [showMapaDestino, setShowMapaDestino] = useState(false);

  const styles = useMemo(() => getStyles(cores, tamanhos), [temaAtual, tamanhoFonte]);

  const handleBuscar = () => {
    if (!origem || !destino) {
      return;
    }

    // Criar cópias das cidades para não modificar as originais
    const origemCopia = { ...origem };
    const destinoCopia = { ...destino };

    // Calcular distância e tempo (assíncrono)
    const calcularRota = async () => {
      try {
        // Enriquecer cidades com coordenadas se não tiverem
        const { GeocodificacaoService } = await import('@/src/services/api/geocodificacao');
        
        if (!origemCopia.latitude || !origemCopia.longitude) {
          try {
            const coordenadas = await GeocodificacaoService.buscarCoordenadas(origemCopia);
            origemCopia.latitude = coordenadas.latitude;
            origemCopia.longitude = coordenadas.longitude;
          } catch (error) {
            console.warn('Erro ao obter coordenadas da origem:', error);
          }
        }

        if (!destinoCopia.latitude || !destinoCopia.longitude) {
          try {
            const coordenadas = await GeocodificacaoService.buscarCoordenadas(destinoCopia);
            destinoCopia.latitude = coordenadas.latitude;
            destinoCopia.longitude = coordenadas.longitude;
          } catch (error) {
            console.warn('Erro ao obter coordenadas do destino:', error);
          }
        }

        // Calcular rota se tiver coordenadas
        if (origemCopia.latitude && origemCopia.longitude && destinoCopia.latitude && destinoCopia.longitude) {
          try {
            const { calcularRotaCompleta } = await import('@/src/services/calculadoraDistancia');
            const rota = await calcularRotaCompleta(origemCopia, destinoCopia);
            
            // Adicionar informações calculadas às cidades
            origemCopia.distanciaKm = rota.distanciaKm;
            origemCopia.tempoViagem = formatarTempoViagem(rota.tempoHoras, rota.tempoMinutos);
            destinoCopia.distanciaKm = rota.distanciaKm;
            destinoCopia.tempoViagem = formatarTempoViagem(rota.tempoHoras, rota.tempoMinutos);
          } catch (error) {
            console.warn('Erro ao calcular rota:', error);
            // Continuar mesmo sem calcular rota
          }
        }
      } catch (error) {
        console.warn('Erro ao processar cidades:', error);
        // Continuar mesmo com erro
      }

      onBuscar({
        origem: origemCopia,
        destino: destinoCopia,
        dataIda,
        dataVolta: tipoViagem === 'IDA_VOLTA' ? dataVolta : null,
        tipoViagem,
        passageiros,
      });
    };

    calcularRota();
  };

  const trocarOrigemDestino = () => {
    const temp = origem;
    setOrigem(destino);
    setDestino(temp);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tipoViagemContainer}>
        <Pressable
          style={[styles.tipoViagemButton, tipoViagem === 'IDA' && styles.tipoViagemButtonActive]}
          onPress={() => {
            setTipoViagem('IDA');
            setDataVolta(null);
          }}
        >
          <Text style={[styles.tipoViagemText, tipoViagem === 'IDA' && styles.tipoViagemTextActive]}>
            Ida
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tipoViagemButton, tipoViagem === 'IDA_VOLTA' && styles.tipoViagemButtonActive]}
          onPress={() => setTipoViagem('IDA_VOLTA')}
        >
          <Text style={[styles.tipoViagemText, tipoViagem === 'IDA_VOLTA' && styles.tipoViagemTextActive]}>
            Ida e Volta
          </Text>
        </Pressable>
      </View>

      <View style={styles.inputContainer}>
        <Pressable style={styles.inputWrapper} onPress={() => setShowMapaOrigem(true)}>
          <Icon name="location-on" size={tamanhos.iconSm} color={cores.primary} style={styles.inputIcon} />
          <View style={styles.inputTextContainer}>
            <Text style={styles.inputLabel}>Origem</Text>
            <Text style={[styles.inputText, !origem && styles.inputTextPlaceholder]} numberOfLines={2}>
              {origem 
                ? `${origem.nome.replace(', Brasil', '')}${origem.sigla ? `, ${origem.sigla}` : origem.estado ? `, ${origem.estado}` : ''}`
                : 'Selecione a cidade de origem'}
            </Text>
          </View>
          {origem && destino && (
            <Pressable onPress={(e) => { e.stopPropagation(); trocarOrigemDestino(); }} style={styles.trocarButton}>
              <Icon name="swap-vert" size={tamanhos.iconSm} color={cores.textSecondary} />
            </Pressable>
          )}
        </Pressable>
      </View>

      <View style={styles.inputContainer}>
        <Pressable style={styles.inputWrapper} onPress={() => setShowMapaDestino(true)}>
          <Icon name="location-on" size={tamanhos.iconSm} color={cores.error} style={styles.inputIcon} />
          <View style={styles.inputTextContainer}>
            <Text style={styles.inputLabel}>Destino</Text>
            <Text style={[styles.inputText, !destino && styles.inputTextPlaceholder]} numberOfLines={2}>
              {destino 
                ? `${destino.nome.replace(', Brasil', '')}${destino.sigla ? `, ${destino.sigla}` : destino.estado ? `, ${destino.estado}` : ''}`
                : 'Selecione a cidade de destino'}
            </Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.datesContainer}>
        <Pressable style={styles.dateButton} onPress={() => setShowDataIda(true)}>
          <Icon name="calendar-today" size={tamanhos.iconSm} color={cores.primary} />
          <View style={styles.dateContent}>
            <Text style={styles.dateLabel}>Data de Ida</Text>
            <Text style={styles.dateValue}>{format(dataIda, "dd 'de' MMM", { locale: ptBR })}</Text>
          </View>
        </Pressable>

        {tipoViagem === 'IDA_VOLTA' && (
          <Pressable style={styles.dateButton} onPress={() => setShowDataVolta(true)}>
            <Icon name="calendar-today" size={tamanhos.iconSm} color={cores.primary} />
            <View style={styles.dateContent}>
              <Text style={styles.dateLabel}>Data de Volta</Text>
              <Text style={styles.dateValue}>
                {dataVolta ? format(dataVolta, "dd 'de' MMM", { locale: ptBR }) : 'Selecione'}
              </Text>
            </View>
          </Pressable>
        )}
      </View>

      <View style={styles.passageirosContainer}>
        <Text style={styles.passageirosLabel}>Passageiros</Text>
        <View style={styles.passageirosButtons}>
          <Pressable
            style={styles.passageirosButton}
            onPress={() => setPassageiros(Math.max(1, passageiros - 1))}
          >
            <Icon name="remove" size={tamanhos.iconSm} color={cores.textSecondary} />
          </Pressable>
          <Text style={styles.passageirosValue}>{passageiros}</Text>
          <Pressable
            style={styles.passageirosButton}
            onPress={() => setPassageiros(Math.min(10, passageiros + 1))}
          >
            <Icon name="add" size={tamanhos.iconSm} color={cores.textSecondary} />
          </Pressable>
        </View>
      </View>

      <Pressable
        style={[styles.buscarButton, (!origem || !destino || loading) && styles.buscarButtonDisabled]}
        onPress={handleBuscar}
        disabled={!origem || !destino || loading}
      >
        <Icon name="search" size={tamanhos.iconMd} color="#FFFFFF" />
        <Text style={styles.buscarButtonText}>Buscar Passagens</Text>
      </Pressable>

      {showDataIda && (
        <DateTimePicker
          value={dataIda}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDataIda(false);
            if (selectedDate) {
              setDataIda(selectedDate);
            }
          }}
        />
      )}

      {showDataVolta && (
        <DateTimePicker
          value={dataVolta || new Date()}
          mode="date"
          display="default"
          minimumDate={dataIda}
          onChange={(event, selectedDate) => {
            setShowDataVolta(false);
            if (selectedDate) {
              setDataVolta(selectedDate);
            }
          }}
        />
      )}

      <SelecaoCidadeMapa
        visible={showMapaOrigem}
        onClose={() => setShowMapaOrigem(false)}
        onSelect={(cidade) => setOrigem(cidade)}
        title="Selecionar Origem"
        tipo="origem"
      />

      <SelecaoCidadeMapa
        visible={showMapaDestino}
        onClose={() => setShowMapaDestino(false)}
        onSelect={(cidade) => setDestino(cidade)}
        title="Selecionar Destino"
        tipo="destino"
      />
    </View>
  );
}

function getStyles(cores: CoresType, tamanhos: any) {
  return StyleSheet.create({
    container: {
      backgroundColor: cores.backgroundCard,
      borderRadius: 12,
      padding: tamanhos.spacingLg,
      marginHorizontal: tamanhos.spacingLg,
      marginTop: tamanhos.spacingLg,
      shadowColor: cores.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    tipoViagemContainer: {
      flexDirection: 'row',
      gap: tamanhos.spacingSm,
      marginBottom: tamanhos.spacingLg,
    },
    tipoViagemButton: {
      flex: 1,
      paddingVertical: tamanhos.spacingMd,
      borderRadius: 8,
      backgroundColor: cores.background,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: cores.border,
    },
    tipoViagemButtonActive: {
      backgroundColor: cores.primary,
      borderColor: cores.primary,
    },
    tipoViagemText: {
      fontSize: tamanhos.sm,
      fontWeight: '600',
      color: cores.textSecondary,
    },
    tipoViagemTextActive: {
      color: '#FFFFFF',
    },
    inputContainer: {
      marginBottom: tamanhos.spacingMd,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: cores.background,
      borderRadius: 8,
      padding: tamanhos.spacingMd,
      borderWidth: 1,
      borderColor: cores.border,
    },
    inputIcon: {
      marginRight: tamanhos.spacingMd,
    },
    inputTextContainer: {
      flex: 1,
    },
    inputLabel: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
      marginBottom: tamanhos.spacingXs / 2,
    },
    inputText: {
      fontSize: tamanhos.md,
      color: cores.text,
      fontWeight: '600',
    },
    inputTextPlaceholder: {
      color: cores.textTertiary,
    },
    trocarButton: {
      padding: tamanhos.spacingXs,
    },
    datesContainer: {
      flexDirection: 'row',
      gap: tamanhos.spacingMd,
      marginBottom: tamanhos.spacingMd,
    },
    dateButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: cores.background,
      borderRadius: 8,
      padding: tamanhos.spacingMd,
      borderWidth: 1,
      borderColor: cores.border,
      gap: tamanhos.spacingMd,
    },
    dateContent: {
      flex: 1,
    },
    dateLabel: {
      fontSize: tamanhos.xs,
      color: cores.textSecondary,
      marginBottom: tamanhos.spacingXs / 2,
    },
    dateValue: {
      fontSize: tamanhos.sm,
      color: cores.text,
      fontWeight: '600',
    },
    passageirosContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tamanhos.spacingLg,
      paddingVertical: tamanhos.spacingMd,
      paddingHorizontal: tamanhos.spacingMd,
      backgroundColor: cores.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: cores.border,
    },
    passageirosLabel: {
      fontSize: tamanhos.sm,
      fontWeight: '600',
      color: cores.text,
    },
    passageirosButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tamanhos.spacingMd,
    },
    passageirosButton: {
      width: tamanhos.iconMd,
      height: tamanhos.iconMd,
      borderRadius: tamanhos.iconMd / 2,
      backgroundColor: cores.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    passageirosValue: {
      fontSize: tamanhos.md,
      fontWeight: '700',
      color: cores.text,
      minWidth: tamanhos.spacingXl,
      textAlign: 'center',
    },
    buscarButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: cores.primary,
      borderRadius: 8,
      paddingVertical: tamanhos.spacingLg,
      gap: tamanhos.spacingMd,
    },
    buscarButtonDisabled: {
      backgroundColor: cores.textTertiary,
      opacity: 0.6,
    },
    buscarButtonText: {
      fontSize: tamanhos.md,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
}

