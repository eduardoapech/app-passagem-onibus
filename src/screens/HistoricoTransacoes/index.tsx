import { useState } from 'react';
import { useApi } from '@/src/hooks/useApi';
import { View,Text, ScrollView, FlatList, TextInput, TouchableOpacity } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { styles } from "./style";

import { useHistoricoTransacoes } from "@/src/hooks/HistoricoTransacoes/useHistoricoTransacoes";
import { EstatisticaService } from '@/src/services/api/estatisticas';
import { CategoriaTipo } from '@/src/enums/categoriaTipo';
import { TransacaoService } from '@/src/services/api/transacao';
import { BotaoDeletarEditar } from '@/src/components/BotaoEditarDeletar';
import { ModalEditarTransacao } from '@/src/components/ModalEditarTransacao';
import { Alert} from "@/src/components/Alert"
  

export const HistoricoTransacoesScreen = ()=>{

    const { data: valor, loading:carregandoValor } = useApi(EstatisticaService.listarLucro);
    const [pesquisa, setPesquisa] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [transacaoSelecionada, setTransacaoSelecionada] = useState<any>(null);
    
    const {
        mes, 
        setMes,
        ano, 
        setAno,
        meses,
        anos,
        transacoesFiltradas,
        carregando: carregandoTransacoes,
    } = useHistoricoTransacoes(refreshKey);

    const [confirmAlertVisible, setConfirmAlertVisible] = useState(false);
    const [resultAlertVisible, setResultAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<{id: number, descricao: string} | null>(null);

    const transacoesFiltradasPorCategoria = transacoesFiltradas.filter(transacao => transacao.categoria?.nome.toLowerCase().includes(pesquisa.toLowerCase()));

    // Função para forçar atualização
    const forceRefresh = () => {
        setRefreshKey(prev => prev + 1);
        // Não precisa chamar refetchValores pois o useApi vai recarregar automaticamente
    };

     const mostrarAlerta = (titulo: string, mensagem: string) => {
        setAlertTitle(titulo);
        setAlertMessage(mensagem);
        setResultAlertVisible(true);
    };

    // Função para mostrar confirmação de exclusão
    const mostrarConfirmacaoExclusao = (id: number, descricao: string) => {
        setTransacaoParaExcluir({ id, descricao });
        setConfirmAlertVisible(true);
    };

    // Função para executar a exclusão após confirmação
    const executarExclusao = async () => {
        if (!transacaoParaExcluir) return;

        try {
            await TransacaoService.deletarPorTransacaoId(transacaoParaExcluir.id);
            forceRefresh();
            mostrarAlerta("Sucesso", "Transação excluída com sucesso!");
        } catch (error) {
            console.error('Erro ao excluir transação:', error);
            mostrarAlerta("Erro", "Não foi possível excluir a transação.");
        } finally {
            setTransacaoParaExcluir(null);
            setConfirmAlertVisible(false);
        }
    };

    // Função para cancelar a exclusão
    const cancelarExclusao = () => {
        setTransacaoParaExcluir(null);
        setConfirmAlertVisible(false);
    };

    // Função para abrir modal de edição
    const handleEditTransacao = (transacao: any) => {
        setTransacaoSelecionada(transacao);
        setModalEditarVisible(true);
    };

    // Função quando a edição é bem sucedida
    const handleEdicaoSucesso = () => {
        forceRefresh();
        setModalEditarVisible(false);
    };

    // Função para fechar o modal
    const handleFecharModal = () => {
        setModalEditarVisible(false);
        setTransacaoSelecionada(null);
    };

    return(
            <View style={{ flex: 1 }}>
            <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.titleHeader}>
                        <Text style={styles.titleText}>
                            Histórico de Transações
                        </Text>
                    </View>
                </View>

                <View style={styles.container}>

                    <View style={styles.containerCard}>
                        <View style={styles.card}>
                            <View style={styles.cardText}>
                                <Text style={styles.text}>Receitas Totais</Text>
                                <Text style={styles.textValueReceita}>R${valor?.receitas.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.containerCard}>
                        <View style={styles.card}>
                            <View style={styles.cardText}>
                                <Text style={styles.text}>Despesas Totais</Text>
                                <Text style={styles.textValueDespesa}>R${valor?.despesas.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.containerCard}>
                        <View style={styles.card}>
                            <View style={styles.cardText}>
                                <Text style={styles.text}>Saldo Total</Text>
                                <Text style={styles.textValueSaldo}>R${valor?.lucro.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.transacoesHeader}>
                        <Text style={styles.transacoesTitle}>Histórico de Transações</Text>
                    </View>

                    <View style={styles.periodContainer}>
                        <Text style={styles.periodLabel}>Período:</Text>
                        <View style={styles.selectorsContainer}>
                            <View style={styles.pickerWrapperMes}>
                                <Picker
                                    selectedValue={mes}
                                    onValueChange={setMes}
                                    style={styles.pickerMes}
                                    dropdownIconColor="#FFFFFF"
                                >
                                    {meses.map((monthName, index) => (
                                    <Picker.Item 
                                        key={index} 
                                        label={monthName} 
                                        value={index === 0 ? 'todos' : index}
                                    />
                                    ))}
                                </Picker>
                            </View>
                            <View style={styles.pickerWrapperAno}>
                                <Picker
                                    selectedValue={ano}
                                    onValueChange={setAno}
                                    style={styles.pickerAno}
                                    dropdownIconColor="#FFFFFF"
                                >
                                    {anos.map(anoItem => (
                                        <Picker.Item 
                                            key={anoItem} 
                                            label={anoItem.toString()} 
                                            value={anoItem} 
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    <View style={styles.pesquisaContainer}>
                        <TextInput
                            style={styles.pesquisaInput}
                            placeholder="Pesquisar por categoria..."
                            placeholderTextColor="#999"
                            value={pesquisa}
                            onChangeText={setPesquisa}
                        />
                    </View>

                    {!carregandoTransacoes && transacoesFiltradasPorCategoria && transacoesFiltradasPorCategoria.length > 0 ? (
                    <View style={styles.transacoesListContainer}>
                        <FlatList
                            data={transacoesFiltradasPorCategoria}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.transacaoContainer}>
                                    <View style={styles.transacaoCard}>

                                        <View style={styles.contentLeft}>
                                            {/* Descrição - mostra nome completo */}
                                            <Text style={styles.descricao}>
                                                {item.descricao}
                                            </Text>

                                            {/* Categoria */}
                                            {item.categoria && (
                                                <Text style={styles.categoriaNome}>
                                                    {item.categoria.nome}
                                                </Text>
                                            )}

                                            {/* Metas - mostra nome completo */}
                                            {item.metas && item.metas.length > 0 && (
                                                <View style={styles.metasContainer}>
                                                    {item.metas.map((meta: any) => (
                                                        <Text 
                                                            key={meta.id} 
                                                            style={styles.metaNome}
                                                        >
                                                            Meta: {meta.nome}
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}

                                            {/* Data - agora embaixo de tudo */}
                                            <Text style={styles.data}>{item.data}</Text>
                                        </View>

                                        <View style={styles.contentRight}>
                                            <Text
                                                style={[
                                                    styles.valor,
                                                    item.categoria?.tipo === CategoriaTipo.RECEITA ? styles.valorReceita :
                                                    item.categoria?.tipo === CategoriaTipo.DESPESA ? styles.valorDespesa :
                                                    styles.valorNeutro,
                                                ]}
                                            >
                                                R${item.valor.toFixed(2)}
                                            </Text>

                                            <BotaoDeletarEditar 
                                                onEdit={() => handleEditTransacao(item)}
                                                onDelete={() => mostrarConfirmacaoExclusao(item.id, item.descricao)}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}
                            scrollEnabled={false}
                        />
                    </View>
                    ) : (
                        <Text style={styles.emptyText}>
                            {carregandoTransacoes ? 'Carregando...' : 'Nenhuma transação cadastrada'}
                        </Text>
                    )}
                </View>
            </ScrollView>

            <ModalEditarTransacao
                visible={modalEditarVisible}
                transacao={transacaoSelecionada}
                onClose={handleFecharModal}
                onSuccess={handleEdicaoSucesso}
            />

            {confirmAlertVisible && (
                <View style={styles.customAlertOverlay}>
                    <View style={styles.customAlertContainer}>
                        <View style={styles.customAlertHeader}>
                            <Text style={styles.customAlertTitle}>Confirmar exclusão</Text>
                        </View>
                        
                        <View style={styles.customAlertBody}>
                            <Text style={styles.customAlertMessage}>
                                {`Tem certeza que deseja excluir a transação "${transacaoParaExcluir?.descricao}"?`}
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
        </View>
    );
}