import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Modal, Pressable, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { styles } from './style';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Cidade } from '@/src/interfaces/passagem';
import { PassagemService } from '@/src/services/api/passagens';

interface SelecaoCidadeMapaProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (cidade: Cidade) => void;
  title: string;
  tipo: 'origem' | 'destino';
}

export function SelecaoCidadeMapa({ visible, onClose, onSelect, title, tipo }: SelecaoCidadeMapaProps) {
  const [searchText, setSearchText] = useState('');
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      setSearchText('');
      setCidades([]);
      setLoading(false);
    }
  }, [visible]);

  const buscarCidades = useCallback(async (termo: string) => {
    if (!termo || termo.trim().length < 2) {
      setCidades([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Buscar cidades e enriquecer com coordenadas (primeiras 10)
      const resultados = await PassagemService.buscarCidadesComCoordenadas(termo.trim());
      setCidades(resultados);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      // Fallback: buscar sem coordenadas
      try {
        const resultados = await PassagemService.buscarCidades(termo.trim());
        setCidades(resultados);
      } catch (fallbackError) {
        console.error('Erro no fallback de busca de cidades:', fallbackError);
        setCidades([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Limpar cidades se o texto estiver vazio ou muito curto
    if (!searchText || searchText.trim().length < 2) {
      setCidades([]);
      setLoading(false);
      return;
    }

    // Debounce da busca
    searchTimeoutRef.current = setTimeout(() => {
      if (searchText.trim().length >= 2) {
        buscarCidades(searchText.trim());
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText, buscarCidades]);

  const handleSelecionarCidade = (cidade: Cidade) => {
    // Manter o nome original da cidade
    onSelect(cidade);
    setSearchText('');
    setCidades([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#1F2937" />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Digite o nome da cidade (ex: Horizontina, RS)"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
            autoFocus
            returnKeyType="search"
          />
        </View>
        
        {searchText.length > 0 && searchText.length < 2 && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Digite pelo menos 2 caracteres para buscar</Text>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#1E40AF" />
          </View>
        )}

        {cidades.length > 0 && !loading && (
          <FlatList
            data={cidades}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.cidadeItem}
                onPress={() => handleSelecionarCidade(item)}
              >
                <Icon name="location-on" size={20} color="#1E40AF" />
                <View style={styles.cidadeInfo}>
                  <Text style={styles.cidadeNome}>{item.nome}</Text>
                  <Text style={styles.cidadeEstado}>{item.estado} - {item.sigla}</Text>
                  {item.terminal && (
                    <Text style={styles.cidadeTerminal}>{item.terminal}</Text>
                  )}
                </View>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </Pressable>
            )}
            style={styles.cidadesList}
          />
        )}

        {!loading && cidades.length === 0 && searchText.trim().length >= 2 && (
          <View style={styles.emptyContainer}>
            <Icon name="location-off" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Nenhuma cidade encontrada</Text>
            <Text style={styles.emptySubtext}>Tente buscar por nome da cidade ou estado</Text>
          </View>
        )}
        
        {!loading && cidades.length === 0 && searchText.trim().length === 0 && (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Busque por cidade</Text>
            <Text style={styles.emptySubtext}>Digite o nome da cidade, estado ou sigla (ex: Horizontina, RS)</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}
