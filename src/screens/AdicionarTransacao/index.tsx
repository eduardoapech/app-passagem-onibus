import { useState } from 'react';
import { Pressable, View,Text, Keyboard } from "react-native"
import { styles } from "./style"
import { useSelecaoCategoria } from '@/src/hooks/SelecaoCategoria/useSelecaoCategoria';
import { CategoriaTipo } from '@/src/enums/categoriaTipo';
import { InputModalCategoria } from '@/src/components/InputModalCategoria';
import { InputForm } from '@/src/components/InputForm';
import { SelecaoTipoCategoria } from '@/src/components/SelecaoTipoCategoria';
import { MetaModal } from "@/src/components/MarkModal";
import { useSelecaoMeta } from '@/src/hooks/SelecaoMeta/useSelecaoMeta';
import { TransacaoService } from '@/src/services/api/transacao';
import { BotaoSalvar } from '@/src/components/BotaoSalvar';
import { DataPicker } from '@/src/components/DataPicker';
import { Alert} from "@/src/components/Alert"

export const AdicionarTransacao = () =>{

    const [tipoTransacao, setTipoTransacao] = useState<CategoriaTipo>(CategoriaTipo.RECEITA);
    const [nomeNovaCategoria, setNomeNovaCategoria] = useState('');

    const [valor, setValor] = useState('');
    const [descricao, setDescricao] = useState('');
    const [data, setData] = useState('');
    const [salvando, setSalvando] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    const {
        modalVisible:categoriaModalVisible,
        categoriaSelecionada,
        criandoNova,
        categorias,
        loading:categoriaLoading,
        abrirModal:abrirCategoriaModal,
        fecharModal:fecharCategoriaModal,
        selecionarCategoria,
        iniciarCriacao,
        criarCategoria
    } = useSelecaoCategoria(tipoTransacao);

    const {
        modalVisible: metaModalVisible,
        metaSelecionada,
        metas,
        loading: metaLoading,
        abrirModal: abrirMetaModal,
        fecharModal: fecharMetaModal,
        selecionarMeta
    } = useSelecaoMeta();


    const mostrarAlerta = (titulo: string, mensagem: string) => {
        setAlertTitle(titulo);
        setAlertMessage(mensagem);
        setAlertVisible(true);
    };
    
    const handleCriarCategoria = async () => {
        if (nomeNovaCategoria.trim()) {
            try {
                await criarCategoria(nomeNovaCategoria);
                setNomeNovaCategoria('');
            } catch{
                mostrarAlerta("Erro", "Erro ao criar uma categoria. Tente novamente.");
            }
        }
    };

    const handleSalvarTransacao = async () => {
        // Validações básicas de campos obrigatórios
        if (!valor.trim() || !descricao.trim() || !data.trim() || !categoriaSelecionada) {
            mostrarAlerta("Atenção", "Preencha todos os campos obrigatórios");
            return;
        }

        // Validação do valor
        const valorLimpo = valor.replace(/\./g, '').replace(',', '.');
        const valorNumerico = parseFloat(valorLimpo);
        
        if (isNaN(valorNumerico)) {
            mostrarAlerta("Erro", "Valor inválido. Use apenas números");
            return;
        }

        if (valorNumerico <= 0) {
            mostrarAlerta("Atenção", "O valor deve ser maior que zero");
            return;
        }

        if (valorNumerico > 9999999.99) {
            mostrarAlerta("Atenção", "O valor não pode ser superior a 9.999.999,99");
            return;
        }

        if (valorNumerico < 0.01) {
            mostrarAlerta("Atenção", "O valor deve ser de pelo menos R$ 0,01");
            return;
        }

        // Validação da descrição
        if (descricao.trim().length < 2) {
            mostrarAlerta("Atenção", "A descrição deve ter pelo menos 2 caracteres");
            return;
        }

        if (descricao.trim().length > 15) {
            mostrarAlerta("Atenção", "A descrição não pode ter mais de 15 caracteres");
            return;
        }

        try {
            setSalvando(true);
            
            // Chama diretamente a service com os parâmetros corretos
            await TransacaoService.criarTransacao(
                parseFloat(valor.replace(',', '.')),
                descricao,                           
                data,                                
                categoriaSelecionada.id,            
                metaSelecionada?.id ? [metaSelecionada.id] : []
            );
            mostrarAlerta("Sucesso","Transação salva com sucesso!");
            
            // Limpa o formulário
            setValor('');
            setDescricao('');
            setData('');
            
        } catch {
            mostrarAlerta("Erro","Erro ao criar transação. Tente novamente.");
        } finally {
            setSalvando(false);
        }
    };

    
    return (
        <Pressable style={styles.container} onPress={Keyboard.dismiss}>
            <View style={styles.header}>
                <View style={styles.titleHeader}>
                    <Text style={styles.titleText}>
                        Nova Transação
                    </Text>
                </View>
            </View>

            <View style={styles.containerForm}>
                <View style={styles.form}>
                    <InputForm
                        label="Valor"
                        placeholder="Valor da transação"
                        iconName="cash-outline"
                        value={valor}
                        onChangeText={setValor}
                    />

                    <InputForm
                        label="Descrição"
                        placeholder="Descrição da transação"
                        iconName="information-circle-outline"
                        value={descricao}
                        onChangeText={setDescricao}
                    />

                    <DataPicker
                        label="Data"
                        placeholder="Data da transação"
                        value={data}
                        onChangeText={setData}
                    />

                    <SelecaoTipoCategoria
                        tipoTransacao={tipoTransacao}
                        onTipoChange={setTipoTransacao}
                    />

                    <InputForm
                        label="Categoria"
                        placeholder="Selecione/crie uma categoria"
                        iconName="chevron-down"
                        value={categoriaSelecionada?.nome}
                        onPress={abrirCategoriaModal}
                        isCombobox={true}
                    />

                    <InputForm
                        label="Meta"
                        placeholder="Selecione uma meta (opcional)"
                        iconName="chevron-down"
                        value={metaSelecionada?.nome}
                        onPress={abrirMetaModal}
                        isCombobox={true}
                    />

                    <View style={styles.botao}>
                        <BotaoSalvar 
                            onPress={handleSalvarTransacao}
                            loading={salvando}
                            disabled={!valor || !descricao || !data || !categoriaSelecionada}
                        />
                    </View>

                </View>
                    <Alert
                        visible={alertVisible}
                        title={alertTitle}
                        message={alertMessage}
                        onClose={() => setAlertVisible(false)}
                        confirmText="OK"
                    />
            </View>

             <InputModalCategoria
                visible={categoriaModalVisible}
                criandoNova={criandoNova}
                categorias={categorias}
                loading={categoriaLoading}
                nomeNovaCategoria={nomeNovaCategoria}
                onClose={fecharCategoriaModal}
                onCriarCategoria={handleCriarCategoria}
                onIniciarCriacao={iniciarCriacao}
                onSelecionarCategoria={selecionarCategoria}
                onNomeNovaCategoriaChange={setNomeNovaCategoria}
            />

             <MetaModal
                visible={metaModalVisible}
                metas={metas}
                loading={metaLoading}
                metaSelecionada={metaSelecionada}
                onClose={fecharMetaModal}
                onSelecionarMeta={selecionarMeta}
            />
        </Pressable>
  );
}