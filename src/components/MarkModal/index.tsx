import { MetaBasicaResponse } from "@/src/interfaces/meta/response";
import { Modal, View,Text, Pressable, ScrollView } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { styles } from "./style";


interface MetaModalProps {
  visible: boolean;
  metas: MetaBasicaResponse[];
  loading: boolean;
  metaSelecionada: MetaBasicaResponse | null;
  onClose: () => void;
  onSelecionarMeta: (meta: MetaBasicaResponse | null) => void;
}


export function MetaModal({
  visible,
  metas,
  loading,
  metaSelecionada,
  onClose,
  onSelecionarMeta
}: MetaModalProps) {


 
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecionar Meta</Text>

          <View style={styles.modalBody}>
            
            <Pressable 
              style={styles.nenhumaMetaButton}
              onPress={() => onSelecionarMeta(null)}
            >
              <Icon name="close-circle-outline" size={20} color="#858587" />
              <Text style={styles.nenhumaMetaText}>Nenhuma Meta</Text>
            </Pressable>

            <Text style={styles.metasTitle}>Metas ({metas.length})</Text>

            {loading ? (
              <Text style={styles.textoAviso}>Carregando metas...</Text>
            ) : metas.length === 0 ? (
              <View style={styles.semRegistrosContainer}>
                <Icon name="alert-circle-outline" size={40} color="#858587" />
                <Text style={styles.textoAviso}>Nenhuma meta encontrada</Text>
                <Text style={styles.textoInstrucao}>
                  Crie uma meta para associar a esta transação
                </Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.metasList}
                showsVerticalScrollIndicator={true}
              >
                {metas.map((item) => (
                  <Pressable
                      key={item.id}
                      style={[
                        styles.metaItem,
                        metaSelecionada?.id === item.id && styles.itemSelecionado
                      ]}
                      onPress={() => onSelecionarMeta(item)}
                  >
                      <View style={styles.metaInfo}>
                          <Text style={styles.metaText}>{item.nome}</Text>
                          <Text style={styles.metaDetalhes}>
                              R$ {item.valorAlvo.toFixed(2)} • {item.data}
                          </Text>
                      </View>
                      <Icon name="chevron-forward" size={16} color="#858587" />
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <Pressable 
              style={[styles.modalButton, styles.closeButton, { marginTop: 15 }]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}