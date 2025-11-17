import { View, Text } from "react-native"
import { styles } from "./style";
import { InputForm } from "@/src/components/InputForm";
import { BotaoSalvar } from "@/src/components/BotaoSalvar";
import { DataPicker } from "@/src/components/DataPicker";
import { useState } from "react";
import { MetaService } from "@/src/services/api/metas";
import { useNavigation } from "../../constants/router";
import { Alert} from "@/src/components/Alert"


export const AdicionarMetaScreen = () => {

    const navigation = useNavigation();
    const [nome, setNome] = useState('');
    const [valorAlvo, setValorAlvo] = useState('');
    const [data, setData] = useState('');
    const [loading, setLoading] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');


    const mostrarAlerta = (titulo: string, mensagem: string) => {
        setAlertTitle(titulo);
        setAlertMessage(mensagem);
        setAlertVisible(true);
    };

    const handleCriarMeta = async () => {
        // Validações do nome
        if (!nome.trim()) {
            mostrarAlerta("Atenção", "Preencha o nome da meta");
            return;
        }

        if (nome.trim().length < 2) {
            mostrarAlerta("Atenção", "O nome da meta deve ter pelo menos 2 caracteres");
            return;
        }

        if (nome.trim().length > 50) {
            mostrarAlerta("Atenção", "O nome da meta não pode ter mais de 50 caracteres");
            return;
        }

        // Validações do valor
        if (!valorAlvo.trim()) {
            mostrarAlerta("Atenção", "Preencha o valor da meta");
            return;
        }

        // Limpa formatação do valor (remove pontos e troca vírgula por ponto)
        const valorLimpo = valorAlvo.replace(/\./g, '').replace(',', '.');
        const valorNumerico = parseFloat(valorLimpo);

        if (isNaN(valorNumerico)) {
            mostrarAlerta("Erro", "Use apenas números");
            return;
        }

        if (valorNumerico <= 0) {
            mostrarAlerta("Atenção", "O valor da meta deve ser maior que zero");
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

        // Validações da data
        if (!data.trim()) {
            mostrarAlerta("Atenção", "Preencha uma data");
            return;
        }

        setLoading(true);
        try {
            await MetaService.criarMeta(
                nome.trim(),
                Number(valorAlvo),
                data
            );
            
            mostrarAlerta("Sucesso", "A meta foi criada");
            
            // Limpa os campos
            setNome('');
            setValorAlvo('');
            setData('');
            
        } catch (error: any) {
            mostrarAlerta("Erro", error.response?.data?.message || "Erro ao criar meta. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };
    
    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleHeader}>
                    <Text style={styles.titleText}>
                        Adicionar Meta
                    </Text>
                </View>
            </View>

            <View style={styles.containerForm}>
                <View style={styles.form}>
                    <InputForm
                        label="Nome"
                        placeholder="Nome da meta"
                        iconName="information-circle-outline"
                        value={nome}
                        onChangeText={setNome}
                    />

                    <InputForm
                        label="Valor"
                        placeholder="Valor da meta"
                        iconName="information-circle-outline"
                        value={valorAlvo}
                        onChangeText={setValorAlvo}
                    />

                    <DataPicker
                        label="Data"
                        placeholder="Data da meta"
                        value={data}
                        onChangeText={setData}
                    />
                    
                </View>

                    <View style={styles.botao}>
                         <BotaoSalvar 
                            onPress={handleCriarMeta}
                            title="Adicionar Meta"
                            loading={loading}
                            disabled={loading}
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
    );
}