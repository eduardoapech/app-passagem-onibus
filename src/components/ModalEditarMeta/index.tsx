import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity,KeyboardAvoidingView,Platform, ScrollView } from 'react-native';
import { styles } from './style';
import { Meta } from '@/src/interfaces/meta';
import { BotaoSalvar } from '../BotaoSalvar';
import { Alert} from "@/src/components/Alert"


interface MetaModalEditarProps {
  visible: boolean;
  meta: Meta | null;
  onClose: () => void;
  onSave: (metaEditada: Meta) => void;
  salvando?: boolean;
}

export const MetaModalEditar = ({ 
  visible, 
  meta, 
  onClose, 
  onSave,
  salvando = false
}: MetaModalEditarProps) => {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (meta) {
      setNome(meta.nome || '');
      setValor(meta.valorAlvo ? meta.valorAlvo.toString() : '');
      setData(meta.data || '');
    }
  }, [meta]);

  const mostrarAlerta = (titulo: string, mensagem: string) => {
    setAlertTitle(titulo);
    setAlertMessage(mensagem);
    setAlertVisible(true);
  };

  const handleSalvar = () => {
    if (!nome.trim() || !valor || !data) {
      mostrarAlerta("Atenção", "Preencha todos os campos");
      return;
    }

    if (!meta) {
      mostrarAlerta("Erro","Meta não encontrada");
      return;
    }

    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico)) {
      mostrarAlerta("Atenção","Valor inválido");
      return;
    }

    const metaEditada: Meta = {
      ...meta,
      nome: nome.trim(),
      valorAlvo: valorNumerico,
      data: data
    };

    onSave(metaEditada);
  };

  const handleCancelar = () => {
    if (!salvando) {
      onClose();
    }
  };

  const formatarValor = (text: string) => {
    let cleaned = text.replace(/[^\d,]/g, '');
    const parts = cleaned.split(',');
    if (parts.length > 2) {
      cleaned = parts[0] + ',' + parts.slice(1).join('');
    }
    return cleaned;
  };


  return (
      <View>
        <Modal
          visible={visible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCancelar}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContainer}>
              {/* Header do Modal */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Meta</Text>
                <TouchableOpacity onPress={handleCancelar} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                {/* Nome da Meta */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Nome da Meta</Text>
                  <TextInput
                    style={styles.textInput}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Digite o nome da meta"
                    placeholderTextColor="#999"
                    editable={!salvando}
                  />
                </View>

                {/* Valor da Meta */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Valor da Meta</Text>
                  <TextInput
                    style={styles.textInput}
                    value={valor}
                    onChangeText={(text) => setValor(formatarValor(text))}
                    placeholder="R$ 0,00"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                    editable={!salvando}
                  />
                </View>

                {/* Data Alvo */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Data Alvo</Text>
                  <TextInput
                    style={styles.textInput}
                    value={data}
                    onChangeText={setData}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    editable={!salvando}
                    maxLength={10}
                  />
                </View>
                </ScrollView>

              {/* Footer do Modal */}
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={handleCancelar}
                  disabled={salvando}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <BotaoSalvar
                  onPress={handleSalvar}
                  loading={salvando}
                  title="Salvar"
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Alert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
          confirmText="OK"
        />
      </View>
  );
}