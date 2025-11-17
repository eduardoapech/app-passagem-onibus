import { View, Text, FlatList, ScrollView, TouchableOpacity } from "react-native"
import { styles } from "./style";
import { ProgressoMetaResponse } from "@/src/interfaces/estatistica/response";
import { EstatisticaService } from "@/src/services/api/estatisticas";
import { useNavigation } from "../../constants/router";
import { BotaoSalvar } from "@/src/components/BotaoSalvar";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Meta } from "@/src/interfaces/meta";
import { Usuario } from "@/src/interfaces/usuario";
import { MetaService } from "@/src/services/api/metas";
import { MetaModalEditar } from "@/src/components/ModalEditarMeta";
import { BotaoDeletarEditar } from "@/src/components/BotaoEditarDeletar";
import { Alert } from "@/src/components/Alert";


export const MetasScreen = () => {
    
    const navigation = useNavigation();
    
    const [progressoDaMeta, setProgressoDaMeta] = useState<ProgressoMetaResponse[]>([]);
    const [carregandoProgresso, setCarregandoProgresso] = useState(true);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [metaSelecionada, setMetaSelecionada] = useState<Meta | null>(null);

    const [confirmAlertVisible, setConfirmAlertVisible] = useState(false);
    const [resultAlertVisible, setResultAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [metaParaExcluir, setMetaParaExcluir] = useState<{id: number, nome: string} | null>(null);

    const carregarMetas = async () => {
        try {
            setCarregandoProgresso(true);
            const data = await EstatisticaService.listarProgressoDaMeta();
            setProgressoDaMeta(data);
        } catch {
            setProgressoDaMeta([]);
        } finally {
            setCarregandoProgresso(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            carregarMetas();
        }, [])
    );

    const mostrarAlerta = (titulo: string, mensagem: string) => {
        setAlertTitle(titulo);
        setAlertMessage(mensagem);
        setResultAlertVisible(true);
    };

    // Função para mostrar confirmação de exclusão
    const mostrarConfirmacaoExclusao = (id: number, nome: string) => {
        setMetaParaExcluir({ id, nome });
        setConfirmAlertVisible(true);
    };

    // Função para executar a exclusão após confirmação
    const executarExclusao = async () => {
        if (!metaParaExcluir) return;

        try {
            await MetaService.deletarMeta(metaParaExcluir.id);
            await carregarMetas();
            mostrarAlerta("Sucesso", "Meta excluída com sucesso!");
        } catch (error) {
            console.error('Erro ao excluir meta:', error);
            mostrarAlerta("Erro", "Não foi possível excluir a meta.");
        } finally {
            setMetaParaExcluir(null);
            setConfirmAlertVisible(false);
        }
    };

    // Função para cancelar a exclusão
    const cancelarExclusao = () => {
        setMetaParaExcluir(null);
        setConfirmAlertVisible(false);
    };

    const handleEditarMeta = (metaProgresso: ProgressoMetaResponse) => {
        const metaConvertida = converterParaMeta(metaProgresso);
        setMetaSelecionada(metaConvertida);
        setModalEditarVisible(true);
    };

    const handleSalvarEdicao = async (metaEditada: Meta) => {
        try {
            await MetaService.editarPorMetaId(
                metaEditada.id,
                metaEditada.nome,
                metaEditada.valorAlvo,
                metaEditada.data
            );
            
            setModalEditarVisible(false);
            await carregarMetas();
            mostrarAlerta("Sucesso", "Meta atualizada com sucesso!");
        } catch (error) {
            console.error('Erro ao atualizar meta:', error);
            mostrarAlerta("Erro", "Não foi possível atualizar a meta.");
        }
    };


    const handleFecharModal = () => {
        setModalEditarVisible(false);
        setMetaSelecionada(null);
    };

     // Converter ProgressoMetaResponse para Meta
    const converterParaMeta = (metaProgresso: ProgressoMetaResponse): Meta => {
        const dataPadrao = new Date();
        dataPadrao.setMonth(dataPadrao.getMonth() + 1);
        
        const formatarDataParaAPI = (data: Date): string => {
            const ano = data.getFullYear();
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const dia = String(data.getDate()).padStart(2, '0');
            return `${ano}-${mes}-${dia}`;
        };

        return {
            id: metaProgresso.metaId,
            nome: metaProgresso.metaNome,
            valorAlvo: metaProgresso.valorAlvo,
            data: formatarDataParaAPI(dataPadrao),
            status: metaProgresso.status,
            usuario: {} as Usuario
        };
    };
    
    return(
        <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>

        
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.titleHeader}>
                        <Text style={styles.titleText}>
                            Historico de Metas
                        </Text>
                    </View>
                </View>

                <View style={styles.containerMetas}>
                    <Text style={styles.subtitle}>Minhas metas</Text>
                    <FlatList
                        data={progressoDaMeta}
                        keyExtractor={(item) => item.metaId.toString()}
                        renderItem={({ item }) => (
                        <View style={styles.cardMeta}>
                            {/* Cabeçalho do card com título e botões */}
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitleMeta}>{item.metaNome}</Text>
                                <BotaoDeletarEditar
                                    onEdit={() => handleEditarMeta(item)}
                                    onDelete={() => mostrarConfirmacaoExclusao(item.metaId, item.metaNome)}
                                />
                            </View>

                            {/* Barra de progresso */}
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                        styles.progressFill,
                                        { width: `${Math.min(item.percentualConcluido, 100)}%` },
                                        ]}>
                                    </View>
                                </View>

                                <View style={styles.progressInfo}>
                                    <Text style={styles.cardSubTitleMeta}>
                                        R${item.valorAtual.toFixed(2)} de R$
                                        {item.valorAlvo.toFixed(2)}
                                    </Text>

                                    <Text style={styles.cardSubTitlePercent}>
                                        {Math.min(item.percentualConcluido, 100)}%
                                    </Text>
                                </View>
                            </View>
                        </View>
                        )}

                        ListEmptyComponent={
                        <Text style={styles.emptyText}>Nenhuma meta cadastrada</Text>
                        }
                        scrollEnabled={false}
                    />

                    <View style={styles.botao}>
                        <BotaoSalvar
                            onPress={navigation.adicionarMeta}
                            title="Adicionar Meta"
                        />
                    </View>
                </View>
            </View>

             {/* Modal de Edição de Meta */}
            <MetaModalEditar
                visible={modalEditarVisible}
                meta={metaSelecionada}
                onClose={handleFecharModal}
                onSave={handleSalvarEdicao}
            />
            
            {/* Alert de Confirmação de Exclusão */}
            {confirmAlertVisible && (
                <View style={styles.customAlertOverlay}>
                    <View style={styles.customAlertContainer}>
                        <View style={styles.customAlertHeader}>
                            <Text style={styles.customAlertTitle}>Confirmar exclusão</Text>
                        </View>
                        
                        <View style={styles.customAlertBody}>
                            <Text style={styles.customAlertMessage}>
                                Tem certeza que deseja excluir a meta "{metaParaExcluir?.nome}"?
                            </Text>
                        </View>
                        
                        <View style={styles.customAlertFooter}>
                            <TouchableOpacity 
                                style={styles.customAlertCancelButton} 
                                onPress={cancelarExclusao}
                            >
                                <Text style={styles.customAlertCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.customAlertConfirmButton} 
                                onPress={executarExclusao}
                            >
                                <Text style={styles.customAlertConfirmText}>Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Alert de Resultado */}
            <Alert
                visible={resultAlertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setResultAlertVisible(false)}
                confirmText="OK"
            />

        </ScrollView>
          
    );
}