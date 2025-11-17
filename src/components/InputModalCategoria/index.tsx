import { Modal, View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CategoriaBasicaResponse } from '@/src/interfaces/categoria/response';
import { styles } from './style';


    interface ModalCategoriaProps {
        visible: boolean;
        criandoNova: boolean;
        categorias: CategoriaBasicaResponse[];
        loading: boolean;
        nomeNovaCategoria: string;
        onClose: () => void;
        onCriarCategoria: () => void;
        onIniciarCriacao: () => void;
        onSelecionarCategoria: (categoria: CategoriaBasicaResponse) => void;
        onNomeNovaCategoriaChange: (text: string) => void;
    }

    export function InputModalCategoria({
        visible,
        criandoNova,
        categorias,
        loading,
        nomeNovaCategoria,
        onClose,
        onCriarCategoria,
        onIniciarCriacao,
        onSelecionarCategoria,
        onNomeNovaCategoriaChange
        }: ModalCategoriaProps) {
        return (
            <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {criandoNova ? 'Nova Categoria' : 'Selecionar Categoria'}
                        </Text>

                        {criandoNova ? (
                            <CreateCategoryView
                            nomeNovaCategoria={nomeNovaCategoria}
                            loading={loading}
                            onNomeChange={onNomeNovaCategoriaChange}
                            onCriar={onCriarCategoria}
                            onCancelar={onClose}
                            />
                        ) : (
                            <SelectCategoryView
                            categorias={categorias}
                            onIniciarCriacao={onIniciarCriacao}
                            onSelecionarCategoria={onSelecionarCategoria}
                            onClose={onClose}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        );
        }

        // Subcomponente para criação de categoria
        function CreateCategoryView({
            nomeNovaCategoria,
            loading,
            onNomeChange,
            onCriar,
            onCancelar
            }: {
            nomeNovaCategoria: string;
            loading: boolean;
            onNomeChange: (text: string) => void;
            onCriar: () => void;
            onCancelar: () => void;
        }) {
        return (
            <View style={styles.modalBody}>
                <TextInput
                    style={styles.modalInput}
                    placeholder="Digite o nome da categoria"
                    value={nomeNovaCategoria}
                    onChangeText={onNomeChange}
                    autoFocus={true}
                    onSubmitEditing={onCriar}
                />
                <View style={styles.modalButtons}>
                    <Pressable style={styles.modalButton} onPress={onCancelar}>
                        <Text style={styles.modalButtonText}>Cancelar</Text>
                    </Pressable>

                    <Pressable 
                    style={[styles.modalButton, styles.primaryButton]}
                    onPress={onCriar}
                    disabled={!nomeNovaCategoria.trim() || loading}
                    >
                        <Text style={styles.primaryButtonText}>
                            {loading ? 'Criando...' : 'Criar'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
        }

        // Subcomponente para seleção de categoria
        function SelectCategoryView({
            categorias,
            onIniciarCriacao,
            onSelecionarCategoria,
            onClose
        }: {
            categorias: CategoriaBasicaResponse[];
            onIniciarCriacao: () => void;
            onSelecionarCategoria: (categoria: CategoriaBasicaResponse) => void;
            onClose: () => void;
        }) {
        return (
            <View style={styles.modalBody}>
                <Pressable style={styles.novaCategoriaButton} onPress={onIniciarCriacao}>
                    <Icon name="add-circle" size={20} color="#136F6C" />
                    <Text style={styles.novaCategoriaText}>Nova Categoria</Text>
                </Pressable>

                <Text style={styles.categoriasTitle}>
                    Categorias ({categorias.length})
                </Text>

                <ScrollView 
                    style={styles.categoriasList}
                    showsVerticalScrollIndicator={true}
                >
                    {categorias.map((item) => (
                        <Pressable
                            key={item.id}
                            style={styles.categoriaItem}
                            onPress={() => onSelecionarCategoria(item)}
                        >
                            <Text style={styles.categoriaText}>{item.nome}</Text>
                            <Icon name="chevron-forward" size={16} color="#858587" />
                        </Pressable>
                    ))}
                </ScrollView>

                <Pressable 
                    style={[styles.modalButton, styles.closeButton, { marginTop: 15 }]}
                    onPress={onClose}
                >
                    <Text style={styles.modalButtonText}>Fechar</Text>
                </Pressable>
            </View>
    );
}